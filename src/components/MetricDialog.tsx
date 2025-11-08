import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

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
  
  const [hoverPoint, setHoverPoint] = useState<{x: number, y: number, score: number, value: string} | null>(null);

  // Determine which image to show based on metric type
  // Front image: things visible from the front
  // Profile image: things visible from the side (angles, projections, convexity)
  const useFrontImage = [
    "cantalTilt", "eyebrowTilt", "yawSymmetry", 
    "nasalHeightToWidthRatio", "topThird", "middleThird", "lowerThird", "noseToMouthRatio",
    "totalFacialWidthToHeightRatio", "bigonialToBizygomaticRatio", "eyeSeparationRatio",
    "eyesApartRatio", "faceWidthToHeightRatio", "chinToPhiltrumRatio"
  ].includes(metric.key);
  
  const useProfileImage = [
    "gonialAngle", "nasalProjection", "nasalTipAngle", "nasofrontalAngle",
    "nasolabialAngle", "facialConvexityGlabella", "facialConvexityNasion",
    "totalFacialConvexity"
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
        // Profile view - show full image without zoom
        return {};
      
      case "nasalProjection":
      case "nasalTipAngle":
      case "nasofrontalAngle":
      case "nasolabialAngle":
        // Profile metrics - no zoom (show full image)
        return {};
      
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
        // Show nose width vs mouth width comparison
        if (!imageLandmarks.noseLeft || !imageLandmarks.noseRight || !imageLandmarks.leftMouth || !imageLandmarks.rightMouth) return null;
        return (
          <>
            {/* Nose width line */}
            <line 
              x1={`${imageLandmarks.noseLeft.x * 100}%`}
              y1={`${imageLandmarks.noseLeft.y * 100}%`}
              x2={`${imageLandmarks.noseRight.x * 100}%`}
              y2={`${imageLandmarks.noseRight.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            {/* Mouth width line */}
            <line 
              x1={`${imageLandmarks.leftMouth.x * 100}%`}
              y1={`${imageLandmarks.leftMouth.y * 100}%`}
              x2={`${imageLandmarks.rightMouth.x * 100}%`}
              y2={`${imageLandmarks.rightMouth.y * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            {/* Nose markers */}
            <circle cx={`${imageLandmarks.noseLeft.x * 100}%`} cy={`${imageLandmarks.noseLeft.y * 100}%`} r="4" fill="#00D4FF"/>
            <circle cx={`${imageLandmarks.noseRight.x * 100}%`} cy={`${imageLandmarks.noseRight.y * 100}%`} r="4" fill="#00D4FF"/>
            {/* Mouth markers */}
            <circle cx={`${imageLandmarks.leftMouth.x * 100}%`} cy={`${imageLandmarks.leftMouth.y * 100}%`} r="4" fill="#FF00D4"/>
            <circle cx={`${imageLandmarks.rightMouth.x * 100}%`} cy={`${imageLandmarks.rightMouth.y * 100}%`} r="4" fill="#FF00D4"/>
            {/* Labels */}
            <text
              x={`${((imageLandmarks.noseLeft.x + imageLandmarks.noseRight.x) / 2) * 100}%`}
              y={`${(imageLandmarks.noseLeft.y - 0.03) * 100}%`}
              fill="#00D4FF"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              Nose Width
            </text>
            <text
              x={`${((imageLandmarks.leftMouth.x + imageLandmarks.rightMouth.x) / 2) * 100}%`}
              y={`${(imageLandmarks.leftMouth.y + 0.05) * 100}%`}
              fill="#FF00D4"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              Mouth Width
            </text>
          </>
        );

      case "eyeToEyeSeparation":
        if (!imageLandmarks.eyeLeft || !imageLandmarks.eyeRight || !imageLandmarks.jawLeft || !imageLandmarks.jawRight) return null;
        return (
          <>
            {/* Face width at eye level (jaw to jaw) */}
            <line 
              x1={`${imageLandmarks.jawLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.jawRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="#00D4FF" 
              strokeWidth="3"
            />
            
            {/* Pupil to pupil distance */}
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="#FF00D4" 
              strokeWidth="3"
            />
            
            {/* Eye markers */}
            <circle cx={`${imageLandmarks.eyeLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="4" fill="#FF00D4"/>
            <circle cx={`${imageLandmarks.eyeRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="4" fill="#FF00D4"/>
            
            {/* Jaw markers */}
            <circle cx={`${imageLandmarks.jawLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="4" fill="#00D4FF"/>
            <circle cx={`${imageLandmarks.jawRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="4" fill="#00D4FF"/>
            
            {/* Labels */}
            <text
              x={`${((imageLandmarks.eyeLeft.x + imageLandmarks.eyeRight.x) / 2) * 100}%`}
              y={`${(imageLandmarks.eyeLeft.y - 0.03) * 100}%`}
              fill="#FF00D4"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              Pupil Distance
            </text>
            <text
              x={`${((imageLandmarks.jawLeft.x + imageLandmarks.jawRight.x) / 2) * 100}%`}
              y={`${(imageLandmarks.eyeLeft.y + 0.05) * 100}%`}
              fill="#00D4FF"
              fontSize="14"
              fontWeight="bold"
              textAnchor="middle"
            >
              Face Width
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
        // Use pronasale (better profile nose point) instead of noseTip
        const nosePoint = imageLandmarks.pronasale || imageLandmarks.noseTip;
        if (!imageLandmarks.forehead || !nosePoint || !imageLandmarks.chin) return null;
        return (
          <>
            <line 
              x1={`${imageLandmarks.forehead.x * 100}%`}
              y1={`${imageLandmarks.forehead.y * 100}%`}
              x2={`${nosePoint.x * 100}%`}
              y2={`${nosePoint.y * 100}%`}
              stroke="hsl(var(--cyan))" strokeWidth="2"
            />
            <line 
              x1={`${nosePoint.x * 100}%`}
              y1={`${nosePoint.y * 100}%`}
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

      case "totalFacialWidthToHeightRatio":
        if (!imageLandmarks.leftCheekbone || !imageLandmarks.rightCheekbone || !imageLandmarks.forehead || !imageLandmarks.chin) return null;
        return (
          <>
            {/* Horizontal width line at cheekbones */}
            <line 
              x1={`${imageLandmarks.leftCheekbone.x * 100}%`}
              y1={`${imageLandmarks.leftCheekbone.y * 100}%`}
              x2={`${imageLandmarks.rightCheekbone.x * 100}%`}
              y2={`${imageLandmarks.rightCheekbone.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            {/* Vertical height line */}
            <line 
              x1={`${((imageLandmarks.leftCheekbone.x + imageLandmarks.rightCheekbone.x) / 2) * 100}%`}
              y1={`${imageLandmarks.forehead.y * 100}%`}
              x2={`${((imageLandmarks.leftCheekbone.x + imageLandmarks.rightCheekbone.x) / 2) * 100}%`}
              y2={`${imageLandmarks.chin.y * 100}%`}
              stroke="#FF00D4" strokeWidth="3"
            />
            <text x={`${((imageLandmarks.leftCheekbone.x + imageLandmarks.rightCheekbone.x) / 2) * 100}%`} y={`${(imageLandmarks.leftCheekbone.y - 0.03) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Width</text>
            <text x={`${((imageLandmarks.leftCheekbone.x + imageLandmarks.rightCheekbone.x) / 2 + 0.06) * 100}%`} y={`${((imageLandmarks.forehead.y + imageLandmarks.chin.y) / 2) * 100}%`} fill="#FF00D4" fontSize="12" fontWeight="bold" textAnchor="middle">Height</text>
          </>
        );

      case "bigonialToBizygomaticRatio":
        if (!imageLandmarks.jawLeft || !imageLandmarks.jawRight || !imageLandmarks.leftCheekbone || !imageLandmarks.rightCheekbone) return null;
        return (
          <>
            {/* Jaw width (bigonial) */}
            <line 
              x1={`${imageLandmarks.jawLeft.x * 100}%`}
              y1={`${imageLandmarks.jawLeft.y * 100}%`}
              x2={`${imageLandmarks.jawRight.x * 100}%`}
              y2={`${imageLandmarks.jawRight.y * 100}%`}
              stroke="#FF00D4" strokeWidth="3"
            />
            {/* Cheekbone width (bizygomatic) */}
            <line 
              x1={`${imageLandmarks.leftCheekbone.x * 100}%`}
              y1={`${imageLandmarks.leftCheekbone.y * 100}%`}
              x2={`${imageLandmarks.rightCheekbone.x * 100}%`}
              y2={`${imageLandmarks.rightCheekbone.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            <text x="50%" y={`${(imageLandmarks.leftCheekbone.y - 0.03) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Cheekbones</text>
            <text x="50%" y={`${(imageLandmarks.jawLeft.y + 0.03) * 100}%`} fill="#FF00D4" fontSize="12" fontWeight="bold" textAnchor="middle">Jaw</text>
          </>
        );

      case "eyeSeparationRatio":
        if (!imageLandmarks.eyeLeft || !imageLandmarks.eyeRight || !imageLandmarks.leftCheekbone || !imageLandmarks.rightCheekbone) return null;
        const innerLeft = imageLandmarks.eyeLeft;
        const innerRight = imageLandmarks.eyeRight;
        return (
          <>
            {/* Inner eye distance */}
            <line 
              x1={`${innerLeft.x * 100}%`}
              y1={`${innerLeft.y * 100}%`}
              x2={`${innerRight.x * 100}%`}
              y2={`${innerRight.y * 100}%`}
              stroke="#FF00D4" strokeWidth="3"
            />
            {/* Face width */}
            <line 
              x1={`${imageLandmarks.leftCheekbone.x * 100}%`}
              y1={`${imageLandmarks.leftCheekbone.y * 100}%`}
              x2={`${imageLandmarks.rightCheekbone.x * 100}%`}
              y2={`${imageLandmarks.rightCheekbone.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            <text x="50%" y={`${(innerLeft.y - 0.03) * 100}%`} fill="#FF00D4" fontSize="12" fontWeight="bold" textAnchor="middle">Eye Gap</text>
            <text x="50%" y={`${(imageLandmarks.leftCheekbone.y + 0.05) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Face Width</text>
          </>
        );

      case "eyesApartRatio":
        if (!imageLandmarks.eyeLeft || !imageLandmarks.eyeRight) return null;
        return (
          <>
            <line 
              x1={`${imageLandmarks.eyeLeft.x * 100}%`}
              y1={`${imageLandmarks.eyeLeft.y * 100}%`}
              x2={`${imageLandmarks.eyeRight.x * 100}%`}
              y2={`${imageLandmarks.eyeRight.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            <circle cx={`${imageLandmarks.eyeLeft.x * 100}%`} cy={`${imageLandmarks.eyeLeft.y * 100}%`} r="4" fill="#00D4FF"/>
            <circle cx={`${imageLandmarks.eyeRight.x * 100}%`} cy={`${imageLandmarks.eyeRight.y * 100}%`} r="4" fill="#00D4FF"/>
            <text x="50%" y={`${(imageLandmarks.eyeLeft.y - 0.03) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Pupil Distance</text>
          </>
        );

      case "faceWidthToHeightRatio":
        if (!imageLandmarks.jawLeft || !imageLandmarks.jawRight || !imageLandmarks.forehead || !imageLandmarks.chin) return null;
        return (
          <>
            {/* Face width at jaw level */}
            <line 
              x1={`${imageLandmarks.jawLeft.x * 100}%`}
              y1={`${imageLandmarks.jawLeft.y * 100}%`}
              x2={`${imageLandmarks.jawRight.x * 100}%`}
              y2={`${imageLandmarks.jawRight.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            {/* Face height */}
            <line 
              x1={`${((imageLandmarks.jawLeft.x + imageLandmarks.jawRight.x) / 2) * 100}%`}
              y1={`${imageLandmarks.forehead.y * 100}%`}
              x2={`${((imageLandmarks.jawLeft.x + imageLandmarks.jawRight.x) / 2) * 100}%`}
              y2={`${imageLandmarks.chin.y * 100}%`}
              stroke="#FF00D4" strokeWidth="3"
            />
            <text x="50%" y={`${(imageLandmarks.jawLeft.y + 0.03) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Width</text>
            <text x={`${((imageLandmarks.jawLeft.x + imageLandmarks.jawRight.x) / 2 + 0.06) * 100}%`} y={`${((imageLandmarks.forehead.y + imageLandmarks.chin.y) / 2) * 100}%`} fill="#FF00D4" fontSize="12" fontWeight="bold" textAnchor="middle">Height</text>
          </>
        );

      case "chinToPhiltrumRatio":
        if (!imageLandmarks.philtrumTop || !imageLandmarks.philtrumBottom || !imageLandmarks.chin || !imageLandmarks.mouthTop) return null;
        return (
          <>
            {/* Philtrum height */}
            <line 
              x1={`${imageLandmarks.philtrumTop.x * 100}%`}
              y1={`${imageLandmarks.philtrumTop.y * 100}%`}
              x2={`${imageLandmarks.philtrumBottom.x * 100}%`}
              y2={`${imageLandmarks.philtrumBottom.y * 100}%`}
              stroke="#00D4FF" strokeWidth="3"
            />
            {/* Chin height */}
            <line 
              x1={`${imageLandmarks.mouthTop.x * 100}%`}
              y1={`${imageLandmarks.mouthTop.y * 100}%`}
              x2={`${imageLandmarks.chin.x * 100}%`}
              y2={`${imageLandmarks.chin.y * 100}%`}
              stroke="#FF00D4" strokeWidth="3"
            />
            <text x={`${(imageLandmarks.philtrumTop.x - 0.06) * 100}%`} y={`${((imageLandmarks.philtrumTop.y + imageLandmarks.philtrumBottom.y) / 2) * 100}%`} fill="#00D4FF" fontSize="12" fontWeight="bold" textAnchor="middle">Philtrum</text>
            <text x={`${(imageLandmarks.mouthTop.x + 0.06) * 100}%`} y={`${((imageLandmarks.mouthTop.y + imageLandmarks.chin.y) / 2) * 100}%`} fill="#FF00D4" fontSize="12" fontWeight="bold" textAnchor="middle">Chin</text>
          </>
        );

      default:
        return null;
    }
  };

  // Generate score distribution curve data based on metric type
  const generateDistributionData = () => {
    const points: {x: number, y: number, value: string}[] = [];
    
    // Parse ideal range from metric
    const idealMatch = metric.ideal.match(/([\d.]+)-([\d.]+)/);
    if (!idealMatch) return points;
    
    const idealMin = parseFloat(idealMatch[1]);
    const idealMax = parseFloat(idealMatch[2]);
    const idealMid = (idealMin + idealMax) / 2;
    const range = idealMax - idealMin;
    
    // Generate curve points from min to max with extra padding
    const minX = idealMin - range * 2;
    const maxX = idealMax + range * 2;
    const step = (maxX - minX) / 100;
    
    for (let x = minX; x <= maxX; x += step) {
      // Calculate score at this x value based on metric type
      let score = 0;
      if (metric.key === "noseToMouthRatio") {
        // Custom scoring for nose to mouth ratio
        const peakPoint = 1.3;
        if (x >= 1.2 && x <= peakPoint) {
          score = 10;
        } else if (x > peakPoint && x <= 1.35) {
          const distanceFromPeak = x - peakPoint;
          const rangeAfterPeak = 1.35 - peakPoint;
          const dropFactor = distanceFromPeak / rangeAfterPeak;
          score = 10 * (1 - dropFactor * 0.15);
        } else if (x < 1.2) {
          const deviation = 1.2 - x;
          score = 10 * Math.exp(-2.0 * deviation);
        } else {
          const deviation = x - 1.35;
          score = 10 * 0.85 * Math.exp(-0.8 * deviation);
        }
      } else {
        // Standard bell curve for other metrics
        if (x >= idealMin && x <= idealMax) {
          score = 10;
        } else {
          const deviation = x < idealMin ? idealMin - x : x - idealMax;
          const normalizedDeviation = deviation / (range * 0.5);
          score = 10 * Math.exp(-0.5 * normalizedDeviation);
        }
      }
      
      score = Math.max(0.1, Math.min(10, score));
      
      // Format value based on metric type
      let formattedValue = x.toFixed(2);
      if (metric.value.includes('%')) {
        formattedValue = x.toFixed(1) + '%';
      } else if (metric.value.includes('°')) {
        formattedValue = x.toFixed(1) + '°';
      } else if (metric.value.includes('mm')) {
        formattedValue = x.toFixed(1) + 'mm';
      } else if (metric.value.includes('×')) {
        formattedValue = x.toFixed(2) + '×';
      }
      
      points.push({ x, y: score, value: formattedValue });
    }
    return points;
  };

  const distributionData = generateDistributionData();
  
  const handleChartHover = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    
    if (distributionData.length === 0) return;
    
    // Find closest point
    const minX = distributionData[0].x;
    const maxX = distributionData[distributionData.length - 1].x;
    const actualX = minX + (x / 100) * (maxX - minX);
    
    const closestPoint = distributionData.reduce((prev, curr) => 
      Math.abs(curr.x - actualX) < Math.abs(prev.x - actualX) ? curr : prev
    );
    
    setHoverPoint({
      x: ((closestPoint.x - minX) / (maxX - minX)) * 100,
      y: 100 - (closestPoint.y * 10),
      score: closestPoint.y,
      value: closestPoint.value
    });
  };

  const handleChartLeave = () => {
    setHoverPoint(null);
  };

  const scorePosition = (() => {
    if (distributionData.length === 0) return 50;
    const minX = distributionData[0].x;
    const maxX = distributionData[distributionData.length - 1].x;
    
    // Parse current value
    const currentValue = parseFloat(metric.value);
    return ((currentValue - minX) / (maxX - minX)) * 100;
  })();
  
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
              <div className="relative h-48 bg-gradient-to-b from-background/95 to-background/80 rounded border border-border/50">
                <svg 
                  className="w-full h-full cursor-crosshair" 
                  viewBox="0 0 100 100" 
                  preserveAspectRatio="none"
                  onMouseMove={handleChartHover}
                  onMouseLeave={handleChartLeave}
                >
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
                  
                  {/* Gradient fill under curve */}
                  <defs>
                    <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.05" />
                    </linearGradient>
                  </defs>
                  
                  {/* Fill under curve */}
                  {distributionData.length > 0 && (
                    <polygon
                      points={`
                        0,100 
                        ${distributionData.map((p, i) => {
                          const minX = distributionData[0].x;
                          const maxX = distributionData[distributionData.length - 1].x;
                          const xPos = ((p.x - minX) / (maxX - minX)) * 100;
                          return `${xPos},${100 - (p.y * 10)}`;
                        }).join(' ')} 
                        100,100
                      `}
                      fill="url(#curveGradient)"
                      opacity="0.5"
                    />
                  )}
                  
                  {/* Bell curve - thicker stroke */}
                  {distributionData.length > 0 && (
                    <polyline
                      points={distributionData.map((p, i) => {
                        const minX = distributionData[0].x;
                        const maxX = distributionData[distributionData.length - 1].x;
                        const xPos = ((p.x - minX) / (maxX - minX)) * 100;
                        return `${xPos},${100 - (p.y * 10)}`;
                      }).join(' ')}
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* User's score marker */}
                  <line
                    x1={scorePosition}
                    y1="0"
                    x2={scorePosition}
                    y2="100"
                    stroke="hsl(var(--cyan))"
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.8"
                  />
                  <circle
                    cx={scorePosition}
                    cy={100 - (metric.score * 10)}
                    r="2"
                    fill="hsl(var(--cyan))"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                  
                  {/* User value label */}
                  <rect
                    x={Math.max(2, Math.min(75, scorePosition - 12))}
                    y={Math.max(5, 100 - (metric.score * 10) - 10)}
                    width="24"
                    height="8"
                    fill="hsl(var(--cyan))"
                    rx="2"
                    opacity="0.95"
                  />
                  <text
                    x={Math.max(14, Math.min(87, scorePosition))}
                    y={Math.max(10, 100 - (metric.score * 10) - 6)}
                    fontSize="3.5"
                    fill="white"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontWeight="bold"
                  >
                    {metric.value}
                  </text>
                  
                  {/* Hover point indicator */}
                  {hoverPoint && (
                    <>
                      <line
                        x1={hoverPoint.x}
                        y1="0"
                        x2={hoverPoint.x}
                        y2="100"
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                        opacity="0.6"
                      />
                      <circle
                        cx={hoverPoint.x}
                        cy={hoverPoint.y}
                        r="2"
                        fill="hsl(var(--primary))"
                        stroke="white"
                        strokeWidth="0.5"
                      />
                      {/* Hover tooltip */}
                      <rect
                        x={Math.max(2, Math.min(65, hoverPoint.x - 17))}
                        y={Math.max(5, hoverPoint.y - 12)}
                        width="34"
                        height="10"
                        fill="hsl(var(--background))"
                        stroke="hsl(var(--primary))"
                        strokeWidth="0.5"
                        rx="2"
                        opacity="0.95"
                      />
                      <text
                        x={Math.max(19, Math.min(82, hoverPoint.x))}
                        y={Math.max(10, hoverPoint.y - 7.5)}
                        fontSize="3"
                        fill="hsl(var(--primary))"
                        textAnchor="middle"
                        fontWeight="bold"
                      >
                        {hoverPoint.value}
                      </text>
                      <text
                        x={Math.max(19, Math.min(82, hoverPoint.x))}
                        y={Math.max(13, hoverPoint.y - 4.5)}
                        fontSize="2.5"
                        fill="hsl(var(--muted-foreground))"
                        textAnchor="middle"
                      >
                        {hoverPoint.score.toFixed(1)} pts
                      </text>
                    </>
                  )}
                </svg>
                
                {/* X-axis labels */}
                <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-muted-foreground px-1">
                  {distributionData.length > 0 && (
                    <>
                      <span>{distributionData[0].value}</span>
                      <span>{distributionData[Math.floor(distributionData.length * 0.25)].value}</span>
                      <span>{distributionData[Math.floor(distributionData.length * 0.5)].value}</span>
                      <span>{distributionData[Math.floor(distributionData.length * 0.75)].value}</span>
                      <span>{distributionData[distributionData.length - 1].value}</span>
                    </>
                  )}
                </div>
                
                {/* Y-axis label */}
                <div className="absolute -left-16 top-0 bottom-0 flex items-center">
                  <span className="text-xs text-muted-foreground transform -rotate-90 whitespace-nowrap">
                    Score (1-10)
                  </span>
                </div>
              </div>
              
              <div className="text-center text-xs text-muted-foreground mt-8">
                {metric.title}
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
