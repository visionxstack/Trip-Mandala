import React, { useEffect, useRef } from "react";

export default function PanellumViewer({ config }) {
  const viewerRef = useRef(null);
  const pannellumInstance = useRef(null);

  useEffect(() => {
    // Load CSS
    let link = document.querySelector('link[href="https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.css";
      document.head.appendChild(link);
    }

    // Load Script
    const initViewer = () => {
      if (window.pannellum && viewerRef.current) {
        // clean up previous instance
        if (pannellumInstance.current) {
          try { pannellumInstance.current.destroy(); } catch(e) {}
        }
        pannellumInstance.current = window.pannellum.viewer(viewerRef.current, config);
      }
    };

    let script = document.querySelector('script[src="https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.js"]');
    if (!script) {
      script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/pannellum/build/pannellum.js";
      script.async = true;
      script.onload = initViewer;
      document.body.appendChild(script);
    } else {
      if (window.pannellum) {
        initViewer();
      } else {
        script.addEventListener("load", initViewer);
      }
    }

    return () => {
      if (pannellumInstance.current) {
        try { pannellumInstance.current.destroy(); } catch(e) {}
      }
      if (script && !window.pannellum) {
        script.removeEventListener("load", initViewer);
      }
    };
  }, [config]);

  return <div ref={viewerRef} className="w-full h-full" />;
}
