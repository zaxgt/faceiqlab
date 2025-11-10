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
      // Add 243 to the total visitor count
      setVisits((data.totalCount ?? 0) + 54);
    })
    .catch((err) => {
      console.error("Visitor counter error:", err);
      setVisits(0); // Fallback in case API fails
    });
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
  👁 All Time Users: {visits ?? "Loading..."}
</div>

{/* Small description under the counter */}
<div
  className="fixed bottom-2 left-4 text-neutral-300 text-xs font-sans z-[9999]"
  style={{ maxWidth: "200px", lineHeight: "1.2" }}
>
  This data is not tracked by us; it is tracked by a third-party source 6developer.com
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
