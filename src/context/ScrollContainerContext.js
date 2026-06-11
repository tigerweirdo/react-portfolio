import { createContext, useContext } from 'react';

/**
 * Gerçek scroll `.scroll-container` içinde dönüyor (window değil).
 * Scroll'a bağlı efektlerin (parallax, progress) doğru ölçebilmesi için
 * bu container ref'ini bölümlere context ile geçiriyoruz.
 */
const ScrollContainerContext = createContext(null);

export const ScrollContainerProvider = ScrollContainerContext.Provider;

export function useScrollContainer() {
  return useContext(ScrollContainerContext);
}

export default ScrollContainerContext;
