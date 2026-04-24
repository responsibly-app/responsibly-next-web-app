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

  const triggerFireworks = useCallback(() => {
    setVisible(true);
    setTimeout(() => setVisible(false), 5000);
  }, []);

  return (
    <FireworksContext.Provider value={{ triggerFireworks }}>
      {children}
      {visible && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <FireworksBackground transparent className="w-full h-full">
            <span />
          </FireworksBackground>
        </div>
      )}
    </FireworksContext.Provider>
  );
}
