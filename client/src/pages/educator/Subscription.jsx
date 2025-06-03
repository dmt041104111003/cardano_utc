import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdaPremiumPayment from '../../components/premium/AdaPremiumPayment';
import PaypalPremiumPayment from '../../components/premium/PaypalPremiumPayment';
import { toast } from 'react-toastify';

const ADA_ADDRESS = 'addr_test1qqcc0nggvw9ctfvjwj3ksssvufflhmwymh7uaw8cnjlfxj4gw7ql85e7m6yzdn2ssncqdpf7xfm96k386vdc5xp5g75q7uhvay';
const PAYPAL_EMAIL = 'sb-huutl40684105@business.example.com';
const PLANS = [
  { id: 'monthly', label: '2 minutes', ada: 200, usd: 400, period: '2 minutes' },
  { id: 'yearly', label: '5 hours', ada: 300, usd: 600, period: '5 hours' }
];

export default function Subscription() {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [selectedMethod, setSelectedMethod] = useState('ada');
  const [searchParams] = useSearchParams();
  const plan = PLANS.find(p => p.id === selectedPlan);

  useEffect(() => {
    const status = searchParams.get('status');
    const message = searchParams.get('message');
    if (status && message) {
      toast[status === 'success' ? 'success' : status === 'error' ? 'error' : 'info'](message);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-start md:p-8 md:pb-0 p-4 pt-8 pb-0 bg-gradient-to-b from-blue-50 to-white">
      <div className="w-full max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            <div className="w-1.5 h-8 bg-blue-600 rounded-full mr-2"></div>
            Premium Subscription
          </h1>
          <p className="text-gray-600 ml-5">Unlock all premium features and exclusive content!</p>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">Edu Premium</h2>
            <p className="opacity-90">Enhance your teaching experience with premium features</p>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select a Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {PLANS.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${selectedPlan === p.id ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.02]' : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-lg font-bold text-gray-800">{p.label}</h4>
                    {selectedPlan === p.id && (
                      <div className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">SELECTED</div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{p.ada} ADA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{p.usd} USD</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Duration: {p.period}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Payment Method</h3>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button
                onClick={() => setSelectedMethod('ada')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedMethod === 'ada' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-9.5v4h2v-4h3l-4-6-4 6h3z" />
                </svg>
                Pay with ADA
              </button>
              <button
                onClick={() => setSelectedMethod('paypal')}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${selectedMethod === 'paypal' ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300'}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 4.876-.032.228a.804.804 0 0 1-.794.679h-2.52a.5.5 0 0 1-.488-.62l.77-4.92a.5.5 0 0 1 .49-.38h2.63a5.387 5.387 0 0 0 5.483-4.424c.022-.097.047-.195.07-.292.134-.561.232-1.155.232-1.768a3.67 3.67 0 0 0-.62-2.118" />
                  <path d="M18.036 6.073a3.67 3.67 0 0 0-.7-.174 6.37 6.37 0 0 0-1.108-.097h-4.979a.75.75 0 0 0-.75.75v.017l-.818 5.302-.022.14a.75.75 0 0 0 .736.876h2.129c.052 0 .103-.003.154-.009a.75.75 0 0 0 .679-.519l.797-5.05a.75.75 0 0 1 .736-.631h1.883c.789 0 1.39.16 1.787.478.423.339.675.875.675 1.598a4.49 4.49 0 0 1-.12 1.05" />
                </svg>
                Pay with PayPal
              </button>
            </div>
            <div className="mt-6 border-t border-gray-200 pt-6">
              {selectedMethod === 'ada' ? (
                <AdaPremiumPayment plan={plan.id} adaAmount={plan.ada} receiverAddress={ADA_ADDRESS} />
              ) : (
                <PaypalPremiumPayment plan={plan.id} usdAmount={plan.usd} paypalEmail={PAYPAL_EMAIL} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}