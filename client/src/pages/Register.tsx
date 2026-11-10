// new file: client/src/pages/Register.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    try {
      const data = await api('/auth/register', 'POST', { name, email, password });
      localStorage.setItem('token', data.token);
      navigate('/apply');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  const input = 'w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1b2f5e] focus:ring-1 focus:ring-[#1b2f5e]';

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] px-4">
      <div className="w-full max-w-sm bg-white border border-gray-200 shadow-sm rounded-sm p-8">
        <h1 className="text-xl font-semibold text-[#1b2f5e] text-center mb-6">Create applicant account</h1>
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Full name</label>
            <input className={input} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Email</label>
            <input type="email" className={input} value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Password</label>
            <input type="password" className={input} value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Confirm password</label>
            <input type="password" className={input} value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="w-full bg-[#1b2f5e] hover:bg-[#111e3d] text-white font-semibold py-3 text-sm tracking-widest uppercase">
            Register
          </button>
        </form>
        <button onClick={() => navigate('/')} className="block mx-auto mt-4 text-xs text-[#2563eb] hover:underline">
          ← Back to login
        </button>
      </div>
    </div>
  );
}
