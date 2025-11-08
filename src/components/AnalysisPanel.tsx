import MetricBar from "@/components/MetricBar";
import MetricDialog from "@/components/MetricDialog";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
interface AnalysisPanelProps {
  profileImage: string | null;
  frontImage: string | null;
}

const metricDefinitions = [
  {
    key: "midfaceRatio",
    title: "Midface Ratio",
    ideal: "0.95-1.00",
    color: "cyan",
    description: "The midface ratio measures the vertical proportion of your middle face. A ratio closer to the golden proportion creates balanced facial harmony."
  },
  {
    key: "gonialAngle",
    title: "Gonial Angle",
    ideal: "120-130°",
    color: "cyan",
    description: "The gonial angle defines your jawline sharpness. Angles within 120-130° create the most defined, masculine jaw structure."
  },
  {
    key: "noseToMouthRatio",
    title: "Nose-to-Mouth Ratio",
    ideal: "1.20-1.30",
    color: "cyan",
    description: "This ratio measures the balance between your nose length and upper lip distance. Higher ratios indicate better facial proportionality."
  },
  {
    key: "eyeToEyeSeparation",
    title: "Eye-to-Eye Separation",
    ideal: "0.88-0.95",
    color: "cyan",
    description: "Interocular spacing affects perceived facial balance. Your measurement falls within the ideal range for harmonious eye placement."
  },
  {
    key: "cantalTilt",
    title: "Cantal Tilt",
    ideal: "5-8°",
    color: "magenta",
    description: "Cantal tilt is the angle of your outer eye corners. A positive tilt of 5-8° creates the most attractive, youthful eye shape."
  },
  {
    key: "eyebrowTilt",
    title: "Eyebrow Tilt",
    ideal: "2-5°",
    color: "magenta",
    description: "Eyebrow angle defines facial expression and frame. Your tilt is well-positioned within the ideal expressive range."
  },
  {
    key: "yawSymmetry",
    title: "Yaw Symmetry",
    ideal: "95-100%",
    color: "cyan",
    description: "Yaw symmetry measures how centered and balanced your face appears. Higher percentages indicate exceptional facial alignment."
  },
  {
    key: "nasalProjection",
    title: "Nasal Projection",
    ideal: "12-16mm",
    color: "cyan",
    description: "Nasal projection measures how far your nose extends from your face. Your measurement shows excellent dimensional balance."
  },
  {
    key: "nasalTipAngle",
    title: "Nasal Tip Angle",
    ideal: "95-115°",
    color: "magenta",
    description: "The nasal tip angle affects the overall nose profile. Angles within 95-115° are considered most aesthetically refined."
  },
  {
    key: "nasofrontalAngle",
    title: "Nasofrontal Angle",
    ideal: "115-135°",
    color: "cyan",
    description: "This angle measures the transition from forehead to nose bridge. Your measurement indicates perfect upper face harmony."
  },
  {
    key: "nasolabialAngle",
    title: "Nasolabial Angle",
    ideal: "90-120°",
    color: "magenta",
    description: "The nasolabial angle defines the curvature between nose and upper lip. Your angle creates excellent facial flow."
  },
  {
    key: "facialConvexityGlabella",
    title: "Facial Convexity (Glabella)",
    ideal: "165-175°",
    color: "cyan",
    description: "Measures the forehead-to-midface curvature. Your measurement shows strong forward projection and balanced profile."
  },
  {
    key: "facialConvexityNasion",
    title: "Facial Convexity (Nasion)",
    ideal: "160-170°",
    color: "magenta",
    description: "This measures midface-to-nose harmony. Your convexity indicates excellent proportional smoothness."
  },
  {
    key: "totalFacialConvexity",
    title: "Total Facial Convexity",
    ideal: "165-175°",
    color: "cyan",
    description: "Overall facial profile curvature. Your measurement demonstrates strong dimensional proportionality."
  },
  {
    key: "nasalHeightToWidthRatio",
    title: "Nasal Height-to-Width Ratio",
    ideal: "1.00-1.20",
    color: "magenta",
    description: "Defines nose balance from front view. Your ratio shows well-proportioned nasal dimensions."
  }
];
const AnalysisPanel = ({
  profileImage,
  frontImage
}: AnalysisPanelProps) => {
  const [selectedMetric, setSelectedMetric] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [aiAdvice, setAiAdvice] = useState<string>("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [faceDetected, setFaceDetected] = useState(true);
  const [landmarks, setLandmarks] = useState<any>(null);

  useEffect(() => {
    const analyzeImages = async () => {
      setIsAnalyzing(true);
      try {
        const { data, error } = await supabase.functions.invoke('analyze-face', {
          body: {
            frontImage,
            profileImage
          }
        });

        if (error) throw error;

        setFaceDetected(data.faceDetected);
        setLandmarks(data.landmarks);
        
        // Transform the API response into the metrics array
        const analyzedMetrics = metricDefinitions.map(def => ({
          title: def.title,
          value: data.metrics[def.key].value,
          ideal: def.ideal,
          score: data.metrics[def.key].score,
          color: def.color,
          description: def.description,
          key: def.key
        }));

        setMetrics(analyzedMetrics);

        if (!data.faceDetected) {
          toast.error("No face detected in the images. All scores set to 0.");
        } else {
          toast.success("Facial analysis complete!");
        }
      } catch (error) {
        console.error('Error analyzing face:', error);
        toast.error("Failed to analyze face. Using default values.");
        
        // Set all metrics to 0
        const zeroMetrics = metricDefinitions.map(def => ({
          title: def.title,
          value: "0.00",
          ideal: def.ideal,
          score: 0,
          color: def.color,
          description: def.description,
          key: def.key
        }));
        setMetrics(zeroMetrics);
        setFaceDetected(false);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeImages();
  }, [frontImage, profileImage]);
  const handleMetricClick = (metric: any) => {
    setSelectedMetric(metric);
    setIsDialogOpen(true);
  };
  const handleGetAiAdvice = async () => {
    setIsLoadingAdvice(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('facial-advice', {
        body: {
          metrics
        }
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
  const overallScore = metrics.length > 0 
    ? (metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length).toFixed(1)
    : "0.0";

  // Get symmetry from yawSymmetry metric
  const symmetryMetric = metrics.find(m => m.key === "yawSymmetry");
  const symmetryValue = symmetryMetric ? symmetryMetric.value : "0.0%";

  if (isAnalyzing) {
    return <div className="min-h-screen px-4 py-12 flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin text-cyan mx-auto" />
        <h2 className="text-2xl font-bold">Analyzing Your Facial Structure...</h2>
        <p className="text-muted-foreground">This may take a moment</p>
      </div>
    </div>;
  }

  return <div className="min-h-screen px-4 py-12">
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
          <div className="space-y-6 animate-slide-up" style={{
          animationDelay: "0.1s"
        }}>
            <div className="grid grid-cols-2 gap-4">
              {/* Front Image */}
              {frontImage && landmarks?.front && <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-magenta/30 glow-subtle">
                  <img src={frontImage} alt="Front view analysis" className="w-full h-full object-cover" />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70">
                    <line 
                      x1={`${landmarks.front.faceCenter.x * 100}%`}
                      y1="10%"
                      x2={`${landmarks.front.faceCenter.x * 100}%`}
                      y2="90%"
                      stroke="hsl(var(--cyan))" strokeWidth="2" strokeDasharray="4"
                    />
                    <line 
                      x1={`${landmarks.front.eyeLeft.x * 100}%`}
                      y1={`${landmarks.front.eyeLeft.y * 100}%`}
                      x2={`${landmarks.front.eyeRight.x * 100}%`}
                      y2={`${landmarks.front.eyeRight.y * 100}%`}
                      stroke="hsl(var(--magenta))" strokeWidth="2"
                    />
                    <circle cx={`${landmarks.front.noseTip.x * 100}%`} cy={`${landmarks.front.noseTip.y * 100}%`} r="3" fill="hsl(var(--cyan))"/>
                  </svg>
                </div>}
              
              {/* Profile Image */}
              {profileImage && landmarks?.profile && <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-cyan/30 glow-subtle">
                  <img src={profileImage} alt="Profile analysis" className="w-full h-full object-cover" />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70">
                    <line 
                      x1={`${landmarks.profile.forehead.x * 100}%`}
                      y1={`${landmarks.profile.forehead.y * 100}%`}
                      x2={`${landmarks.profile.noseTip.x * 100}%`}
                      y2={`${landmarks.profile.noseTip.y * 100}%`}
                      stroke="hsl(var(--cyan))" strokeWidth="2"
                    />
                    <line 
                      x1={`${landmarks.profile.noseTip.x * 100}%`}
                      y1={`${landmarks.profile.noseTip.y * 100}%`}
                      x2={`${landmarks.profile.chin.x * 100}%`}
                      y2={`${landmarks.profile.chin.y * 100}%`}
                      stroke="hsl(var(--magenta))" strokeWidth="2"
                    />
                    <circle cx={`${landmarks.profile.jawAngle.x * 100}%`} cy={`${landmarks.profile.jawAngle.y * 100}%`} r="4" fill="hsl(var(--cyan))"/>
                  </svg>
                </div>}
            </div>
          </div>

          {/* Metrics Panel */}
          <div className="space-y-4">
            {metrics.map((metric, index) => <div key={metric.title} onClick={() => handleMetricClick(metric)} className="cursor-pointer">
                <MetricBar title={metric.title} value={metric.value} ideal={metric.ideal} score={metric.score} color={metric.color as "cyan" | "magenta"} delay={index * 0.05} />
              </div>)}
          </div>
        </div>

        {/* Overall Ratings */}
        <div className="mt-16 space-y-8 animate-slide-up" style={{
        animationDelay: "0.8s"
      }}>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-card border border-cyan/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Overall Balance</p>
              <p className="text-4xl font-bold text-cyan">{overallScore}</p>
              <p className="text-xs text-muted-foreground mt-1">/ 10</p>
            </div>
            <div className="bg-card border border-magenta/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Appeal Score</p>
              <div className="flex justify-center gap-1 my-2">
                {[...Array(Math.round(parseFloat(overallScore) / 2))].map((_, i) => <Star key={i} className="w-5 h-5 fill-magenta text-magenta" />)}
              </div>
              <p className="text-xs text-muted-foreground">
                {parseFloat(overallScore) >= 9 ? "Exceptional" : parseFloat(overallScore) >= 7 ? "Strong" : "Developing"}
              </p>
            </div>
            <div className="bg-card border border-cyan/30 rounded-lg p-6 text-center hover:glow-subtle transition-all">
              <p className="text-sm text-muted-foreground mb-2">Symmetry Index</p>
              <p className="text-4xl font-bold text-cyan">{symmetryValue}</p>
            </div>
          </div>

          {/* Final Lovable Rating */}
          <div className="bg-gradient-to-r from-cyan/10 to-magenta/10 border border-cyan rounded-lg p-8 text-center glow-cyan">
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">
              Final Lovable Rating
            </p>
            <p className="text-7xl font-black text-foreground mb-4">{overallScore}</p>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {parseFloat(overallScore) >= 9 ? "Exceptional facial harmony with well-defined structure and modern proportions." : parseFloat(overallScore) >= 7 ? "Strong facial balance with good proportions and aesthetic appeal." : "Developing facial structure with areas for enhancement and refinement."}
            </p>
          </div>

          {/* AI Advice Section */}
          <div className="bg-card border border-magenta/30 rounded-lg p-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-magenta">AI Analysis</h3>
              {!aiAdvice && <Button onClick={handleGetAiAdvice} disabled={isLoadingAdvice} className="bg-magenta text-white hover:bg-magenta/90">
                  {isLoadingAdvice ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </> : "Get AI Advice"}
                </Button>}
            </div>
            {aiAdvice ? <div className="text-foreground leading-relaxed whitespace-pre-wrap">{aiAdvice}</div> : <p className="text-muted-foreground italic">
                Click "Get AI Advice" to receive personalized recommendations based on your facial measurements.
              </p>}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-24 text-center space-y-6 pb-12 animate-slide-up" style={{
      animationDelay: "1s"
    }}>
        <div>
          <h4 className="text-2xl font-bold tracking-wider my-0 text-center">LOVE // AI FACIAL ENGINE 
SO YOU CAN 
FEEL YOUR BEST AND BE THE BEST</h4>
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
        frontImage={frontImage}
        profileImage={profileImage}
        landmarks={landmarks}
      />
    </div>;
};
export default AnalysisPanel;