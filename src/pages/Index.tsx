import { useState } from "react";
import Hero from "@/components/Hero";
import UploadSection from "@/components/UploadSection";
import AnalysisPanel from "@/components/AnalysisPanel";

const Index = () => {
  const [stage, setStage] = useState<"hero" | "upload" | "analysis">("hero");
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleBegin = () => {
    setStage("upload");
  };

  const handleAnalyze = () => {
    setStage("analysis");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Invisible overlay to cover Lovable badge */}
      <div className="fixed bottom-4 right-4 w-32 h-12 bg-background z-[9999]" />
      
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
        <AnalysisPanel
          profileImage={profileImage}
          frontImage={frontImage}
        />
      )}
    </div>
  );
};

export default Index;
