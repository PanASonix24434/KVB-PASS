import React, { createContext, useContext } from 'react';

interface NavigationContextType {
  handleNavigation: (itemId: string) => void;
  navigationAction: string | null;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const useNavigation = () => {
  const ctx = useContext(NavigationContext);
  return ctx;
};

export const NavigationProvider: React.FC<{
  children: React.ReactNode;
  handleNavigation: (itemId: string) => void;
  navigationAction: string | null;
}> = ({ children, handleNavigation, navigationAction }) => (
  <NavigationContext.Provider value={{ handleNavigation, navigationAction }}>
    {children}
  </NavigationContext.Provider>
);
