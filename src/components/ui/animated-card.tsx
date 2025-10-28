import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode, useState } from "react";
import { Sparkles } from "lucide-react";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  variant?: "default" | "glass" | "gradient" | "glow" | "floating";
  hover?: boolean;
  delay?: number;
  icon?: ReactNode;
}

const AnimatedCard = ({
  children,
  className,
  title,
  description,
  variant = "default",
  hover = true,
  delay = 0,
  icon,
}: AnimatedCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const getVariantClasses = () => {
    switch (variant) {
      case "glass":
        return "gradient-glass border-white/20 backdrop-blur-sm";
      case "gradient":
        return "gradient-primary text-white border-0";
      case "glow":
        return "border-primary/20 bg-primary/5 hover:bg-primary/10";
      case "floating":
        return "shadow-lg hover:shadow-xl";
      default:
        return "";
    }
  };

  const getHoverClasses = () => {
    if (!hover) return "";
    
    switch (variant) {
      case "floating":
        return "hover:-translate-y-2 hover:shadow-2xl";
      case "glow":
        return "hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1";
      case "glass":
        return "hover:bg-white/20 hover:scale-105";
      case "gradient":
        return "hover:scale-[1.02] hover:shadow-xl";
      default:
        return "hover:shadow-lg hover:-translate-y-1";
    }
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        getVariantClasses(),
        getHoverClasses(),
        hover && "cursor-pointer",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Effects */}
      {variant === "gradient" && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
      )}
      
      {variant === "glow" && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/20 rounded-full blur-xl -ml-12 -mb-12" />
        </div>
      )}

      {/* Floating Elements */}
      {variant === "floating" && (
        <div className="absolute top-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
        </div>
      )}

      {/* Card Header */}
      {(title || icon) && (
        <CardHeader className={cn(
          "relative z-10",
          variant === "gradient" && "text-white"
        )}>
          <div className="flex items-center gap-3">
            {icon && (
              <div className={cn(
                "transition-transform duration-300",
                isHovered && "animate-bounce"
              )}>
                {icon}
              </div>
            )}
            <div className="flex-1">
              {title && (
                <CardTitle className={cn(
                  "flex items-center gap-2",
                  variant === "gradient" && "text-white"
                )}>
                  {title}
                  {isHovered && (
                    <Sparkles className="w-4 h-4 animate-pulse" />
                  )}
                </CardTitle>
              )}
              {description && (
                <p className={cn(
                  "text-sm mt-1",
                  variant === "gradient" ? "text-white/80" : "text-muted-foreground"
                )}>
                  {description}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      {/* Card Content */}
      <CardContent className={cn(
        "relative z-10",
        variant === "gradient" && "text-white"
      )}>
        {children}
      </CardContent>

      {/* Shimmer Effect */}
      {hover && (
        <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
      )}
    </Card>
  );
};

export default AnimatedCard;