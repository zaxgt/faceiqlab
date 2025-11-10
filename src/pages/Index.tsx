import { useState, useEffect } from "react";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisPanel from "@/components/AnalysisPanel";

const Index = () => {
  const [stage, setStage] = useState<"hero" | "upload" | "analysis">("hero");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  // 👁 Visitor counter state
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.countapi.xyz/hit/facelabs.netlify.app/visits")
      .then((res) => res.json())
      .then((data) => setVisits(data.value))
      .catch(() => setVisits(0));
  }, []);

  const handleBegin = () => setStage("upload");
  const handleAnalyze = () => setStage("analysis");

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Invisible overlay to cover Lovable badge */}
      <div className="fixed bottom-4 right-4 w-32 h-12 bg-background z-[9999]" />

      {/* 👁 Floating Visitor Counter */}
      <div
        className="fixed bottom-4 left-4 bg-neutral-900 text-purple-400 font-mono px-4 py-2 rounded-xl shadow-lg z-[9999]"
        style={{ opacity: 0.9 }}
      >
        👁 All Time Visitors: {visits ?? "Loading..."}
      </div>

      {stage === "hero" && <Hero onBegin={handleBegin} />}
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
