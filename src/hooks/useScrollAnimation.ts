import { useEffect } from 'react';

/**
 * useScrollAnimation
 * 
 * Attaches an IntersectionObserver to all elements with the class 'fade-in-section'.
 * When an element enters the viewport, the 'is-visible' class is added to trigger the transition.
 * The observer unobserves the element after it becomes visible to run the animation only once.
 */
export const useScrollAnimation = () => {
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px' // Trigger slightly before element is fully in view
        });

        // Observe all elements with the target class
        const elements = document.querySelectorAll('.fade-in-section');
        elements.forEach((el) => observer.observe(el));

        return () => {
            elements.forEach((el) => observer.unobserve(el));
            observer.disconnect();
        };
    }); // No dependency array to re-run on render updates if DOM changes, essentially acting like componentDidUpdate
};
