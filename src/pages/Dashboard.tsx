import { useNavigate } from "react-router-dom";
import { useSession } from "@supabase/auth-helpers-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const session = useSession();

  if (!session) {
    navigate("/signin");
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-neutral-950 text-white">
      <h1 className="text-2xl font-bold mb-6">Welcome, {session?.user?.email}</h1>

      <div className="space-y-4">
        <button
          onClick={() => navigate("/analysis")}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow"
        >
          Analyse Face
        </button>

        <button
          onClick={() => navigate("/history")}
          className="bg-neutral-800 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg"
        >
          View Analysis History
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
