export const loadFonts = async (fonts) => {
  for (const [font, weight] of Object.entries(fonts)) {
    const fontFace = new FontFace(font, `url(/${font}.ttf)`, {
      weight: weight.toString()
    });

    await fontFace.load();
    document.fonts.add(fontFace);
  }
};