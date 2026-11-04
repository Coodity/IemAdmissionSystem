import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const applications = [
  { id: 'APP-2024-01', applicant: 'Priya Sharma', course: 'B.Tech CSE', status: 'Under Review' },
  { id: 'APP-2024-02', applicant: 'Rohit Das', course: 'MBA', status: 'Docs Verified' },
  { id: 'APP-2024-03', applicant: 'Anjali Roy', course: 'MCA', status: 'Submitted' },
  { id: 'APP-2024-04', applicant: 'Sameer Khan', course: 'B.Tech ECE', status: 'Under Review' },
];

type Doc = { label: string; status: 'Pending' | 'Verified' | 'Rejected' };

const initialDocs: Doc[] = [
  { label: 'Mark sheet', status: 'Pending' },
  { label: 'ID proof', status: 'Verified' },
  { label: 'Photo', status: 'Pending' },
];

export default function OfficerReview() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(applications[0]);
  const [docs, setDocs] = useState<Doc[]>(initialDocs);
  const [decision, setDecision] = useState<'approved' | 'rejected' | null>(null);

  const filtered = applications.filter(a =>
    [a.id, a.applicant, a.course].some(v => v.toLowerCase().includes(query.toLowerCase()))
  );

  function verifyDoc(i: number) {
    setDocs(d => d.map((doc, idx) => idx === i ? { ...doc, status: 'Verified' } : doc));
  }
  function rejectDoc(i: number) {
    setDocs(d => d.map((doc, idx) => idx === i ? { ...doc, status: 'Rejected' } : doc));
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-4 px-1">
          <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">Screen 4 of 4</span>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
          {/* Chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-sm">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="ml-3 text-xs text-gray-400 font-medium">4. Officer / Admin — Review Application</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Search */}
            <div className="flex gap-2">
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by Application ID / name / course"
                className="flex-1 border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1b2f5e] focus:ring-1 focus:ring-[#1b2f5e]"
              />
              <button className="bg-[#1b2f5e] text-white text-sm font-semibold px-5 py-2 hover:bg-[#111e3d] transition-colors">
                Search
              </button>
            </div>

            {/* Applications table */}
            <div className="border border-gray-200 rounded-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['App ID', 'Applicant', 'Course', 'Status'].map(h => (
                      <th key={h} className="text-left text-xs font-semibold text-gray-500 px-3 py-2">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(app => (
                    <tr
                      key={app.id}
                      onClick={() => { setSelected(app); setDocs(initialDocs); setDecision(null); }}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${selected.id === app.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                    >
                      <td className="px-3 py-2 font-mono text-xs text-gray-600">{app.id}</td>
                      <td className="px-3 py-2 text-gray-800">{app.applicant}</td>
                      <td className="px-3 py-2 text-gray-600">{app.course}</td>
                      <td className="px-3 py-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          app.status === 'Docs Verified' ? 'bg-green-100 text-green-700' :
                          app.status === 'Under Review' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Selected application panel */}
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Selected application
                <span className="ml-2 text-xs font-normal text-gray-400 font-mono">{selected.id} — {selected.applicant}</span>
              </p>

              <div className="space-y-2">
                {docs.map((doc, i) => (
                  <div key={doc.label} className="flex items-center gap-2">
                    <div className="flex-1 border border-gray-200 bg-gray-50 rounded-sm px-3 py-2 text-sm text-gray-600">
                      {doc.label}
                      <span className={`ml-2 text-xs font-medium ${
                        doc.status === 'Verified' ? 'text-green-600' :
                        doc.status === 'Rejected' ? 'text-red-600' :
                        'text-amber-600'
                      }`}>· {doc.status}</span>
                    </div>
                    <button
                      onClick={() => verifyDoc(i)}
                      className="bg-[#1b2f5e] text-white text-xs font-semibold px-3 py-2 hover:bg-[#111e3d] transition-colors"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => rejectDoc(i)}
                      className="border border-gray-300 text-gray-600 text-xs font-medium px-3 py-2 hover:border-red-400 hover:text-red-600 transition-colors"
                    >
                      Reject + reason
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-6 mt-4 text-xs font-semibold">
                <span className="text-green-600">Fee: Paid ✓</span>
                <span className="text-green-600">Seat availability: Available</span>
              </div>
            </div>

            {/* Approve / Reject */}
            {decision ? (
              <div className={`text-center py-4 font-semibold text-sm rounded-sm ${decision === 'approved' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                Application {decision === 'approved' ? 'Approved ✓' : 'Rejected ✗'}
                <button onClick={() => setDecision(null)} className="ml-4 text-xs font-normal underline opacity-60">Undo</button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setDecision('approved')}
                  className="flex-1 bg-[#1b2f5e] text-white text-sm font-semibold py-3 tracking-wide hover:bg-[#111e3d] uppercase transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => setDecision('rejected')}
                  className="flex-1 border-2 border-red-500 text-red-600 text-sm font-semibold py-3 tracking-wide hover:bg-red-50 uppercase transition-colors"
                >
                  Reject
                </button>
              </div>
            )}

            <div className="pt-2 border-t border-gray-100">
              <button
                onClick={() => navigate('/')}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Log out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
