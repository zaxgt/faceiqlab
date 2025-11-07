import { useEffect, useState } from "react";

interface MetricBarProps {
  title: string;
  value: string;
  ideal: string;
  score: number;
  color: "cyan" | "magenta";
  delay?: number;
}

const MetricBar = ({ title, value, ideal, score, color, delay = 0 }: MetricBarProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [delay]);

  const percentage = (score / 10) * 100;
  
  // Color gradient based on score
  const getGradientColor = (score: number) => {
    if (score >= 9) return color === "cyan" ? "from-cyan to-cyan/60" : "from-magenta to-magenta/60";
    if (score >= 7) return "from-yellow-400 to-yellow-600";
    return "from-red-500 to-red-700";
  };

  return (
    <div
      className={`bg-card border border-border/50 rounded-lg p-4 space-y-3 transition-all duration-500 hover:border-${color}/30 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-semibold text-foreground">{title}</h4>
          <p className="text-xs text-muted-foreground">Ideal: {ideal}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-foreground">{value}</p>
          <p className="text-sm font-semibold text-cyan">{score.toFixed(1)} / 10</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${getGradientColor(score)} origin-left transition-transform duration-1000 ease-out ${
            visible ? "scale-x-100" : "scale-x-0"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default MetricBar;
