import axios from "axios";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

export default function PaypalPayment({ courseData }) {
  const { userData, backendUrl, getToken } = useContext(AppContext);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [coursePrice, setCoursePrice] = useState("0.00");
  const [adaToUsd, setAdaToUsd] = useState(0);

  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=cardano&vs_currencies=usd');
        const data = await response.json();
        setAdaToUsd(data.cardano.usd);
      } catch (error) {
        console.error('Error fetching exchange rate:', error);
      }
    };

    fetchExchangeRate();
    const interval = setInterval(fetchExchangeRate, 300000); 
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (courseData && adaToUsd > 0) {
      const currentDate = new Date();
      const discountEnd = courseData.discountEndTime ? new Date(courseData.discountEndTime) : null;
      const isDiscountActive = discountEnd && !isNaN(discountEnd.getTime()) && currentDate <= discountEnd;
    
      const adaPrice = isDiscountActive && courseData.discount > 0
        ? courseData.coursePrice * (1 - courseData.discount / 100)
        : courseData.coursePrice;
      const usdPrice = (adaPrice * adaToUsd).toFixed(2);
      setCoursePrice(usdPrice);
      
      console.log(`PayPal: ADA price: ${adaPrice}, USD price: ${usdPrice}, Exchange rate: ${adaToUsd}`);
    }
  }, [courseData, adaToUsd]);

  const handlePaypalPayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/course/payment-by-paypal`,
        {
          courseName: courseData.courseTitle,
          courseId: courseData._id,
          price: coursePrice,
          userId: userData._id,
          originalAdaPrice: courseData.coursePrice 
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.forwardLink) {
        window.location.href = data.forwardLink;
      } else {
        throw new Error("PayPal link not received.");
      }
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || "Payment failed. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-5 border rounded-xl mt-4 bg-gradient-to-br from-blue-50 to-white shadow-sm">
      <div className="flex items-center mb-4">
        <img
          src="https://cdn.iconscout.com/icon/free/png-256/free-paypal-54-675727.png"
          alt="PayPal"
          className="h-7 mr-3"
        />
        <h3 className="text-xl font-bold text-blue-800">Pay with PayPal</h3>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
        <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
          <span className="text-gray-700">Course price:</span>
          <span className="font-bold text-green-600">${coursePrice} USD</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Original price:</span>
          <span className="text-gray-600">{courseData.coursePrice} ADA</span>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="text-sm text-gray-600">Secure payment with PayPal or credit card</span>
        </div>
      </div>

      {error && (
        <div className="p-3 mb-4 text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <button
        className={`w-full py-3 px-4 rounded-lg font-medium transition-all transform ${!isProcessing 
          ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 hover:scale-[1.02] shadow-md" 
          : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
        onClick={handlePaypalPayment}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Redirecting to PayPal...
          </span>
        ) : (
          <span className="flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pay with PayPal
          </span>
        )}
      </button>

      <p className="text-xs text-gray-500 mt-3 text-center">
        By making a payment, you agree to our <a href="#" className="text-blue-600 hover:underline">Terms of Service</a>.
      </p>
      
      <div className="flex items-center justify-center mt-4">
        <img src="https://cdn.iconscout.com/icon/free/png-256/free-visa-3-226460.png" alt="Visa" className="h-6 mx-1" />
        <img src="https://cdn.iconscout.com/icon/free/png-256/free-mastercard-3-226462.png" alt="Mastercard" className="h-6 mx-1" />
        <img src="https://cdn.iconscout.com/icon/free/png-256/free-american-express-3-226461.png" alt="Amex" className="h-6 mx-1" />
        <img src="https://cdn.iconscout.com/icon/free/png-256/free-discover-card-1-555245.png" alt="Discover" className="h-6 mx-1" />
      </div>
    </div>
  );
}
