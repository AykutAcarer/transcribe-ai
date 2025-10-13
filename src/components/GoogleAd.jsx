import React, { useEffect, useRef } from "react";

const ensureAdSenseScript = (client) => {
  if (typeof window === "undefined") return null;

  const existing = document.querySelector(`script[data-google-ad-client="${client}"]`);
  if (existing) {
    return existing;
  }

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
  script.crossOrigin = "anonymous";
  script.setAttribute("data-google-ad-client", client);
  document.head.appendChild(script);
  return script;
};

const GoogleAd = ({
  client,
  slot,
  format = "auto",
  responsive = "true",
  style = "display:block",
  className = "",
}) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!client || !slot) return;

    const script = ensureAdSenseScript(client);

    const pushAd = () => {
      if (typeof window === "undefined") return;
      window.adsbygoogle = window.adsbygoogle || [];
      try {
        window.adsbygoogle.push({});
      } catch (error) {
        // Ignore repeated pushes while the script initialises
      }
    };

    if (containerRef.current) {
      containerRef.current.innerHTML = "";
      const ins = document.createElement("ins");
      ins.className = "adsbygoogle";
      ins.setAttribute("style", style);
      ins.setAttribute("data-ad-client", client);
      ins.setAttribute("data-ad-slot", slot);
      if (format) ins.setAttribute("data-ad-format", format);
      if (responsive) ins.setAttribute("data-full-width-responsive", responsive);
      containerRef.current.appendChild(ins);
    }

    if (script && !script.dataset.loaded) {
      script.addEventListener("load", () => {
        script.dataset.loaded = "true";
        pushAd();
      });
    } else {
      pushAd();
    }
  }, [client, slot, format, responsive, style]);

  return <div ref={containerRef} className={className} />;
};

export default GoogleAd;
