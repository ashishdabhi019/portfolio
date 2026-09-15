import { lazy, PropsWithChildren, Suspense, useEffect, useState } from "react";
import About from "./About";
import Career from "./Career";
import Contact from "./Contact";
import ContactForm from "./ContactForm";
import Cursor from "./Cursor";
import { GreoButton } from "./GreoPage";
import Landing from "./Landing";
import Navbar from "./Navbar";
import SocialIcons from "./SocialIcons";
import WhatIDo from "./WhatIDo";
import Work from "./Work";
import setSplitText from "./utils/splitText";

const TechStack = lazy(() => import("./TechStack"));

const MainContainer = ({ children }: PropsWithChildren) => {
  const [isDesktopView, setIsDesktopView] = useState<boolean>(
    window.innerWidth > 1024
  );

  useEffect(() => {
    let timeoutId: number;
    const resizeHandler = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setIsDesktopView(window.innerWidth > 1024);
      }, 150);
    };
    
    // Run animation setup exactly once on mount
    setSplitText();
    
    window.addEventListener("resize", resizeHandler);
    return () => {
      window.removeEventListener("resize", resizeHandler);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="container-main">
      <Cursor />
      <Navbar />
      <GreoButton />
      <SocialIcons />
      {isDesktopView && children}
      <div id="smooth-wrapper">
        <div id="smooth-content">
          <div className="container-main">
            <Landing>{!isDesktopView && children}</Landing>
            <About />
            <WhatIDo />
            <Career />
            <Work />
            <div id="techstack" style={{ minHeight: isDesktopView ? "100vh" : "360px", position: "relative" }}>
              <Suspense fallback={<div style={{ height: isDesktopView ? "100vh" : "360px" }}>Loading...</div>}>
                <TechStack />
              </Suspense>
            </div>
            <ContactForm />
            <Contact />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContainer;
