import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Loading from "../components/Loading";

interface LoadingType {
  isLoading: boolean;
  setIsLoading: (state: boolean) => void;
  setLoading: (percent: number) => void;
}

export const LoadingContext = createContext<LoadingType | null>(null);

export const LoadingProvider = ({ children }: PropsWithChildren) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(0);
  const hasRealProgress = useRef(false);

  // Intercept setLoading to detect when 3D scene starts real progress
  const setLoadingIntercepted = useCallback((value: number) => {
    if (value > 0) hasRealProgress.current = true;
    setLoading(value);
  }, []);

  useEffect(() => {
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let pct = 0;

    // After 1.5s, if 3D scene hasn't loaded (mobile / slow connection),
    // auto-advance the progress bar so the user isn't stuck at 0%
    const kickstarter = setTimeout(() => {
      if (!hasRealProgress.current) {
        fallbackInterval = setInterval(() => {
          pct = Math.min(pct + Math.round(Math.random() * 5 + 2), 90);
          setLoading(pct);
          if (pct >= 90 && fallbackInterval) {
            clearInterval(fallbackInterval);
            fallbackInterval = null;
          }
        }, 80);
      }
    }, 1500);

    // Hard cap: force-complete loading after 10 seconds max
    // This triggers the normal exit animation in Loading.tsx
    const forceComplete = setTimeout(() => {
      setLoading(100);
    }, 10000);

    return () => {
      clearTimeout(kickstarter);
      clearTimeout(forceComplete);
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, []);

  const value = {
    isLoading,
    setIsLoading,
    setLoading: setLoadingIntercepted,
  };

  return (
    <LoadingContext.Provider value={value as LoadingType}>
      {isLoading && <Loading percent={loading} />}
      <main className="main-body">{children}</main>
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};
