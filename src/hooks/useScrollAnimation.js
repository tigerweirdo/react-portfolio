import { useEffect } from 'react';

const defaultOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1, // %10 görünür olduğunda tetikle
};

const useScrollAnimation = (itemRefs, options = {}) => {
    useEffect(() => {
        const observerOptions = { ...defaultOptions, ...options };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // İsteğe bağlı olarak, animasyon bir kez çalıştıktan sonra gözlemciyi kaldırabilirsiniz
                    // observer.unobserve(entry.target);
                } else {
                    // İsteğe bağlı: Görünümden çıktığında animasyonu sıfırlamak için sınıfı kaldır
                    // entry.target.classList.remove('is-visible');
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        const currentRefs = Array.isArray(itemRefs) ? itemRefs : [itemRefs];

        currentRefs.forEach(itemRef => {
            if (itemRef && itemRef.current) {
                observer.observe(itemRef.current);
            } else if (itemRef && !(itemRef instanceof Function) && itemRef.id && itemRef.target) {
                 // Bu durum, Portfolio bileşenindeki gibi dinamik ref listesi içindir
                 // itemRef = { id: 'someId', target: Element }
                 // Ya da itemRefs.current = { 'someId': Element }
                const element = itemRef.target || (itemRef.current && itemRef.current[itemRef.id]);
                 if (element) {
                    observer.observe(element);
                 }
            }
        });

        return () => {
            currentRefs.forEach(itemRef => {
                if (itemRef && itemRef.current) {
                    observer.unobserve(itemRef.current);
                } else if (itemRef && !(itemRef instanceof Function) && itemRef.id && itemRef.target) {
                    const element = itemRef.target || (itemRef.current && itemRef.current[itemRef.id]);
                    if (element) {
                       observer.unobserve(element);
                    }
                }
            });
        };
    }, [itemRefs, options]); // itemRefs ve options değiştiğinde efekti yeniden çalıştır
};

export default useScrollAnimation; 