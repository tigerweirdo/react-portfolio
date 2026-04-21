import React, { useRef, useEffect, memo } from "react";

/**
 * Hover "peek" alanı: opsiyonel video veya ikinci görsel.
 * Video oynatma yalnızca playbackEnabled true iken — aksi halde duraklatılır
 * (aynı anda birden fazla peek videosunun decode/oynatılmasını önler).
 */
const PeekInner = memo(({ peekVideo, innerSrc, playbackEnabled }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !peekVideo) return;
    if (playbackEnabled) {
      el.play?.().catch(() => {});
    } else {
      el.pause();
    }
  }, [peekVideo, playbackEnabled]);

  if (peekVideo) {
    return (
      <video
        ref={videoRef}
        className="premium-card__inner-img premium-card__inner-video"
        src={peekVideo}
        muted
        loop
        playsInline
        preload={playbackEnabled ? "metadata" : "none"}
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
