import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CreditCard, Leaf, Lock, Mountain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "../services/api";
import { usePageTitle } from "../hooks/usePageTitle";
import { getLocationImage } from "../utils/imageBank";
import ImpactCard from "../components/ImpactCard";
import { TrustScoreCard } from "../components/TrustBadge";
import { resolveHomestayImage } from "../utils/homestayImages";





export default function Booking({ currentUser }) {
  usePageTitle("Checkout | Trip Mandala");
  const { id } = useParams();
  const navigate = useNavigate();

  const [homestay, setHomestay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Dates & booking details
  const [checkIn, setCheckIn] = useState("2026-11-14");
  const [checkOut, setCheckOut] = useState("2026-11-17");
  const [nights, setNights] = useState(3);

  // Form states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState(currentUser?.name || "Ananya Sharma");

  // Success Modal state
  const [successResponse, setSuccessResponse] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [impactData, setImpactData] = useState(null);
  const [trustScore, setTrustScore] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const data = await api.getHomestay(id);
        setHomestay(data);
        // Load trust score (non-blocking)
        api.getTrustScore("homestay", id).then(setTrustScore).catch(() => {});
      } catch (err) {
        console.error(err);
        setError("Homestay details could not be loaded.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Recalculate nights when dates change
  useEffect(() => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = Math.abs(d2.getTime() - d1.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 0) {
        setNights(diffDays);
      } else {
        setNights(1);
      }
    } catch (e) {
      setNights(1);
    }
  }, [checkIn, checkOut]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!homestay) return;

    if (!currentUser) {
      alert("Please login first to confirm your booking.");
      navigate("/auth");
      return;
    }

    setBookingLoading(true);
    try {
      const response = await api.createBooking({
        homestay_id: homestay.id,
        check_in: checkIn,
        check_out: checkOut,
        guests: 1
      });
      setSuccessResponse(response);
      // Calculate and show community impact (non-blocking)
      if (response?.id) {
        api.calculateImpact(response.id, homestay.id)
          .then((imp) => {
            // Adapt to ImpactCard shape
            setImpactData({
              families_supported: imp.families_supported || 1,
              women_led_supported: imp.women_led_supported || homestay.women_led,
              eco_friendly_stay: imp.eco_friendly_stay || homestay.eco_score >= 7,
              local_economy_contribution_npr: imp.local_economy_contribution || response.host_payout,
              cultural_sites_nearby: imp.cultural_sites_nearby || 0,
            });
          })
          .catch(() => {
            // Fallback impact from homestay data
            setImpactData({
              families_supported: 1,
              women_led_supported: homestay.women_led,
              eco_friendly_stay: homestay.eco_score >= 7,
              local_economy_contribution_npr: response.host_payout,
              cultural_sites_nearby: 0,
            });
          });
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || "Booking failed. Please try again.";
      alert(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 bg-[#FAF8F5] min-h-screen">
        <div className="w-10 h-10 border-4 border-dashed border-[#C26B4A] border-t-transparent animate-spin rounded-full" />
      </div>);

  }

  if (error || !homestay) {
    return (
      <div className="text-center py-20 text-red-500 bg-[#FAF8F5] min-h-screen">
        {error || "Homestay not found."}
      </div>);

  }

  // Fees calculation details
  const feePct = homestay.women_led ? 0.03 : 0.05;
  const rawBase = homestay.price_per_night * nights;
  const platformFee = round(rawBase * feePct, 2);
  const hostAmount = round(rawBase - platformFee, 2);
  const total = rawBase; // Service fee is included in total booking raw base for the checkout page display

  function round(val, decimals) {
    return Number(Math.round(Number(val + "e" + decimals)) + "e-" + decimals);
  }

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible relative">
      {/* Checkout Steps */}
      <div className="flex pt-8 pb-6 flex-col items-center max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="size-3 rounded-full bg-[#C26B4A]" />
            <span className="text-[#2B2B2B] text-[13px] font-medium">Your Details</span>
          </div>
          <div className="bg-[#C26B4A]/40 w-16 h-px" />
          <div className="flex items-center gap-2">
            <div className="size-3 ring-4 ring-[#C26B4A]/15 rounded-full bg-[#C26B4A]" />
            <span className="font-semibold text-[#2B2B2B] text-[13px]">{`Review & Confirm`}</span>
          </div>
        </div>
        <span className="uppercase text-[#8A8A8A] text-[11px] tracking-wider mt-2 font-semibold">
          Step 2 of 2
        </span>
      </div>

      {/* Main Checkout Panel */}
      <form onSubmit={handleBook} className="flex flex-col lg:flex-row px-12 pb-10 gap-6 max-w-6xl mx-auto">
        {/* Left Card: Summary */}
        <div className="w-full lg:w-[60%]">
          <div className="shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[14px] bg-white p-8 border border-neutral-100">
            <h2 className="font-medium text-[#2B2B2B] text-[22px] mb-6">
              Booking Summary
            </h2>
            <div className="border-b border-[#E8E4DD] border-solid flex pb-6 items-start gap-4">
              <img
                alt={homestay.name}
                className="object-cover rounded-lg w-20 h-20"
                src={resolveHomestayImage(homestay, 0, getLocationImage)}
                loading="lazy"
                onError={(e) => { e.target.src = getLocationImage(homestay.location, 0) || getLocationImage("Default", 0) }} />
              
              <div className="flex-1">
                <div className="font-bold text-[#2B2B2B] text-[17px]">
                  {homestay.name}
                </div>
                <div className="text-[#6B6B6B] text-[13px] mt-1 font-medium">
                  {homestay.location}
                </div>
                {homestay.women_led ?
                <div className="inline-flex font-semibold rounded-full bg-[#E8EDE0] text-[#5B6B47] text-[10px] mt-2 px-2.5 py-1 items-center gap-1 uppercase tracking-wider">
                    <Sparkles className="size-3" />
                    Women-Led (3% fee)
                  </div> :

                <div className="inline-flex font-semibold rounded-full bg-neutral-100 text-neutral-600 text-[10px] mt-2 px-2.5 py-1 items-center gap-1 uppercase tracking-wider">
                    Community Homestay
                  </div>
                }
              </div>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-2 border-b border-[#E8E4DD] border-solid py-6 gap-6">
              <div>
                <label className="uppercase text-[#7A8466] text-[10px] tracking-wider mb-2 block font-bold">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] text-[#2B2B2B] text-sm px-3 py-1.5 w-full bg-white h-10" />
                
                <div className="text-[#8A8A8A] text-xs mt-1">After 2:00 PM</div>
              </div>
              <div>
                <label className="uppercase text-[#7A8466] text-[10px] tracking-wider mb-2 block font-bold">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="rounded-md border border-[#E0DDD8] text-[#2B2B2B] text-sm px-3 py-1.5 w-full bg-white h-10" />
                
                <div className="text-[#8A8A8A] text-xs mt-1">Before 11:00 AM</div>
              </div>
            </div>

            {/* Pricing breakdown */}
            <div className="border-b border-[#E8E4DD] border-solid py-6">
              <div className="text-sm flex py-2 justify-between">
                <span className="text-[#6B6B6B] font-medium">Per Night</span>
                <span className="text-[#2B2B2B] font-semibold">NPR {homestay.price_per_night}</span>
              </div>
              <div className="text-sm border-t border-[#F0ECE5] border-solid flex py-2 justify-between">
                <span className="text-[#6B6B6B] font-medium">Nights</span>
                <span className="text-[#2B2B2B] font-semibold">{nights}</span>
              </div>
              <div className="text-sm border-t border-[#F0ECE5] border-solid flex py-2 justify-between">
                <span className="text-[#6B6B6B] font-medium">
                  Platform Fee ({homestay.women_led ? "3% Women-Led promo" : "5% standard"})
                </span>
                <span className="text-[#2B2B2B] font-semibold">NPR {platformFee}</span>
              </div>
              <div className="text-sm border-t border-[#F0ECE5] border-solid flex py-2 justify-between bg-green-50/50 p-2 rounded-md">
                <span className="text-[#5B6B47] font-semibold">Direct Host Payout (95% - 97%)</span>
                <span className="text-[#5B6B47] font-bold">NPR {hostAmount}</span>
              </div>
              <div className="border-t border-[#E0DDD8] border-solid flex mt-2 pt-4 justify-between">
                <span className="font-semibold text-[#2B2B2B] text-base">Total</span>
                <span className="font-bold text-[#2B2B2B] text-xl">NPR {total}</span>
              </div>
            </div>

            <div className="rounded-lg bg-[#F2EDE6] flex mt-6 p-4 items-start gap-3">
              <Leaf className="size-4 shrink-0 text-[#7A8466] mt-0.5" />
              <p className="leading-relaxed italic text-[#6B6B6B] text-[13px]">
                Your stay directly supports the local host family and environmental conservation efforts in {homestay.location}.
              </p>
            </div>

            {/* Trust Score */}
            {trustScore && (
              <div className="mt-4">
                <TrustScoreCard
                  score={trustScore.score}
                  badges={trustScore.badges || []}
                  entityType="homestay"
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Card: Payment */}
        <div className="w-full lg:w-[40%]">
          <div className="shadow-[0_2px_12px_rgba(0,0,0,0.04)] rounded-[14px] bg-white p-8 border border-neutral-100">
            <h2 className="font-medium text-[#2B2B2B] text-[22px] mb-6">
              Payment Method
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#7A8466] text-[10px] tracking-wider font-bold">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="rounded-md bg-white text-[#2B2B2B] text-sm border border-solid border-[#E0DDD8] pl-3 pr-10 w-full h-10"
                    placeholder="1234 5678 9012 3456" />
                  
                  <CreditCard className="size-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] absolute right-3" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase text-[#7A8466] text-[10px] tracking-wider font-bold">
                    Expiry
                  </label>
                  <input
                    type="text"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="rounded-md bg-white text-[#2B2B2B] text-sm border border-solid border-[#E0DDD8] px-3 w-full h-10"
                    placeholder="MM / YY" />
                  
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="uppercase text-[#7A8466] text-[10px] tracking-wider font-bold">
                    CVV
                  </label>
                  <input
                    type="password"
                    required
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    maxLength={4}
                    className="rounded-md bg-white text-[#2B2B2B] text-sm border border-solid border-[#E0DDD8] px-3 w-full h-10"
                    placeholder="•••" />
                  
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="uppercase text-[#7A8466] text-[10px] tracking-wider font-bold">
                  Name on Card
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="rounded-md bg-white text-[#2B2B2B] text-sm border border-solid border-[#E0DDD8] px-3 w-full h-10"
                  placeholder="Ananya Sharma" />
                
              </div>
            </div>

            <Button
              type="submit"
              disabled={bookingLoading}
              className="font-bold rounded-lg bg-[#C26B4A] hover:bg-[#a55233] text-white text-base mt-6 w-full h-12 border-0 cursor-pointer shadow-sm">
              
              {bookingLoading ? "Processing payment..." : "Confirm & Book"}
            </Button>
            <p className="text-center text-[#8A8A8A] text-xs mt-4">
              Free cancellation up to 48 hours before check-in.
            </p>
            <div className="border-t border-[#F0ECE5] border-solid flex mt-4 pt-4 justify-center items-center gap-2">
              <Lock className="size-3 text-[#8A8A8A]" />
              <span className="text-[#8A8A8A] text-[11px] font-medium">
                Secure 256-bit encrypted simulated gateway
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Success Payout Modal Dialog */}
      {successResponse &&
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative border border-neutral-100 flex flex-col gap-6 text-center transform scale-100 transition-all duration-300 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex justify-center items-center mx-auto mb-2">
              <Mountain className="size-8 animate-bounce text-green-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-[#2A2A2A]">Payment Successful!</h3>
            
            <p className="text-sm text-[#6B6B6B]">
              Your reservation is confirmed. A receipt has been generated under reference 
              <span className="font-semibold text-[#2a2a2a]"> #{(successResponse.id || "N/A").slice(0, 8).toUpperCase()}</span>.
            </p>
            
            <div className="bg-[#FAF8F5] border border-neutral-100 rounded-xl p-5 text-left flex flex-col gap-3">
              <div className="flex justify-between text-xs">
                <span className="text-[#6B6B6B] font-medium">Total Paid:</span>
                <span className="text-[#2A2A2A] font-bold">NPR {successResponse.total_amount}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#6B6B6B] font-medium">Platform Fee:</span>
                <span className="text-[#2A2A2A] font-bold">NPR {successResponse.platform_fee}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-neutral-200/60 pt-2">
                <span className="text-[#5B6B47] font-semibold">Direct Host Earning:</span>
                <span className="text-[#5B6B47] font-bold">NPR {successResponse.host_payout}</span>
              </div>
            </div>

            {/* Community Impact Card */}
            {impactData ? (
              <ImpactCard impact={impactData} compact={true} />
            ) : (
              <div className="bg-green-50 border border-green-200/50 rounded-xl p-4 text-xs italic text-[#5B6B47] leading-relaxed">
                Your stay directly supports the local host family and environmental conservation in {homestay.location}.
              </div>
            )}

            <div className="flex gap-3 justify-center mt-2 flex-wrap">
              <Button
              onClick={() => navigate("/")}
              className="bg-neutral-100 hover:bg-neutral-200 text-neutral-700 px-6 py-2 rounded-lg border-0 cursor-pointer">
              
                Back to Explore
              </Button>
              <Button
              onClick={() => navigate("/homestays")}
              className="bg-[#C26B4A] hover:bg-[#a55233] text-white px-6 py-2 rounded-lg border-0 cursor-pointer">
              
                Explore More Homestays
              </Button>
              {currentUser?.role === "host" && (
                <Button
                onClick={() => {
                  setSuccessResponse(null);
                  navigate("/host");
                }}
                className="bg-[#6B7A4B] hover:bg-[#58643f] text-white px-6 py-2 rounded-lg border-0 cursor-pointer">
                  Host Portal
                </Button>
              )}
              {currentUser?.role === "admin" && (
                <Button
                onClick={() => {
                  setSuccessResponse(null);
                  navigate("/admin");
                }}
                className="bg-[#6B7A4B] hover:bg-[#58643f] text-white px-6 py-2 rounded-lg border-0 cursor-pointer">
                  Admin Panel
                </Button>
              )}
            </div>
          </div>
        </div>
      }
    </div>);

}