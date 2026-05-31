import { useNavigate } from "react-router-dom";
import {
  ArrowRight,

  Calendar,


  MapPin,
  Quote,
  Search,
  Sparkles,
  Star } from

"lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { usePageTitle } from "../hooks/usePageTitle";
import { getLocationImage } from "../utils/imageBank";
import { destinationImageMap } from "../utils/destinationImages";
import AnimatedSection, { AnimatedItem } from "../components/ui/AnimatedSection";

// Local destination images — bundled by Vite at build time
const imgBhaktapur = destinationImageMap.bhaktapur;
const imgPokhara   = destinationImageMap.pokhara;
const imgBandipur  = destinationImageMap.bandipur;
const imgMustang   = destinationImageMap.mustang;






export default function Explore({ currentUser, onLogout }) {
  usePageTitle("Trip Mandala — Discover Nepal");
  const navigate = useNavigate();

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible">
      {/* Hero Section */}
      <section className="relative w-full h-120 overflow-hidden">
        <img
          alt="Himalayan foothills"
          className="object-cover absolute inset-0 w-full h-full"
          src="https://images.unsplash.com/photo-1580424917967-a8867a6e676e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3ODc2NDd8MHwxfHNlYXJjaHwxfHxIaW1hbGF5YW4lMjBtb3VudGFpbnMlMjBOZXBhbCUyMHZpbGxhZ2UlMjBzdW5yaXNlfGVufDF8MHx8fDE3ODAwMzQzMTB8MA&ixlib=rb-4.1.0&q=80&w=1600" />
        
        <div className="bg-gradient-to-t from-[#FAF8F5] via-[#FAF8F5]/40 to-transparent absolute inset-0" />
        <AnimatedSection delay={0.1} className="relative z-10 text-center flex px-12 pt-20 flex-col items-center">
          <span className="font-medium text-[#7A8C5E] text-xs tracking-[2px]">
            NEPAL · COMMUNITY · CULTURE
          </span>
          <h1 className="max-w-3xl font-light text-[#2C2C2C] text-5xl leading-[58px] mt-4">
            Discover Nepal. Stay Local. Travel Meaningfully.
          </h1>
          <p className="max-w-2xl text-[#6B6B6B] text-lg mt-4">
            Connect with local families, explore living heritage, and travel
            with purpose.
          </p>
        </AnimatedSection>
      </section>

      {/* Quick Search Planner Bar */}
      <AnimatedSection delay={0.3} className="relative z-20 -mt-12 px-12">
        <Card className="max-w-4xl shadow-lg rounded-xl border-neutral-200/40 border-0 border-solid mx-auto p-2 gap-0 bg-white">
          <CardContent className="flex p-0 items-center gap-0">
            <div className="flex px-6 py-3 items-center flex-1 gap-2 cursor-pointer" onClick={() => navigate("/homestays")}>
              <MapPin className="size-4 text-[#7A8C5E]" />
              <div className="flex flex-col">
                <span className="uppercase text-[#6B6B6B] text-[11px] tracking-wider">
                  Where
                </span>
                <span className="text-[#2C2C2C] text-sm font-medium">
                  Where in Nepal?
                </span>
              </div>
            </div>
            <div className="bg-neutral-200 w-px h-10" />
            <div className="flex px-6 py-3 items-center flex-1 gap-2 cursor-pointer" onClick={() => navigate("/plan")}>
              <Calendar className="size-4 text-[#7A8C5E]" />
              <div className="flex flex-col">
                <span className="uppercase text-[#6B6B6B] text-[11px] tracking-wider">
                  When
                </span>
                <span className="text-[#2C2C2C] text-sm font-medium">Add dates</span>
              </div>
            </div>
            <div className="bg-neutral-200 w-px h-10" />
            <div className="flex px-6 py-3 items-center flex-1 gap-2 cursor-pointer" onClick={() => navigate("/plan")}>
              <Sparkles className="size-4 text-[#7A8C5E]" />
              <div className="flex flex-col">
                <span className="uppercase text-[#6B6B6B] text-[11px] tracking-wider">
                  Style
                </span>
                <span className="text-[#2C2C2C] text-sm font-medium">Travel Style</span>
              </div>
            </div>
            <Button
              onClick={() => navigate("/plan")}
              className="font-medium rounded-lg bg-[#C4714A] hover:bg-[#b05d38] text-white text-sm px-6 gap-2 h-12">
              
              <Search className="size-4" />
              Plan My Trip
            </Button>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Featured Destinations */}
      <section className="px-12 pt-16 pb-10 max-w-6xl mx-auto">
        <AnimatedSection delay={0.4} className="flex mb-8 justify-between items-end">
          <div>
            <h2 className="font-medium text-[#2C2C2C] text-[28px]">
              Featured Destinations
            </h2>
            <p className="text-[#6B6B6B] text-sm mt-1">
              Handpicked places to begin your Nepal journey.
            </p>
          </div>
          <button
            onClick={() => navigate("/homestays")}
            className="text-[#C4714A] hover:text-[#b05d38] text-[13px] flex items-center gap-1 bg-transparent border-0 cursor-pointer">
            
            View all
            <ArrowRight className="size-3.5 icon-hover-bounce" />
          </button>
        </AnimatedSection>

        <AnimatedSection stagger={true} delay={0.5} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedItem>
            <Card
              onClick={() => navigate("/homestays?region=Bhaktapur")}
              className="card-lift shadow-sm rounded-xl border-neutral-200/40 border border-solid p-0 gap-0 overflow-hidden cursor-pointer bg-white">
              <div className="h-40 overflow-hidden">
                <img
                  alt="Bhaktapur"
                  className="object-cover w-full h-full"
                  src={imgBhaktapur} />
              </div>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2C2C2C] text-base">Bhaktapur</h3>
                  <span className="text-[#7A8C5E] text-[11px] flex items-center gap-1 font-medium">
                    <Star className="size-3 fill-[#7A8C5E] text-[#7A8C5E]" /> 4.9
                  </span>
                </div>
                <p className="leading-snug text-[#6B6B6B] text-[13px]">{`Living medieval city of Newari arts & temples.`}</p>
              </CardContent>
            </Card>
          </AnimatedItem>

          <AnimatedItem>
            <Card
              onClick={() => navigate("/homestays?region=Pokhara")}
              className="card-lift shadow-sm rounded-xl border-neutral-200/40 border border-solid p-0 gap-0 overflow-hidden cursor-pointer bg-white">
              <div className="h-40 overflow-hidden">
                <img
                  alt="Pokhara"
                  className="object-cover w-full h-full"
                  src={imgPokhara} />
              </div>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2C2C2C] text-base">Pokhara</h3>
                  <span className="text-[#7A8C5E] text-[11px] flex items-center gap-1 font-medium">
                    <Star className="size-3 fill-[#7A8C5E] text-[#7A8C5E]" /> 4.8
                  </span>
                </div>
                <p className="leading-snug text-[#6B6B6B] text-[13px]">Lakeside calm beneath the Annapurna skyline.</p>
              </CardContent>
            </Card>
          </AnimatedItem>

          <AnimatedItem>
            <Card
              onClick={() => navigate("/homestays?region=Bandipur")}
              className="card-lift shadow-sm rounded-xl border-neutral-200/40 border border-solid p-0 gap-0 overflow-hidden cursor-pointer bg-white">
              <div className="h-40 overflow-hidden">
                <img
                  alt="Bandipur"
                  className="object-cover w-full h-full"
                  src={imgBandipur} />
              </div>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2C2C2C] text-base">Bandipur</h3>
                  <span className="text-[#7A8C5E] text-[11px] flex items-center gap-1 font-medium">
                    <Star className="size-3 fill-[#7A8C5E] text-[#7A8C5E]" /> 4.9
                  </span>
                </div>
                <p className="leading-snug text-[#6B6B6B] text-[13px]">Hilltop village frozen in old-world charm.</p>
              </CardContent>
            </Card>
          </AnimatedItem>

          <AnimatedItem>
            <Card
              onClick={() => navigate("/homestays?region=Manang")}
              className="card-lift shadow-sm rounded-xl border-neutral-200/40 border border-solid p-0 gap-0 overflow-hidden cursor-pointer bg-white">
              <div className="h-40 overflow-hidden">
                <img
                  alt="Mustang"
                  className="object-cover w-full h-full"
                  src={imgMustang} />
              </div>
              <CardContent className="p-4 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-[#2C2C2C] text-base">Mustang</h3>
                  <span className="text-[#7A8C5E] text-[11px] flex items-center gap-1 font-medium">
                    <Star className="size-3 fill-[#7A8C5E] text-[#7A8C5E]" /> 4.9
                  </span>
                </div>
                <p className="leading-snug text-[#6B6B6B] text-[13px]">High desert kingdom beyond the Himalayas.</p>
              </CardContent>
            </Card>
          </AnimatedItem>
        </AnimatedSection>
      </section>

      {/* Quote Banner */}
      <section className="max-w-6xl mx-auto px-12 mb-12">
        <div className="rounded-xl bg-[#F2EDE6] flex px-10 py-8 justify-between items-center flex-col md:flex-row gap-6">
          <div className="flex items-start gap-4">
            <Quote className="size-6 shrink-0 text-[#C4714A] mt-1" />
            <div>
              <p className="leading-snug max-w-2xl italic font-light text-[#2C2C2C] text-xl">
                "Every home here holds a story older than the road that leads to
                it."
              </p>
              <span className="inline-block text-[#6B6B6B] text-xs mt-2">
                — Aarati, host in Bandipur
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate("/stories")}
            className="whitespace-nowrap text-[#C4714A] hover:text-[#b05d38] font-medium text-sm flex items-center gap-1 bg-transparent border-0 cursor-pointer">
            
            Read Stories
            <ArrowRight className="size-4 icon-hover-bounce" />
          </button>
        </div>
      </section>
    </div>);

}