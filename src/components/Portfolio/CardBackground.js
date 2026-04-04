import React, { memo } from "react";

/**
 * Dış alan (tam kart): her zaman görsel.
 * Kapak bir video dosyasıysa (coverIsVideo) arka plan = ana görsel; video içeride PeekInner'da oynar.
 */
function backgroundImageSrc(item) {
  if (item.coverIsVideo === true && item.image) {
    return item.image;
  }
  if (item.imageIsVideo === true) {
    return item.cover || item.image;
  }
  return item.cover || item.image;
}

const CardBackground = memo(({ item, index }) => {
  const src = backgroundImageSrc(item);
  if (!src) return null;

  return (
    <img
      src={src}
      alt=""
      className="premium-card__bg"
      loading={index < 2 ? "eager" : "lazy"}
    />
  );
});

CardBackground.displayName = "CardBackground";

export default CardBackground;
