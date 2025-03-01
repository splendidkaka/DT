// src/utils/viewportHelper.js
export const initViewport = () => {
  const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent);
  const meta = document.createElement("meta");
  meta.name = "viewport";

  if (isMobile) {
    meta.content = `width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no`;
  } else {
    meta.content = `width=1920, initial-scale=${window.innerWidth / 1920}`;
  }

  document.head.appendChild(meta);
};

// main.js 中调用
