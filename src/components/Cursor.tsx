import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import "./styles/Cursor.css";

const Cursor = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Custom spring physics to replace GSAP delay lerping
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  const [cursorType, setCursorType] = useState("");
  const [cursorHeight, setCursorHeight] = useState("0px");

  useEffect(() => {
    let hover = false;

    const handleMouseMove = (e: MouseEvent) => {
      if (!hover) {
        mouseX.set(e.clientX);
        mouseY.set(e.clientY);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.closest("[data-cursor]") as HTMLElement | null;
      if (!element) return;

      const type = element.dataset.cursor;

      if (type === "icons") {
        setCursorType("cursor-icons");
        const rect = element.getBoundingClientRect();
        mouseX.set(rect.left);
        mouseY.set(rect.top);
        setCursorHeight(`${rect.height}px`);
        hover = true;
      }

      if (type === "disable") {
        setCursorType("cursor-disable");
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.closest("[data-cursor]") as HTMLElement | null;
      if (!element) return;

      setCursorType("");
      hover = false;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, [mouseX, mouseY]);

  return (
    <motion.div
      className={`cursor-main ${cursorType}`}
      style={
        {
          x: cursorX,
          y: cursorY,
          "--cursorH": cursorHeight,
        } as any
      }
    />
  );
};

export default Cursor;
