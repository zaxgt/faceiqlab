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
  } | null;
}

const MetricDialog = ({ isOpen, onClose, metric }: MetricDialogProps) => {
  if (!metric) return null;

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

          {/* Diagram */}
          <div className="bg-background/50 p-6 rounded-lg border border-cyan/30">
            <p className="text-sm text-muted-foreground mb-4">Visual Reference</p>
            <div className="aspect-video bg-gradient-to-br from-cyan/5 to-magenta/5 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 200 200" className="w-full h-full max-w-xs">
                {/* Face outline */}
                <ellipse cx="100" cy="100" rx="60" ry="80" fill="none" stroke="hsl(var(--cyan))" strokeWidth="2" opacity="0.3"/>
                
                {/* Measurement lines based on metric type */}
                {metric.title.includes("Angle") && (
                  <>
                    <line x1="70" y1="100" x2="130" y2="100" stroke="hsl(var(--magenta))" strokeWidth="2"/>
                    <line x1="100" y1="70" x2="100" y2="130" stroke="hsl(var(--magenta))" strokeWidth="2"/>
                    <circle cx="100" cy="100" r="3" fill="hsl(var(--cyan))"/>
                  </>
                )}
                
                {metric.title.includes("Ratio") && (
                  <>
                    <line x1="60" y1="80" x2="140" y2="80" stroke="hsl(var(--cyan))" strokeWidth="2"/>
                    <line x1="60" y1="120" x2="140" y2="120" stroke="hsl(var(--cyan))" strokeWidth="2"/>
                    <line x1="100" y1="80" x2="100" y2="120" stroke="hsl(var(--magenta))" strokeWidth="2" strokeDasharray="4"/>
                  </>
                )}

                {metric.title.includes("Symmetry") && (
                  <>
                    <line x1="100" y1="40" x2="100" y2="160" stroke="hsl(var(--cyan))" strokeWidth="2" strokeDasharray="4"/>
                    <circle cx="75" cy="90" r="8" fill="none" stroke="hsl(var(--magenta))" strokeWidth="2"/>
                    <circle cx="125" cy="90" r="8" fill="none" stroke="hsl(var(--magenta))" strokeWidth="2"/>
                  </>
                )}
              </svg>
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
