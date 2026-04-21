import React, { useRef, useEffect, useState, memo } from "react";

/**
 * Hover "peek" alanı: opsiyonel video veya ikinci görsel.
 * Video src yalnızca oynatma aktifken set edilir — gereksiz indirme/decode önlenir.
 */
const PeekInner = memo(({ peekVideo, innerSrc, playbackEnabled }) => {
  const videoRef = useRef(null);
  const [activeSrc, setActiveSrc] = useState(null);

  useEffect(() => {
    if (!peekVideo) {
      setActiveSrc(null);
      return;
    }
    if (playbackEnabled) {
      setActiveSrc(peekVideo);
    } else {
      const el = videoRef.current;
      if (el) {
        el.pause();
        el.currentTime = 0;
      }
      setActiveSrc(null);
    }
  }, [peekVideo, playbackEnabled]);

  useEffect(() => {
    if (!activeSrc || !playbackEnabled) return;
    const el = videoRef.current;
    if (!el) return;
    el.play?.().catch(() => {});
  }, [activeSrc, playbackEnabled]);

  if (peekVideo) {
    return (
      <video
        ref={videoRef}
        className="premium-card__inner-img premium-card__inner-video"
        src={activeSrc ?? undefined}
        muted
        loop
        playsInline
        preload="none"
        autoPlay={false}
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
