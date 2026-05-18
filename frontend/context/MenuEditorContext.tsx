"use client";

import { createContext, useContext, useState } from "react";

interface MenuEditorContextValue {
  isEditorOpen: boolean;
  setEditorOpen: (v: boolean) => void;
}

const MenuEditorContext = createContext<MenuEditorContextValue>({
  isEditorOpen: false,
  setEditorOpen: () => {},
});

export function MenuEditorProvider({ children }: { children: React.ReactNode }) {
  const [isEditorOpen, setEditorOpen] = useState(false);
  return (
    <MenuEditorContext.Provider value={{ isEditorOpen, setEditorOpen }}>
      {children}
    </MenuEditorContext.Provider>
  );
}

export function useMenuEditor() {
  return useContext(MenuEditorContext);
}
