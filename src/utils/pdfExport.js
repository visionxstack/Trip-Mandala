import { getLocalImage } from "./destinationImages";

export const exportStoryPDF = async (site, storyModeContent) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  // Colors
  const primaryColor = [181, 83, 42]; // #B5532A
  const textColor = [42, 42, 42];
  const lightText = [107, 107, 107];

  // Helper to add text and manage pagination
  const addText = (text, size, isBold = false, align = "left", color = textColor, customLineHeight = 6) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - margin - 15) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], align === "center" ? pageWidth / 2 : margin, y, { align });
      y += customLineHeight;
    }
  };

  // 1. Header (Logo/Title)
  addText("Trip Mandala", 24, true, "center", primaryColor, 10);
  y += 5;
  addText("Discover Nepal, Connect Locally, Travel Seamlessly", 10, false, "center", lightText, 15);
  
  doc.setDrawColor(232, 226, 216);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // 2. Cover Image (if available)
  const imageUrl = getLocalImage(site.name);
  if (imageUrl) {
    try {
      // Create an image element to get base64
      const img = new Image();
      img.src = imageUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (img.height * imgWidth) / img.width;
      
      if (y + imgHeight > pageHeight - margin - 20) {
        doc.addPage();
        y = margin;
      }
      
      doc.addImage(dataUrl, "JPEG", margin, y, imgWidth, imgHeight);
      y += imgHeight + 15;
    } catch (err) {
      console.warn("Failed to load image for PDF", err);
    }
  }

  // 3. Site Title and Info
  addText(site.name, 22, true, "left", textColor, 8);
  if (site.location) {
    addText(site.location, 12, false, "left", lightText, 10);
  }
  y += 5;

  // 4. Story Content
  if (storyModeContent) {
    const rawParagraphs = storyModeContent.split("\n").filter(p => p.trim().length > 0);
    rawParagraphs.forEach(p => {
      // Simple Markdown Bold parser for headings
      if (p.startsWith("**") && p.endsWith("**")) {
        y += 4;
        addText(p.replace(/\*\*/g, ""), 14, true, "left", primaryColor, 8);
      } else {
        addText(p, 11, false, "left", textColor, 6);
      }
      y += 2;
    });
  } else {
    // Fallback if no specific story mode content string is passed
    addText(site.historical_details || site.description || "", 11, false, "left", textColor, 6);
  }
  
  y += 10;

  // 5. Cultural Significance
  if (site.cultural_significance) {
    addText("Cultural Significance", 16, true, "left", primaryColor, 8);
    addText(site.cultural_significance, 11, false, "left", textColor, 6);
    y += 5;
  }

  // 6. Local Traditions
  if (site.local_traditions && site.local_traditions.length > 0) {
    addText("Local Traditions", 16, true, "left", primaryColor, 8);
    site.local_traditions.forEach(t => {
      addText(`• ${t}`, 11, false, "left", textColor, 6);
    });
    y += 5;
  }

  // 7. Footer
  const dateStr = new Date().toLocaleDateString();
  const footerText = `Generated on ${dateStr} by Trip Mandala`;
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // 8. Download
  const filename = `Story-${site.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
  doc.save(filename);
};

export const exportItineraryPDF = async (plan, tripParams) => {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = margin;

  const primaryColor = [181, 83, 42]; 
  const secondaryColor = [107, 122, 75]; // #6B7A4B
  const textColor = [42, 42, 42];
  const lightText = [107, 107, 107];

  const addText = (text, size, isBold = false, align = "left", color = textColor, customLineHeight = 6) => {
    doc.setFont("helvetica", isBold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    for (let i = 0; i < lines.length; i++) {
      if (y > pageHeight - margin - 15) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], align === "center" ? pageWidth / 2 : margin, y, { align });
      y += customLineHeight;
    }
  };

  // 1. Header
  addText("Trip Mandala", 24, true, "center", primaryColor, 10);
  y += 2;
  addText("Your Custom Travel Itinerary", 14, false, "center", secondaryColor, 15);
  
  doc.setDrawColor(232, 226, 216);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // 2. Trip Summary
  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  addText("Trip Summary", 18, true, "left", textColor, 8);
  
  const theme = tripParams?.travel_type || "Custom Adventure";
  const duration = tripParams?.duration || plan.itinerary?.length || "?";
  const budget = tripParams?.budget ? `USD ${tripParams.budget}` : "Flexible";
  
  addText(`Travel Theme: ${capitalize(theme)}`, 11, false, "left", textColor, 6);
  addText(`Duration: ${duration} Days`, 11, false, "left", textColor, 6);
  addText(`Budget Limit: ${budget}`, 11, false, "left", textColor, 10);
  
  y += 5;

  // 3. Day-by-Day Plan
  if (plan && plan.itinerary) {
    plan.itinerary.forEach((day, index) => {
      // Day Header
      y += 5;
      addText(`DAY ${day.day}: ${day.destination}`, 14, true, "left", primaryColor, 8);
      
      // Activities
      if (day.activities && day.activities.length > 0) {
        day.activities.forEach(act => {
          addText(`${act.time}: ${act.activity}`, 11, true, "left", textColor, 5);
          addText(act.description, 10, false, "left", lightText, 6);
          y += 2;
        });
      }

      // Accommodation & Travel
      y += 2;
      if (day.accommodation) {
        addText(`Accommodation: ${day.accommodation}`, 10, true, "left", secondaryColor, 5);
      }
      if (day.transportation) {
        addText(`Transportation: ${day.transportation}`, 10, false, "left", lightText, 5);
      }
      if (day.estimated_cost) {
        addText(`Estimated Cost: $${day.estimated_cost}`, 10, false, "left", lightText, 8);
      }
      y += 5;
      
      doc.setDrawColor(232, 226, 216);
      doc.setLineWidth(0.2);
      doc.line(margin, y, pageWidth - margin, y);
      y += 5;
    });
  } else {
    addText("Itinerary details unavailable.", 11, false, "left", textColor, 6);
  }

  // 4. Summary Stats
  if (plan && plan.summary) {
    if (y > pageHeight - margin - 40) {
      doc.addPage();
      y = margin;
    }
    addText("Summary", 16, true, "left", primaryColor, 8);
    addText(`Total Estimated Cost: $${plan.summary.total_estimated_cost_usd}`, 11, true, "left", textColor, 6);
    addText(`Pace: ${plan.summary.pace}`, 11, false, "left", textColor, 6);
  }

  // 5. Footer
  const dateStr = new Date().toLocaleDateString();
  const footerText = `Generated on ${dateStr} by Trip Mandala`;
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(footerText, pageWidth / 2, pageHeight - 10, { align: "center" });
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  // 6. Download
  const filename = `TripMandala-${capitalize(theme)}-Itinerary.pdf`;
  doc.save(filename);
};
