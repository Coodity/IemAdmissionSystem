import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import multer from 'multer';
import path from 'node:path';

import dns from 'node:dns';
dns.setServers(['1.1.1.1', '1.0.0.1']);

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Models ----------
const User = mongoose.model('User', new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: String,
  role: { type: String, enum: ['applicant', 'officer', 'admin'], default: 'applicant' },
}));

const Application = mongoose.model('Application', new mongoose.Schema({
  appId: { type: String, unique: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true }, // FR-8: one per applicant
  applicantName: String,
  course: String,
  campus: String,
  qualification: String,
  marks: Number,
  docs: [{
    label: String,
    fileName: String,
    mimeType: String,
    status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
    reason: String,
  }],
  feeStatus: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  status: { type: String, enum: ['Submitted', 'Under Review', 'Approved', 'Rejected'], default: 'Submitted' },
  history: [{ status: String, at: Date, by: String }],
}, { timestamps: true }));

// ---------- Helpers ----------
const MIN_MARKS = 50; // same rule as the wireframe's eligibility check
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    const ok = ['image/jpeg', 'image/png', 'application/pdf'];
    if (ok.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG / PNG / PDF allowed'));
    }
  },
});

function sign(user) {
  return jwt.sign({ id: user._id, role: user.role, name: user.name }, process.env.JWT_SECRET, { expiresIn: '15m' }); // FR-25
}

function auth(roles) {
  return (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.replace('Bearer ', '');
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return res.status(401).json({ error: 'Not logged in' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

function notify(app_, text) {
  console.log(`[sandbox email] to applicant of ${app_.appId}: ${text}`);
}

// ---------- Auth ----------
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({ error: 'Name, email and 8+ char password required' });
  }
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash, role: 'applicant' });
  res.json({ token: sign(user), role: user.role });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  res.json({ token: sign(user), role: user.role });
});

// ---------- Applicant ----------
app.get('/api/applications/mine', auth(['applicant']), async (req, res) => {
  const doc = await Application.findOne({ applicant: req.user.id });
  res.json(doc); // null if none yet
});

app.post('/api/applications', auth(['applicant']), async (req, res) => {
  const { course, campus, qualification, marks } = req.body;
  const pct = parseFloat(marks);
  if (!course || !campus || isNaN(pct)) {
    return res.status(400).json({ error: 'Course, campus and marks required' });
  }
  if (pct < MIN_MARKS) {
    return res.status(422).json({ error: 'Not eligible', eligible: false });
  }
  const existing = await Application.findOne({ applicant: req.user.id });
  if (existing) {
    return res.status(409).json({ error: 'Already submitted' });
  }
  const count = await Application.countDocuments();
  const appId = `APP-2026-${String(count + 1).padStart(4, '0')}`;
  const created = await Application.create({
    appId, applicant: req.user.id, applicantName: req.user.name,
    course, campus, qualification, marks: pct,
    docs: [{ label: 'Mark sheet' }, { label: 'ID proof' }, { label: 'Photo' }],
    history: [{ status: 'Submitted', at: new Date(), by: req.user.name }],
  });
  res.json(created);
});

app.post('/api/applications/:id/docs/:index', auth(['applicant']), upload.single('file'), async (req, res) => {
  const doc = await Application.findOne({ appId: req.params.id, applicant: req.user.id });
  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }
  const slot = doc.docs[Number(req.params.index)];
  if (!slot || !req.file) {
    return res.status(400).json({ error: 'Bad document slot or file' });
  }
   slot.fileName = req.file.filename;
  slot.mimeType = req.file.mimetype;
  slot.status = 'Pending'; // re-upload after rejection resets it (FR-16)
  slot.reason = '';
  await doc.save();
  res.json(doc);
});

app.post('/api/applications/:id/pay', auth(['applicant']), async (req, res) => {
  const doc = await Application.findOne({ appId: req.params.id, applicant: req.user.id });
  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }
  doc.feeStatus = 'Paid'; // sandboxed gateway: always succeeds
  await doc.save();
  res.json(doc);
});

// ---------- Officer ----------
const staff = auth(['officer', 'admin']);

app.get('/api/officer/applications', staff, async (req, res) => {
  const q = req.query.q || '';
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  const list = await Application.find({ $or: [{ appId: rx }, { applicantName: rx }, { course: rx }] });
  res.json(list);
});

app.patch('/api/officer/applications/:id/docs/:index', staff, async (req, res) => {
  const { status, reason } = req.body;
  if (status === 'Rejected' && !reason) {
    return res.status(400).json({ error: 'Rejection reason is mandatory' }); // FR-14
  }
  const doc = await Application.findOne({ appId: req.params.id });
  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }
  const slot = doc.docs[Number(req.params.index)];
  if (!slot) {
    return res.status(400).json({ error: 'Bad document slot' });
  }
  slot.status = status;
  slot.reason = reason || '';
  if (status === 'Rejected') {
    notify(doc, `document "${slot.label}" rejected: ${reason}`); // FR-15
  }
  await doc.save();
  res.json(doc);
});

app.patch('/api/officer/applications/:id/decision', staff, async (req, res) => {
  const { decision } = req.body; // 'Approved' | 'Rejected'
  const doc = await Application.findOne({ appId: req.params.id });
  if (!doc) {
    return res.status(404).json({ error: 'Not found' });
  }
  if (decision === 'Approved') {
    const allVerified = doc.docs.every(d => d.status === 'Verified');
    if (!allVerified || doc.feeStatus !== 'Paid') {
      return res.status(422).json({ error: 'Verify all docs and fee before approving' });
    }
  }
  doc.status = decision;
  doc.history.push({ status: decision, at: new Date(), by: req.user.name });
  await doc.save();
  notify(doc, `your application was ${decision.toLowerCase()}`); // FR-30
  res.json(doc);
});

app.get('/api/officer/files/:name', staff, async (req, res) => {
  const found = await Application.findOne({ 'docs.fileName': req.params.name });
  if (!found) {
    return res.status(404).json({ error: 'File not found' });
  }
  const slot = found.docs.find(d => d.fileName === req.params.name);
  res.type(slot.mimeType || 'application/octet-stream');
  res.sendFile(path.resolve('uploads', path.basename(req.params.name)));
});

// ---------- Boot ----------
await mongoose.connect(process.env.MONGO_URI);
const staffExists = await User.findOne({ role: 'officer' });
if (!staffExists) {
  await User.create({ name: 'Test Officer', email: 'staff@iem.edu', passwordHash: await bcrypt.hash('Staff@123', 10), role: 'officer' });
  console.log('Seeded officer: staff@iem.edu / Staff@123');
}
app.listen(process.env.PORT || 5000, () => console.log('API on :' + (process.env.PORT || 5000)));
