import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import AdaPremiumPayment from '../../components/premium/AdaPremiumPayment';
import PaypalPremiumPayment from '../../components/premium/PaypalPremiumPayment';
import { toast } from 'react-toastify';

const ADA_ADDRESS = 'addr_test1qqcc0nggvw9ctfvjwj3ksssvufflhmwymh7uaw8cnjlfxj4gw7ql85e7m6yzdn2ssncqdpf7xfm96k386vdc5xp5g75q7uhvay';
const PAYPAL_EMAIL = 'sb-huutl40684105@business.example.com';

const PLANS = [
  {
    id: 'monthly',
    label: '2 minutes',
    ada: 200,
    usd: 400,
    period: '2 minutes'
  },
  {
    id: 'yearly',
    label: '5 hours',
    ada: 300,
    usd: 600,
    period: '5 hours'
  }
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
      if (status === 'success') {
        toast.success(message);
      } else if (status === 'error') {
        toast.error(message);
      } else if (status === 'cancelled') {
        toast.info(message);
      }
    }
  }, [searchParams]);

  return (
    <div className="max-w-xl mx-auto p-6 mt-10 bg-white rounded-lg shadow-lg border">
      <h1 className="text-3xl font-bold mb-6 text-center text-indigo-700">Edu Premium Subscription</h1>
      <p className="mb-6 text-center text-gray-600">Unlock all premium features and exclusive content!</p>

      <div className="flex justify-center gap-4 mb-8">
        {PLANS.map(p => (
          <button
            key={p.id}
            onClick={() => setSelectedPlan(p.id)}
            className={`px-6 py-2 rounded-full font-semibold border transition-all ${selectedPlan === p.id ? 'bg-indigo-600 text-white border-indigo-600 scale-105' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
          >
            {p.label} <span className="ml-2 text-xs">({p.ada} ADA / {p.usd} USD / {p.period})</span>
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setSelectedMethod('ada')}
          className={`px-6 py-2 rounded-full font-semibold border transition-all ${selectedMethod === 'ada' ? 'bg-green-600 text-white border-green-600 scale-105' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
        >
          Pay with ADA
        </button>
        <button
          onClick={() => setSelectedMethod('paypal')}
          className={`px-6 py-2 rounded-full font-semibold border transition-all ${selectedMethod === 'paypal' ? 'bg-blue-700 text-white border-blue-700 scale-105' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
        >
          Pay with PayPal
        </button>
      </div>

      <div className="mt-6">
        {selectedMethod === 'ada' ? (
          <AdaPremiumPayment
            plan={plan.id}
            adaAmount={plan.ada}
            receiverAddress={ADA_ADDRESS}
          />
        ) : (
          <PaypalPremiumPayment
            plan={plan.id}
            usdAmount={plan.usd}
            paypalEmail={PAYPAL_EMAIL}
          />
        )}
      </div>


    </div>
  );
} 