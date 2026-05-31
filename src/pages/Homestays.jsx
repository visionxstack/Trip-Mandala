import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Leaf, MapPin, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { getLocationImage } from "../utils/imageBank";
import { TrustBadges } from "../components/TrustBadge";
import ScamReportModal from "../components/ScamReportModal";
import { CurrencyDisplay } from "../utils/currency";
import { resolveHomestayImage } from "../utils/homestayImages";

export default function Homestays() {
  usePageTitle("Homestays | Trip Mandala");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const regionParam = searchParams.get("region") || "";

  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedRegion, setSelectedRegion] = useState(regionParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterEco, setFilterEco] = useState(false);
  const [filterWomenLed, setFilterWomenLed] = useState(false);
  const [filterPrice, setFilterPrice] = useState(false);

  // Trust scores keyed by homestay id
  const [trustMap, setTrustMap] = useState({});
  // Price benchmarks keyed by location
  const [benchmarkMap, setBenchmarkMap] = useState({});
  // Scam report modal state
  const [reportTarget, setReportTarget] = useState(null);

  const fetchHomestays = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getHomestays({
        women_led: filterWomenLed ? true : undefined,
        region: selectedRegion || undefined
      });

      let filtered = data;
      if (filterEco) filtered = filtered.filter((h) => h.eco_score >= 4.8);
      if (filterPrice) filtered = filtered.filter((h) => h.price_per_night <= 2000);
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter(h => 
          h.title?.toLowerCase().includes(q) || 
          h.location?.toLowerCase().includes(q) || 
          h.district?.toLowerCase().includes(q)
        );
      }

      setHomestays(filtered);

      // Track search analytics (silent)
      api.trackSearch({
        search_type: "homestay",
        filters_applied: { women_led: filterWomenLed, eco: filterEco, price: filterPrice, region: selectedRegion },
        result_count: filtered.length,
      });

      // Load trust scores in batch (non-blocking)
      api.getAllTrustScores("homestay").then((scores) => {
        const map = {};
        (scores || []).forEach((s) => { map[s.entity_id] = s; });
        setTrustMap(map);
      });

      // Load price benchmarks for unique locations (non-blocking)
      const uniqueLocations = [...new Set(filtered.map((h) => h.location).filter(Boolean))];
      Promise.all(
        uniqueLocations.map((loc) =>
          api.getPriceBenchmarks("homestay", loc).then((b) => ({ loc, b }))
        )
      ).then((results) => {
        const map = {};
        results.forEach(({ loc, b }) => {
          if (b && b.length > 0) map[loc] = b[0];
        });
        setBenchmarkMap(map);
      });

    } catch (err) {
      console.error(err);
      setError("Failed to load homestays.");
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, filterEco, filterWomenLed, filterPrice, searchQuery]);

  useEffect(() => { fetchHomestays(); }, [fetchHomestays]);

  useEffect(() => {
    if (regionParam) setSelectedRegion(regionParam);
  }, [regionParam]);

  const toggleRegion = (region) => {
    setSelectedRegion(selectedRegion === region ? "" : region);
  };

  const getPriceWarning = (homestay) => {
    const bench = benchmarkMap[homestay.location];
    if (!bench) return null;
    const priceNPR = homestay.price_per_night;
    const benchMaxNPR = bench.typical_max * 135;
    const benchMinNPR = bench.typical_min * 135;
    
    if (priceNPR > benchMaxNPR * 1.30) {
      return { label: "above_market", message: `⚠️ Price above typical range (NPR ${benchMinNPR}–${benchMaxNPR})` };
    }
    return null;
  };

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible">
      {/* Header & Filter Controls */}
      <div className="max-w-[1140px] flex mx-auto px-12 pt-8 pb-6 justify-between items-center flex-col md:flex-row gap-6">
        <div className="flex flex-col gap-2 w-full md:w-auto">
          <h1 className="leading-tight font-medium text-[#2A2A2A] text-[32px] tracking-tight">
            Homestays Across Nepal
          </h1>
          <p className="text-[#6B6B6B] text-[15px]">
            Handpicked homes. Real families. Genuine hospitality.
          </p>
        </div>

        <div className="flex flex-wrap justify-start md:justify-end items-center gap-2 w-full md:w-[60%]">
          {[
            { label: "All Regions", value: "" },
            { label: "Annapurna Region", value: "Annapurna" },
            { label: "Bandipur", value: "Bandipur" },
            { label: "Bhaktapur", value: "Bhaktapur" },
          ].map((r) => (
            <button
              key={r.value}
              onClick={() => r.value === "" ? setSelectedRegion("") : toggleRegion(r.value)}
              className={`rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors border border-solid ${
                selectedRegion === r.value
                  ? "bg-[#B5532A] text-white border-[#B5532A]"
                  : "bg-[#EDEBE7] text-[#2A2A2A] border-transparent hover:bg-[#e0deda]"
              }`}
            >
              {r.label}
            </button>
          ))}

          <button
            onClick={() => setFilterEco(!filterEco)}
            className={`rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors border border-solid ${
              filterEco ? "bg-[#6B7A4B] text-white border-[#6B7A4B]" : "bg-[#EDEBE7] text-[#2A2A2A] border-transparent hover:bg-[#e0deda]"
            }`}
          >
            Eco-Certified (4.8+)
          </button>

          <button
            onClick={() => setFilterWomenLed(!filterWomenLed)}
            className={`rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors border border-solid ${
              filterWomenLed ? "bg-[#B5532A] text-white border-[#B5532A]" : "bg-[#EDEBE7] text-[#2A2A2A] border-transparent hover:bg-[#e0deda]"
            }`}
          >
            Women-Led Only
          </button>

          <button
            onClick={() => setFilterPrice(!filterPrice)}
            className={`rounded-full px-4 py-2 text-xs font-medium cursor-pointer transition-colors border border-solid ${
              filterPrice ? "bg-[#B5532A] text-white border-[#B5532A]" : "bg-[#EDEBE7] text-[#2A2A2A] border-transparent hover:bg-[#e0deda]"
            }`}
          >
            Under NPR 2000
          </button>
          
          <div className="w-full md:w-auto mt-2 md:mt-0 flex items-center bg-white border border-neutral-200 rounded-full px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#B5532A]/20 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400 mr-2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search homestays..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-xs text-neutral-800 placeholder:text-neutral-400 w-full md:w-32 focus:w-48 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-[1140px] mx-auto px-12 pb-8">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-dashed border-[#B5532A] border-t-transparent animate-spin rounded-full" />
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : homestays.length === 0 ? (
          <div className="text-center py-20 text-[#6B6B6B]">
            No homestays found matching the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {homestays.map((home, index) => {
              const trust = trustMap[home.id];
              const priceWarn = getPriceWarning(home);
              return (
                <div
                  key={home.id}
                  className="shadow-[0_2px_16px_rgba(0,0,0,0.07)] rounded-[14px] bg-white flex p-3 flex-col gap-3 border border-neutral-100 hover:scale-[1.01] hover:shadow-md transition-all"
                >
                  {/* Image */}
                  <div
                    className="aspect-[4/3] rounded-[10px] w-full overflow-hidden relative cursor-pointer"
                    onClick={() => navigate(`/checkout/${home.id}`)}
                  >
                    <img
                      alt={home.title || home.name}
                      className="object-cover w-full h-full"
                      src={resolveHomestayImage(home, index, getLocationImage)}
                      loading="lazy"
                      onError={(e) => { e.target.src = getLocationImage(home.location, index) || getLocationImage("Default", index); }}
                    />
                    {home.women_led && (
                      <span className="absolute top-3 left-3 bg-[#E4EBD8] text-[#6B7A4B] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                        Women-Led
                      </span>
                    )}
                    {trust && trust.score >= 85 && (
                      <span className="absolute top-3 right-3 bg-blue-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                        ✓ {trust.score}/100
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div
                    className="flex px-2 pt-1 pb-1 flex-col gap-2 cursor-pointer"
                    onClick={() => navigate(`/checkout/${home.id}`)}
                  >
                    <span className="uppercase text-[#6B7A4B] text-xs font-semibold tracking-[1px] flex items-center gap-1">
                      <MapPin className="size-3 text-[#6B7A4B]" />
                      {home.location}
                    </span>
                    <h3 className="leading-snug font-medium text-[#2A2A2A] text-[17px]">
                      {home.title || home.name}
                    </h3>
                    <p className="leading-relaxed text-[#6B6B6B] text-[13px] line-clamp-2">
                      {home.description}
                    </p>

                    {/* Trust badges */}
                    {trust && trust.badges && trust.badges.length > 0 && (
                      <TrustBadges badges={trust.badges} />
                    )}

                    {/* Price warning */}
                    {priceWarn && (
                      <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5">
                        {priceWarn.message}
                      </div>
                    )}

                    <div className="border-t border-[#EDEBE7] border-solid flex mt-1 pt-2 justify-between items-center">
                      <CurrencyDisplay nprAmount={home.price_per_night} />
                      <div className="flex items-center gap-1">
                        <Leaf className="size-3.5 text-[#6B7A4B]" />
                        <span className="text-[#6B7A4B] text-xs font-semibold">Eco {home.eco_score}</span>
                      </div>
                    </div>
                  </div>

                  {/* Report button */}
                  <div className="px-2 pb-1">
                    <button
                      onClick={() => setReportTarget({ id: home.id, type: "homestay", name: home.title || home.name })}
                      className="flex items-center gap-1 text-[10px] text-neutral-400 hover:text-red-500 bg-transparent border-0 cursor-pointer transition-colors"
                    >
                      <Flag size={10} />
                      Report a problem
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex pb-10 justify-center">
        <Button className="shadow-none font-medium rounded-full bg-[#EDEBE7] text-[#2A2A2A] hover:bg-[#e0deda] text-[13px] border border-solid border-[#D9D4CC] px-8 py-2.5">
          Load More Homestays
        </Button>
      </div>

      {/* Scam Report Modal */}
      {reportTarget && (
        <ScamReportModal
          targetId={reportTarget.id}
          targetType={reportTarget.type}
          targetName={reportTarget.name}
          onClose={() => setReportTarget(null)}
        />
      )}
    </div>
  );
}