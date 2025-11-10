import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const Checkout = () => {
  const navigate = useNavigate();
  const session = useSession();

  // Replace with real PayPal/Swish links later
  const paypalLink = "https://www.paypal.com/paypalme/yourname/1";
  const swishLink = "swish://paymentrequest?amount=1&message=Premium%20Subscription";

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
      <h1 className="text-2xl font-bold mb-4">Get Premium</h1>
      <p className="text-neutral-400 mb-6">$1 per week</p>

      <button
        onClick={() => window.open(paypalLink, "_blank")}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg mb-4"
      >
        Pay with PayPal
      </button>

      <button
        onClick={() => window.open(swishLink, "_blank")}
        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg"
      >
        Pay with Swish
      </button>

      <button
        onClick={() => navigate("/dashboard")}
        className="mt-6 text-sm underline text-neutral-400"
      >
        I already paid
      </button>
    </div>
  );
};

export default Checkout;
