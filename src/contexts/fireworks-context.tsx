"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { FireworksBackground } from "@/components/ui-custom/fireworks";

const FireworksContext = createContext<{ triggerFireworks: () => void }>({
  triggerFireworks: () => {},
});

export function useFireworks() {
  return useContext(FireworksContext);
}

export function FireworksProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);

  const triggerFireworks = useCallback(() => {
    setVisible(true);
    setFading(false);
    setTimeout(() => setFading(true), 2500);
    setTimeout(() => { setVisible(false); setFading(false); }, 3000);
  }, []);

  return (
    <FireworksContext.Provider value={{ triggerFireworks }}>
      {children}
      {visible && (
        <div
          className="fixed inset-0 z-50 pointer-events-none transition-opacity duration-500"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <FireworksBackground className="w-full h-full">
            <span />
          </FireworksBackground>
        </div>
      )}
    </FireworksContext.Provider>
  );
}
