import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Footer from "./Footer";
import ContactForm from "./ContactForm";
import FAQ from "./FAQ";
import Process from "./Process";
import { GreoButton } from "./GreoPage";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import WorkStats from "./WorkStats";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLoading } from "../context/LoadingProvider";

gsap.registerPlugin(ScrollTrigger);
const preloadTechStack = () => import("./TechStack");
const TechStack = lazy(preloadTechStack);

const checkIsDesktopView = () => {
  if (typeof window === "undefined") return true;
  const isPortrait = window.innerHeight > window.innerWidth;
  if (isPortrait && window.innerWidth <= 1050) return false;
  return window.innerWidth > 1024;
};

const MainContainer = ({ children }: PropsWithChildren) => {
  const { isLoading } = useLoading();
  const [isDesktopView, setIsDesktopView] = useState<boolean>(checkIsDesktopView);

  useEffect(() => {
    let timeoutId: number;
    const resizeHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsDesktopView(checkIsDesktopView());
      }, 150);
    };
    
    window.addEventListener("resize", resizeHandler);
    
    // Initialize Lenis for premium smooth scroll
    const lenis = new Lenis({
      duration: 1.35,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.8,
    });

    (window as any).__lenisInstance = lenis;
    (window as any).lenis = lenis;

    // Immediately stop Lenis if loader is still active
    if (isLoading) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    }

    lenis.on('scroll', ScrollTrigger.update);

    const rafCb = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCb);
    gsap.ticker.lagSmoothing(0);

    // Preload 3D TechStack chunk silently so entering from WorkStats never stutters
    const preloadTimer = window.setTimeout(() => {
      void preloadTechStack();
    }, 1200);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearTimeout(timeoutId);
      clearTimeout(preloadTimer);
      (window as any).__lenisInstance = null;
      (window as any).lenis = null;
      lenis.destroy();
      gsap.ticker.remove(rafCb);
    };
  }, []);

  // Ensure landing text container stays visible if switching into portrait view after scroll
  useEffect(() => {
    if (!isDesktopView) {
      gsap.set(".landing-container", { opacity: 1, y: 0, clearProps: "opacity,transform" });
    }
  }, [isDesktopView]);

  // Synchronize Lenis start/stop with loading state
  useEffect(() => {
    const lenis = (window as any).__lenisInstance || (window as any).lenis;
    if (!lenis) return;
    if (isLoading) {
      lenis.stop();
      lenis.scrollTo(0, { immediate: true });
    } else {
      lenis.scrollTo(0, { immediate: true });
      lenis.start();
    }
  }, [isLoading]);

  return (
    <div className="container-main">
      <Navbar />
      <GreoButton />
      <SocialIcons />
      {isDesktopView && children}
      <div className="container-main">
        <Landing>{!isDesktopView && children}</Landing>
        <About />
        <WhatIDo />
        <Career />
        <Work />
        <WorkStats />
        <div id="techstack" style={{ minHeight: "var(--vh, 100vh)", position: "relative", margin: 0, padding: 0 }}>
          <Suspense fallback={<div style={{ height: "var(--vh, 100vh)" }}>Loading...</div>}>
            <TechStack />
          </Suspense>
        </div>
        <Process />
        <FAQ />
        <ContactForm />
        <Footer />
      </div>
    </div>
  );
};

export default MainContainer;
