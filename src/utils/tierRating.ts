export interface TierRating {
  tier: string;
  percentile: string;
  description: string;
  color: string;
}

export const calculateTierRating = (overallScore: number): TierRating => {
  if (overallScore === 10) {
    return {
      tier: "ADAM",
      percentile: "Top 0.0001%",
      description: "Perfect facial harmony. Exceptional in every metric.",
      color: "from-yellow-400 via-yellow-500 to-amber-600"
    };
  } else if (overallScore >= 9) {
    return {
      tier: "CHAD",
      percentile: "Top 1%",
      description: "Elite facial aesthetics. Outstanding proportions.",
      color: "from-cyan via-blue-500 to-indigo-600"
    };
  } else if (overallScore >= 8.5) {
    return {
      tier: "CHAD LITE",
      percentile: "Top 5%",
      description: "Excellent facial structure with strong appeal.",
      color: "from-cyan/80 via-blue-400 to-indigo-500"
    };
  } else if (overallScore >= 7.5) {
    return {
      tier: "HTN",
      percentile: "Top 20%",
      description: "High tier normie. Above average aesthetics.",
      color: "from-green-400 via-emerald-500 to-teal-600"
    };
  } else if (overallScore >= 6) {
    return {
      tier: "MTN",
      percentile: "50th Percentile",
      description: "Mid tier normie. Average facial proportions.",
      color: "from-yellow-500 via-amber-500 to-orange-500"
    };
  } else if (overallScore >= 5) {
    return {
      tier: "LTN",
      percentile: "30th Percentile",
      description: "Low tier normie. Below average features.",
      color: "from-orange-500 via-orange-600 to-red-500"
    };
  } else if (overallScore >= 4) {
    return {
      tier: "SUB 5",
      percentile: "10th Percentile",
      description: "Significant areas for improvement.",
      color: "from-red-500 via-red-600 to-red-700"
    };
  } else if (overallScore >= 2) {
    return {
      tier: "SUB 3",
      percentile: "2nd Percentile",
      description: "Major aesthetic challenges present.",
      color: "from-red-700 via-red-800 to-red-900"
    };
  } else {
    return {
      tier: "SUB HUMAN",
      percentile: "Bottom 1%",
      description: "Critical facial proportion concerns.",
      color: "from-gray-700 via-gray-800 to-black"
    };
  }
};
