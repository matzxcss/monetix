import { useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  decay: number;
}

interface ParticleEffectProps {
  className?: string;
  particleCount?: number;
  colors?: string[];
  variant?: "floating" | "bubbles" | "stars";
}

const ParticleEffect = ({ 
  className = "", 
  particleCount = 30,
  colors = ["#008080", "#CC5500", "#0E5555"],
  variant = "floating"
}: ParticleEffectProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(canvas, colors, variant));
      }
    };

    const createParticle = (canvas: HTMLCanvasElement, colors: string[], variant: string): Particle => {
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      if (variant === "bubbles") {
        return {
          x: Math.random() * canvas.width,
          y: canvas.height + Math.random() * 100,
          vx: (Math.random() - 0.5) * 0.5,
          vy: -Math.random() * 2 - 1,
          radius: Math.random() * 4 + 1,
          color,
          alpha: Math.random() * 0.5 + 0.2,
          decay: Math.random() * 0.002 + 0.001
        };
      }
      
      if (variant === "stars") {
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          radius: Math.random() * 2 + 0.5,
          color,
          alpha: Math.random() * 0.8 + 0.2,
          decay: Math.random() * 0.01 + 0.005
        };
      }
      
      // Default floating variant
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 3 + 1,
        color,
        alpha: Math.random() * 0.5 + 0.2,
        decay: Math.random() * 0.002 + 0.001
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current = particlesRef.current.filter(particle => {
        // Update particle position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Update particle alpha
        particle.alpha -= particle.decay;

        // Remove dead particles
        if (particle.alpha <= 0) {
          return false;
        }

        // Bounce off walls for floating variant
        if (variant === "floating") {
          if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
          if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
        }

        // Remove particles that are out of bounds for bubbles
        if (variant === "bubbles" && particle.y < -10) {
          return false;
        }

        // Draw particle
        ctx.save();
        ctx.globalAlpha = particle.alpha;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Add glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = particle.color;
        ctx.fill();
        ctx.restore();

        return true;
      });

      // Add new particles to maintain count
      while (particlesRef.current.length < particleCount) {
        particlesRef.current.push(createParticle(canvas, colors, variant));
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [particleCount, colors, variant]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticleEffect;