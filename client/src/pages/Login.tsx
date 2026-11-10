import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'applicant' | 'staff'>('applicant');

     async function handleLogin(e: React.FormEvent) {
     e.preventDefault();
     try {
       const data = await api('/auth/login', 'POST', { email, password });
       localStorage.setItem('token', data.token);
       if (data.role === 'applicant') {
         navigate('/dashboard');
       } else {
         navigate('/officer');
       }
     } catch (err) {
       alert((err as Error).message);
     }
   }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f5f7] px-4">
      <div className="w-full max-w-sm">
        {/* Screen label */}
        <div className="mb-4 px-2">
          <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">Screen 1 of 4</span>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
          {/* Fake window chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-sm">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="ml-3 text-xs text-gray-400 font-medium">1. Login</span>
          </div>

          <div className="p-8">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center mb-4 bg-gray-50">
                <span className="text-xs font-semibold text-gray-500 tracking-wide">LOGO</span>
              </div>
              <h1 className="text-xl font-semibold text-[#1b2f5e] text-center">IEM Admission Portal</h1>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1b2f5e] focus:ring-1 focus:ring-[#1b2f5e] transition-colors"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-[#1b2f5e] focus:ring-1 focus:ring-[#1b2f5e] transition-colors"
                />
              </div>

              {/* Role selector for demo */}
              <div>
                <label className="block text-sm text-gray-600 mb-1">Login as</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('applicant')}
                    className={`flex-1 py-1.5 text-sm border rounded-sm transition-colors ${role === 'applicant' ? 'bg-[#1b2f5e] text-white border-[#1b2f5e]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                  >
                    Applicant
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`flex-1 py-1.5 text-sm border rounded-sm transition-colors ${role === 'staff' ? 'bg-[#1b2f5e] text-white border-[#1b2f5e]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                  >
                    Staff / Officer
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#1b2f5e] hover:bg-[#111e3d] text-white font-semibold py-3 text-sm tracking-widest uppercase transition-colors"
              >
                Log In
              </button>
            </form>

            <div className="flex justify-between mt-4 text-xs text-[#2563eb]">
              <button className="hover:underline">Forgot password?</button>
              <span>
                New applicant?{' '}
                <button onClick={() => navigate('/register')} className="font-medium hover:underline">Register</button>
              </span>
            </div>

            <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
              Applicants and staff use the same login;<br />role decides the dashboard
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
