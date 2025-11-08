import { TierRating } from "@/utils/tierRating";
import { Trophy } from "lucide-react";

interface TierRatingCardProps {
  tierRating: TierRating;
  overallScore: string;
}

const TierRatingCard = ({ tierRating, overallScore }: TierRatingCardProps) => {
  return (
    <div className="relative overflow-hidden bg-card border-2 border-primary rounded-xl p-8 text-center animate-slide-up glow-cyan">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${tierRating.color} opacity-10`} />
      
      <div className="relative z-10 space-y-4">
        <div className="flex justify-center mb-4">
          <Trophy className="w-16 h-16 text-primary" />
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">YOUR TIER RATING</p>
          <h2 className="text-6xl font-black bg-gradient-to-r from-cyan via-primary to-magenta bg-clip-text text-transparent mb-2">
            {tierRating.tier}
          </h2>
          <p className="text-2xl font-bold text-foreground">{overallScore} / 10</p>
        </div>
        
        <div className="space-y-2">
          <div className="inline-block px-4 py-2 bg-primary/20 border border-primary/30 rounded-full">
            <p className="text-lg font-semibold text-primary">{tierRating.percentile}</p>
          </div>
          <p className="text-muted-foreground max-w-md mx-auto">
            {tierRating.description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TierRatingCard;
