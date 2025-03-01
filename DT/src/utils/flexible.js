export const initFlexible = () => {
  const doc = document.documentElement;
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);

  console.log("isMobile", isMobile);

  const setRem = () => {
    const width = doc.clientWidth;
    const baseSize = isMobile
      ? (width / 375) * 100 + "vw"
      : (width / 1920) * 16 + "px";

    doc.style.fontSize = baseSize;
  };

  setRem();
  window.addEventListener("resize", setRem);
  window.addEventListener("pageshow", setRem);
};
