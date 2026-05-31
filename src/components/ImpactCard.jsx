/**
 * ImpactCard — Shows a tourist's community impact after a booking
 * Celebrates local families supported, women-led, eco-friendly stays
 */
import { Heart, Leaf, Users, Star, TrendingUp } from "lucide-react";

export default function ImpactCard({ impact, compact = false }) {
  if (!impact) return null;

  const {
    families_supported = 1,
    women_led_supported = false,
    eco_friendly_stay = false,
    local_economy_contribution_npr,
    cultural_sites_nearby = 0,
  } = impact;

  const items = [
    { show: true,               icon: "👨‍👩‍👧", text: `Supported ${families_supported} Local ${families_supported === 1 ? "Family" : "Families"}` },
    { show: women_led_supported, icon: "👩",   text: "Supported Women-Led Tourism" },
    { show: eco_friendly_stay,   icon: "🌿",   text: "Contributed to Sustainable Travel" },
    { show: cultural_sites_nearby > 0, icon: "🏛️", text: `${cultural_sites_nearby} Heritage Site${cultural_sites_nearby > 1 ? "s" : ""} Nearby` },
  ].filter((i) => i.show);

  if (compact) {
    return (
      <div className="rounded-xl bg-gradient-to-br from-[#F0FDF4] to-[#ECFDF5] border border-green-100 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Heart size={14} className="text-green-600" />
          <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Your Impact</span>
        </div>
        <div className="flex flex-col gap-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-green-800 font-medium">
              <span>{item.icon}</span>
              <span>✓ {item.text}</span>
            </div>
          ))}
        </div>
        {local_economy_contribution_npr > 0 && (
          <div className="mt-3 pt-3 border-t border-green-100 flex items-center gap-2 text-xs text-green-700">
            <TrendingUp size={12} />
            <span className="font-semibold">NPR {Number(local_economy_contribution_npr).toLocaleString()}</span>
            <span className="text-green-600">went directly to the host community</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-[#F0FDF4] via-[#ECFDF5] to-white border border-green-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Heart size={18} className="text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-green-900 text-base">Your Travel Impact</h3>
          <p className="text-xs text-green-600">How your journey benefits Nepal</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 mb-5">
        {items.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 bg-white rounded-xl p-3 border border-green-50 shadow-[0_1px_4px_rgba(0,0,0,0.04)]"
          >
            <span className="text-xl">{item.icon}</span>
            <div className="flex-1">
              <span className="text-sm font-medium text-green-800">✓ {item.text}</span>
            </div>
          </div>
        ))}
      </div>

      {local_economy_contribution_npr > 0 && (
        <div className="rounded-xl bg-green-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp size={16} />
            <div>
              <div className="text-xs opacity-80 font-medium">Local Economy Contribution</div>
              <div className="font-bold text-lg">NPR {Number(local_economy_contribution_npr).toLocaleString()}</div>
            </div>
          </div>
          <div className="text-right text-xs opacity-80">
            <div>96.5% went</div>
            <div>to your host</div>
          </div>
        </div>
      )}

      <p className="text-[11px] text-green-600 text-center mt-4">
        Trip Mandala is committed to community-first tourism in Nepal.
      </p>
    </div>
  );
}
