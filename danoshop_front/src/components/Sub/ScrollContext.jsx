import React, { createContext, useContext, useState } from "react";

const ScrollContext = createContext(undefined);

export function ScrollProvider({ children }) {
  const [selectedTab, setSelectedTab] = useState(1);

  return (
    <ScrollContext.Provider value={{ selectedTab, setSelectedTab }}>
      {children}
    </ScrollContext.Provider>
  );
}

export function useScroll() {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error("ScrollProvider와 함께 사용해야합니다.");
  }
  return context;
}
