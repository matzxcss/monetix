import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ReactNode, useState, forwardRef } from "react";
import { Loader2, Check, Sparkles } from "lucide-react";

interface AnimatedButtonProps extends Omit<ButtonProps, 'variant'> {
  loading?: boolean;
  success?: boolean;
  successText?: string;
  loadingText?: string;
  icon?: ReactNode;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "gradient";
  ripple?: boolean;
}

const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(({
  children,
  loading = false,
  success = false,
  successText = "Concluído!",
  loadingText = "Processando...",
  icon,
  variant = "default",
  ripple = true,
  className,
  disabled,
  onClick,
  ...props
}, ref) => {
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ripple || loading || success) return;

    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      id: Date.now(),
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    onClick?.(e);
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "gradient":
        return "gradient-primary text-white border-0 hover:shadow-lg hover:shadow-primary/25 transition-all duration-300";
      default:
        return "";
    }
  };

  return (
    <Button
      ref={ref}
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        getVariantClasses(),
        (loading || success) && "cursor-not-allowed",
        className
      )}
      disabled={disabled || loading || success}
      onClick={handleClick}
      {...props}
    >
      {/* Ripple Effect */}
      {ripple && (
        <span className="absolute inset-0">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              className="absolute bg-white/30 rounded-full animate-ping"
              style={{
                left: ripple.x - 10,
                top: ripple.y - 10,
                width: 20,
                height: 20,
              }}
            />
          ))}
        </span>
      )}

      {/* Button Content */}
      <span className="relative z-10 flex items-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {success && <Check className="w-4 h-4 animate-bounce" />}
        {!loading && !success && icon && (
          <span className="group-hover:animate-bounce transition-all duration-300">
            {icon}
          </span>
        )}
        
        {loading ? (
          loadingText
        ) : success ? (
          <span className="flex items-center gap-2">
            {successText}
            <Sparkles className="w-4 h-4 animate-pulse" />
          </span>
        ) : (
          children
        )}
      </span>

      {/* Shimmer Effect */}
      {!loading && !success && (
        <span className="absolute inset-0 -top-2 -left-2 h-[calc(100%+4px)] w-[calc(100%+4px)]">
          <span className="shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </span>
      )}
    </Button>
  );
});

AnimatedButton.displayName = "AnimatedButton";

export default AnimatedButton;