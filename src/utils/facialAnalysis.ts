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
    leftEye: 33, // Left pupil
    rightEye: 263, // Right pupil
    noseTop: 168,
    noseTip: 1,
    noseBottom: 2,
    noseLeft: 98,
    noseRight: 327,
    noseBridge: 6, // Nose bridge for measurements
    mouthTop: 13,
    mouthBottom: 14,
    leftMouth: 78, // Inner lip corner (where lips meet)
    rightMouth: 308, // Inner lip corner (where lips meet)
    leftMouthOuter: 61, // Outer corner of mouth
    rightMouthOuter: 291, // Outer corner of mouth
    upperLipTop: 0, // Top of upper lip (vermillion border)
    lowerLipBottom: 17, // Bottom of lower lip
    leftJaw: 234,
    rightJaw: 454,
    chin: 152,
    forehead: 10,
    leftEyeOuter: 33, // Outer canthus left
    rightEyeOuter: 263, // Outer canthus right
    leftEyeInner: 133, // Inner canthus left (medial)
    rightEyeInner: 362, // Inner canthus right (medial)
    leftEyeTop: 159, // Top of left eye
    leftEyeBottom: 145, // Bottom of left eye
    rightEyeTop: 386, // Top of right eye
    rightEyeBottom: 374, // Bottom of right eye
    jawAngle: isProfile ? 172 : 234,
    glabella: 9,
    leftCheekbone: 454, // Bizygomatic point
    rightCheekbone: 234, // Bizygomatic point
    philtrumTop: 164, // Top of philtrum (under nose)
    philtrumBottom: 13, // Bottom of philtrum (top of upper lip)
    pronasale: isProfile ? 4 : 1, // Nose tip in profile (actual anterior point on nose)
    leftTemple: 127, // Left temple
    rightTemple: 356 // Right temple
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
    noseBridge: landmarks[indices.noseBridge],
    mouthTop: landmarks[indices.mouthTop],
    mouthBottom: landmarks[indices.mouthBottom],
    leftMouth: landmarks[indices.leftMouth],
    rightMouth: landmarks[indices.rightMouth],
    leftMouthOuter: landmarks[indices.leftMouthOuter],
    rightMouthOuter: landmarks[indices.rightMouthOuter],
    upperLipTop: landmarks[indices.upperLipTop],
    lowerLipBottom: landmarks[indices.lowerLipBottom],
    leftJaw: landmarks[indices.leftJaw],
    rightJaw: landmarks[indices.rightJaw],
    chin: landmarks[indices.chin],
    forehead: landmarks[indices.forehead],
    leftEyeOuter: landmarks[indices.leftEyeOuter],
    rightEyeOuter: landmarks[indices.rightEyeOuter],
    leftEyeInner: landmarks[indices.leftEyeInner],
    rightEyeInner: landmarks[indices.rightEyeInner],
    leftEyeTop: landmarks[indices.leftEyeTop],
    leftEyeBottom: landmarks[indices.leftEyeBottom],
    rightEyeTop: landmarks[indices.rightEyeTop],
    rightEyeBottom: landmarks[indices.rightEyeBottom],
    jawAngle: landmarks[indices.jawAngle],
    glabella: landmarks[indices.glabella],
    leftCheekbone: landmarks[indices.leftCheekbone],
    rightCheekbone: landmarks[indices.rightCheekbone],
    philtrumTop: landmarks[indices.philtrumTop],
    philtrumBottom: landmarks[indices.philtrumBottom],
    pronasale: landmarks[indices.pronasale],
    leftTemple: landmarks[indices.leftTemple],
    rightTemple: landmarks[indices.rightTemple]
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
  // Eye measurements
  const interpupillaryDistance = distance(front.leftEye, front.rightEye) * 100; // IPD in relative units (mm approximation)
  const intercanthalDistance = distance(front.leftEyeInner, front.rightEyeInner) * 100; // Inner eye corners distance
  const biocularWidth = distance(front.leftEyeOuter, front.rightEyeOuter) * 100; // Outer eye corners distance
  const leftPalpebralFissure = distance(front.leftEyeTop, front.leftEyeBottom) * 100; // Left eye opening height
  const rightPalpebralFissure = distance(front.rightEyeTop, front.rightEyeBottom) * 100; // Right eye opening height
  const averagePalpebralFissure = (leftPalpebralFissure + rightPalpebralFissure) / 2;
  const canthalIndex = (intercanthalDistance / interpupillaryDistance) * 100; // ICD/IPD ratio
  
  // Face width measurements
  const faceWidthAtEyeLevel = distance(front.leftJaw, front.rightJaw); // Face width at eye level
  const cheekboneWidth = distance(front.leftCheekbone, front.rightCheekbone); // Bizygomatic width
  const jawWidth = distance(front.leftJaw, front.rightJaw); // Bigonial width
  const templeWidth = distance(front.leftTemple, front.rightTemple); // Temple width
  
  // Face thirds - measure from forehead to eyebrow line, eyebrow line to nose bottom, nose bottom to chin
  const topThirdHeight = distance(front.forehead, front.noseTop); // Forehead to eyebrow level (using noseTop as proxy)
  const middleThirdHeight = distance(front.noseTop, front.noseBottom); // Eyebrow to nose bottom
  const lowerThirdHeight = distance(front.noseBottom, front.chin); // Nose bottom to chin
  const totalFaceHeight = topThirdHeight + middleThirdHeight + lowerThirdHeight;
  
  const topThirdPercent = (topThirdHeight / totalFaceHeight) * 100;
  const middleThirdPercent = (middleThirdHeight / totalFaceHeight) * 100;
  const lowerThirdPercent = (lowerThirdHeight / totalFaceHeight) * 100;
  
  // Nose and mouth measurements
  const noseWidth = distance(front.noseLeft, front.noseRight);
  const noseHeight = distance(front.noseTop, front.noseBottom);
  const noseBridgeWidth = distance(front.leftEyeInner, front.rightEyeInner) * 0.4; // Approximate bridge width
  const mouthWidthInner = distance(front.leftMouth, front.rightMouth); // Inner mouth width
  const mouthWidthOuter = distance(front.leftMouthOuter, front.rightMouthOuter); // Outer mouth width
  const noseToMouthRatio = mouthWidthInner / noseWidth; // Mouth width : Nose width ratio
  const mouthToNoseWidthRatio = mouthWidthOuter / noseWidth; // Outer mouth to nose ratio
  
  // Lip measurements
  const upperLipHeight = distance(front.philtrumBottom, front.upperLipTop);
  const lowerLipHeight = distance(front.mouthBottom, front.lowerLipBottom);
  const lipThicknessRatio = upperLipHeight / lowerLipHeight; // Upper to lower lip ratio
  
  // Facial ratios and proportions
  const totalFacialWidthToHeightRatio = cheekboneWidth / totalFaceHeight; // Widest point to height
  const facialWidthToHeightRatio = cheekboneWidth / totalFaceHeight; // FWHR - important metric
  const bigonialToBizygomaticRatio = (jawWidth / cheekboneWidth) * 100; // Jaw to cheekbone percentage
  const eyeSeparationRatio = (intercanthalDistance / (cheekboneWidth * 100)) * 100; // Inner eye distance as % of face width
  const faceWidthToHeightRatio = faceWidthAtEyeLevel / topThirdHeight; // Face width at eye level to forehead height
  const philtrumHeight = distance(front.philtrumTop, front.philtrumBottom);
  const chinHeight = distance(front.mouthBottom, front.chin);
  const chinToPhiltrumRatio = chinHeight / philtrumHeight;
  const midfaceRatio = middleThirdHeight / totalFaceHeight; // Midface proportion
  const lowerThirdToMidfaceRatio = lowerThirdHeight / middleThirdHeight; // Lower to middle third ratio
  const jawToCheekboneRatio = jawWidth / cheekboneWidth; // Jaw definition
  const templeToJawRatio = templeWidth / jawWidth; // Temple to jaw taper
  
  // Cantal tilt
  const cantalTiltAngle = Math.atan2(front.rightEye.y - front.leftEye.y, front.rightEye.x - front.leftEye.x) * (180 / Math.PI);
  
  // Yaw symmetry
  const leftDistance = Math.abs(front.leftEye.x - frontAnalysis.faceCenter.x);
  const rightDistance = Math.abs(front.rightEye.x - frontAnalysis.faceCenter.x);
  const yawSymmetry = (1 - Math.abs(leftDistance - rightDistance) / Math.max(leftDistance, rightDistance)) * 100;
  
  // Additional nasal measurements
  const nasalHeightToWidthRatio = noseHeight / noseWidth;
  const nasalIndexRatio = (noseWidth / noseHeight) * 100; // Nasal index percentage
  
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
    // Use pronasale (better nose point for profile) instead of noseTip for convexity
    facialConvexityGlabella = angle(profile.glabella, profile.pronasale, profile.chin);
    facialConvexityNasion = angle(profile.noseTop, profile.pronasale, profile.chin);
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
        pronasale: profile.pronasale, // Better nose point for profile convexity
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
      nasalIndexRatio: {
        value: `${nasalIndexRatio.toFixed(1)}%`,
        score: scoreMetric(nasalIndexRatio, 60, 85)
      },
      interpupillaryDistance: {
        value: `${interpupillaryDistance.toFixed(1)}mm`,
        score: scoreMetric(interpupillaryDistance, 58, 72)
      },
      intercanthalDistance: {
        value: `${intercanthalDistance.toFixed(1)}mm`,
        score: scoreMetric(intercanthalDistance, 28, 35)
      },
      biocularWidth: {
        value: `${biocularWidth.toFixed(1)}mm`,
        score: scoreMetric(biocularWidth, 85, 105)
      },
      canthalIndex: {
        value: `${canthalIndex.toFixed(1)}%`,
        score: scoreMetric(canthalIndex, 45, 55)
      },
      palpebralFissureLength: {
        value: `${averagePalpebralFissure.toFixed(1)}mm`,
        score: scoreMetric(averagePalpebralFissure, 8, 12)
      },
      mouthToNoseWidthRatio: {
        value: `${mouthToNoseWidthRatio.toFixed(2)}×`,
        score: scoreMetric(mouthToNoseWidthRatio, 1.40, 1.60)
      },
      lipThicknessRatio: {
        value: `${lipThicknessRatio.toFixed(2)}×`,
        score: scoreMetric(lipThicknessRatio, 0.80, 1.20)
      },
      totalFacialWidthToHeightRatio: {
        value: `${totalFacialWidthToHeightRatio.toFixed(2)}×`,
        score: scoreMetric(totalFacialWidthToHeightRatio, 1.12, 1.57)
      },
      facialWidthToHeightRatio: {
        value: `${facialWidthToHeightRatio.toFixed(2)}×`,
        score: scoreMetric(facialWidthToHeightRatio, 1.75, 1.95)
      },
      bigonialToBizygomaticRatio: {
        value: `${bigonialToBizygomaticRatio.toFixed(1)}%`,
        score: scoreMetric(bigonialToBizygomaticRatio, 70, 85)
      },
      eyeSeparationRatio: {
        value: `${eyeSeparationRatio.toFixed(1)}%`,
        score: scoreMetric(eyeSeparationRatio, 40, 50)
      },
      midfaceRatio: {
        value: `${(midfaceRatio * 100).toFixed(1)}%`,
        score: scoreMetric(midfaceRatio * 100, 30, 35)
      },
      lowerThirdToMidfaceRatio: {
        value: `${lowerThirdToMidfaceRatio.toFixed(2)}×`,
        score: scoreMetric(lowerThirdToMidfaceRatio, 0.95, 1.05)
      },
      jawToCheekboneRatio: {
        value: `${jawToCheekboneRatio.toFixed(2)}×`,
        score: scoreMetric(jawToCheekboneRatio, 0.75, 0.90)
      },
      templeToJawRatio: {
        value: `${templeToJawRatio.toFixed(2)}×`,
        score: scoreMetric(templeToJawRatio, 0.85, 1.05)
      },
      faceWidthToHeightRatio: {
        value: `${faceWidthToHeightRatio.toFixed(2)}×`,
        score: scoreMetric(faceWidthToHeightRatio, 1.58, 2.36)
      },
      chinToPhiltrumRatio: {
        value: `${chinToPhiltrumRatio.toFixed(2)}×`,
        score: scoreMetric(chinToPhiltrumRatio, 1.80, 2.20)
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
    nasalIndexRatio: { value: "0.0%", score: 0 },
    interpupillaryDistance: { value: "0.0mm", score: 0 },
    intercanthalDistance: { value: "0.0mm", score: 0 },
    biocularWidth: { value: "0.0mm", score: 0 },
    canthalIndex: { value: "0.0%", score: 0 },
    palpebralFissureLength: { value: "0.0mm", score: 0 },
    mouthToNoseWidthRatio: { value: "0.00×", score: 0 },
    lipThicknessRatio: { value: "0.00×", score: 0 },
    totalFacialWidthToHeightRatio: { value: "0.00×", score: 0 },
    facialWidthToHeightRatio: { value: "0.00×", score: 0 },
    bigonialToBizygomaticRatio: { value: "0.0%", score: 0 },
    eyeSeparationRatio: { value: "0.0%", score: 0 },
    midfaceRatio: { value: "0.0%", score: 0 },
    lowerThirdToMidfaceRatio: { value: "0.00×", score: 0 },
    jawToCheekboneRatio: { value: "0.00×", score: 0 },
    templeToJawRatio: { value: "0.00×", score: 0 },
    faceWidthToHeightRatio: { value: "0.00×", score: 0 },
    chinToPhiltrumRatio: { value: "0.00×", score: 0 }
  };
}
