import { FaceLandmarker, FilesetResolver, FaceLandmarkerResult } from "@mediapipe/tasks-vision";

let faceLandmarker: FaceLandmarker | null = null;

export async function initializeFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker;
  
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );
  
  faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
      delegate: "GPU"
    },
    outputFaceBlendshapes: false,
    outputFacialTransformationMatrixes: false,
    runningMode: "IMAGE",
    numFaces: 1
  });
  
  return faceLandmarker;
}

function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function angle(p1: { x: number; y: number }, p2: { x: number; y: number }, p3: { x: number; y: number }): number {
  const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
  const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
  return Math.acos(dot / (mag1 * mag2)) * (180 / Math.PI);
}

export async function analyzeFace(imageDataUrl: string, isProfile: boolean = false) {
  const landmarker = await initializeFaceLandmarker();
  
  // Convert data URL to image element
  const img = new Image();
  img.src = imageDataUrl;
  await new Promise((resolve) => { img.onload = resolve; });
  
  const results = landmarker.detect(img);
  
  if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
    return null;
  }
  
  const landmarks = results.faceLandmarks[0];
  
  // Key landmark indices from MediaPipe Face Mesh
  const indices = {
    leftEye: 33,
    rightEye: 263,
    noseTop: 168,
    noseTip: 1,
    noseBottom: 2,
    noseLeft: 98,
    noseRight: 327,
    mouthTop: 13,
    mouthBottom: 14,
    leftMouth: 78, // Inner lip corner (where lips meet)
    rightMouth: 308, // Inner lip corner (where lips meet)
    leftJaw: 234,
    rightJaw: 454,
    chin: 152,
    forehead: 10,
    leftEyeOuter: 33,
    rightEyeOuter: 263,
    leftEyeInner: 133,
    rightEyeInner: 362,
    jawAngle: isProfile ? 172 : 234,
    glabella: 9,
    leftCheekbone: 454, // Bizygomatic point
    rightCheekbone: 234, // Bizygomatic point
    philtrumTop: 164, // Top of philtrum (under nose)
    philtrumBottom: 13 // Bottom of philtrum (top of upper lip)
  };
  
  // Extract key points
  const keyPoints = {
    leftEye: landmarks[indices.leftEye],
    rightEye: landmarks[indices.rightEye],
    noseTop: landmarks[indices.noseTop],
    noseTip: landmarks[indices.noseTip],
    noseBottom: landmarks[indices.noseBottom],
    noseLeft: landmarks[indices.noseLeft],
    noseRight: landmarks[indices.noseRight],
    mouthTop: landmarks[indices.mouthTop],
    mouthBottom: landmarks[indices.mouthBottom],
    leftMouth: landmarks[indices.leftMouth],
    rightMouth: landmarks[indices.rightMouth],
    leftJaw: landmarks[indices.leftJaw],
    rightJaw: landmarks[indices.rightJaw],
    chin: landmarks[indices.chin],
    forehead: landmarks[indices.forehead],
    leftEyeOuter: landmarks[indices.leftEyeOuter],
    rightEyeOuter: landmarks[indices.rightEyeOuter],
    leftEyeInner: landmarks[indices.leftEyeInner],
    rightEyeInner: landmarks[indices.rightEyeInner],
    jawAngle: landmarks[indices.jawAngle],
    glabella: landmarks[indices.glabella],
    leftCheekbone: landmarks[indices.leftCheekbone],
    rightCheekbone: landmarks[indices.rightCheekbone],
    philtrumTop: landmarks[indices.philtrumTop],
    philtrumBottom: landmarks[indices.philtrumBottom]
  };
  
  // Calculate face center
  const faceCenter = {
    x: (keyPoints.leftEye.x + keyPoints.rightEye.x) / 2,
    y: (keyPoints.leftEye.y + keyPoints.rightEye.y) / 2
  };
  
  return {
    landmarks: keyPoints,
    faceCenter,
    allLandmarks: landmarks
  };
}

function scoreMetric(value: number, idealMin: number, idealMax: number, maxScore: number = 10): number {
  const midpoint = (idealMin + idealMax) / 2;
  const idealRange = idealMax - idealMin;
  
  // Within ideal range = perfect score
  if (value >= idealMin && value <= idealMax) {
    return maxScore;
  }
  
  // Calculate how far outside the ideal range
  const deviation = value < idealMin ? idealMin - value : value - idealMax;
  
  // Use a gentler exponential decay curve
  // Score decreases gradually, allowing values outside ideal to still score well
  const normalizedDeviation = deviation / (idealRange * 0.5); // Normalize by half the ideal range
  const score = maxScore * Math.exp(-0.5 * normalizedDeviation);
  
  return Math.max(0.1, Math.min(maxScore, Math.round(score * 10) / 10)); // Minimum 0.1 score
}

function scoreNoseToMouthRatio(value: number, maxScore: number = 10): number {
  const idealMin = 1.2;
  const idealMax = 1.35;
  const peakPoint = 1.3; // Peak of the curve
  
  // Within ideal range but before peak = perfect score
  if (value >= idealMin && value <= peakPoint) {
    return maxScore;
  }
  
  // Between peak and idealMax = slight drop
  if (value > peakPoint && value <= idealMax) {
    const distanceFromPeak = value - peakPoint;
    const rangeAfterPeak = idealMax - peakPoint;
    const dropFactor = distanceFromPeak / rangeAfterPeak;
    return maxScore * (1 - dropFactor * 0.15); // 15% drop by idealMax
  }
  
  // Below idealMin = sharp drop
  if (value < idealMin) {
    const deviation = idealMin - value;
    const score = maxScore * Math.exp(-2.0 * deviation);
    return Math.max(0.1, score);
  }
  
  // Above idealMax = gradual drop (slower decay)
  const deviation = value - idealMax;
  const score = maxScore * 0.85 * Math.exp(-0.8 * deviation); // Start at 85% of max, slower decay
  
  return Math.max(0.1, Math.min(maxScore, Math.round(score * 10) / 10));
}

export async function calculateMetrics(frontImageUrl: string, profileImageUrl: string | null) {
  const frontAnalysis = await analyzeFace(frontImageUrl, false);
  const profileAnalysis = profileImageUrl ? await analyzeFace(profileImageUrl, true) : null;
  
  if (!frontAnalysis) {
    return {
      faceDetected: false,
      landmarks: null,
      metrics: getEmptyMetrics()
    };
  }
  
  const front = frontAnalysis.landmarks;
  const profile = profileAnalysis?.landmarks;
  
  // Calculate metrics
  const eyeDistance = distance(front.leftEye, front.rightEye); // Pupil to pupil
  const faceWidthAtEyeLevel = distance(front.leftJaw, front.rightJaw); // Face width at eye level
  const cheekboneWidth = distance(front.leftCheekbone, front.rightCheekbone); // Bizygomatic width
  const jawWidth = distance(front.leftJaw, front.rightJaw); // Bigonial width
  const innerEyeDistance = distance(front.leftEyeInner, front.rightEyeInner);
  
  // Face thirds - measure from forehead to eyebrow line, eyebrow line to nose bottom, nose bottom to chin
  const topThirdHeight = distance(front.forehead, front.noseTop); // Forehead to eyebrow level (using noseTop as proxy)
  const middleThirdHeight = distance(front.noseTop, front.noseBottom); // Eyebrow to nose bottom
  const lowerThirdHeight = distance(front.noseBottom, front.chin); // Nose bottom to chin
  const totalFaceHeight = topThirdHeight + middleThirdHeight + lowerThirdHeight;
  
  const topThirdPercent = (topThirdHeight / totalFaceHeight) * 100;
  const middleThirdPercent = (middleThirdHeight / totalFaceHeight) * 100;
  const lowerThirdPercent = (lowerThirdHeight / totalFaceHeight) * 100;
  
  const noseWidth = distance(front.noseLeft, front.noseRight);
  const mouthWidth = distance(front.leftMouth, front.rightMouth);
  const noseToMouthRatio = mouthWidth / noseWidth; // Mouth width : Nose width ratio
  const eyeToEyeSeparation = eyeDistance / faceWidthAtEyeLevel; // Pupil distance to face width ratio
  
  // New metrics from the reference
  const totalFacialWidthToHeightRatio = cheekboneWidth / totalFaceHeight; // Widest point to height
  const bigonialToBizygomaticRatio = (jawWidth / cheekboneWidth) * 100; // Jaw to cheekbone percentage
  const eyeSeparationRatio = (innerEyeDistance / cheekboneWidth) * 100; // Inner eye distance as % of face width
  const eyesApartRatio = eyeDistance / eyeDistance; // This needs clarification, using 1.0 for now
  const faceWidthToHeightRatio = faceWidthAtEyeLevel / topThirdHeight; // Face width at eye level to forehead height
  const philtrumHeight = distance(front.philtrumTop, front.philtrumBottom);
  const chinHeight = distance(front.mouthBottom, front.chin);
  const chinToPhiltrumRatio = chinHeight / philtrumHeight;
  
  // Cantal tilt
  const cantalTiltAngle = Math.atan2(front.rightEye.y - front.leftEye.y, front.rightEye.x - front.leftEye.x) * (180 / Math.PI);
  
  // Yaw symmetry
  const leftDistance = Math.abs(front.leftEye.x - frontAnalysis.faceCenter.x);
  const rightDistance = Math.abs(front.rightEye.x - frontAnalysis.faceCenter.x);
  const yawSymmetry = (1 - Math.abs(leftDistance - rightDistance) / Math.max(leftDistance, rightDistance)) * 100;
  
  // Nasal measurements
  const nasalHeight = distance(front.noseTop, front.noseBottom);
  const nasalWidth = distance(front.noseLeft, front.noseRight);
  const nasalHeightToWidthRatio = nasalHeight / nasalWidth;
  
  let gonialAngle = 0;
  let nasalProjection = 0;
  let nasalTipAngle = 0;
  let nasofrontalAngle = 0;
  let nasolabialAngle = 0;
  let facialConvexityGlabella = 0;
  let facialConvexityNasion = 0;
  let totalFacialConvexity = 0;
  
  if (profile) {
    // Gonial angle: measured at jaw angle between mandibular plane (jaw-chin) and ramus (jaw-ear/forehead)
    // Create a point above jawAngle for the ramus line (vertical reference)
    const ramusReference = { x: profile.jawAngle.x, y: profile.forehead.y };
    gonialAngle = angle(profile.chin, profile.jawAngle, ramusReference);
    nasalProjection = distance(profile.noseTop, profile.noseTip) * 100; // Convert to mm approximation
    nasalTipAngle = angle(profile.noseTop, profile.noseTip, profile.mouthTop);
    nasofrontalAngle = angle(profile.forehead, profile.noseTop, profile.noseTip);
    nasolabialAngle = angle(profile.noseTip, profile.noseBottom, profile.mouthTop);
    facialConvexityGlabella = angle(profile.glabella, profile.noseTip, profile.chin);
    facialConvexityNasion = angle(profile.noseTop, profile.noseTip, profile.chin);
    totalFacialConvexity = (facialConvexityGlabella + facialConvexityNasion) / 2;
  }
  
  return {
    faceDetected: true,
    landmarks: {
      front: {
        faceCenter: frontAnalysis.faceCenter,
        eyeLeft: front.leftEye,
        eyeRight: front.rightEye,
        noseTip: front.noseTip,
        noseTop: front.noseTop,
        noseBottom: front.noseBottom,
        noseLeft: front.noseLeft,
        noseRight: front.noseRight,
        mouthTop: front.mouthTop,
        leftMouth: front.leftMouth,
        rightMouth: front.rightMouth,
        lipTop: front.mouthTop,
        jawLeft: front.leftJaw,
        jawRight: front.rightJaw,
        leftCheekbone: front.leftCheekbone,
        rightCheekbone: front.rightCheekbone,
        philtrumTop: front.philtrumTop,
        philtrumBottom: front.philtrumBottom,
        chin: front.chin,
        forehead: front.forehead,
        topThirdPercent: `${topThirdPercent.toFixed(1)}%`,
        middleThirdPercent: `${middleThirdPercent.toFixed(1)}%`,
        lowerThirdPercent: `${lowerThirdPercent.toFixed(1)}%`
      },
      profile: profile ? {
        forehead: profile.forehead,
        noseTip: profile.noseTip,
        noseTop: profile.noseTop,
        lipTop: profile.mouthTop,
        chin: profile.chin,
        jawAngle: profile.jawAngle
      } : null
    },
    metrics: {
      topThird: { 
        value: `${topThirdPercent.toFixed(1)}%`, 
        score: scoreMetric(topThirdPercent, 25, 30) 
      },
      middleThird: { 
        value: `${middleThirdPercent.toFixed(1)}%`, 
        score: scoreMetric(middleThirdPercent, 25, 30) 
      },
      lowerThird: { 
        value: `${lowerThirdPercent.toFixed(1)}%`, 
        score: scoreMetric(lowerThirdPercent, 30, 40) 
      },
      gonialAngle: {
        value: `${gonialAngle.toFixed(1)}°`, 
        score: profile ? scoreMetric(gonialAngle, 120, 130) : 0 
      },
      noseToMouthRatio: { 
        value: noseToMouthRatio.toFixed(2), 
        score: scoreNoseToMouthRatio(noseToMouthRatio) 
      },
      cantalTilt: {
        value: `${cantalTiltAngle.toFixed(1)}°`, 
        score: scoreMetric(Math.abs(cantalTiltAngle), 5, 8) 
      },
      eyebrowTilt: { 
        value: `${cantalTiltAngle.toFixed(1)}°`, 
        score: scoreMetric(Math.abs(cantalTiltAngle), 2, 5) 
      },
      yawSymmetry: { 
        value: `${yawSymmetry.toFixed(1)}%`, 
        score: scoreMetric(yawSymmetry, 95, 100) 
      },
      nasalProjection: { 
        value: `${nasalProjection.toFixed(1)}mm`, 
        score: profile ? scoreMetric(nasalProjection, 12, 18) : 0 
      },
      nasalTipAngle: { 
        value: `${nasalTipAngle.toFixed(1)}°`, 
        score: profile ? scoreMetric(nasalTipAngle, 95, 115) : 0 
      },
      nasofrontalAngle: { 
        value: `${nasofrontalAngle.toFixed(1)}°`, 
        score: profile ? scoreMetric(nasofrontalAngle, 115, 135) : 0 
      },
      nasolabialAngle: { 
        value: `${nasolabialAngle.toFixed(1)}°`, 
        score: profile ? scoreMetric(nasolabialAngle, 90, 120) : 0 
      },
      facialConvexityGlabella: { 
        value: `${facialConvexityGlabella.toFixed(1)}°`, 
        score: profile ? scoreMetric(facialConvexityGlabella, 155, 170) : 0 
      },
      facialConvexityNasion: { 
        value: `${facialConvexityNasion.toFixed(1)}°`, 
        score: profile ? scoreMetric(facialConvexityNasion, 125, 135) : 0 
      },
      totalFacialConvexity: { 
        value: `${totalFacialConvexity.toFixed(1)}°`, 
        score: profile ? scoreMetric(totalFacialConvexity, 125, 135) : 0 
      },
      nasalHeightToWidthRatio: { 
        value: nasalHeightToWidthRatio.toFixed(2), 
        score: scoreMetric(nasalHeightToWidthRatio, 1.00, 1.20) 
      },
      totalFacialWidthToHeightRatio: {
        value: `${totalFacialWidthToHeightRatio.toFixed(2)}×`,
        score: scoreMetric(totalFacialWidthToHeightRatio, 1.12, 1.57)
      },
      bigonialToBizygomaticRatio: {
        value: `${bigonialToBizygomaticRatio.toFixed(2)}%`,
        score: scoreMetric(bigonialToBizygomaticRatio, 66.40, 109.60)
      },
      eyeSeparationRatio: {
        value: `${eyeSeparationRatio.toFixed(2)}%`,
        score: scoreMetric(eyeSeparationRatio, 38.40, 53.60)
      },
      eyesApartRatio: {
        value: `${eyesApartRatio.toFixed(2)}×`,
        score: scoreMetric(eyesApartRatio, 0.65, 1.26)
      },
      faceWidthToHeightRatio: {
        value: `${faceWidthToHeightRatio.toFixed(2)}×`,
        score: scoreMetric(faceWidthToHeightRatio, 1.58, 2.36)
      },
      chinToPhiltrumRatio: {
        value: `${chinToPhiltrumRatio.toFixed(2)}×`,
        score: scoreMetric(chinToPhiltrumRatio, 0.80, 3.80)
      }
    }
  };
}

function getEmptyMetrics() {
  return {
    topThird: { value: "0.0%", score: 0 },
    middleThird: { value: "0.0%", score: 0 },
    lowerThird: { value: "0.0%", score: 0 },
    gonialAngle: { value: "0.0°", score: 0 },
    noseToMouthRatio: { value: "0.00", score: 0 },
    cantalTilt: { value: "0.0°", score: 0 },
    eyebrowTilt: { value: "0.0°", score: 0 },
    yawSymmetry: { value: "0.0%", score: 0 },
    nasalProjection: { value: "0.0mm", score: 0 },
    nasalTipAngle: { value: "0.0°", score: 0 },
    nasofrontalAngle: { value: "0.0°", score: 0 },
    nasolabialAngle: { value: "0.0°", score: 0 },
    facialConvexityGlabella: { value: "0.0°", score: 0 },
    facialConvexityNasion: { value: "0.0°", score: 0 },
    totalFacialConvexity: { value: "0.0°", score: 0 },
    nasalHeightToWidthRatio: { value: "0.00", score: 0 },
    totalFacialWidthToHeightRatio: { value: "0.00×", score: 0 },
    bigonialToBizygomaticRatio: { value: "0.00%", score: 0 },
    eyeSeparationRatio: { value: "0.00%", score: 0 },
    eyesApartRatio: { value: "0.00×", score: 0 },
    faceWidthToHeightRatio: { value: "0.00×", score: 0 },
    chinToPhiltrumRatio: { value: "0.00×", score: 0 }
  };
}
