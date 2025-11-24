import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ChevronLeft, Check } from "lucide-react";
import type { User } from "@supabase/supabase-js";

const Premium = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth and premium status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUser(user);

      // Check premium status
      const { data: profile } = await supabase
        .from("profiles")
        .select("premium")
        .eq("id", user.id)
        .single();

      if (profile) {
        setIsPremium(profile.premium);
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const handleUpgrade = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Update premium status
      const { error } = await supabase
        .from("profiles")
        .update({ premium: true })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Welcome to Premium! 🎉");
      setIsPremium(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30 animate-pulse-glow" />
        <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-magenta to-transparent opacity-30 animate-pulse-glow" style={{ animationDelay: "1s" }} />
        <div className="absolute top-3/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan to-transparent opacity-30 animate-pulse-glow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Home
        </button>

        <div className="bg-card border border-magenta/30 rounded-lg p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-magenta to-purple-600 bg-clip-text text-transparent">
              Premium Access
            </h1>
            <p className="text-2xl font-bold text-foreground">$1 / week</p>
          </div>

          {isPremium ? (
            <div className="space-y-6">
              <div className="bg-cyan/10 border border-cyan/30 rounded-lg p-6 text-center">
                <Check className="w-12 h-12 text-cyan mx-auto mb-3" />
                <p className="text-lg font-semibold text-foreground">You're Premium!</p>
                <p className="text-sm text-muted-foreground mt-2">Enjoy unlimited facial analysis</p>
              </div>

              <Button
                onClick={() => navigate("/")}
                className="w-full bg-cyan hover:bg-cyan/90 text-black font-semibold py-6"
              >
                Start Analyzing
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-magenta mt-0.5" />
                  <p className="text-foreground">Unlimited facial analysis</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-magenta mt-0.5" />
                  <p className="text-foreground">AI-powered personalized advice</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-magenta mt-0.5" />
                  <p className="text-foreground">Priority support</p>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-magenta mt-0.5" />
                  <p className="text-foreground">Advanced metrics & insights</p>
                </div>
              </div>

              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="w-full bg-gradient-to-r from-magenta to-purple-600 hover:from-magenta/90 hover:to-purple-600/90 text-white font-semibold py-6"
              >
                {loading ? "Processing..." : "Upgrade to Premium"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * This is a demo. No actual payment will be processed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Premium;
