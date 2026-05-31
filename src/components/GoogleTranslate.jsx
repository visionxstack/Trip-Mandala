import React, { useEffect, useState, useRef } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LANGUAGES = [
  { code: "en", name: "English", native: "English" },
  { code: "ne", name: "Nepali", native: "नेपाली" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "fr", name: "French", native: "Français" },
];

const GoogleTranslate = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(() => {
    return localStorage.getItem("tm_lang") || "en";
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    const initWidget = () => {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        // Clear the element first to prevent duplicates on remount
        const el = document.getElementById("google_translate_element");
        if (el) el.innerHTML = "";
        
        new window.google.translate.TranslateElement(
          {
            pageLanguage: "en",
            includedLanguages: "en,ne,hi,de,fr",
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          "google_translate_element"
        );
      }
    };

    // Define the callback globally
    window.googleTranslateElementInit = initWidget;

    // Check if script is already added
    const scriptId = "google-translate-script";
    const existingScript = document.getElementById(scriptId);
    
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    } else {
      // Script already exists (React remount), initialize directly
      initWidget();
    }
    
    // Apply saved language once widget is loaded
    let attempts = 0;
    const applySavedLang = setInterval(() => {
      const selectField = document.querySelector(".goog-te-combo");
      if (selectField) {
        clearInterval(applySavedLang);
        const savedLang = localStorage.getItem("tm_lang") || "en";
        if (savedLang !== "en" && selectField.value !== savedLang) {
          selectField.value = savedLang;
          selectField.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      if (attempts++ > 40) clearInterval(applySavedLang); // timeout after 10s
    }, 250);

    return () => clearInterval(applySavedLang);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (langCode) => {
    setSelectedLang(langCode);
    localStorage.setItem("tm_lang", langCode);
    setIsOpen(false);
    
    // Set cookies for Google Translate directly
    const cookieString = langCode === "en" ? "/auto/en" : `/en/${langCode}`;
    document.cookie = `googtrans=${cookieString}; path=/`;
    document.cookie = `googtrans=${cookieString}; domain=${window.location.hostname}; path=/`;
    
    const selectField = document.querySelector(".goog-te-combo");
    if (selectField) {
      selectField.value = langCode;
      selectField.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      // Fallback: If widget failed to load, a reload will force it to read the cookie we just set
      window.location.reload();
    }
  };

  const selectedLanguage = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Hidden original widget - don't use 'hidden' class to ensure script initializes */}
      <div 
        id="google_translate_element" 
        className="opacity-0 absolute pointer-events-none -z-10 w-0 h-0 overflow-hidden"
      ></div>
      
      {/* Custom Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors border-0 cursor-pointer text-sm font-medium"
        title="Translate Website"
      >
        <Globe className="size-4 text-[#C4714A]" />
        <span className="hidden sm:inline">{selectedLanguage.native}</span>
        <ChevronDown className={`size-3.5 transition-transform duration-200 text-neutral-500 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Custom Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white border border-neutral-200 shadow-xl rounded-xl overflow-hidden z-50 py-1"
          >
            <div className="px-3 py-2 border-b border-neutral-100 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Translate To</span>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2 text-sm cursor-pointer border-0 bg-transparent transition-colors ${
                  selectedLang === lang.code ? "text-[#C4714A] bg-orange-50/50" : "text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <div className="flex flex-col items-start">
                  <span className={`font-medium ${selectedLang === lang.code ? "text-[#C4714A]" : ""}`}>{lang.native}</span>
                  <span className="text-[10px] text-neutral-400 font-normal">{lang.name}</span>
                </div>
                {selectedLang === lang.code && <Check className="size-4 text-[#C4714A]" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GoogleTranslate;
