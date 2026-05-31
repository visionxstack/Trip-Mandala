import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Car,
  ChevronDown,
  Compass,
  MapPin,
  Sparkle,
  Train,
  Wallet,
  Mountain,
  ShieldCheck,
  Leaf,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { getLocationImage } from "../utils/imageBank";
import { CurrencyDisplay } from "../utils/currency";
import { resolveHomestayImage } from "../utils/homestayImages";

export default function Planner() {
  usePageTitle("AI Trip Planner | Trip Mandala");
  const navigate = useNavigate();

  // Dropdown states
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [durationOpen, setDurationOpen] = useState(false);
  const [styleOpen, setStyleOpen] = useState(false);

  // Form selections
  const [budgetVal, setBudgetVal] = useState({ label: "USD 500 – 1,000", value: 750 });
  const [durationVal, setDurationVal] = useState({ label: "7 Days", value: 7 });
  const [styleVal, setStyleVal] = useState({ label: "Cultural Immersion", value: "cultural" });

  // Response states
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [planError, setPlanError] = useState("");

  const budgetOptions = [
  { label: "USD 150 – 500", value: 350 },
  { label: "USD 500 – 1,000", value: 750 },
  { label: "USD 1,000 – 2,500", value: 1800 }];


  const durationOptions = [
  { label: "5 Days", value: 5 },
  { label: "7 Days", value: 7 },
  { label: "10 Days", value: 10 },
  { label: "14 Days", value: 14 }];


  const styleOptions = [
  { label: "Cultural Immersion", value: "cultural" },
  { label: "Trekking Adventure", value: "trekking" },
  { label: "Spiritual Mindfulness", value: "spiritual" },
  { label: "Wild Adventure", value: "adventure" }];


  const handleGenerate = async () => {
    setLoading(true);
    setPlan(null);
    setPlanError("");
    // Track trip planner search event
    api.trackSearch({
      search_type: "trip_planner",
      interests: [styleVal.value],
      filters_applied: { budget: budgetVal.value, duration: durationVal.value, style: styleVal.value },
    });
    try {
      const response = await api.generateTripPlan({
        budget: budgetVal.value,
        duration: durationVal.value,
        travel_type: styleVal.value,
      });
      setPlan(response);
    } catch (err) {
      console.error("Error generating trip plan:", err);
      setPlanError(err.message || "Failed to generate your itinerary. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName) => {
    switch (iconName.toLowerCase()) {
      case "mountain":
        return <Mountain className="size-4" />;
      case "train":
        return <Train className="size-4" />;
      case "car":
        return <Car className="size-4" />;
      default:
        return <MapPin className="size-4" />;
    }
  };

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible">
      <div className="max-w-[1140px] mx-auto px-12 pt-10 pb-12">
        {/* Title */}
        <div className="text-center flex flex-col items-center gap-4">
          <span className="font-medium text-[#7A8450] text-xs tracking-[2px]">
            AI TRIP PLANNER
          </span>
          <h1 className="leading-tight font-light text-[#3A3A3A] text-4xl">
            Tell us how you’d like to travel.
          </h1>
          <p className="max-w-xl text-[#6B6B6B] text-base">
            We’ll craft a meaningful itinerary connecting you with authentic Nepali homestays.
          </p>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 mt-8 gap-6 relative z-30">
          {/* Budget Dropdown */}
          <div className="relative">
            <Card className="shadow-sm rounded-xl bg-white border border-solid border-neutral-200 p-6 gap-4">
              <CardHeader className="p-0 flex-row justify-between items-center gap-2">
                <Wallet className="size-5 stroke-[1.5] text-[#3A3A3A]" />
                <span className="font-medium text-[#7A8450] text-xs tracking-[2px]">
                  YOUR BUDGET
                </span>
              </CardHeader>
              <CardContent className="p-0 gap-2 mt-4">
                <button
                  onClick={() => {
                    setBudgetOpen(!budgetOpen);
                    setDurationOpen(false);
                    setStyleOpen(false);
                  }}
                  className="text-left flex justify-between items-center w-full bg-transparent border-0 cursor-pointer">
                  
                  <span className="font-medium text-[#3A3A3A] text-lg">
                    {budgetVal.label}
                  </span>
                  <ChevronDown className="size-4 text-[#6B6B6B]" />
                </button>
                <div className="text-[#6B6B6B] text-xs mt-1">Per person, total trip</div>
              </CardContent>
            </Card>
            {budgetOpen &&
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 shadow-lg rounded-xl z-40 overflow-hidden">
                {budgetOptions.map((opt) =>
              <div
                key={opt.value}
                onClick={() => {
                  setBudgetVal(opt);
                  setBudgetOpen(false);
                }}
                className="px-6 py-3 text-sm hover:bg-[#FAF8F5] cursor-pointer text-[#2C2C2C] border-b border-neutral-100 last:border-0">
                
                    {opt.label}
                  </div>
              )}
              </div>
            }
          </div>

          {/* Duration Dropdown */}
          <div className="relative">
            <Card className="shadow-sm rounded-xl bg-white border border-solid border-neutral-200 p-6 gap-4">
              <CardHeader className="p-0 flex-row justify-between items-center gap-2">
                <Calendar className="size-5 stroke-[1.5] text-[#3A3A3A]" />
                <span className="font-medium text-[#7A8450] text-xs tracking-[2px]">
                  DURATION
                </span>
              </CardHeader>
              <CardContent className="p-0 gap-2 mt-4">
                <button
                  onClick={() => {
                    setDurationOpen(!durationOpen);
                    setBudgetOpen(false);
                    setStyleOpen(false);
                  }}
                  className="text-left flex justify-between items-center w-full bg-transparent border-0 cursor-pointer">
                  
                  <span className="font-medium text-[#3A3A3A] text-lg">
                    {durationVal.label}
                  </span>
                  <ChevronDown className="size-4 text-[#6B6B6B]" />
                </button>
                <div className="text-[#6B6B6B] text-xs mt-1">Flexible departure window</div>
              </CardContent>
            </Card>
            {durationOpen &&
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 shadow-lg rounded-xl z-40 overflow-hidden">
                {durationOptions.map((opt) =>
              <div
                key={opt.value}
                onClick={() => {
                  setDurationVal(opt);
                  setDurationOpen(false);
                }}
                className="px-6 py-3 text-sm hover:bg-[#FAF8F5] cursor-pointer text-[#2C2C2C] border-b border-neutral-100 last:border-0">
                
                    {opt.label}
                  </div>
              )}
              </div>
            }
          </div>

          {/* Style Dropdown */}
          <div className="relative">
            <Card className="shadow-sm rounded-xl bg-white border border-solid border-neutral-200 p-6 gap-4">
              <CardHeader className="p-0 flex-row justify-between items-center gap-2">
                <Compass className="size-5 stroke-[1.5] text-[#3A3A3A]" />
                <span className="font-medium text-[#7A8450] text-xs tracking-[2px]">
                  TRAVEL STYLE
                </span>
              </CardHeader>
              <CardContent className="p-0 gap-2 mt-4">
                <button
                  onClick={() => {
                    setStyleOpen(!styleOpen);
                    setBudgetOpen(false);
                    setDurationOpen(false);
                  }}
                  className="text-left flex justify-between items-center w-full bg-transparent border-0 cursor-pointer">
                  
                  <span className="font-medium text-[#3A3A3A] text-lg">
                    {styleVal.label}
                  </span>
                  <ChevronDown className="size-4 text-[#6B6B6B]" />
                </button>
                <div className="text-[#6B6B6B] text-xs mt-1">Slow travel, local hosts</div>
              </CardContent>
            </Card>
            {styleOpen &&
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 shadow-lg rounded-xl z-40 overflow-hidden">
                {styleOptions.map((opt) =>
              <div
                key={opt.value}
                onClick={() => {
                  setStyleVal(opt);
                  setStyleOpen(false);
                }}
                className="px-6 py-3 text-sm hover:bg-[#FAF8F5] cursor-pointer text-[#2C2C2C] border-b border-neutral-100 last:border-0">
                
                    {opt.label}
                  </div>
              )}
              </div>
            }
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex mt-8 justify-center relative z-10">
          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="font-medium rounded-lg bg-[#C0573A] hover:bg-[#a8492e] text-white text-base px-8 h-12 gap-2">
            
            <Sparkle className="size-4 animate-pulse" />
            {loading ? "Crafting Itinerary..." : "Generate My Itinerary"}
          </Button>
        </div>

        {/* Loading Spinner state */}
        {loading &&
        <div className="flex flex-col items-center justify-center mt-12 py-10 gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-dashed border-[#C0573A] border-t-transparent animate-spin" />
            <div className="text-[#6B6B6B] text-sm animate-pulse">Connecting with local hosts and calculating community impact splits...</div>
          </div>
        }

        {/* Error State */}
        {planError && !loading && (
          <div className="flex flex-col items-center justify-center mt-12 py-10 gap-4 animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-2xl font-bold">!</div>
            <div className="text-red-500 text-sm font-medium text-center max-w-md">{planError}</div>
            <button
              onClick={handleGenerate}
              className="text-[#C0573A] text-xs underline cursor-pointer border-0 bg-transparent font-semibold"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Plan Result */}
        {plan &&
        <div className="mt-12 transition-all duration-500 animate-in fade-in slide-in-from-bottom-5">
            <div className="border-b border-[#E8E0D2] border-solid flex pb-4 justify-between items-center flex-col sm:flex-row gap-4">
              <div>
                <h2 className="font-light text-[#3A3A3A] text-2xl">Your Suggested Journey</h2>
                <div className="text-[#6B6B6B] text-xs mt-1">
                  Destinations: <span className="font-medium text-[#3A3A3A]">{plan.destinations.join(" → ")}</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button 
                  onClick={async () => {
                    const { exportItineraryPDF } = await import("../utils/pdfExport");
                    exportItineraryPDF(plan, { budget: budgetVal.value, duration: durationVal.value, travel_type: styleVal.value });
                  }}
                  className="flex items-center gap-2 text-xs font-semibold bg-white border border-[#C0573A] text-[#C0573A] hover:bg-[#C0573A] hover:text-white px-3 py-1.5 rounded-full cursor-pointer transition-all shadow-sm"
                >
                  📥 Download Itinerary PDF
                </button>
                <div className="text-[#7A8450] text-sm flex items-center gap-2 font-medium bg-[#7A8450]/10 px-3 py-1.5 rounded-full">
                  <Sparkle className="size-4" />
                  Est. Cost: ${plan.estimated_cost} · {durationVal.label}
                </div>
              </div>
            </div>

            <div className="flex mt-6 flex-col gap-6">
              {plan.itinerary.map((dayPlan, index) => {
              // Find matching homestay details
              const homestayDetail = plan.recommended_homestays.find(
                (h) => h.id === dayPlan.homestay_id
              );

              return (
                <Card
                  key={index}
                  className="shadow-sm border-l-4 border-l-[#C0573A] rounded-xl bg-white border border-neutral-200 border-solid p-6 gap-4">
                  
                    <CardHeader className="p-0 flex-row justify-between items-start gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-[#C0573A] text-[13px] tracking-[1.5px]">
                          {dayPlan.day.toUpperCase()}
                        </span>
                        <span className="font-medium text-[#3A3A3A] text-xl">
                          {dayPlan.title}
                        </span>
                        <span className="text-[#6B6B6B] text-sm mt-1 leading-relaxed">
                          {dayPlan.description}
                        </span>
                        {/* AI Reasoning badge */}
                        <div className="flex items-start gap-1.5 mt-2 bg-[#F2EDE6] rounded-lg px-3 py-2">
                          <Info size={11} className="text-[#C0573A] mt-0.5 shrink-0" />
                          <span className="text-[10px] text-[#6B4A3A] leading-relaxed">
                            Recommended because it matches your interest in <strong>{styleVal.label.toLowerCase()}</strong>,
                            prioritizing verified hosts and community-based tourism.
                          </span>
                        </div>
                      </div>
                      <div className="text-[#7A8450] flex items-center gap-2 font-medium shrink-0">
                        {getIconComponent(dayPlan.icon)}
                        <span className="text-[13px]">{dayPlan.duration}</span>
                      </div>
                    </CardHeader>
                    {homestayDetail &&
                  <CardContent className="p-0 gap-4 mt-4">
                        <div className="rounded-lg bg-[#FAF8F5] border border-neutral-100 flex p-4 justify-between items-center flex-col sm:flex-row gap-4">
                          <div className="flex items-center gap-4">
                            <img
                          alt={homestayDetail.name}
                          className="object-cover rounded-lg w-14 h-14"
                          src={resolveHomestayImage(homestayDetail, index, getLocationImage)}
                          loading="lazy"
                          onError={(e) => { e.target.src = getLocationImage(homestayDetail.location || homestayDetail.district, index) || getLocationImage("Default", index) }} />
                        
                            <div className="flex flex-col">
                              <span className="font-medium text-[#3A3A3A] text-sm">
                                {homestayDetail.name}
                              </span>
                              <span className="text-[#6B6B6B] text-xs">
                                {homestayDetail.location} {homestayDetail.women_led && "· Women-Led"}
                              </span>
                              {/* Trust / eco badges */}
                              <div className="flex items-center gap-2 mt-1">
                                {homestayDetail.women_led && (
                                  <span className="text-[9px] font-bold text-pink-700 bg-pink-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    👩 Women-Led
                                  </span>
                                )}
                                {homestayDetail.eco_score >= 7 && (
                                  <span className="text-[9px] font-bold text-green-700 bg-green-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                    <Leaf size={8} /> Eco
                                  </span>
                                )}
                                <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                  <ShieldCheck size={8} /> Verified
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                            <CurrencyDisplay nprAmount={homestayDetail.price_per_night} compact />
                            <button
                          onClick={() => navigate(`/checkout/${homestayDetail.id}`)}
                          className="font-medium text-[#C0573A] hover:text-[#a8492e] text-[13px] flex items-center gap-1 bg-transparent border-0 cursor-pointer">
                          
                              Book This Stay
                              <ArrowRight className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </CardContent>
                  }
                  </Card>);

            })}
            </div>
            
            {/* Cultural Highlights & Tips */}
            {(plan.cultural_highlights || plan.travel_tips) && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {plan.cultural_highlights && (
                  <Card className="shadow-sm rounded-xl bg-[#FAF8F5] border border-neutral-200 p-6">
                    <h3 className="font-medium text-[#C0573A] mb-3 text-lg">Cultural Highlights</h3>
                    <ul className="list-disc pl-5 text-sm text-[#6B6B6B] space-y-1">
                      {plan.cultural_highlights.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </Card>
                )}
                {plan.travel_tips && (
                  <Card className="shadow-sm rounded-xl bg-[#FAF8F5] border border-neutral-200 p-6">
                    <h3 className="font-medium text-[#7A8450] mb-3 text-lg">Travel Tips</h3>
                    <ul className="list-disc pl-5 text-sm text-[#6B6B6B] space-y-1">
                      {plan.travel_tips.map((t, i) => <li key={i}>{t}</li>)}
                    </ul>
                  </Card>
                )}
              </div>
            )}
          </div>
        }
      </div>
    </div>);

}