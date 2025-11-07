import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";

interface UploadSectionProps {
  frontImage: string | null;
  profileImage: string | null;
  onFrontImageChange: (image: string | null) => void;
  onProfileImageChange: (image: string | null) => void;
  onAnalyze: () => void;
}

const UploadSection = ({
  frontImage,
  profileImage,
  onFrontImageChange,
  onProfileImageChange,
  onAnalyze,
}: UploadSectionProps) => {
  const frontInputRef = useRef<HTMLInputElement>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);
  const [scanning, setScanning] = useState<"front" | "profile" | null>(null);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "front" | "profile"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === "front") {
          onFrontImageChange(result);
        } else {
          onProfileImageChange(result);
        }
        // Trigger scan animation
        setScanning(type);
        setTimeout(() => setScanning(null), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  const bothImagesUploaded = frontImage && profileImage;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 animate-slide-up">
      <div className="w-full max-w-6xl space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-5xl font-bold tracking-tight">Upload Images</h2>
          <p className="text-muted-foreground text-lg">
            Provide clear, well-lit photos for accurate analysis
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Front View Upload */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Front View</h3>
            <div
              onClick={() => frontInputRef.current?.click()}
              className="relative aspect-[3/4] border-2 border-cyan/30 rounded-lg overflow-hidden cursor-pointer group hover:border-cyan transition-all duration-300 hover:glow-subtle"
            >
              {frontImage ? (
                <>
                  <img
                    src={frontImage}
                    alt="Front view"
                    className="w-full h-full object-cover"
                  />
                  {scanning === "front" && (
                    <div className="absolute inset-0 bg-cyan/10">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-cyan to-transparent animate-scan" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground group-hover:text-cyan transition-colors">
                  <Upload className="w-12 h-12" />
                  <p className="text-sm">Click or Drag Image Here</p>
                </div>
              )}
            </div>
            <input
              ref={frontInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "front")}
              className="hidden"
            />
          </div>

          {/* Profile View Upload */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-center">Side Profile</h3>
            <div
              onClick={() => profileInputRef.current?.click()}
              className="relative aspect-[3/4] border-2 border-magenta/30 rounded-lg overflow-hidden cursor-pointer group hover:border-magenta transition-all duration-300 hover:glow-subtle"
            >
              {profileImage ? (
                <>
                  <img
                    src={profileImage}
                    alt="Profile view"
                    className="w-full h-full object-cover"
                  />
                  {scanning === "profile" && (
                    <div className="absolute inset-0 bg-magenta/10">
                      <div className="absolute w-full h-1 bg-gradient-to-r from-transparent via-magenta to-transparent animate-scan" />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 text-muted-foreground group-hover:text-magenta transition-colors">
                  <Upload className="w-12 h-12" />
                  <p className="text-sm">Click or Drag Image Here</p>
                </div>
              )}
            </div>
            <input
              ref={profileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, "profile")}
              className="hidden"
            />
          </div>
        </div>

        {bothImagesUploaded && (
          <div className="flex justify-center pt-8 animate-slide-up">
            <Button
              onClick={onAnalyze}
              className="px-12 py-6 text-lg font-semibold bg-gradient-to-r from-cyan/20 to-magenta/20 border border-cyan hover:glow-cyan animate-glow-pulse"
            >
              Analyze My Face
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSection;
