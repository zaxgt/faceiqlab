import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface MetricDialogProps {
  isOpen: boolean;
  onClose: () => void;
  metric: {
    title: string;
    value: string;
    ideal: string;
    score: number;
    description: string;
    key: string;
  } | null;
  frontImage: string | null;
  profileImage: string | null;
  landmarks: any;
}

const MetricDialog = ({ isOpen, onClose, metric, frontImage, profileImage, landmarks }: MetricDialogProps) => {
  if (!metric) return null;

  // Determine which image to show based on metric type
  const useFrontImage = [
    "eyeToEyeSeparation", "cantalTilt", "eyebrowTilt", "yawSymmetry", 
    "nasalHeightToWidthRatio", "midfaceRatio"
  ].includes(metric.key);
  
  const displayImage = useFrontImage ? frontImage : profileImage;
  const imageLandmarks = useFrontImage ? landmarks?.front : landmarks?.profile;

  // Function to render measurement lines based on metric type
  const renderMeasurementLines = () => {
    if (!imageLandmarks) return null;

    switch (metric.key) {
      case "midfaceRatio":
        return (
          <>
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`} 
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${imageLandmarks.noseBottom.x * 100}%`}
              y1={`${imageLandmarks.noseBottom.y * 100}%`}
              x2={`${imageLandmarks.mouthTop.x * 100}%`}
              y2={`${imageLandmarks.mouthTop.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2"
            />
          </>
        );
      
      case "gonialAngle":
        return (
          <>
            <line 
              x1={`${imageLandmarks.jawAngle.x * 100}%`}
              y1={`${imageLandmarks.jawAngle.y * 100}%`}
              x2={`${imageLandmarks.chin.x * 100}%`}
              y2={`${imageLandmarks.chin.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <circle 
              cx={`${imageLandmarks.jawAngle.x * 100}%`}
              cy={`${imageLandmarks.jawAngle.y * 100}%`}
              r="5" fill="hsl(var(--magenta))"
            />
          </>
        );

      case "noseToMouthRatio":
        return (
          <>
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${imageLandmarks.noseTip.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${imageLandmarks.lipTop.x * 100}%`}
              y2={`${imageLandmarks.lipTop.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2"
            />
          </>
        );

      case "eyeToEyeSeparation":
        return (
          <>
            <circle cx={`${imageLandmarks.eyeLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="8" fill="none" stroke="hsl(var(--cyan))" strokeWidth="2"/>
            <circle cx={`${imageLandmarks.eyeRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="8" fill="none" stroke="hsl(var(--cyan))" strokeWidth="2"/>
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2" strokeDasharray="4"
            />
          </>
        );

      case "cantalTilt":
      case "eyebrowTilt":
        return (
          <>
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <circle cx={`${imageLandmarks.eyeLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="4" fill="hsl(var(--magenta))"/>
            <circle cx={`${imageLandmarks.eyeRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="4" fill="hsl(var(--magenta))"/>
          </>
        );

      case "yawSymmetry":
        return (
          <>
            <line 
              x1={`${imageLandmarks.faceCenter.x * 100}%`}
              y1="10%"
              x2={`${imageLandmarks.faceCenter.x * 100}%`}
              y2="90%"
              stroke="hsl(var(--cyan))" strokeWidth="2" strokeDasharray="4"
            />
            <circle cx={`${imageLandmarks.eyeLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="6" fill="none" stroke="hsl(var(--magenta))" strokeWidth="2"/>
            <circle cx={`${imageLandmarks.eyeRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="6" fill="none" stroke="hsl(var(--magenta))" strokeWidth="2"/>
          </>
        );

      case "nasalProjection":
      case "nasalTipAngle":
      case "nasofrontalAngle":
      case "nasolabialAngle":
        return (
          <>
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${imageLandmarks.noseTip.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${imageLandmarks.lipTop.x * 100}%`}
              y2={`${imageLandmarks.lipTop.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2"
            />
            <circle cx={`${imageLandmarks.noseTip.x * 100}%`} cy={`${imageLandmarks.noseTip.y * 100}%`} r="4" fill="hsl(var(--cyan))"/>
          </>
        );

      case "facialConvexityGlabella":
      case "facialConvexityNasion":
      case "totalFacialConvexity":
        return (
          <>
            <line 
              x1={`${imageLandmarks.forehead.x * 100}%`}
              y1={`${imageLandmarks.forehead.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${imageLandmarks.noseTip.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${imageLandmarks.chin.x * 100}%`}
              y2={`${imageLandmarks.chin.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2"
            />
          </>
        );

      case "nasalHeightToWidthRatio":
        return (
          <>
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseBottom.x * 100}%`}
              y2={`${imageLandmarks.noseBottom.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${imageLandmarks.noseLeft.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${imageLandmarks.noseRight.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="hsl(var(--magenta))" strokeWidth="2"
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card border-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan">{metric.title}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Understanding your measurement
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Current vs Ideal */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Your Measurement</p>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <p className="text-sm text-muted-foreground mb-1">Ideal Range</p>
              <p className="text-2xl font-bold text-cyan">{metric.ideal}</p>
            </div>
          </div>

          {/* Score Visualization */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Score</span>
              <span className="text-cyan font-semibold">{metric.score.toFixed(1)} / 10</span>
            </div>
            <div className="relative h-8 bg-muted rounded-full overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 ${
                  metric.score >= 9 ? 'bg-gradient-to-r from-cyan to-cyan/60' :
                  metric.score >= 7 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                  'bg-gradient-to-r from-red-500 to-red-700'
                }`}
                style={{ width: `${(metric.score / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Image with Measurement Lines */}
          <div className="bg-background/50 p-6 rounded-lg border border-cyan/30">
            <p className="text-sm text-muted-foreground mb-4">Your Measurement Visualization</p>
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
              {displayImage && (
                <>
                  <img 
                    src={displayImage} 
                    alt="Face measurement" 
                    className="w-full h-full object-cover"
                  />
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {renderMeasurementLines()}
                  </svg>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-gradient-to-r from-cyan/5 to-magenta/5 p-4 rounded-lg">
            <p className="text-sm text-foreground leading-relaxed">{metric.description}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDialog;
