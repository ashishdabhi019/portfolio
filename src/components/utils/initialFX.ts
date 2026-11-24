// @ts-ignore
import { SplitText } from "gsap/SplitText";
import gsap from "gsap";

let splitInstances: any[] = [];
let loopTimelines: gsap.core.Timeline[] = [];

export function initialFX() {
  // Kill any running loop timelines and revert previous splits on HMR or re-run
  if (loopTimelines.length > 0) {
    loopTimelines.forEach((tl) => tl.kill());
    loopTimelines = [];
  }
  if (splitInstances.length > 0) {
    splitInstances.forEach(instance => instance.revert());
    splitInstances = [];
  }

  window.scrollTo(0, 0);
  document.documentElement.style.overflow = "";
  document.body.style.overflow = "";
  document.body.style.overflowY = "auto";
  document.body.style.touchAction = "";
  document.getElementsByTagName("main")[0]?.classList.add("main-active");
  document.body.style.removeProperty("background-color");
  gsap.set(".landing-container", { opacity: 1, y: 0, clearProps: "opacity,transform" });
  gsap.set([".landing-intro", ".landing-info"], { opacity: 1, clearProps: "opacity" });

  const lenis = (window as any).__lenisInstance || (window as any).lenis;
  if (lenis && typeof lenis.start === "function") {
    lenis.scrollTo(0, { immediate: true });
    lenis.start();
  }

  var landingText = new SplitText(
    [".landing-info h3", ".landing-intro h2"],
    {
      type: "chars,lines",
      linesClass: "split-line",
    }
  );
  gsap.fromTo(
    landingText.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  let TextProps = { type: "chars,lines", linesClass: "split-h2" };

  var landingText2 = new SplitText(".landing-h2-info", TextProps);
  gsap.fromTo(
    landingText2.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  var landingLeftText2 = new SplitText(".landing-h1-info", TextProps);
  gsap.fromTo(
    landingLeftText2.chars,
    { opacity: 0, y: 80, filter: "blur(5px)" },
    {
      opacity: 1,
      duration: 1.2,
      filter: "blur(0px)",
      ease: "power3.inOut",
      y: 0,
      stagger: 0.025,
      delay: 0.3,
    }
  );

  gsap.fromTo(
    ".landing-info-h2",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );

  gsap.fromTo(
    ".landing-intro-h1",
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      y: 0,
      delay: 0.8,
    }
  );

  gsap.fromTo(
    [".header", ".icons-section"],
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power1.inOut",
      delay: 0.1,
    }
  );

  var landingText3 = new SplitText(".landing-h2-info-1", TextProps);
  var landingText4 = new SplitText(".landing-h2-1", TextProps);
  var landingText5 = new SplitText(".landing-h2-2", TextProps);

  var landingLeftText3 = new SplitText(".landing-h1-info-1", TextProps);
  var landingLeftText4 = new SplitText(".landing-h1-1", TextProps);
  var landingLeftText5 = new SplitText(".landing-h1-2", TextProps);

  splitInstances.push(
    landingText,
    landingText2,
    landingText3,
    landingText4,
    landingText5,
    landingLeftText2,
    landingLeftText3,
    landingLeftText4,
    landingLeftText5
  );

  LoopText(landingText2, landingText3);
  LoopText(landingText4, landingText5);

  LoopText(landingLeftText2, landingLeftText3);
  LoopText(landingLeftText4, landingLeftText5);
}

function LoopText(Text1: SplitText, Text2: SplitText) {
  var tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
  loopTimelines.push(tl);
  const delay = 4;
  const delay2 = delay * 2 + 1;

  tl.fromTo(
    Text2.chars,
    { opacity: 0, y: 80 },
    {
      opacity: 1,
      duration: 1.2,
      ease: "power3.inOut",
      y: 0,
      stagger: 0.1,
      delay: delay,
    },
    0
  )
    .fromTo(
      Text1.chars,
      { y: 80 },
      {
        duration: 1.2,
        ease: "power3.inOut",
        y: 0,
        stagger: 0.1,
        delay: delay2,
        immediateRender: false,
      },
      1
    )
    .fromTo(
      Text1.chars,
      { y: 0 },
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay,
        immediateRender: false,
      },
      0
    )
    .to(
      Text2.chars,
      {
        y: -80,
        duration: 1.2,
        ease: "power3.inOut",
        stagger: 0.1,
        delay: delay2,
      },
      1
    );
}
