import React, { ReactNode, createContext, useContext, useState } from "react";

// Define the types for the context
interface LoadingContextType {
  loading: boolean;
  setLoading: (v: boolean) => void;
}

// Create the context with a default value (optional)
const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Create a provider component
interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({
  children,
}) => {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Custom hook to use the LoadingContext
export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
