import { useNavigate } from 'react-router-dom';

const steps = ['Submitted', 'Docs Verified', 'Under Review', 'Decision'];
const currentStep = 1; // 0-indexed: Docs Verified is active

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f4f5f7] px-4 py-8">
      <div className="max-w-xl mx-auto">
        <div className="mb-4 px-1">
          <span className="text-xs font-mono tracking-widest text-gray-400 uppercase">Screen 2 of 4</span>
        </div>

        <div className="bg-white border border-gray-200 shadow-sm rounded-sm">
          {/* Chrome */}
          <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-200 bg-gray-50 rounded-t-sm">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="ml-3 text-xs text-gray-400 font-medium">2. Applicant Dashboard</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#1b2f5e]">Welcome, Applicant</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400">App ID:</span>
                <span className="text-xs font-mono font-semibold text-gray-600 ml-1">APP-0000-00</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-4">Application status timeline</p>
              <div className="flex items-center">
                {steps.map((step, i) => (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                        i < currentStep + 1
                          ? 'bg-[#1b2f5e] border-[#1b2f5e] text-white'
                          : 'bg-white border-gray-300 text-gray-400'
                      }`}>
                        {i < currentStep + 1 ? '✓' : ''}
                      </div>
                      <span className="text-[10px] text-gray-500 mt-1.5 whitespace-nowrap">{step}</span>
                    </div>
                    {i < steps.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-[#1b2f5e]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Documents card */}
            <div className="border border-gray-200 rounded-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Documents</p>
                <p className="text-xs text-gray-500 mt-0.5">2 Verified · 1 Pending</p>
              </div>
              <button
                onClick={() => navigate('/apply')}
                className="border-2 border-[#1b2f5e] text-[#1b2f5e] text-sm font-semibold px-4 py-2 hover:bg-[#1b2f5e] hover:text-white transition-colors"
              >
                View Docs
              </button>
            </div>

            {/* Fee card */}
            <div className="border border-gray-200 rounded-sm p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800">Fee payment</p>
                <p className="text-xs text-gray-500 mt-0.5">Application fee: Pending</p>
              </div>
              <button className="bg-[#1b2f5e] text-white text-sm font-semibold px-4 py-2 hover:bg-[#111e3d] transition-colors">
                Pay Fee
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/apply')}
                className="flex-1 bg-[#1b2f5e] text-white text-sm font-semibold py-3 hover:bg-[#111e3d] transition-colors"
              >
                Edit Application
              </button>
              <button className="flex-1 border border-gray-300 text-gray-700 text-sm font-semibold py-3 hover:border-gray-500 hover:text-gray-900 transition-colors">
                Download Receipt
              </button>
            </div>

            <p className="text-center text-xs text-gray-400">
              Timeline stays read-only once the form is submitted
            </p>

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
