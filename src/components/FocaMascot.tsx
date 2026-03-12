import { cn } from "@/lib/utils";

interface FocaMascotProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

export function FocaMascot({ size = "md", className, animated = true }: FocaMascotProps) {
  const sizes = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  return (
    <div className={cn(sizes[size], className)}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-full", animated && "hover:scale-105 transition-transform duration-300")}
      >
        <rect x="16" y="16" width="168" height="168" rx="42" fill="#2563EB" stroke="#1F1A44" strokeWidth="8" />
        <rect x="34" y="34" width="132" height="132" rx="28" fill="#FFFAEF" stroke="#1F1A44" strokeWidth="6" />
        <rect x="54" y="54" width="58" height="58" rx="16" fill="#F7CF3D" stroke="#1F1A44" strokeWidth="6" />
        <path d="M72 84L84 96L104 68" stroke="#1F1A44" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="122" y="58" width="24" height="24" rx="8" fill="#FF6B57" stroke="#1F1A44" strokeWidth="5" />
        <rect x="122" y="92" width="24" height="48" rx="8" fill="#34D399" stroke="#1F1A44" strokeWidth="5" />
        <path d="M58 136H110" stroke="#1F1A44" strokeWidth="6" strokeLinecap="round" />
        <path d="M58 154H146" stroke="#1F1A44" strokeWidth="6" strokeLinecap="round" />
        <circle cx="142" cy="126" r="15" fill="#2563EB" stroke="#1F1A44" strokeWidth="6" />
        <path d="M142 118V133" stroke="#FFFAEF" strokeWidth="5" strokeLinecap="round" />
        <path d="M134 126H150" stroke="#FFFAEF" strokeWidth="5" strokeLinecap="round" />
        <defs>
        </defs>
      </svg>
    </div>
  );
}

export function FocaLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <FocaMascot size="sm" className="shrink-0" animated={false} />
      <span className="text-2xl font-black uppercase leading-none text-foreground">Gabarit</span>
    </div>
  );
}
