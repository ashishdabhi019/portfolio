import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { MotionConfig } from "framer-motion";
import App from "./App.tsx";
import "./index.css";
import { EDITORIAL_EASE } from "./components/utils/motionPresets";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.6, ease: EDITORIAL_EASE }}
    >
      <App />
    </MotionConfig>
  </StrictMode>
);
