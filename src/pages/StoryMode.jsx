import React, { useState, useEffect, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  MapPin,
  Play,
  Pause,
  RotateCcw,
  Share2,
  Volume2,
  Search,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Zap,
  Users,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { usePageTitle } from "../hooks/usePageTitle";
import { CurrencyDisplay } from "../utils/currency";
import { api } from "../services/api";
import { getLocationImage } from "../utils/imageBank";
import { getLocalImage } from "../utils/destinationImages";
import { getStoryAudio } from "../utils/storyAudioMap";
import { resolveHomestayImage } from "../utils/homestayImages";

// Lazy load the Panellum Viewer so it doesn't load globally
const PanellumViewer = React.lazy(() => import("../components/PanellumViewer"));

const STORY_MODES = [
  { key: "quick",  label: "Quick Explore", icon: Zap,   desc: "2-min overview" },
  { key: "deep",   label: "Deep Dive",     icon: Clock, desc: "10-min immersive" },
  { key: "family", label: "Family Mode",   icon: Users, desc: "Easy storytelling" },
];

export default function StoryMode() {
  usePageTitle("Heritage Stories | Trip Mandala");
  const navigate = useNavigate();
  
  const [sites, setSites] = useState([]);
  const [allSites, setAllSites] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSiteIndex, setSelectedSiteIndex] = useState(0);
  const [homestayMatch, setHomestayMatch] = useState(null);
  const [didYouMean, setDidYouMean] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loading, setLoading] = useState(true);

  // Story mode: quick | deep | family
  const [storyMode, setStoryMode] = useState("quick");
  // Feedback state
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  // Engagement tracking
  const engagementStart = useRef(Date.now());
  const sectionsViewed = useRef([]);

  // Visual toggle
  const [visualMode, setVisualMode] = useState("photo");
  const [vrConfig, setVrConfig] = useState(null);

  // Audio / Speech State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentParagraphIndex, setCurrentParagraphIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [paragraphs, setParagraphs] = useState([]);

  // NEW MP3 Audio State
  const audioRef = useRef(null);
  const [hasMp3, setHasMp3] = useState(false);
  const [currentMp3Url, setCurrentMp3Url] = useState(null);

  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const lottieRef = useRef(null);

  // Load Lottie
  useEffect(() => {
    if (!document.getElementById("dotlottie-script")) {
      const script = document.createElement("script");
      script.id = "dotlottie-script";
      script.src = "https://unpkg.com/@lottiefiles/dotlottie-wc@0.9.14/dist/dotlottie-wc.js";
      script.type = "module";
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    // Fetch data
    const loadData = async () => {
      try {
        const data = await api.getHeritageSites();
        
        // 1. PRIORITY ORDER: Make Pashupatinath Temple the default first story
        const pashupatiIndex = data.findIndex(s => 
          s.name.toLowerCase().includes("pashupati") || s.id === "pashupatinath"
        );
        
        if (pashupatiIndex > 0) {
          const pashupati = data.splice(pashupatiIndex, 1)[0];
          data.unshift(pashupati);
        }

        setAllSites(data);
        setSites(data);
        if (data.length > 0) {
          prepareSiteData(data[0]);
        }
      } catch (err) {
        console.error("Failed to load heritage sites", err);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();

    return () => {
      if (synthRef.current) synthRef.current.cancel();
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Sync character animation state with isPlaying
  useEffect(() => {
    try {
      if (lottieRef.current) {
        if (isPlaying) {
          if (typeof lottieRef.current.play === 'function') lottieRef.current.play();
        } else {
          if (typeof lottieRef.current.pause === 'function') lottieRef.current.pause();
        }
      }
    } catch (e) {
      console.warn("Failed to control Lottie animation:", e);
    }
  }, [isPlaying]);

  // Track engagement on site change / unmount
  useEffect(() => {
    return () => {
      const site = sites[selectedSiteIndex];
      if (!site) return;
      const elapsed = Math.round((Date.now() - engagementStart.current) / 1000);
      if (elapsed > 3) {
        api.trackHeritageEngagement({
          site_id: site.id,
          story_mode: storyMode,
          completion_pct: progress,
          audio_played: isPlaying || isPaused,
          sections_viewed: sectionsViewed.current,
          time_spent_seconds: elapsed,
        });
      }
    };
  }, [selectedSiteIndex, sites, storyMode, progress]);

  const prepareSiteData = async (site) => {
    if (!site) return;
    // Split story_text into paragraphs
    const paras = site.story_text ? site.story_text.split(/(?<=[.?!])\s+/).filter(p => p.length > 20) : [];
    const chunkedParas = [];
    for (let i = 0; i < paras.length; i += 2) {
      chunkedParas.push(paras.slice(i, i + 2).join(" "));
    }
    setParagraphs(chunkedParas.length > 0 ? chunkedParas : [site.story_text]);
    
    // Fetch matching homestay
    try {
      const allHomestays = await api.getHomestays();
      const match = allHomestays.find(h => h.district === site.district) || allHomestays[0];
      setHomestayMatch(match);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // Handle Search
    setDidYouMean(null);
    if (searchQuery.trim() === "") {
      setSites(allSites);
      setSuggestions([]);
    } else {
      const fuse = new Fuse(allSites, {
        keys: ["name", "aliases"],
        threshold: 0.3,
        distance: 100,
        ignoreLocation: true,
        useExtendedSearch: true
      });
      
      const result = fuse.search(searchQuery);
      if (result.length > 0) {
        setSites(result.map(r => r.item));
        setSuggestions(result.map(r => r.item).slice(0, 5));
      } else {
        setSites([]);
        setSuggestions([]);
        
        // 4. SEARCH BEHAVIOR: Auto-suggest correct match
        const looseFuse = new Fuse(allSites, {
          keys: ["name", "aliases"],
          threshold: 0.6,
          distance: 200,
          ignoreLocation: true
        });
        const looseResult = looseFuse.search(searchQuery);
        if (looseResult.length > 0) {
          const matchedName = looseResult[0].item.name;
          if (matchedName.toLowerCase().includes("pashupati")) {
             setDidYouMean("Pashupatinath Temple");
          } else {
             setDidYouMean(matchedName);
          }
        } else if (searchQuery.toLowerCase().includes("pasupati") || searchQuery.toLowerCase().includes("pashupati")) {
          setDidYouMean("Pashupatinath Temple");
        }
      }
    }
  }, [searchQuery, allSites]);

  // Sync index if site changes
  useEffect(() => {
    handleStopNarration();
    setIsTransitioning(true);
    if (sites.length > 0 && sites[selectedSiteIndex]) {
      const currentSite = sites[selectedSiteIndex];
      prepareSiteData(currentSite);
      
      const isPashupati = currentSite.name.toLowerCase().includes("pashupati") || currentSite.id === "pashupatinath";
      
      // 5. DEFAULT OPEN BEHAVIOR
      if (isPashupati) {
        setVisualMode("vr");
      } else {
        setVisualMode("photo");
      }

      // LOAD AUDIO URL
      const mp3Url = getStoryAudio(currentSite.name);
      
      if (mp3Url) {
        // VERIFY FILE EXISTS BEFORE FALLBACK
        fetch(mp3Url, { method: 'HEAD' })
          .then(res => {
            if (res.ok) {
              setHasMp3(true);
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
              }
              const audio = new Audio(mp3Url);
              audio.load();
              
              audio.addEventListener('timeupdate', () => {
                setProgress((audio.currentTime / audio.duration) * 100);
              });
              
              audio.addEventListener('ended', () => {
                setIsPlaying(false);
                setIsPaused(false);
                setProgress(0);
              });

              audioRef.current = audio;
              console.log("Audio Loaded: true");
            } else {
              console.error("MP3 failed: Response not 200 OK for", mp3Url);
              setHasMp3(false);
            }
          })
          .catch(err => {
            console.error("MP3 failed: Fetch error", err);
            setHasMp3(false);
          });
      } else {
        setHasMp3(false);
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
      }
    }
    const timer = setTimeout(() => setIsTransitioning(false), 500);
    return () => clearTimeout(timer);
  }, [selectedSiteIndex, sites]);

  // Lazy load VR config only when visualMode is vr
  useEffect(() => {
    if (visualMode === "vr" && !vrConfig) {
      Promise.all([
        import("../../Pashupati/tour.json"),
        import("../../Pashupati/1.jpg"),
        import("../../Pashupati/2.jpg"),
        import("../../Pashupati/3.jpg"),
        import("../../Pashupati/4.jpg"),
        import("../../Pashupati/5.jpg"),
        import("../../Pashupati/6.jpg")
      ]).then(([tourData, m1, m2, m3, m4, m5, m6]) => {
        const config = JSON.parse(JSON.stringify(tourData.default || tourData));
        if (config.scenes) {
          if (config.scenes["1"]) config.scenes["1"].panorama = m1.default;
          if (config.scenes["2"]) config.scenes["2"].panorama = m2.default;
          if (config.scenes["3"]) config.scenes["3"].panorama = m3.default;
          if (config.scenes["4"]) config.scenes["4"].panorama = m4.default;
          if (config.scenes["5"]) config.scenes["5"].panorama = m5.default;
          if (config.scenes["6"]) config.scenes["6"].panorama = m6.default;
        }
        setVrConfig(config);
      }).catch(err => console.error("Failed to load VR configuration", err));
    }
  }, [visualMode, vrConfig]);

  const handleStartNarration = () => {
    if (hasMp3 && audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsPaused(false);
        })
        .catch(error => {
          console.error("Audio playback blocked", error);
        });
      return;
    }

    if (!synthRef.current || paragraphs.length === 0) return;

    if (isPaused) {
      synthRef.current.resume();
      setIsPlaying(true);
      setIsPaused(false);
      return;
    }

    synthRef.current.cancel();
    speakParagraph(0);
  };

  const speakParagraph = (index) => {
    if (!synthRef.current || index >= paragraphs.length) {
      handleStopNarration();
      return;
    }

    setCurrentParagraphIndex(index);
    const pct = ((index + 1) / paragraphs.length) * 100;
    setProgress(pct);

    const utterance = new SpeechSynthesisUtterance(paragraphs[index]);
    utteranceRef.current = utterance;
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      if (isPlaying || !isPaused) {
        speakParagraph(index + 1);
      }
    };

    utterance.onerror = (e) => {
      console.error("Speech error", e);
      handleStopNarration();
    };

    setIsPlaying(true);
    setIsPaused(false);
    synthRef.current.speak(utterance);
  };

  const handlePauseNarration = () => {
    if (hasMp3 && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
      return;
    }

    if (synthRef.current && isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
      setIsPaused(true);
    }
  };

  const handleStopNarration = () => {
    if (hasMp3 && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentParagraphIndex(-1);
    setProgress(0);
  };

  const handleHeritageFeedback = async (helpful) => {
    const site = sites[selectedSiteIndex];
    if (!site || feedbackSent) return;
    try {
      await api.submitHeritageFeedback({ target_id: site.id, story_mode: storyMode, story_helped: helpful });
      setFeedbackSent(true);
    } catch {}
  };

  if (loading) {
    return <div className="flex justify-center items-center py-20 min-h-screen bg-[#FAF8F5]">
      <div className="w-10 h-10 border-4 border-dashed border-[#B5532A] border-t-transparent animate-spin rounded-full" />
    </div>;
  }

  const site = sites[selectedSiteIndex];
  const isPashupatiActive = site && (site.name.toLowerCase().includes("pashupati") || site.id === "pashupatinath");

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-[#FAF8F5] text-neutral-950 w-full h-fit min-h-screen overflow-visible flex flex-col">

      {/* Site Selector & Search */}
      <div className="bg-white border-b border-[#E8E2D8] border-solid py-4 px-6 md:px-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-[#B5532A]" />
          <span className="font-semibold text-lg text-[#2A2A2A]">Living Heritage</span>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto relative">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
            <input 
              type="text" 
              placeholder="Search by name or alias (e.g. Everest)" 
              value={searchQuery}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
                setSelectedSiteIndex(0);
              }}
              className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full text-xs outline-none focus:border-[#B5532A] transition-colors"
            />
          </div>
          
          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white border border-neutral-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              {suggestions.map((s, idx) => (
                <div 
                  key={s.id}
                  onClick={() => {
                    setSearchQuery(s.name);
                    setSelectedSiteIndex(idx);
                    setShowSuggestions(false);
                  }}
                  className="px-4 py-2 hover:bg-[#F2EDE6] cursor-pointer flex items-center gap-2 transition-colors"
                >
                  <MapPin className="size-3 text-[#B5532A]" />
                  <span className="text-sm text-neutral-800">{s.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Story Mode Selector */}
        <div className="flex items-center gap-1 bg-neutral-100 rounded-full p-1">
          {STORY_MODES.map((m) => {
            const Icon = m.icon;
            return (
              <button
                key={m.key}
                onClick={() => { setStoryMode(m.key); setFeedbackSent(false); }}
                title={m.desc}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold cursor-pointer border-0 transition-all ${
                  storyMode === m.key ? "bg-[#B5532A] text-white shadow-sm" : "bg-transparent text-neutral-500 hover:text-neutral-700"
                }`}
              >
                <Icon size={11} />{m.label}
              </button>
            );
          })}
        </div>
      </div>

      {site ? (
        <div className={`flex flex-col lg:flex-row w-full flex-1 transition-all duration-700 ease-out ${isTransitioning ? 'opacity-0 translate-y-4 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'}`}>
          {/* Left Side: Photo, Street View, or VR Mode */}
          <div className="w-full lg:w-[55%] h-100 lg:h-155 relative bg-black overflow-hidden flex flex-col">
            {visualMode === "vr" ? (
              <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading VR Experience...</div>}>
                {vrConfig && <PanellumViewer config={vrConfig} />}
              </Suspense>
            ) : visualMode === "photo" || !site.street_view_url ? (
              <>
                <img
                  alt={site.name}
                  className="object-cover w-full h-full opacity-80"
                  src={getLocalImage(site.name) || site.image_url || getLocationImage(site.location || site.district, selectedSiteIndex)}
                  onError={(e) => { e.target.src = getLocationImage("Default", selectedSiteIndex) }}
                />
                <div className="bg-[#140f0a]/60 absolute inset-0" />
              </>
            ) : (
              <iframe
                src={site.street_view_url}
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            )}

            {/* Top floating metadata */}
            <div className="absolute left-6 top-6 flex items-center gap-3 z-10">
              <div className="backdrop-blur-sm rounded-full bg-black/45 flex px-3.5 py-1.5 items-center gap-2 border border-white/10">
                <Volume2 className="size-3.5 text-white" />
                <span className="uppercase text-white text-[10px] font-bold tracking-widest">
                  Narrated History Mode
                </span>
              </div>
              
              {(site.street_view_url || isPashupatiActive) && (
                <div className="bg-white/95 rounded-lg p-0.5 shadow-sm flex items-center gap-1">
                  <button
                    onClick={() => setVisualMode("photo")}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors border-0 ${
                      visualMode === "photo" ? "bg-[#B5532A] text-white" : "bg-transparent text-[#6B6B6B]"
                    }`}
                  >
                    Photo
                  </button>
                  {isPashupatiActive ? (
                    <button
                      onClick={() => setVisualMode("vr")}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors border-0 ${
                        visualMode === "vr" ? "bg-[#B5532A] text-white" : "bg-transparent text-[#6B6B6B]"
                      }`}
                    >
                      360° VR Tour
                    </button>
                  ) : (
                    <button
                      onClick={() => setVisualMode("streetview")}
                      className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md cursor-pointer transition-colors border-0 ${
                        visualMode === "streetview" ? "bg-[#B5532A] text-white" : "bg-transparent text-[#6B6B6B]"
                      }`}
                    >
                      360° Street View
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Overlay Info (only visible if not in VR to keep VR clean) */}
            {visualMode !== "vr" && (
              <div className="absolute inset-x-0 bottom-0 p-10 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none">
                <div className="flex mb-2 items-center gap-2">
                  <MapPin className="size-3.5 text-[#C4714A]" />
                  <span className="uppercase text-white text-xs font-semibold tracking-[1.5px]">
                    {site.location}
                  </span>
                </div>
                <h2 className="text-white text-3xl font-light mb-1">{site.name}</h2>
                <p className="text-white/70 text-sm max-w-md line-clamp-3">
                  {site.cultural_significance}
                </p>
              </div>
            )}
          </div>

          {/* Right Side: Narration Transcript */}
          <div className="w-full lg:w-[45%] bg-white flex p-10 flex-col h-fit lg:h-155 overflow-hidden border-l border-neutral-100">
            <div className="flex mb-4 justify-between items-center shrink-0">
              <span className="font-semibold uppercase text-[#7A7A4A] text-[11px] tracking-[2px]">
                {site.category || "LIVING HERITAGE"}
              </span>
              <div className="text-[#9A9A9A] flex items-center gap-3">
                <button 
                  onClick={async () => {
                    const { exportStoryPDF } = await import("../utils/pdfExport");
                    exportStoryPDF(site, paragraphs.join("\n\n"));
                  }}
                  title="Download Story PDF"
                  className="cursor-pointer hover:text-[#B5532A] transition-colors bg-transparent border-none p-0 flex items-center gap-1.5"
                >
                  <span className="text-[14px]">📄</span> 
                  <span className="text-[11px] font-bold uppercase tracking-wider hidden sm:inline">Download Story PDF</span>
                </button>
                <div className="w-px h-4 bg-neutral-200 mx-1"></div>
                <Bookmark className="size-4 cursor-pointer hover:text-[#2A2A2A]" />
                <Share2 className="size-4 cursor-pointer hover:text-[#2A2A2A]" />
              </div>
            </div>

            <h1 className="font-light text-[#2A2A2A] text-[30px] leading-[38px] tracking-tight mb-2 shrink-0">
              {site.story_title || site.name}
            </h1>
            <p className="italic text-[#8A8A8A] text-[13px] mb-4 shrink-0">
              Voice narration enabled. Put on your headphones.
            </p>

            {/* Inner Flex Row to hold Transcript and Character */}
            <div className="flex flex-1 overflow-hidden flex-col md:flex-row gap-4">
              
              {/* Transcript Column */}
              <div className="flex-1 overflow-y-auto text-[#3A3A3A] text-sm leading-[26px] flex pr-2 flex-col gap-4">
                {paragraphs.map((para, idx) => (
                  <div key={idx}>
                    <p
                      className={`transition-colors duration-300 p-2 rounded-lg ${
                        (!hasMp3 && currentParagraphIndex === idx)
                          ? "bg-[#F2EDE6] text-[#2A2A2A] font-medium border-l-2 border-l-[#B5532A]"
                          : "text-[#5A5A5A]"
                      }`}
                    >
                      {para}
                    </p>
                    {idx < paragraphs.length - 1 && <Separator className="bg-[#EFEAE0] mt-3" />}
                  </div>
                ))}
              </div>

              {/* Character Column */}
              <div className="w-full md:w-[150px] shrink-0 flex items-center justify-center flex-col gap-2">
                <div 
                  className={`transition-all duration-500 ease-in-out rounded-full ${
                    isPlaying 
                    ? "scale-105 shadow-[0_0_25px_rgba(181,83,42,0.3)] ring-4 ring-[#B5532A]/20" 
                    : "scale-100 shadow-none ring-0"
                  }`}
                >
                  <dotlottie-wc
                    ref={lottieRef}
                    src="https://lottie.host/17dff78f-3eb6-4565-9135-14e22cbc01a3/CS5B73meWR.lottie"
                    style={{ width: "150px", height: "150px" }}
                    loop
                  ></dotlottie-wc>
                </div>
                {isPlaying && (
                  <div className="text-[10px] text-[#B5532A] uppercase font-bold tracking-wider animate-pulse mt-2">
                    Speaking
                  </div>
                )}
              </div>
            </div>

            {/* Warning if no MP3 */}
            {!hasMp3 && (
               <div className="text-[10px] text-amber-600 bg-amber-50 px-2 py-1 rounded-md mb-2 flex items-center gap-1 w-fit shrink-0 mt-2">
                 <AlertCircle className="size-3" />
                 Narration unavailable for this story. Using synthesized voice fallback.
               </div>
            )}

            {/* Narration Player Controls */}
            <div className="bg-[#FAF8F5] border border-neutral-100 rounded-xl p-4 mt-2 shrink-0 flex flex-col gap-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {isPlaying ? (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handlePauseNarration(); }}
                      className="w-10 h-10 rounded-full bg-[#B5532A] hover:bg-[#a0441f] text-white flex justify-center items-center cursor-pointer border-0 shadow-sm transition-transform hover:scale-105"
                    >
                      <Pause className="size-4 fill-white text-white" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStartNarration(); }}
                      className="w-10 h-10 rounded-full bg-[#B5532A] hover:bg-[#a0441f] text-white flex justify-center items-center cursor-pointer border-0 shadow-sm transition-transform hover:scale-105"
                    >
                      <Play className="size-4 fill-white text-white ml-0.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleStopNarration(); }}
                    className="w-8 h-8 rounded-full bg-white hover:bg-neutral-100 text-[#6B6B6B] flex justify-center items-center cursor-pointer border border-neutral-200 shadow-sm"
                  >
                    <RotateCcw className="size-3.5" />
                  </button>

                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-[#2A2A2A] uppercase">
                      {isPlaying ? "Narration Playing" : isPaused ? "Narration Paused" : "Narration Stopped"}
                    </span>
                    <span className="text-[10px] text-[#8A8A8A]">
                      {hasMp3 ? "Pre-recorded Audio" : "Voice Playback Synthesis"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 flex-1 ml-4 hidden sm:flex">
                  <span className="text-[10px] font-mono text-neutral-400">
                    {hasMp3 && audioRef.current ? formatTime(audioRef.current.currentTime) : "0:00"}
                  </span>
                  <div className="flex-1 bg-[#E8E2D6] rounded-full h-1 overflow-hidden relative">
                    <div
                      className="bg-[#B5532A] h-full transition-all duration-300 absolute left-0 top-0 bottom-0"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">
                    {hasMp3 && audioRef.current?.duration ? formatTime(audioRef.current.duration) : "0:00"}
                  </span>
                </div>
              </div>
            </div>

            {/* Heritage Feedback Prompt */}
            {showFeedback && !feedbackSent && (
              <div className="bg-[#F2EDE6] rounded-xl p-4 mt-4 shrink-0 border border-[#E8E0D2]">
                <p className="text-xs font-semibold text-[#2A2A2A] mb-3">Did this story help you understand the heritage site?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleHeritageFeedback(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-green-100 text-green-800 hover:bg-green-200 rounded-lg border-0 cursor-pointer transition-colors"
                  >
                    <ThumbsUp size={12} /> Yes, it helped!
                  </button>
                  <button
                    onClick={() => handleHeritageFeedback(false)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 rounded-lg border-0 cursor-pointer transition-colors"
                  >
                    <ThumbsDown size={12} /> Not really
                  </button>
                </div>
              </div>
            )}
            {feedbackSent && (
              <div className="bg-green-50 rounded-xl p-3 mt-4 shrink-0 text-xs text-green-700 font-medium border border-green-100">
                ✓ Thank you for your feedback!
              </div>
            )}

            {/* Recommendations Card at bottom */}
            {homestayMatch && (
              <Card className="rounded-[10px] bg-[#F2EDE6] border-0 mt-4 p-4 shrink-0">
                <CardContent className="flex p-0 items-center gap-4">
                  <img
                    alt={homestayMatch.title}
                    className="object-cover flex-shrink-0 rounded-lg w-14 h-14"
                    src={resolveHomestayImage(homestayMatch, 0, getLocationImage)}
                    onError={(e) => { e.target.src = getLocationImage(homestayMatch.location || homestayMatch.district, 0) || getLocationImage("Default", 0) }}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="uppercase text-[#7A7A4A] text-[9px] font-semibold tracking-[1.5px] mb-0.5">
                      Continue the Story
                    </div>
                    <div className="font-semibold text-[#2A2A2A] text-sm truncate">
                      {homestayMatch.title}
                    </div>
                    <div className="text-[#7A7A7A] text-xs">
                      <CurrencyDisplay nprAmount={homestayMatch.price_per_night || homestayMatch.price} compact />
                    </div>
                  </div>
                  <Button
                    onClick={() => navigate(`/checkout/${homestayMatch.id}`)}
                    className="rounded-full bg-[#B5532A] hover:bg-[#a0441f] text-white text-[11px] px-3.5 h-8 border-0 shrink-0"
                  >
                    Book Stay
                    <ArrowRight className="size-3 ml-1" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex justify-center items-center flex-col text-neutral-500 py-20 bg-white shadow-inner">
          <BookOpen className="size-16 mb-4 text-neutral-300 animate-pulse" />
          <p className="text-lg">No heritage sites found matching your search.</p>
          {didYouMean && (
            <p className="mt-4 text-[#B5532A] font-medium cursor-pointer hover:underline animate-in fade-in slide-in-from-bottom-2" onClick={() => {
              setSearchQuery(didYouMean);
              
              // Try to find the exact match from allSites to instantly load it
              const exactMatchIndex = allSites.findIndex(s => s.name.toLowerCase() === didYouMean.toLowerCase());
              if (exactMatchIndex !== -1) {
                setSites([allSites[exactMatchIndex]]);
                setSelectedSiteIndex(0);
                setDidYouMean(null);
              }
            }}>
              Did you mean <span className="font-bold">{didYouMean}</span>?
            </p>
          )}
        </div>
      )}

      {/* Narrative Sites Grid list below */}
      <div className="bg-[#FAF8F5] border-t border-[#E8E2D8] border-solid px-6 md:px-12 py-8 w-full">
        <div className="flex mb-6 justify-between items-end max-w-6xl mx-auto">
          <div>
            <div className="uppercase text-[#7A7A4A] text-[11px] tracking-[2px] mb-1 font-semibold">
              Heritage Experiences
            </div>
            <h2 className="font-light text-[#2A2A2A] text-[22px]">
              More Stories from the Mandala
            </h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {sites.map((s, idx) => (
            <div
              key={s.id}
              onClick={() => {
                setSelectedSiteIndex(idx);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex flex-col gap-3 cursor-pointer group"
            >
              <div className="relative rounded-lg h-36 overflow-hidden bg-black">
                <img
                  alt={s.name}
                  className="object-cover w-full h-full opacity-80 group-hover:scale-105 transition-transform duration-500"
                  src={getLocalImage(s.name) || s.image_url || getLocationImage(s.location || s.district, idx)}
                  onError={(e) => { e.target.src = getLocationImage("Default", idx) }}
                />
              </div>
              <div>
                <div className="leading-snug font-medium text-[#2A2A2A] text-[14px] group-hover:text-[#B5532A] transition-colors line-clamp-1">
                  {s.name}
                </div>
                <div className="uppercase text-[#7A7A4A] text-[10px] tracking-[1.5px] flex mt-1 items-center gap-1 font-medium truncate">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{s.district}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}