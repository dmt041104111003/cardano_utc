import { useState, useEffect } from 'react';
import AdaPayment from './AdaPayment';

export default function PaymentMethod({ courseData }) {
    const [selectedMethod, setSelectedMethod] = useState('ada');
    const [adaToUsd, setAdaToUsd] = useState(0);
    const [usdToAda, setUsdToAda] = useState(0);

    useEffect(() => {
        const updateExchangeRate = async () => {
            try {
                const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
                const data = await response.json();
                setUsdToAda(1 / data.cardano.usd);
            } catch (error) {
                console.error('Error fetching exchange rate:', error);
            }
        };

        updateExchangeRate();
        const interval = setInterval(updateExchangeRate, 300000); 
        return () => clearInterval(interval);
    }, []);

    const getPrice = () => {
        const discountedPrice = courseData.coursePrice - (courseData.discount * courseData.coursePrice) / 100;
        
        if (selectedMethod === 'ada') {
            const adaPrice = usdToAda > 0 ? discountedPrice * usdToAda : 0;
            return `${adaPrice.toFixed(2)} ADA`;
        } else {
            return `$${discountedPrice.toFixed(2)} USD`;
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6 text-center">Select payment method</h2>
            
            <div className="flex justify-center gap-4 mb-8">
                <button
                    onClick={() => setSelectedMethod('ada')}
                    className={`px-6 py-2 rounded-full ${
                        selectedMethod === 'ada' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    ADA
                </button>
                <button
                    onClick={() => setSelectedMethod('stripe')}
                    className={`px-6 py-2 rounded-full ${
                        selectedMethod === 'stripe' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    Stripe
                </button>
                <button
                    onClick={() => setSelectedMethod('paypal')}
                    className={`px-6 py-2 rounded-full ${
                        selectedMethod === 'paypal' 
                            ? 'bg-blue-700 text-white' 
                            : 'bg-gray-100 text-gray-700'
                    }`}
                >
                    Paypal
                </button>
            </div>

            <div className="bg-purple-50 rounded-lg p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-semibold mb-2">
                        {selectedMethod === 'ada' ? 'Thanh toán bằng ADA' : 
                         selectedMethod === 'stripe' ? 'Thanh toán bằng Stripe' : 
                         'Thanh toán bằng PayPal'}
                    </h3>
                    <p className="text-gray-600">
                        Giá khóa học: <span className="font-semibold">{getPrice()}</span>
                    </p>
                </div>

                {selectedMethod === 'ada' ? (
                    <AdaPayment courseData={{
                        ...courseData,
                        coursePrice: usdToAda > 0 ? courseData.coursePrice * usdToAda : 0
                    }} />
                ) : selectedMethod === 'stripe' ? (
                    <div>
                        
                        <button className="w-full py-2 px-4 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors">
                            Thanh toán với Stripe
                        </button>
                    </div>
                ) : (
                    <div>
                        
                        <button className="w-full py-2 px-4 rounded-md bg-blue-700 text-white font-medium hover:bg-blue-800 transition-colors">
                            Thanh toán với PayPal
                        </button>
                    </div>
                )}

                <p className="text-xs text-gray-500 mt-4">
                    Bằng cách thanh toán, bạn đồng ý với Điều khoản dịch vụ của chúng tôi
                </p>
            </div>
        </div>
    );
}
