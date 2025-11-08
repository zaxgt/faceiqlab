import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frontImage, profileImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are a precise facial analysis expert. Analyze these facial images and provide exact measurements for the following metrics. If no face is detected, return all values as 0.

CRITICAL: You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "faceDetected": true/false,
  "metrics": {
    "midfaceRatio": { "value": "X.XX", "score": X.X },
    "gonialAngle": { "value": "XXX.X°", "score": X.X },
    "noseToMouthRatio": { "value": "X.XX", "score": X.X },
    "eyeToEyeSeparation": { "value": "X.XX", "score": X.X },
    "cantalTilt": { "value": "X.X°", "score": X.X },
    "eyebrowTilt": { "value": "X.X°", "score": X.X },
    "yawSymmetry": { "value": "XX.X%", "score": X.X },
    "nasalProjection": { "value": "XX.Xmm", "score": X.X },
    "nasalTipAngle": { "value": "XXX.X°", "score": X.X },
    "nasofrontalAngle": { "value": "XXX.X°", "score": X.X },
    "nasolabialAngle": { "value": "XXX.X°", "score": X.X },
    "facialConvexityGlabella": { "value": "XXX.X°", "score": X.X },
    "facialConvexityNasion": { "value": "XXX.X°", "score": X.X },
    "totalFacialConvexity": { "value": "XXX.X°", "score": X.X },
    "nasalHeightToWidthRatio": { "value": "X.XX", "score": X.X }
  }
}

Ideal ranges for scoring (score 0-10):
- Midface Ratio: 0.95-1.00 (10 points), deduct points as it deviates
- Gonial Angle: 120-130° (10 points), deduct heavily outside range
- Nose-to-Mouth Ratio: 1.20-1.30 (10 points)
- Eye-to-Eye Separation: 0.88-0.95 (10 points)
- Cantal Tilt: 5-8° (10 points)
- Eyebrow Tilt: 2-5° (10 points)
- Yaw Symmetry: 95-100% (10 points)
- Nasal Projection: 12-16mm (10 points)
- Nasal Tip Angle: 95-115° (10 points)
- Nasofrontal Angle: 115-135° (10 points)
- Nasolabial Angle: 90-120° (10 points)
- Facial Convexity (Glabella): 165-175° (10 points)
- Facial Convexity (Nasion): 160-170° (10 points)
- Total Facial Convexity: 165-175° (10 points)
- Nasal Height-to-Width Ratio: 1.00-1.20 (10 points)

Analyze both images carefully. Be harsh in scoring - only exceptional measurements get 9-10 points.`;

    const messages = [
      { 
        role: "user", 
        content: [
          { type: "text", text: prompt },
          ...(frontImage ? [{ 
            type: "image_url", 
            image_url: { url: frontImage }
          }] : []),
          ...(profileImage ? [{ 
            type: "image_url", 
            image_url: { url: profileImage }
          }] : [])
        ]
      }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let analysisText = data.choices[0].message.content;
    
    // Extract JSON from markdown code blocks if present
    const jsonMatch = analysisText.match(/```json\s*([\s\S]*?)\s*```/) || 
                     analysisText.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      analysisText = jsonMatch[1];
    }
    
    // Parse the JSON response
    const analysis = JSON.parse(analysisText);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-face function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      faceDetected: false,
      metrics: {
        midfaceRatio: { value: "0.00", score: 0 },
        gonialAngle: { value: "0.0°", score: 0 },
        noseToMouthRatio: { value: "0.00", score: 0 },
        eyeToEyeSeparation: { value: "0.00", score: 0 },
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
        nasalHeightToWidthRatio: { value: "0.00", score: 0 }
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
