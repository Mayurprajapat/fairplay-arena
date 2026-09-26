import { fmt } from "../utils/points";

// Animated FPP balance display
export default function PointsDisplay({ value, size = "md" }) {
  const cls =
    size === "lg"
      ? "text-3xl md:text-4xl"
      : size === "sm"
        ? "text-base"
        : "text-xl md:text-2xl";
  return (
    <div className="flex items-center gap-2">
      <span className="text-xl md:text-2xl">⭐</span>
      <span key={value} className={`font-display font-bold gold-text pop-in ${cls}`}>
        {fmt(value)} FPP
      </span>
    </div>
  );
}
