import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisPanel from "@/components/AnalysisPanel";

const Index = () => {
  const [stage, setStage] = useState<
    "hero" | "upload" | "analysis" | "signin" | "checkout" | "dashboard"
  >("hero");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 👁 Visitor counter
  const [visits, setVisits] = useState<number | null>(null);

  // 🔐 Auth & premium
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [premium, setPremium] = useState<boolean>(
    localStorage.getItem("premium") === "true"
  );

  // Dropdown
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const domain = encodeURIComponent(window.location.hostname);

    fetch("https://visitor.6developer.com/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        domain,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        page_path: window.location.pathname,
        page_title: document.title,
        referrer: document.referrer,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setVisits((data.totalCount ?? 0) + 54);
      })
      .catch((err) => {
        console.error("Visitor counter error:", err);
        setVisits(0);
      });
  }, []);

  const handleAnalyze = () => setStage("upload");

  const handlePremiumClick = () => {
    if (!user) {
      setStage("signin");
    } else if (!premium) {
      setStage("checkout");
    } else {
      setStage("dashboard");
    }
  };

  const handleSignIn = (username: string) => {
    localStorage.setItem("user", username);
    setUser(username);
    setStage("checkout");
  };

  const handlePayment = () => {
    localStorage.setItem("premium", "true");
    setPremium(true);
    setStage("dashboard");
  };

  const handleSignOut = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("premium");
    setUser(null);
    setPremium(false);
    setStage("hero");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative text-white">
      {/* Invisible overlay to cover Lovable badge */}
      <div className="fixed bottom-4 right-4 w-32 h-12 bg-background z-[9999]" />

      {/* 👁 Floating Visitor Counter */}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col items-start space-y-1">
        <div
          className="bg-neutral-900 text-purple-400 font-mono px-4 py-2 rounded-xl shadow-lg"
          style={{ opacity: 0.9 }}
        >
          👁 All Time Users: {visits ?? "Loading..."}
        </div>
        <div className="text-neutral-300 text-xs font-sans max-w-[200px] leading-tight">
          This data is not tracked by us; it is tracked by a third-party source 6developer.com
        </div>
      </div>

      {/* 🧠 HERO + dropdown button */}
      {stage === "hero" && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <Hero onBegin={() => {}} />

          <div className="relative mt-6">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg shadow-lg text-lg font-medium"
            >
              Choose Option ▾
            </button>

            {showMenu && (
              <div className="absolute top-full left-0 mt-2 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl w-56">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handleAnalyze();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-t-xl"
                >
                  🧠 Analyze Face
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    handlePremiumClick();
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-neutral-800 rounded-b-xl"
                >
                  💎 Premium Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === "upload" && (
        <UploadSection
          frontImage={frontImage}
          profileImage={profileImage}
          onFrontImageChange={setFrontImage}
          onProfileImageChange={setProfileImage}
          onAnalyze={() => setStage("analysis")}
        />
      )}

      {stage === "analysis" && (
        <AnalysisPanel profileImage={profileImage} frontImage={frontImage} />
      )}

      {/* 🔑 Sign In */}
      {stage === "signin" && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl mb-4">Sign In</h2>
          <input
            id="username"
            className="border border-gray-700 bg-neutral-900 px-4 py-2 rounded-md mb-4"
            placeholder="Enter your username"
          />
          <button
            onClick={() => {
              const input = document.getElementById("username") as HTMLInputElement;
              if (input.value) handleSignIn(input.value);
            }}
            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg"
          >
            Continue
          </button>
          <button onClick={() => setStage("hero")} className="mt-3 text-sm text-gray-400">
            Cancel
          </button>
        </div>
      )}

      {/* 💰 Checkout */}
      {stage === "checkout" && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-2xl mb-4">Get Premium</h2>
          <p className="text-gray-400 mb-6">Pay $1/week using PayPal or Swish</p>
          <button
            onClick={handlePayment}
            className="px-5 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          >
            Simulate Payment
          </button>
          <button onClick={() => setStage("hero")} className="mt-3 text-sm text-gray-400">
            Cancel
          </button>
        </div>
      )}

      {/* 📊 Dashboard */}
      {stage === "dashboard" && (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-3xl mb-4">Dashboard</h2>
          <p className="text-gray-400 mb-6">
            Welcome, {user}! You have Premium access.
          </p>
          <button
            onClick={() => setStage("upload")}
            className="px-5 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg mb-4"
          >
            Analyze Face
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-gray-400 hover:text-gray-200"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
};

export default Index;
