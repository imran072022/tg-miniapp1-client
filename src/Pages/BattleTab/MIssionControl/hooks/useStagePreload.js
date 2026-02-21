import { useEffect, useState } from "react";
import { CAMPAIGN_DATA } from "../../../../config/CampaignConfig";

export const useStagePreload = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let loaded = 0;
    const total = CAMPAIGN_DATA.length;
    CAMPAIGN_DATA.forEach((stage) => {
      const img = new Image();
      const markLoaded = () => {
        loaded++;
        if (loaded === total) setReady(true);
      };
      img.onload = markLoaded;
      img.onerror = markLoaded; // ← important fallback
      img.src = stage.bg;
    });
  }, []);
  return ready;
};
