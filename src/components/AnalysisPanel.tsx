import MetricBar from "@/components/MetricBar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AnalysisPanelProps {
  profileImage: string | null;
}

const metrics = [
  { title: "Midface Ratio", value: "0.98", ideal: "0.90-1.05", score: 9.4, color: "cyan" },
  { title: "Gonial Angle", value: "118.0°", ideal: "110-125°", score: 9.8, color: "cyan" },
  { title: "Nose-to-Mouth Ratio", value: "1.05", ideal: "1.00-1.10", score: 9.6, color: "cyan" },
  { title: "Eye-to-Eye Separation", value: "0.92", ideal: "0.88-0.95", score: 9.5, color: "cyan" },
  { title: "Cantal Tilt", value: "4.2°", ideal: "2-6°", score: 9.7, color: "magenta" },
  { title: "Eyebrow Tilt", value: "3.8°", ideal: "2-5°", score: 9.6, color: "magenta" },
  { title: "Yaw Symmetry", value: "98.2%", ideal: "95-100%", score: 9.8, color: "cyan" },
  { title: "Nasal Projection", value: "14.2mm", ideal: "12-16mm", score: 9.3, color: "cyan" },
  { title: "Nasal Tip Angle", value: "127.9°", ideal: "95-115°", score: 8.3, color: "magenta" },
  { title: "Nasofrontal Angle", value: "117.1°", ideal: "115-135°", score: 10.0, color: "cyan" },
  { title: "Nasolabial Angle", value: "102.5°", ideal: "90-120°", score: 9.5, color: "magenta" },
  { title: "Facial Convexity (Glabella)", value: "168.4°", ideal: "165-175°", score: 9.6, color: "cyan" },
  { title: "Facial Convexity (Nasion)", value: "166.2°", ideal: "160-170°", score: 9.7, color: "magenta" },
  { title: "Total Facial Convexity", value: "167.8°", ideal: "165-175°", score: 9.7, color: "cyan" },
  { title: "Nasal Height-to-Width Ratio", value: "1.12", ideal: "1.00-1.20", score: 9.4, color: "magenta" },
];

const AnalysisPanel = ({ profileImage }: AnalysisPanelProps) => {
  return (
    <div className="min-h-screen px-4 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-5xl font-bold mb-4">Analysis Complete</h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive facial harmony assessment
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Profile Image with Geometry */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-cyan/30 glow-subtle">
              {profileImage && (
                <>
                  <img
                    src={profileImage}
                    alt="Profile analysis"
                    className="w-full h-full object-cover"
                  />
                  {/* Facial geometry overlay lines */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                    <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="hsl(var(--cyan))" strokeWidth="2" />
                    <line x1="20%" y1="45%" x2="80%" y2="45%" stroke="hsl(var(--magenta))" strokeWidth="2" />
                    <line x1="20%" y1="60%" x2="80%" y2="60%" stroke="hsl(var(--cyan))" strokeWidth="2" />
                    <line x1="40%" y1="20%" x2="40%" y2="80%" stroke="hsl(var(--magenta))" strokeWidth="2" />
                  </svg>
                </>
              )}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <MetricBar
                key={metric.title}
                title={metric.title}
                value={metric.value}
                ideal={metric.ideal}
                score={metric.score}
                color={metric.color as "cyan" | "magenta"}
                delay={index * 0.05}
              />
            ))}
          </div>
        </div>

        {/* Overall Ratings */}
        <div className="mt-16 space-y-8 animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-cyan/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Overall Balance</p>
              <p className="text-4xl font-bold text-cyan">9.4</p>
              <p className="text-xs text-muted-foreground mt-1">/ 10</p>
            </div>
            <div className="bg-card border border-magenta/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Appeal Score</p>
              <div className="flex justify-center gap-1 my-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-magenta text-magenta" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">Exceptional</p>
            </div>
            <div className="bg-card border border-cyan/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Symmetry Index</p>
              <p className="text-4xl font-bold text-cyan">98.2%</p>
            </div>
          </div>

          {/* Final Lovable Rating */}
          <div className="bg-gradient-to-r from-cyan/10 to-magenta/10 border border-cyan rounded-lg p-8 text-center glow-cyan">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
              Final Lovable Rating
            </p>
            <p className="text-7xl font-black text-foreground mb-4">9.2</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exceptional midface harmony and defined structure — subtle strength and modern proportion.
            </p>
          </div>

          {/* AI Advice Section */}
          <div className="bg-card border border-magenta/30 rounded-lg p-8 space-y-4">
            <h3 className="text-2xl font-bold text-magenta">AI Analysis</h3>
            <p className="text-foreground leading-relaxed">
              Your gonial angle sits at 118°, giving you a strong, balanced jawline definition. 
              The nasofrontal angle of 117° is exceptionally well-proportioned, contributing to facial harmony.
            </p>
            <p className="text-foreground leading-relaxed">
              Minor nasal tip refinement could further enhance facial symmetry, though current measurements 
              indicate above-average aesthetic appeal with natural proportions.
            </p>
            <p className="text-muted-foreground text-sm italic">
              Overall aesthetic appeal rated 9.3/10 — balanced, photogenic, and naturally expressive.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center pt-4">
            <Button
              variant="outline"
              className="border-cyan text-cyan hover:bg-cyan hover:text-background"
            >
              View Details
            </Button>
            <Button
              variant="outline"
              className="border-magenta text-magenta hover:bg-magenta hover:text-background"
            >
              Get AI Advice
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center space-y-6 pb-12 animate-slide-up" style={{ animationDelay: "1s" }}>
        <div>
          <h4 className="text-2xl font-bold tracking-wider">LOVABLE // AI FACIAL ENGINE</h4>
          <p className="text-muted-foreground text-sm mt-2">
            Built to reveal what makes you unforgettable.
          </p>
        </div>
        <div className="flex gap-6 justify-center text-sm text-muted-foreground">
          <a href="#" className="hover:text-cyan transition-colors">About</a>
          <a href="#" className="hover:text-cyan transition-colors">Tech</a>
          <a href="#" className="hover:text-cyan transition-colors">Feedback</a>
          <a href="#" className="hover:text-cyan transition-colors">Privacy</a>
          <a href="#" className="hover:text-cyan transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
};

export default AnalysisPanel;
