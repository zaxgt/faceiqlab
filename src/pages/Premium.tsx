import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const Premium = () => {
  const session = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) {
      navigate("/signin");
    } else {
      navigate("/checkout");
    }
  }, [session, navigate]);

  return (
    <div className="flex items-center justify-center h-screen text-white">
      <p>Checking your premium status...</p>
    </div>
  );
};

export default Premium;
