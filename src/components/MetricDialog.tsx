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
  // Front image: things visible from the front
  // Profile image: things visible from the side (angles, projections, convexity)
  const useFrontImage = [
    "eyeToEyeSeparation", "cantalTilt", "eyebrowTilt", "yawSymmetry", 
    "nasalHeightToWidthRatio", "topThird", "middleThird", "lowerThird"
  ].includes(metric.key);
  
  const useProfileImage = [
    "gonialAngle", "nasalProjection", "nasalTipAngle", "nasofrontalAngle",
    "nasolabialAngle", "facialConvexityGlabella", "facialConvexityNasion",
    "totalFacialConvexity", "noseToMouthRatio"
  ].includes(metric.key);
  
  const displayImage = useProfileImage ? profileImage : useFrontImage ? frontImage : null;
  const imageLandmarks = useProfileImage ? landmarks?.profile : useFrontImage ? landmarks?.front : null;

  // Calculate zoom region based on metric type
  const getZoomStyle = () => {
    if (!imageLandmarks) return {};

    switch (metric.key) {
      case "eyeToEyeSeparation":
      case "cantalTilt":
      case "eyebrowTilt":
        // Zoom to eye region
        const eyeCenterX = ((imageLandmarks.eyeLeft?.x || 0.3) + (imageLandmarks.eyeRight?.x || 0.7)) / 2;
        const eyeCenterY = ((imageLandmarks.eyeLeft?.y || 0.35) + (imageLandmarks.eyeRight?.y || 0.35)) / 2;
        return {
          transform: `scale(2.5) translate(${(0.5 - eyeCenterX) * 40}%, ${(0.35 - eyeCenterY) * 40}%)`,
          transformOrigin: 'center center'
        };
      
      case "nasalHeightToWidthRatio":
      case "noseToMouthRatio":
        // Zoom to nose region
        const noseCenterX = imageLandmarks.noseTip?.x || 0.5;
        const noseCenterY = imageLandmarks.noseTip?.y || 0.5;
        return {
          transform: `scale(2.2) translate(${(0.5 - noseCenterX) * 45}%, ${(0.5 - noseCenterY) * 45}%)`,
          transformOrigin: 'center center'
        };
      
      case "topThird":
        // Zoom to show full face thirds
        return {
          transform: 'scale(1.3)',
          transformOrigin: 'center 30%'
        };
      
      case "middleThird":
        return {
          transform: 'scale(1.3)',
          transformOrigin: 'center 50%'
        };
      
      case "lowerThird":
        return {
          transform: 'scale(1.3)',
          transformOrigin: 'center 70%'
        };
      
      case "yawSymmetry":
        // Full face view
        return {
          transform: 'scale(1.2)',
          transformOrigin: 'center center'
        };
      
      case "gonialAngle":
      case "facialConvexityGlabella":
      case "facialConvexityNasion":
      case "totalFacialConvexity":
        // Profile view - show jaw/chin area
        return {
          transform: 'scale(1.5)',
          transformOrigin: 'center 60%'
        };
      
      case "nasalProjection":
      case "nasalTipAngle":
      case "nasofrontalAngle":
      case "nasolabialAngle":
        // Profile nose area
        return {
          transform: 'scale(2)',
          transformOrigin: 'center 45%'
        };
      
      default:
        return {
          transform: 'scale(1.2)',
          transformOrigin: 'center center'
        };
    }
  };

  // Function to render measurement lines based on metric type
  const renderMeasurementLines = () => {
    if (!imageLandmarks) return null;

    switch (metric.key) {
      case "topThird":
      case "middleThird":
      case "lowerThird":
        if (!imageLandmarks.faceCenter || !imageLandmarks.noseTop || !imageLandmarks.noseBottom || !imageLandmarks.eyeLeft || !imageLandmarks.jawLeft) return null;
        return (
          <>
            {/* Vertical center line */}
            <line 
              x1={`${imageLandmarks.faceCenter.x * 100}%`}
              y1="5%"
              x2={`${imageLandmarks.faceCenter.x * 100}%`}
              y2="95%"
              stroke="hsl(var(--cyan))" 
              strokeWidth="2"
            />
            
            {/* Top third boundary - forehead to eyebrow level */}
            <line 
              x1="10%"
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2="90%"
              y2={`${imageLandmarks.noseTop.y * 100}%`}
              stroke="hsl(var(--magenta))" 
              strokeWidth="2"
            />
            <text
              x="50%"
              y={`${((imageLandmarks.eyeLeft.y - 0.15) * 100)}%`}
              fill="hsl(var(--cyan))"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-lg"
            >
              {imageLandmarks.topThirdPercent || '29.4%'}
            </text>
            
            {/* Middle third boundary - nose bottom */}
            <line 
              x1="10%"
              y1={`${imageLandmarks.noseBottom.y * 100}%`}
              x2="90%"
              y2={`${imageLandmarks.noseBottom.y * 100}%`}
              stroke="hsl(var(--magenta))" 
              strokeWidth="2"
            />
            <text
              x="50%"
              y={`${((imageLandmarks.noseTop.y + imageLandmarks.noseBottom.y) / 2 * 100)}%`}
              fill="hsl(var(--cyan))"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-lg"
            >
              {imageLandmarks.middleThirdPercent || '31.8%'}
            </text>
            
            {/* Lower third - no bottom line needed, just text */}
            <text
              x="50%"
              y={`${((imageLandmarks.noseBottom.y + imageLandmarks.jawLeft.y) / 2 * 100 + 5)}%`}
              fill="hsl(var(--cyan))"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-lg"
            >
              {imageLandmarks.lowerThirdPercent || '38.8%'}
            </text>
          </>
        );
      
      case "gonialAngle":
        if (!imageLandmarks.jawAngle || !imageLandmarks.chin) return null;
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
        // Show nose base to upper lip distance vs nose to nose base distance
        if (!imageLandmarks.noseTop || !imageLandmarks.noseBottom || !imageLandmarks.lipTop) return null;
        return (
          <>
            {/* Nose height (top to base) */}
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseBottom.x * 100}%`}
              y2={`${imageLandmarks.noseBottom.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            {/* Nose to mouth distance */}
            <line 
              x1={`${imageLandmarks.noseBottom.x * 100}%`}
              y1={`${imageLandmarks.noseBottom.y * 100}%`}
              x2={`${imageLandmarks.lipTop.x * 100}%`}
              y2={`${imageLandmarks.lipTop.y * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            {/* Markers */}
            <circle cx={`${imageLandmarks.noseTop.x * 100}%`} cy={`${imageLandmarks.noseTop.y * 100}%`} r="4" fill="#00D4FF"/>
            <circle cx={`${imageLandmarks.noseBottom.x * 100}%`} cy={`${imageLandmarks.noseBottom.y * 100}%`} r="4" fill="#FFFFFF"/>
            <circle cx={`${imageLandmarks.lipTop.x * 100}%`} cy={`${imageLandmarks.lipTop.y * 100}%`} r="4" fill="#FF00D4"/>
          </>
        );

      case "eyeToEyeSeparation":
        if (!imageLandmarks.faceCenter || !imageLandmarks.eyeLeft || !imageLandmarks.eyeRight) return null;
        return (
          <>
            {/* Vertical center line */}
            <line 
              x1={`${imageLandmarks.faceCenter.x * 100}%`}
              y1="5%"
              x2={`${imageLandmarks.faceCenter.x * 100}%`}
              y2="95%"
              stroke="hsl(var(--cyan))" 
              strokeWidth="2"
            />
            
            {/* Horizontal eye line */}
            <line 
              x1="10%"
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2="90%"
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="hsl(var(--cyan))" 
              strokeWidth="2"
            />
            
            {/* Eye separation measurement line */}
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="hsl(var(--magenta))" 
              strokeWidth="3"
            />
            
            {/* Eye markers */}
            <circle 
              cx={`${imageLandmarks.eyeLeft.x * 100}%`} 
              cy={`${imageLandmarks.eyeLeft.y * 100}%`} 
              r="6" 
              fill="none" 
              stroke="hsl(var(--cyan))" 
              strokeWidth="2"
            />
            <circle 
              cx={`${imageLandmarks.eyeRight.x * 100}%`} 
              cy={`${imageLandmarks.eyeRight.y * 100}%`} 
              r="6" 
              fill="none" 
              stroke="hsl(var(--cyan))" 
              strokeWidth="2"
            />
            
            {/* Value label */}
            <rect
              x={`${(imageLandmarks.faceCenter.x - 0.08) * 100}%`}
              y={`${(imageLandmarks.eyeLeft.y + 0.08) * 100}%`}
              width="16%"
              height="6%"
              fill="hsl(var(--cyan))"
              rx="4"
            />
            <text
              x={`${imageLandmarks.faceCenter.x * 100}%`}
              y={`${(imageLandmarks.eyeLeft.y + 0.12) * 100}%`}
              fill="white"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
              className="drop-shadow-lg"
            >
              {metric.value}
            </text>
          </>
        );

      case "cantalTilt":
      case "eyebrowTilt":
        if (!imageLandmarks.eyeLeft || !imageLandmarks.eyeRight) return null;
        const leftEyeInnerX = (imageLandmarks.eyeLeft.x - 0.06);
        const leftEyeOuterX = (imageLandmarks.eyeLeft.x + 0.06);
        const rightEyeInnerX = (imageLandmarks.eyeRight.x - 0.06);
        const rightEyeOuterX = (imageLandmarks.eyeRight.x + 0.06);
        
        // Calculate distance between eyes to determine if labels will overlap
        const eyeDistance = Math.abs(imageLandmarks.eyeRight.x - imageLandmarks.eyeLeft.x);
        const showBothLabels = eyeDistance > 0.25; // Show both labels only if eyes are far enough apart
        
        return (
          <>
            {/* Left eye canthal line - bright cyan/blue */}
            <line 
              x1={`${leftEyeInnerX * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${leftEyeOuterX * 100}%`}
              y2={`${imageLandmarks.eyeLeft.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Right eye canthal line - bright cyan/blue */}
            <line 
              x1={`${rightEyeInnerX * 100}%`}
              y1={`${imageLandmarks.eyeRight.y * 100}%`}
              x2={`${rightEyeOuterX * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Show single centered label if eyes are close, otherwise show both */}
            {showBothLabels ? (
              <>
                {/* Left eye angle label with background */}
                <rect
                  x={`${(leftEyeInnerX - 0.02) * 100}%`}
                  y={`${(imageLandmarks.eyeLeft.y + 0.05) * 100}%`}
                  width="12%"
                  height="7%"
                  fill="rgba(0, 212, 255, 0.9)"
                  rx="4"
                />
                <text
                  x={`${(leftEyeInnerX + 0.04) * 100}%`}
                  y={`${(imageLandmarks.eyeLeft.y + 0.09) * 100}%`}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-lg"
                >
                  {Math.abs(parseFloat(metric.value)).toFixed(1)}°
                </text>
                
                {/* Right eye angle label with background */}
                <rect
                  x={`${(rightEyeOuterX - 0.10) * 100}%`}
                  y={`${(imageLandmarks.eyeRight.y + 0.05) * 100}%`}
                  width="12%"
                  height="7%"
                  fill="rgba(0, 212, 255, 0.9)"
                  rx="4"
                />
                <text
                  x={`${(rightEyeOuterX - 0.04) * 100}%`}
                  y={`${(imageLandmarks.eyeRight.y + 0.09) * 100}%`}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-lg"
                >
                  {Math.abs(parseFloat(metric.value)).toFixed(1)}°
                </text>
              </>
            ) : (
              <>
                {/* Single centered label */}
                <rect
                  x={`${((leftEyeInnerX + rightEyeOuterX) / 2 - 0.06) * 100}%`}
                  y={`${(imageLandmarks.eyeLeft.y + 0.05) * 100}%`}
                  width="12%"
                  height="7%"
                  fill="rgba(0, 212, 255, 0.9)"
                  rx="4"
                />
                <text
                  x={`${((leftEyeInnerX + rightEyeOuterX) / 2) * 100}%`}
                  y={`${(imageLandmarks.eyeLeft.y + 0.09) * 100}%`}
                  fill="white"
                  fontSize="16"
                  fontWeight="bold"
                  textAnchor="middle"
                  className="drop-shadow-lg"
                >
                  {Math.abs(parseFloat(metric.value)).toFixed(1)}°
                </text>
              </>
            )}
          </>
        );

      case "yawSymmetry":
        if (!imageLandmarks.faceCenter || !imageLandmarks.eyeLeft || !imageLandmarks.eyeRight) return null;
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
        // Show projection distance from face plane to nose tip
        if (!imageLandmarks.noseTip) return null;
        return (
          <>
            {/* Face plane reference line */}
            <line 
              x1={`${(imageLandmarks.forehead?.x || 0.3) * 100}%`}
              y1={`${(imageLandmarks.forehead?.y || 0.2) * 100}%`}
              x2={`${(imageLandmarks.chin?.x || 0.3) * 100}%`}
              y2={`${(imageLandmarks.chin?.y || 0.8) * 100}%`}
              stroke="#808080" 
              strokeWidth="2"
              strokeDasharray="5,5"
            />
            {/* Projection line from face plane to nose tip */}
            <line 
              x1={`${(imageLandmarks.forehead?.x || 0.3) * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            <circle cx={`${imageLandmarks.noseTip.x * 100}%`} cy={`${imageLandmarks.noseTip.y * 100}%`} r="5" fill="#00D4FF"/>
            {/* Only show label if there's enough space */}
            {imageLandmarks.noseTip.x - (imageLandmarks.forehead?.x || 0.3) > 0.08 && (
              <>
                <rect
                  x={`${(((imageLandmarks.forehead?.x || 0.3) + imageLandmarks.noseTip.x) / 2 - 0.05) * 100}%`}
                  y={`${(imageLandmarks.noseTip.y - 0.05) * 100}%`}
                  width="10%"
                  height="4%"
                  fill="rgba(0, 212, 255, 0.8)"
                  rx="3"
                />
                <text
                  x={`${((imageLandmarks.forehead?.x || 0.3) + imageLandmarks.noseTip.x) / 2 * 100}%`}
                  y={`${(imageLandmarks.noseTip.y - 0.025) * 100}%`}
                  fill="white"
                  fontSize="12"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {metric.value}
                </text>
              </>
            )}
          </>
        );

      case "nasalTipAngle":
        // Show the angle at the tip of the nose
        if (!imageLandmarks.noseTop || !imageLandmarks.noseTip) return null;
        return (
          <>
            {/* Line from nose bridge to tip */}
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            {/* Line from tip to columella/base */}
            <line 
              x1={`${imageLandmarks.noseTip.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${(imageLandmarks.noseTip.x - 0.05) * 100}%`}
              y2={`${(imageLandmarks.noseTip.y + 0.05) * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            {/* Angle arc */}
            <path
              d={`M ${imageLandmarks.noseTip.x * 100 + 3} ${imageLandmarks.noseTip.y * 100} 
                  A 15 15 0 0 1 ${imageLandmarks.noseTip.x * 100 - 3} ${imageLandmarks.noseTip.y * 100 + 3}`}
              fill="none"
              stroke="#FFFF00"
              strokeWidth="2"
            />
            <circle cx={`${imageLandmarks.noseTip.x * 100}%`} cy={`${imageLandmarks.noseTip.y * 100}%`} r="5" fill="#FFFFFF"/>
            <rect
              x={`${(imageLandmarks.noseTip.x + 0.02) * 100}%`}
              y={`${(imageLandmarks.noseTip.y - 0.025) * 100}%`}
              width="10%"
              height="5%"
              fill="rgba(255, 255, 0, 0.9)"
              rx="3"
            />
            <text
              x={`${(imageLandmarks.noseTip.x + 0.07) * 100}%`}
              y={`${(imageLandmarks.noseTip.y + 0.005) * 100}%`}
              fill="black"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {metric.value}
            </text>
          </>
        );

      case "nasofrontalAngle":
        // Show the angle where nose meets forehead
        if (!imageLandmarks.noseTop || !imageLandmarks.noseTip) return null;
        return (
          <>
            {/* Forehead to nose bridge line */}
            <line 
              x1={`${(imageLandmarks.forehead?.x || imageLandmarks.noseTop.x - 0.02) * 100}%`}
              y1={`${(imageLandmarks.forehead?.y || imageLandmarks.noseTop.y - 0.1) * 100}%`}
              x2={`${imageLandmarks.noseTop.x * 100}%`}
              y2={`${imageLandmarks.noseTop.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            {/* Nose bridge to tip line */}
            <line 
              x1={`${imageLandmarks.noseTop.x * 100}%`}
              y1={`${imageLandmarks.noseTop.y * 100}%`}
              x2={`${imageLandmarks.noseTip.x * 100}%`}
              y2={`${imageLandmarks.noseTip.y * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            {/* Angle arc at nose bridge */}
            <path
              d={`M ${imageLandmarks.noseTop.x * 100 - 2} ${imageLandmarks.noseTop.y * 100 - 3} 
                  A 20 20 0 0 1 ${imageLandmarks.noseTop.x * 100 + 2} ${imageLandmarks.noseTop.y * 100 + 3}`}
              fill="none"
              stroke="#FFFF00"
              strokeWidth="2"
            />
            <circle cx={`${imageLandmarks.noseTop.x * 100}%`} cy={`${imageLandmarks.noseTop.y * 100}%`} r="5" fill="#FFFFFF"/>
            <rect
              x={`${(imageLandmarks.noseTop.x - 0.12) * 100}%`}
              y={`${(imageLandmarks.noseTop.y + 0.02) * 100}%`}
              width="10%"
              height="5%"
              fill="rgba(255, 255, 0, 0.9)"
              rx="3"
            />
            <text
              x={`${(imageLandmarks.noseTop.x - 0.07) * 100}%`}
              y={`${(imageLandmarks.noseTop.y + 0.052) * 100}%`}
              fill="black"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {metric.value}
            </text>
          </>
        );

      case "nasolabialAngle":
        // Show the angle between nose base and upper lip
        if (!imageLandmarks.noseTip || !imageLandmarks.lipTop) return null;
        return (
          <>
            {/* Line from nose tip down to columella */}
            <line 
              x1={`${imageLandmarks.noseTip.x * 100}%`}
              y1={`${imageLandmarks.noseTip.y * 100}%`}
              x2={`${(imageLandmarks.noseTip.x - 0.04) * 100}%`}
              y2={`${(imageLandmarks.noseTip.y + 0.04) * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            {/* Line from columella to upper lip */}
            <line 
              x1={`${(imageLandmarks.noseTip.x - 0.04) * 100}%`}
              y1={`${(imageLandmarks.noseTip.y + 0.04) * 100}%`}
              x2={`${imageLandmarks.lipTop.x * 100}%`}
              y2={`${imageLandmarks.lipTop.y * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            {/* Angle arc */}
            <path
              d={`M ${(imageLandmarks.noseTip.x - 0.04) * 100 + 2} ${(imageLandmarks.noseTip.y + 0.04) * 100 - 2} 
                  A 15 15 0 0 1 ${(imageLandmarks.noseTip.x - 0.04) * 100 - 2} ${(imageLandmarks.noseTip.y + 0.04) * 100 + 2}`}
              fill="none"
              stroke="#FFFF00"
              strokeWidth="2"
            />
            <circle cx={`${(imageLandmarks.noseTip.x - 0.04) * 100}%`} cy={`${(imageLandmarks.noseTip.y + 0.04) * 100}%`} r="5" fill="#FFFFFF"/>
            <rect
              x={`${(imageLandmarks.noseTip.x - 0.14) * 100}%`}
              y={`${(imageLandmarks.noseTip.y + 0.02) * 100}%`}
              width="10%"
              height="5%"
              fill="rgba(255, 255, 0, 0.9)"
              rx="3"
            />
            <text
              x={`${(imageLandmarks.noseTip.x - 0.09) * 100}%`}
              y={`${(imageLandmarks.noseTip.y + 0.052) * 100}%`}
              fill="black"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              {metric.value}
            </text>
          </>
        );

      case "facialConvexityGlabella":
      case "facialConvexityNasion":
      case "totalFacialConvexity":
        if (!imageLandmarks.forehead || !imageLandmarks.noseTip || !imageLandmarks.chin) return null;
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
        if (!imageLandmarks.noseTop || !imageLandmarks.noseBottom || !imageLandmarks.noseLeft || !imageLandmarks.noseRight || !imageLandmarks.noseTip) return null;
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

  // Generate score distribution curve data
  const generateDistributionData = () => {
    const points: {x: number, y: number}[] = [];
    const idealMid = 5; // Peak at score 5
    const sigma = 1.5; // Standard deviation
    
    for (let x = 0; x <= 10; x += 0.2) {
      const y = Math.exp(-Math.pow(x - idealMid, 2) / (2 * sigma * sigma));
      points.push({ x, y: y * 10 });
    }
    return points;
  };

  const distributionData = generateDistributionData();
  const scorePosition = (metric.score / 10) * 100;
  
  // Determine assessment text based on score
  const getAssessment = (score: number) => {
    if (score >= 9.5) return "Exceptional";
    if (score >= 9) return "Ideal";
    if (score >= 8) return "Very Good";
    if (score >= 7) return "Good";
    if (score >= 6) return "Above Average";
    if (score >= 5) return "Average";
    return "Below Average";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-cyan">
        <DialogHeader>
          <DialogTitle className="text-2xl text-cyan">{metric.title}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Left side - Image with measurement lines */}
          <div className="space-y-4">
            <div className="bg-background/50 p-4 rounded-lg border border-cyan/30 overflow-hidden">
              <div className="relative w-full mx-auto rounded-lg overflow-hidden h-[400px] bg-black/10">
                {displayImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-full h-full transition-transform duration-300" style={getZoomStyle()}>
                      <img 
                        src={displayImage} 
                        alt="Face measurement" 
                        className="w-full h-full object-contain"
                      />
                      <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {renderMeasurementLines()}
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Score information */}
          <div className="space-y-6">
            {/* Score bar with gradient */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Target range</span>
                <span className="text-muted-foreground">Normalized score (1-10)</span>
              </div>
              
              <div className="text-center text-2xl font-bold text-foreground mb-2">
                {metric.value}
              </div>
              
              <div className="relative h-12 rounded-full overflow-hidden"
                style={{
                  background: 'linear-gradient(to right, #00ff00, #00ffff, #ff8800, #ff0000)'
                }}
              >
                {/* Score marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                  style={{ left: `${scorePosition}%` }}
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full border-2 border-background shadow-lg" />
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Ideal: {metric.ideal}</span>
                <span>Max: 43.00 %</span>
              </div>
            </div>

            {/* Your Assessment */}
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-cyan mb-2">YOUR ASSESSMENT</h3>
              <p className="text-lg font-medium text-foreground">{getAssessment(metric.score)}</p>
            </div>

            {/* About this ratio */}
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <h3 className="text-sm font-semibold text-cyan mb-2">ABOUT THIS RATIO</h3>
              <p className="text-sm text-foreground leading-relaxed">{metric.description}</p>
            </div>

            {/* Score Distribution */}
            <div className="bg-background/50 p-4 rounded-lg border border-border">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-cyan">Score Distribution</h3>
                <div className="text-right text-xs text-muted-foreground">
                  <div>Hover</div>
                  <div className="text-cyan">{metric.ideal}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mb-4">How points are awarded across ratio values</p>
              
              {/* Distribution curve */}
              <div className="relative h-48 bg-background/80 rounded border border-border/50">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map(y => (
                    <line 
                      key={y} 
                      x1="0" 
                      y1={100 - y} 
                      x2="100" 
                      y2={100 - y} 
                      stroke="hsl(var(--border))" 
                      strokeWidth="0.2"
                      opacity="0.3"
                    />
                  ))}
                  
                  {/* Bell curve */}
                  <polyline
                    points={distributionData.map((p, i) => 
                      `${(p.x / 10) * 100},${100 - (p.y * 10)}`
                    ).join(' ')}
                    fill="none"
                    stroke="hsl(var(--cyan))"
                    strokeWidth="1"
                  />
                  
                  {/* User's score marker */}
                  <line
                    x1={scorePosition}
                    y1="0"
                    x2={scorePosition}
                    y2="100"
                    stroke="hsl(var(--primary))"
                    strokeWidth="0.5"
                    strokeDasharray="2,2"
                  />
                  <circle
                    cx={scorePosition}
                    cy={100 - (distributionData.find(p => Math.abs((p.x / 10) * 100 - scorePosition) < 5)?.y || 5) * 10}
                    r="1.5"
                    fill="hsl(var(--primary))"
                  />
                  
                  {/* User value label */}
                  <rect
                    x={Math.max(0, Math.min(80, scorePosition - 10))}
                    y="45"
                    width="20"
                    height="8"
                    fill="hsl(var(--primary))"
                    rx="1"
                  />
                  <text
                    x={Math.max(10, Math.min(90, scorePosition))}
                    y="50"
                    fontSize="4"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    Your Value: {metric.value}
                  </text>
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground">
                  <span>19.00</span>
                  <span>25.00</span>
                  <span>30.00</span>
                  <span>35.00</span>
                  <span>40.00</span>
                  <span>43.00</span>
                </div>
                
                {/* Y-axis label */}
                <div className="absolute -left-16 top-0 bottom-0 flex items-center">
                  <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
                    Score (1-10 based on Overall)
                  </span>
                </div>
              </div>
              
              <div className="text-center text-xs text-muted-foreground mt-8">
                Top Third (%)
              </div>
              
              {/* Score info box */}
              <div className="mt-4 p-3 bg-background/80 rounded border border-cyan/30">
                <div className="text-sm text-muted-foreground">
                  Value: <span className="text-cyan font-semibold">{metric.value}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Score: <span className="text-cyan font-semibold">{metric.score.toFixed(2)} points</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricDialog;
