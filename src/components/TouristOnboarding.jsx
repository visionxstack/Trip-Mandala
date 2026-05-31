import { useState } from "react";
import { Globe, Mountain, Church, Leaf, Zap, Users, HelpCircle, Tv, Youtube, BookOpen, Compass, Share2, ChevronRight, CheckCircle2, Sparkles } from "lucide-react";
import { apiClient } from "../services/apiClient";

const STEPS = [
  {
    id: "country",
    question: "Which country are you from?",
    type: "text",
    placeholder: "e.g. United States, Germany, India...",
    icon: Globe,
  },
  {
    id: "visited_nepal_before",
    question: "Have you visited Nepal before?",
    type: "choice",
    options: [
      { label: "Yes, I have!", value: true },
      { label: "No, first time!", value: false },
    ],
    icon: Compass,
  },
  {
    id: "interest",
    question: "What interests you most about Nepal?",
    type: "choice",
    options: [
      { label: "Mountains & Trekking", value: "Mountains & Trekking", icon: Mountain },
      { label: "Culture & Heritage", value: "Culture & Heritage", icon: Church },
      { label: "Spiritual Tourism", value: "Spiritual Tourism", icon: Sparkles },
      { label: "Wildlife", value: "Wildlife", icon: Leaf },
      { label: "Adventure Sports", value: "Adventure Sports", icon: Zap },
      { label: "Local Communities", value: "Local Communities", icon: Users },
    ],
    icon: Mountain,
  },
  {
    id: "source_of_discovery",
    question: "Where did you first hear about Nepal?",
    type: "choice",
    options: [
      { label: "Social Media", value: "Social Media", icon: Share2 },
      { label: "Friends & Family", value: "Friends & Family", icon: Users },
      { label: "Travel Blogs", value: "Travel Blogs", icon: BookOpen },
      { label: "YouTube", value: "YouTube", icon: Youtube },
      { label: "News / TV", value: "News / TV", icon: Tv },
      { label: "Travel Agency", value: "Travel Agency", icon: Compass },
    ],
    icon: Share2,
  },
  {
    id: "visit_purpose",
    question: "What is the primary purpose of your visit?",
    type: "choice",
    options: [
      { label: "Leisure / Holiday", value: "Leisure / Holiday" },
      { label: "Trekking / Adventure", value: "Trekking / Adventure" },
      { label: "Pilgrimage", value: "Pilgrimage" },
      { label: "Research / Study", value: "Research / Study" },
      { label: "Volunteer Work", value: "Volunteer Work" },
      { label: "Business", value: "Business" },
    ],
    icon: HelpCircle,
  },
];

export default function TouristOnboarding({ onComplete, onSkip }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleAnswer = (value) => {
    const updated = { ...answers, [current.id]: value };
    setAnswers(updated);

    // Auto-advance for choice questions
    if (current.type === "choice") {
      if (step < STEPS.length - 1) {
        setTimeout(() => setStep(step + 1), 280);
      } else {
        handleSubmit(updated);
      }
    }
  };

  const handleTextNext = () => {
    if (!answers[current.id]?.trim()) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleSubmit(answers);
    }
  };

  const handleSubmit = async (finalAnswers) => {
    setSubmitting(true);
    try {
      await apiClient.post("/profiles/onboarding", finalAnswers);
    } catch (e) {
      // Silently ignore – insights are non-critical
    } finally {
      setSubmitting(false);
      onComplete(finalAnswers);
    }
  };

  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#C26B4A] to-[#9e4e2e] px-8 pt-8 pb-6 relative overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full" />
          <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-white/5 rounded-full" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="size-4 text-white/80" />
              <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Tourism Insights</span>
            </div>
            <h2 className="text-white text-2xl font-light tracking-tight">Help us personalize your Nepal journey</h2>
            <p className="text-white/70 text-sm mt-1">Step {step + 1} of {STEPS.length}</p>
          </div>
          {/* Progress bar */}
          <div className="relative mt-5 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${progress + (100 / STEPS.length)}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="px-8 py-7">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#C26B4A]/10 flex items-center justify-center flex-shrink-0">
              <StepIcon className="size-5 text-[#C26B4A]" />
            </div>
            <h3 className="text-[#2A2A2A] text-lg font-medium leading-snug">{current.question}</h3>
          </div>

          {/* Text input */}
          {current.type === "text" && (
            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={answers[current.id] || ""}
                onChange={(e) => setAnswers({ ...answers, [current.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleTextNext()}
                placeholder={current.placeholder}
                autoFocus
                className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none focus:border-[#C26B4A] focus:ring-2 focus:ring-[#C26B4A]/10 transition-all"
              />
              <button
                onClick={handleTextNext}
                disabled={!answers[current.id]?.trim()}
                className="self-end flex items-center gap-2 bg-[#C26B4A] hover:bg-[#a55233] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer border-0"
              >
                Next <ChevronRight className="size-4" />
              </button>
            </div>
          )}

          {/* Choice grid */}
          {current.type === "choice" && (
            <div className={`grid gap-2 ${current.options.length > 4 ? "grid-cols-2" : "grid-cols-1"}`}>
              {current.options.map((opt) => {
                const selected = answers[current.id] === opt.value;
                const OptIcon = opt.icon;
                return (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleAnswer(opt.value)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      selected
                        ? "border-[#C26B4A] bg-[#C26B4A]/8 text-[#C26B4A]"
                        : "border-neutral-100 bg-neutral-50 text-neutral-700 hover:border-[#C26B4A]/40 hover:bg-[#C26B4A]/4"
                    }`}
                  >
                    {OptIcon && <OptIcon className="size-4 flex-shrink-0" />}
                    <span className="text-sm font-medium">{opt.label}</span>
                    {selected && <CheckCircle2 className="size-4 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex justify-between items-center">
          <button
            onClick={onSkip}
            className="text-xs text-neutral-400 hover:text-neutral-600 bg-transparent border-0 cursor-pointer underline"
          >
            Skip for now
          </button>
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs text-neutral-500 hover:text-neutral-800 bg-transparent border-0 cursor-pointer font-medium"
            >
              ← Back
            </button>
          )}
        </div>

        {submitting && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm flex items-center justify-center rounded-3xl">
            <div className="w-8 h-8 border-4 border-[#C26B4A] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
