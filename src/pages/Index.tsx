import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisPanel from "@/components/AnalysisPanel";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"hero" | "upload" | "analysis">("hero");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isPremium, setIsPremium] = useState(false);

  // 👁 Visitor counter state
  const [visits, setVisits] = useState<number | null>(null);

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

  // Auth state management
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Fetch premium status when user logs in
        if (session?.user) {
          setTimeout(() => {
            fetchPremiumStatus(session.user.id);
          }, 0);
        } else {
          setIsPremium(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchPremiumStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchPremiumStatus = async (userId: string) => {
    const { data: profile } = await supabase
      .from("profiles")
      .select("premium")
      .eq("id", userId)
      .single();

    if (profile) {
      setIsPremium(profile.premium);
    }
  };

  const handleBegin = () => setStage("upload");
  const handleAnalyze = () => setStage("analysis");

  const handlePremiumClick = () => {
    if (!user) {
      navigate("/auth");
    } else if (!isPremium) {
      navigate("/premium");
    } else {
      // Already premium, go to upload
      setStage("upload");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsPremium(false);
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

      {/* User menu if logged in */}
      {user && stage === "hero" && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
          {isPremium && (
            <span className="bg-gradient-to-r from-magenta to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
              Premium Member
            </span>
          )}
          <button
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground text-sm transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* 🧠 Stage Rendering */}
      {stage === "hero" && (
        <Hero onBegin={handleBegin} onPremium={handlePremiumClick} />
      )}

      {stage === "upload" && (
        <UploadSection
          frontImage={frontImage}
          profileImage={profileImage}
          onFrontImageChange={setFrontImage}
          onProfileImageChange={setProfileImage}
          onAnalyze={handleAnalyze}
        />
      )}

      {stage === "analysis" && (
        <AnalysisPanel profileImage={profileImage} frontImage={frontImage} />
      )}
    </div>
  );
};

export default Index;
