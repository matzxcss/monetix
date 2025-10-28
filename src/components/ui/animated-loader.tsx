import { cn } from "@/lib/utils";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
  variant?: "dots" | "pulse" | "shimmer" | "wallet";
}

const AnimatedLoader = ({ 
  size = "md", 
  className = "", 
  text,
  variant = "dots"
}: AnimatedLoaderProps) => {
  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
        {text && <p className={cn("text-muted-foreground", textSizeClasses[size])}>{text}</p>}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div className="absolute inset-2 bg-primary/40 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          <div className="absolute inset-4 bg-primary rounded-full animate-pulse"></div>
        </div>
        {text && <p className={cn("text-muted-foreground", textSizeClasses[size])}>{text}</p>}
      </div>
    );
  }

  if (variant === "shimmer") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className={cn("shimmer bg-muted rounded-lg", sizeClasses[size])}>
          <div className="w-full h-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>
        {text && <p className={cn("text-muted-foreground", textSizeClasses[size])}>{text}</p>}
      </div>
    );
  }

  if (variant === "wallet") {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
        <div className={cn("relative", sizeClasses[size])}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary rounded-2xl animate-pulse"></div>
          <div className="absolute inset-2 bg-card rounded-xl flex items-center justify-center">
            <svg className="w-1/2 h-1/2 text-primary animate-pulse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="w-4 h-4 bg-success rounded-full animate-bounce"></div>
          </div>
        </div>
        {text && <p className={cn("text-muted-foreground", textSizeClasses[size])}>{text}</p>}
      </div>
    );
  }

  return null;
};

export default AnimatedLoader;