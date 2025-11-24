import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
interface HeroProps {
  onBegin: () => void;
  onPremium: () => void;
}
const Hero = ({
  onBegin,
  onPremium
}: HeroProps) => {
  return <div className="relative min-h-screen flex flex-col items-center justify-center px-4">
      {/* Animated background glow lines */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30 animate-pulse-glow" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta to-transparent opacity-30 animate-pulse-glow" style={{
        animationDelay: "1s"
      }} />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30 animate-pulse-glow" style={{
        animationDelay: "2s"
      }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center space-y-8 animate-slide-up">
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-foreground text-center">ARE YOU LOVABLE</h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
          Where symmetry meets soul.
        </p>
        
        <div className="pt-8 flex flex-col items-center gap-4">
          <Button onClick={onBegin} className="group relative px-8 py-6 text-lg font-semibold bg-card border border-cyan/30 text-foreground hover:border-cyan hover:glow-cyan transition-all duration-300">
            Begin Analysis
            <ChevronDown className="ml-2 h-5 w-5 animate-pulse-glow" />
          </Button>
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-muted-foreground text-sm">Premium — $1 / week</p>
            <Button 
              onClick={onPremium}
              className="px-6 py-3 bg-gradient-to-r from-magenta to-purple-600 text-white hover:from-magenta/90 hover:to-purple-600/90 transition-all duration-300 font-semibold"
            >
              Get Premium
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>;
};
export default Hero;