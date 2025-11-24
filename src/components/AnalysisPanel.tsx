import MetricBar from "@/components/MetricBar";
import MetricDialog from "@/components/MetricDialog";
import TierRatingCard from "@/components/TierRatingCard";
import { Star, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { calculateMetrics } from "@/utils/facialAnalysis";
import { calculateTierRating } from "@/utils/tierRating";
interface AnalysisPanelProps {
  profileImage: string | null;
  frontImage: string | null;
}
const metricDefinitions = [{
  key: "interpupillaryDistance",
  title: "Interpupillary Distance (IPD)",
  ideal: "58-72mm",
  color: "cyan",
  description: "The distance between the centers of your pupils. This measurement is crucial for facial balance and eye spacing. Average adult IPD is around 63mm."
}, {
  key: "intercanthalDistance",
  title: "Intercanthal Distance",
  ideal: "28-35mm",
  color: "magenta",
  description: "The distance between the inner corners of your eyes. This affects the perception of eye width and facial harmony."
}, {
  key: "biocularWidth",
  title: "Biocular Width",
  ideal: "85-105mm",
  color: "cyan",
  description: "The distance between the outer corners of your eyes. This measurement defines the horizontal span of your eyes."
}, {
  key: "canthalIndex",
  title: "Canthal Index",
  ideal: "45-55%",
  color: "magenta",
  description: "Ratio of intercanthal distance to interpupillary distance. Ideal range creates balanced eye spacing and facial width."
}, {
  key: "palpebralFissureLength",
  title: "Palpebral Fissure Length",
  ideal: "8-12mm",
  color: "cyan",
  description: "The height of your eye opening. This measurement affects eye shape and overall eye appearance."
}, {
  key: "topThird",
  title: "Top Third (Forehead)",
  ideal: "25-30%",
  color: "magenta",
  description: "The top third measures your forehead height as a percentage of total face height. Ideally this should be around 25-30% for balanced facial proportions."
}, {
  key: "middleThird",
  title: "Middle Third (Midface)",
  ideal: "25-30%",
  color: "cyan",
  description: "The middle third measures from eyebrow line to nose bottom. This should be around 25-30% of your total face height for ideal harmony."
}, {
  key: "lowerThird",
  title: "Lower Third Proportion",
  ideal: "30-40%",
  color: "magenta",
  description: "The lower third measures from nose bottom to chin. Balanced proportion creates strong, harmonious lower face structure."
}, {
  key: "midfaceRatio",
  title: "Midface Ratio",
  ideal: "30-35%",
  color: "cyan",
  description: "The proportion of the midface relative to total facial height. Balanced midface creates youthful, attractive proportions."
}, {
  key: "lowerThirdToMidfaceRatio",
  title: "Lower Third to Midface Ratio",
  ideal: "0.95-1.05×",
  color: "magenta",
  description: "Compares lower third height to midface height. Balanced ratio creates harmonious vertical facial proportions."
}, {
  key: "totalFacialWidthToHeightRatio",
  title: "Total Facial Width to Height Ratio",
  ideal: "1.12-1.57×",
  color: "cyan",
  description: "This ratio compares the widest part of your face to its total height. A balanced ratio creates optimal facial proportions."
}, {
  key: "facialWidthToHeightRatio",
  title: "Facial Width to Height Ratio (FWHR)",
  ideal: "1.75-1.95×",
  color: "magenta",
  description: "Key attractiveness metric comparing cheekbone width to face height. Higher values suggest stronger, more dominant facial structure."
}, {
  key: "bigonialToBizygomaticRatio",
  title: "Bigonial to Bizygomatic Ratio",
  ideal: "70-85%",
  color: "cyan",
  description: "This compares jaw width to cheekbone width. Lower percentages create more V-shaped, tapered facial structure."
}, {
  key: "jawToCheekboneRatio",
  title: "Jaw to Cheekbone Ratio",
  ideal: "0.75-0.90×",
  color: "magenta",
  description: "Compares jaw width to cheekbone width. Lower ratios indicate stronger facial tapering and definition."
}, {
  key: "templeToJawRatio",
  title: "Temple to Jaw Ratio",
  ideal: "0.85-1.05×",
  color: "cyan",
  description: "Compares temple width to jaw width. Balanced ratio creates harmonious facial tapering from top to bottom."
}, {
  key: "eyeSeparationRatio",
  title: "Eye Separation Ratio",
  ideal: "40-50%",
  color: "magenta",
  description: "Inner eye distance as percentage of face width. Optimal ratio creates balanced eye positioning."
}, {
  key: "noseToMouthRatio",
  title: "Nose to Mouth Width Ratio",
  ideal: "1.20-1.35×",
  color: "cyan",
  description: "This ratio compares mouth width to nose width. Optimal ratio creates balanced mid-to-lower face proportions."
}, {
  key: "mouthToNoseWidthRatio",
  title: "Mouth to Nose Width Ratio (Outer)",
  ideal: "1.40-1.60×",
  color: "magenta",
  description: "Compares outer mouth width to nose width. Proper ratio enhances lower face aesthetics and smile width."
}, {
  key: "nasalHeightToWidthRatio",
  title: "Nasal Height to Width Ratio",
  ideal: "1.00-1.20×",
  color: "cyan",
  description: "Defines nose balance from front view. Your ratio shows well-proportioned nasal dimensions."
}, {
  key: "nasalIndexRatio",
  title: "Nasal Index",
  ideal: "60-85%",
  color: "magenta",
  description: "Nose width as percentage of nose height. Indicates nasal shape classification and proportionality."
}, {
  key: "lipThicknessRatio",
  title: "Lip Thickness Ratio",
  ideal: "0.80-1.20×",
  color: "cyan",
  description: "Ratio of upper lip to lower lip thickness. Balanced ratio creates harmonious mouth appearance."
}, {
  key: "chinToPhiltrumRatio",
  title: "Chin to Philtrum Ratio",
  ideal: "1.80-2.20×",
  color: "magenta",
  description: "Compares chin height to philtrum height. Proper ratio creates balanced lower third proportions and strong chin definition."
}, {
  key: "gonialAngle",
  title: "Gonial Angle (Jaw Angle)",
  ideal: "120-130°",
  color: "cyan",
  description: "The gonial angle defines your jawline sharpness. Angles within 120-130° create the most defined, angular jaw structure."
}, {
  key: "cantalTilt",
  title: "Canthal Tilt",
  ideal: "5-8°",
  color: "magenta",
  description: "Cantal tilt is the angle of your outer eye corners. A positive tilt of 5-8° creates the most attractive, youthful eye shape."
}, {
  key: "eyebrowTilt",
  title: "Eyebrow Tilt",
  ideal: "2-5°",
  color: "cyan",
  description: "Eyebrow angle defines facial expression and frame. Your tilt is well-positioned within the ideal expressive range."
}, {
  key: "yawSymmetry",
  title: "Yaw Symmetry",
  ideal: "95-100%",
  color: "magenta",
  description: "Yaw symmetry measures how centered and balanced your face appears. Higher percentages indicate exceptional facial alignment."
}, {
  key: "nasalProjection",
  title: "Nasal Projection",
  ideal: "12-18mm",
  color: "cyan",
  description: "Nasal projection measures how far your nose extends from your face. Your measurement shows excellent dimensional balance."
}, {
  key: "nasalTipAngle",
  title: "Nasal Tip Angle",
  ideal: "95-115°",
  color: "magenta",
  description: "The nasal tip angle affects the overall nose profile. Angles within 95-115° are considered most aesthetically refined."
}, {
  key: "nasofrontalAngle",
  title: "Nasofrontal Angle",
  ideal: "115-135°",
  color: "cyan",
  description: "This angle measures the transition from forehead to nose bridge. Your measurement indicates perfect upper face harmony."
}, {
  key: "nasolabialAngle",
  title: "Nasolabial Angle",
  ideal: "90-120°",
  color: "magenta",
  description: "The nasolabial angle defines the curvature between nose and upper lip. Your angle creates excellent facial flow."
}, {
  key: "facialConvexityGlabella",
  title: "Facial Convexity (Glabella)",
  ideal: "155-170°",
  color: "cyan",
  description: "Measures the forehead-to-midface curvature. Your measurement shows strong forward projection and balanced profile."
}, {
  key: "totalFacialConvexity",
  title: "Total Facial Convexity",
  ideal: "125-135°",
  color: "magenta",
  description: "Overall facial profile curvature. Your measurement demonstrates strong dimensional proportionality."
}, {
  key: "faceWidthToHeightRatio",
  title: "Face Width to Height at Eye Level",
  ideal: "1.58-2.36×",
  color: "cyan",
  description: "This measures face width at eye level to forehead height. Balanced ratio defines overall facial shape and structure."
}];
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
  const [contactMessage, setContactMessage] = useState("");
  const [isSendingContact, setIsSendingContact] = useState(false);
  useEffect(() => {
    const analyzeImages = async () => {
      if (!frontImage) return;
      
      setIsAnalyzing(true);
      try {
        const result = await calculateMetrics(frontImage, profileImage);
        
        setFaceDetected(result.faceDetected);
        setLandmarks(result.landmarks);

        // Transform the result into the metrics array
        const analyzedMetrics = metricDefinitions.map(def => ({
          title: def.title,
          value: result.metrics[def.key].value,
          ideal: def.ideal,
          score: result.metrics[def.key].score,
          color: def.color,
          description: def.description,
          key: def.key
        }));
        setMetrics(analyzedMetrics);
        
        if (!result.faceDetected) {
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

  const handleSendContact = async () => {
    if (!contactMessage.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSendingContact(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact', {
        body: {
          message: contactMessage,
          rating: overallScore
        }
      });
      
      if (error) throw error;
      
      toast.success("Message sent successfully!");
      setContactMessage("");
    } catch (error) {
      console.error('Error sending contact message:', error);
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSendingContact(false);
    }
  };
  const overallScore = metrics.length > 0 ? (metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length).toFixed(1) : "0.0";
  const tierRating = calculateTierRating(parseFloat(overallScore));

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
              {frontImage && <div className="relative rounded-lg overflow-hidden border border-magenta/30 glow-subtle">
                  <img src={frontImage} alt="Front view analysis" className="w-full object-contain" />
                </div>}
              
              {/* Profile Image */}
              {profileImage && <div className="relative rounded-lg overflow-hidden border border-cyan/30 glow-subtle">
                  <img src={profileImage} alt="Profile analysis" className="w-full object-contain" />
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

        {/* Tier Rating Card */}
        <div className="mt-16 animate-slide-up" style={{ animationDelay: "0.8s" }}>
          <TierRatingCard tierRating={tierRating} overallScore={overallScore} />
        </div>

        {/* Contact Box */}
        <div className="mt-8 bg-card border border-cyan/30 rounded-lg p-6 space-y-4 animate-slide-up" style={{ animationDelay: "0.9s" }}>
          <h3 className="text-xl font-bold text-cyan">Contact & Feedback</h3>
          <p className="text-sm text-muted-foreground">Have questions or want to share your thoughts? Send us a message!</p>
          <Textarea
            value={contactMessage}
            onChange={(e) => setContactMessage(e.target.value)}
            placeholder="Type your message here..."
            className="min-h-[100px] resize-none"
          />
          <Button 
            onClick={handleSendContact} 
            disabled={isSendingContact || !contactMessage.trim()}
            className="w-full bg-cyan text-black hover:bg-cyan/90"
          >
            {isSendingContact ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </>
            )}
          </Button>
        </div>

        {/* Overall Ratings */}
        <div className="mt-8 space-y-8">
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
            <p className="text-sm text-muted-foreground mb-2 uppercase tracking-wider">FINAL RATING</p>
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

      <MetricDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} metric={selectedMetric} frontImage={frontImage} profileImage={profileImage} landmarks={landmarks} />
    </div>;
};
export default AnalysisPanel;