/**
 * TrustBadge — Reusable trust score display component
 * Shows score ring, verified label, and badges for any entity
 */
import { Shield, ShieldCheck, Leaf, Users, Star, Award } from "lucide-react";

const BADGE_CONFIG = {
  "Verified Host":         { icon: ShieldCheck, color: "#2563EB", bg: "#EFF6FF", label: "Verified Host" },
  "Community Approved":    { icon: Award,       color: "#7C3AED", bg: "#F5F3FF", label: "Community Approved" },
  "Women-Led":             { icon: Users,       color: "#DB2777", bg: "#FDF2F8", label: "Women-Led" },
  "Eco-Friendly":          { icon: Leaf,        color: "#16A34A", bg: "#F0FDF4", label: "Eco-Friendly" },
  "Local Heritage Partner":{ icon: Star,        color: "#D97706", bg: "#FFFBEB", label: "Heritage Partner" },
};

function ScoreRing({ score }) {
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626";

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="52" height="52" className="-rotate-90">
        <circle cx="26" cy="26" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="4" />
        <circle
          cx="26" cy="26" r={radius} fill="none"
          stroke={color} strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - filled}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <span className="absolute text-[11px] font-bold" style={{ color }}>
        {score}
      </span>
    </div>
  );
}

export function TrustBadges({ badges = [] }) {
  if (!badges.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge) => {
        const cfg = BADGE_CONFIG[badge];
        if (!cfg) return null;
        const Icon = cfg.icon;
        return (
          <span
            key={badge}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
            style={{ background: cfg.bg, color: cfg.color }}
            title={cfg.label}
          >
            <Icon size={10} />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}

export function TrustScoreCard({ score = null, badges = [], entityType = "homestay", compact = false }) {
  if (score === null) return null;

  const label = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Fair" : "Low";
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626";

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <Shield size={12} style={{ color }} />
        <span className="text-[11px] font-bold" style={{ color }}>{score}/100</span>
        <span className="text-[10px] text-neutral-500">Trust</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-neutral-100 bg-white p-4 flex items-start gap-4">
      <ScoreRing score={score} />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={14} style={{ color }} />
          <span className="text-xs font-bold" style={{ color }}>
            Trust Score: {score}/100 · {label}
          </span>
        </div>
        <p className="text-[11px] text-neutral-500 mb-2">Verified by Trip Mandala</p>
        <TrustBadges badges={badges} />
      </div>
    </div>
  );
}

export function PriceWarning({ label, message, benchmarkMin, benchmarkMax }) {
  if (!label || label === "fair" || label === "unknown") return null;

  const isAbove = label === "above_market" || label === "slightly_above";
  const isBelow = label === "below_market";

  return (
    <div
      className={`flex items-start gap-2 rounded-lg px-3 py-2 text-xs font-medium mt-2`}
      style={{
        background: isAbove ? "#FEF3C7" : isBelow ? "#EFF6FF" : "#F0FDF4",
        color: isAbove ? "#92400E" : isBelow ? "#1E40AF" : "#14532D",
        border: `1px solid ${isAbove ? "#FDE68A" : isBelow ? "#BFDBFE" : "#BBF7D0"}`
      }}
    >
      <span>{isAbove ? "⚠️" : isBelow ? "ℹ️" : "✓"}</span>
      <span>{message}</span>
    </div>
  );
}

export default TrustScoreCard;
