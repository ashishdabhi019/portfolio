import { useEffect, useRef } from "react";
import "./styles/Cursor.css";
import gsap from "gsap";

const Cursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let hover = false;
    const cursor = cursorRef.current!;
    const mousePos = { x: 0, y: 0 };
    const cursorPos = { x: 0, y: 0 };

    document.addEventListener("mousemove", (e) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    });

    requestAnimationFrame(function loop() {
      if (!hover) {
        const delay = 3; // Tightened follow
        cursorPos.x += (mousePos.x - cursorPos.x) / delay;
        cursorPos.y += (mousePos.y - cursorPos.y) / delay;
        gsap.set(cursor, { x: cursorPos.x, y: cursorPos.y }); // Instant crisp update
      }
      requestAnimationFrame(loop);
    });

    // ── Event delegation: catches ALL data-cursor elements, even dynamic ones ──
    document.addEventListener("mouseover", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.closest("[data-cursor]") as HTMLElement | null;
      if (!element) return;

      const type = element.dataset.cursor;

      if (type === "icons") {
        cursor.classList.add("cursor-icons");
        const rect = element.getBoundingClientRect();
        gsap.to(cursor, { x: rect.left, y: rect.top, duration: 0.1 });
        cursor.style.setProperty("--cursorH", `${rect.height}px`);
        hover = true;
      }

      if (type === "disable") {
        cursor.classList.add("cursor-disable");
      }
    });

    document.addEventListener("mouseout", (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const element = target.closest("[data-cursor]") as HTMLElement | null;
      if (!element) return;

      cursor.classList.remove("cursor-disable", "cursor-icons");
      hover = false;
    });
  }, []);

  return <div className="cursor-main" ref={cursorRef}></div>;
};

export default Cursor;
