import React, { useRef, useEffect, memo } from "react";

/**
 * Hover "peek" alanı: opsiyonel video veya ikinci görsel.
 */
const PeekInner = memo(({ peekVideo, innerSrc, isOpen }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !peekVideo) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isOpen || reduceMotion) {
      el.pause();
    } else {
      el.play?.().catch(() => {});
    }
  }, [peekVideo, isOpen]);

  if (peekVideo) {
    return (
      <video
        ref={videoRef}
        className="premium-card__inner-img premium-card__inner-video"
        src={peekVideo}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-hidden="true"
      />
    );
  }

  if (innerSrc) {
    return (
      <img
        src={innerSrc}
        alt=""
        className="premium-card__inner-img"
        loading="lazy"
      />
    );
  }

  return null;
});

PeekInner.displayName = "PeekInner";

export default PeekInner;
