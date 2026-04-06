import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "red" | "gold" | "green" | "blue";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-white/10 text-gray-300 border-white/15",
    red: "bg-[#DE2910]/15 text-[#DE2910] border-[#DE2910]/30",
    gold: "bg-[#FFDE00]/10 text-[#FFDE00] border-[#FFDE00]/25",
    green: "bg-green-500/10 text-green-400 border-green-500/25",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/25",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
