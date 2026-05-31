import { apiClient } from "./apiClient";
import homestaysFallback from "../../dataseeds/homestays.json";
import destinationsFallback from "../../dataseeds/destinations.json";
import experiencesFallback from "../../dataseeds/experiences.json";

export const tripService = {
  generateTripPlan: async (data) => {
    try {
      return await apiClient.post("/ai/generate", data);
    } catch (err) {
      console.warn("API failed, falling back to smart local generation", err);
      const days = data.duration || 7;
      const type = data.travel_type || "cultural";
      
      // Phase 2: Filter datasets
      const categoryMap = {
        cultural: ["culture", "heritage", "festival", "local_life"],
        trekking: ["trekking", "mountains", "hiking", "adventure"],
        spiritual: ["spiritual", "meditation", "temples", "peaceful"],
        adventure: ["wildlife", "rafting", "extreme", "jungle"]
      };
      const targetTags = categoryMap[type] || categoryMap.cultural;
      
      let validDests = destinationsFallback.filter(d => 
        (d.categories || []).some(c => targetTags.includes(c))
      );
      // Randomize destinations to ensure rotation
      validDests = validDests.sort(() => 0.5 - Math.random());
      if (validDests.length === 0) validDests = destinationsFallback; // ultimate fallback

      // Phase 1: Dynamic Titles
      const titleTemplates = {
        cultural: ["Journey Through {Dest}'s Heritage", "Ancient Streets of {Dest}", "Living Traditions in {Dest}", "Hidden Gems of {Dest}"],
        trekking: ["Into the Heart of {Dest}", "Trails Above {Dest}", "Epic Trek in {Dest}", "Mountain Views at {Dest}"],
        spiritual: ["A Journey of Peace in {Dest}", "Sacred Serenity at {Dest}", "Mindful Paths Through {Dest}", "Reflections in {Dest}"],
        adventure: ["{Dest} Unleashed", "Wild Rivers of {Dest}", "Adrenaline in {Dest}", "Untamed Trails of {Dest}"]
      };

      const itinerary = [];
      const usedDests = new Set();
      let lastDest = null;
      let destIndex = 0;

      for (let i = 0; i < days; i++) {
        // Phase 3: Enforce destination uniqueness
        let currentDest = validDests[destIndex % validDests.length];
        
        // Try to find a completely unused destination first
        const unused = validDests.find(d => !usedDests.has(d.name));
        if (unused) {
          currentDest = unused;
          usedDests.add(currentDest.name);
        } else if (lastDest && currentDest.name === lastDest.name && validDests.length > 1) {
          // If we must reuse, at least try not to repeat the exact same one immediately
          destIndex++;
          currentDest = validDests[destIndex % validDests.length];
        }
        
        lastDest = currentDest;
        destIndex++;

        // Find matching experience
        let exps = experiencesFallback.filter(e => e.location === currentDest.name || e.location === currentDest.district);
        if (exps.length === 0) exps = experiencesFallback; // fallback
        const exp = exps[i % exps.length];

        // Find matching homestay (Phase 5)
        let matchingHomes = homestaysFallback.filter(h => h.location === currentDest.name || h.location === currentDest.district);
        if (matchingHomes.length === 0) matchingHomes = homestaysFallback;
        const home = matchingHomes[i % matchingHomes.length];

        // Dynamic Title
        const templates = titleTemplates[type] || titleTemplates.cultural;
        const titleRaw = templates[i % templates.length];
        const title = titleRaw.replace("{Dest}", currentDest.name);

        itinerary.push({
            day: `Day ${i + 1}`,
            title: title,
            description: exp.description || currentDest.description,
            icon: ["map-pin", "mountain", "car", "compass"][i % 4],
            duration: "Full Day",
            homestay_id: home.id
        });
      }
      
      return {
        destinations: Array.from(usedDests).slice(0, 4),
        estimated_cost: (data.budget || 500) * 0.8,
        itinerary: itinerary,
        recommended_homestays: homestaysFallback.slice(0, 3), // just samples
        cultural_highlights: ["Experience authentic local traditions", "Engage with host communities"],
        travel_tips: ["Pack according to regional weather", "Engage respectfully with locals"]
      };
    }
  }
};
