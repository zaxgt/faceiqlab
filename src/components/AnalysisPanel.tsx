import MetricBar from "@/components/MetricBar";
import MetricDialog from "@/components/MetricDialog";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalysisPanelProps {
  profileImage: string | null;
  frontImage: string | null;
}

const metrics = [
  { 
    title: "Midface Ratio", 
    value: "0.98", 
    ideal: "0.95-1.00", 
    score: 7.8, 
    color: "cyan",
    description: "The midface ratio measures the vertical proportion of your middle face. A ratio closer to the golden proportion creates balanced facial harmony."
  },
  { 
    title: "Gonial Angle", 
    value: "118.0°", 
    ideal: "120-130°", 
    score: 7.2, 
    color: "cyan",
    description: "The gonial angle defines your jawline sharpness. Angles within 120-130° create the most defined, masculine jaw structure."
  },
  { 
    title: "Nose-to-Mouth Ratio", 
    value: "1.05", 
    ideal: "1.20-1.30", 
    score: 6.5, 
    color: "cyan",
    description: "This ratio measures the balance between your nose length and upper lip distance. Higher ratios indicate better facial proportionality."
  },
  { 
    title: "Eye-to-Eye Separation", 
    value: "0.92", 
    ideal: "0.88-0.95", 
    score: 9.5, 
    color: "cyan",
    description: "Interocular spacing affects perceived facial balance. Your measurement falls within the ideal range for harmonious eye placement."
  },
  { 
    title: "Cantal Tilt", 
    value: "4.2°", 
    ideal: "5-8°", 
    score: 7.0, 
    color: "magenta",
    description: "Cantal tilt is the angle of your outer eye corners. A positive tilt of 5-8° creates the most attractive, youthful eye shape."
  },
  { 
    title: "Eyebrow Tilt", 
    value: "3.8°", 
    ideal: "2-5°", 
    score: 9.6, 
    color: "magenta",
    description: "Eyebrow angle defines facial expression and frame. Your tilt is well-positioned within the ideal expressive range."
  },
  { 
    title: "Yaw Symmetry", 
    value: "98.2%", 
    ideal: "95-100%", 
    score: 9.8, 
    color: "cyan",
    description: "Yaw symmetry measures how centered and balanced your face appears. Higher percentages indicate exceptional facial alignment."
  },
  { 
    title: "Nasal Projection", 
    value: "14.2mm", 
    ideal: "12-16mm", 
    score: 9.3, 
    color: "cyan",
    description: "Nasal projection measures how far your nose extends from your face. Your measurement shows excellent dimensional balance."
  },
  { 
    title: "Nasal Tip Angle", 
    value: "127.9°", 
    ideal: "95-115°", 
    score: 5.8, 
    color: "magenta",
    description: "The nasal tip angle affects the overall nose profile. Angles within 95-115° are considered most aesthetically refined."
  },
  { 
    title: "Nasofrontal Angle", 
    value: "117.1°", 
    ideal: "115-135°", 
    score: 10.0, 
    color: "cyan",
    description: "This angle measures the transition from forehead to nose bridge. Your measurement indicates perfect upper face harmony."
  },
  { 
    title: "Nasolabial Angle", 
    value: "102.5°", 
    ideal: "90-120°", 
    score: 9.5, 
    color: "magenta",
    description: "The nasolabial angle defines the curvature between nose and upper lip. Your angle creates excellent facial flow."
  },
  { 
    title: "Facial Convexity (Glabella)", 
    value: "168.4°", 
    ideal: "165-175°", 
    score: 9.6, 
    color: "cyan",
    description: "Measures the forehead-to-midface curvature. Your measurement shows strong forward projection and balanced profile."
  },
  { 
    title: "Facial Convexity (Nasion)", 
    value: "166.2°", 
    ideal: "160-170°", 
    score: 9.7, 
    color: "magenta",
    description: "This measures midface-to-nose harmony. Your convexity indicates excellent proportional smoothness."
  },
  { 
    title: "Total Facial Convexity", 
    value: "167.8°", 
    ideal: "165-175°", 
    score: 9.7, 
    color: "cyan",
    description: "Overall facial profile curvature. Your measurement demonstrates strong dimensional proportionality."
  },
  { 
    title: "Nasal Height-to-Width Ratio", 
    value: "1.12", 
    ideal: "1.00-1.20", 
    score: 9.4, 
    color: "magenta",
    description: "Defines nose balance from front view. Your ratio shows well-proportioned nasal dimensions."
  },
];

const AnalysisPanel = ({ profileImage, frontImage }: AnalysisPanelProps) => {
  const [selectedMetric, setSelectedMetric] = useState<typeof metrics[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

  const handleMetricClick = (metric: typeof metrics[0]) => {
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };

  const handleGetAiAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const { data, error } = await supabase.functions.invoke('facial-advice', {
        body: { metrics }
      });

      if (error) throw error;

      setAiAdvice(data.advice);
      toast.success("AI advice generated!");
    } catch (error) {
      console.error('Error getting AI advice:', error);
      toast.error("Failed to get AI advice. Please try again.");
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const overallScore = (metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length).toFixed(1);

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
          {/* Images with Geometry */}
          <div className="space-y-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <div className="grid grid-cols-2 gap-4">
              {/* Front Image */}
              {frontImage && (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-magenta/30 glow-subtle">
                  <img
                    src={frontImage}
                    alt="Front view analysis"
                    className="w-full h-full object-cover"
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                    <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="hsl(var(--cyan))" strokeWidth="2" strokeDasharray="4" />
                    <line x1="20%" y1="35%" x2="80%" y2="35%" stroke="hsl(var(--magenta))" strokeWidth="2" />
                  </svg>
                </div>
              )}
              
              {/* Profile Image */}
              {profileImage && (
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-cyan/30 glow-subtle">
                  <img
                    src={profileImage}
                    alt="Profile analysis"
                    className="w-full h-full object-cover"
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
                    <line x1="20%" y1="30%" x2="80%" y2="30%" stroke="hsl(var(--cyan))" strokeWidth="2" />
                    <line x1="20%" y1="45%" x2="80%" y2="45%" stroke="hsl(var(--magenta))" strokeWidth="2" />
                    <line x1="20%" y1="60%" x2="80%" y2="60%" stroke="hsl(var(--cyan))" strokeWidth="2" />
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            {metrics.map((metric, index) => (
              <div key={metric.title} onClick={() => handleMetricClick(metric)} className="cursor-pointer">
                <MetricBar
                  title={metric.title}
                  value={metric.value}
                  ideal={metric.ideal}
                  score={metric.score}
                  color={metric.color as "cyan" | "magenta"}
                  delay={index * 0.05}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Overall Ratings */}
        <div className="mt-16 space-y-8 animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-cyan/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Overall Balance</p>
              <p className="text-4xl font-bold text-cyan">{overallScore}</p>
              <p className="text-xs text-muted-foreground mt-1">/ 10</p>
            </div>
            <div className="bg-card border border-magenta/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Appeal Score</p>
              <div className="flex justify-center gap-1 my-2">
                {[...Array(Math.round(parseFloat(overallScore) / 2))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-magenta text-magenta" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(overallScore) >= 9 ? "Exceptional" : parseFloat(overallScore) >= 7 ? "Strong" : "Developing"}
              </p>
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
            <p className="text-7xl font-black text-foreground mb-4">{overallScore}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {parseFloat(overallScore) >= 9 
                ? "Exceptional facial harmony with well-defined structure and modern proportions."
                : parseFloat(overallScore) >= 7
                ? "Strong facial balance with good proportions and aesthetic appeal."
                : "Developing facial structure with areas for enhancement and refinement."}
            </p>
          </div>

          {/* AI Advice Section */}
          <div className="bg-card border border-magenta/30 rounded-lg p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-magenta">AI Analysis</h3>
              {!aiAdvice && (
                <Button
                  onClick={handleGetAiAdvice}
                  disabled={isLoadingAdvice}
                  className="bg-magenta text-white hover:bg-magenta/90"
                >
                  {isLoadingAdvice ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Get AI Advice"
                  )}
                </Button>
              )}
            </div>
            {aiAdvice ? (
              <div className="text-foreground leading-relaxed whitespace-pre-wrap">{aiAdvice}</div>
            ) : (
              <p className="text-muted-foreground italic">
                Click "Get AI Advice" to receive personalized recommendations based on your facial measurements.
              </p>
            )}
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

      <MetricDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        metric={selectedMetric}
      />
    </div>
  );
};

export default AnalysisPanel;
