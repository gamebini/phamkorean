export class AnalyticsManager {
    static trackEvent(eventName, params = {}) {
        if (window.gtag) {
            gtag('event', eventName, params);
        }
    }

    static trackPageView() {
        const timeOnPage = Math.round((Date.now() - window.performance.timing.navigationStart) / 1000);
        this.trackEvent('session_quality', {
            time_on_page: timeOnPage,
            scroll_depth: Math.round(window.maxScroll || 0)
        });
    }

    static initializeTracking() {
        window.maxScroll = 0;
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            window.maxScroll = Math.max(window.maxScroll, scrollPercent);
        });

        window.addEventListener('beforeunload', () => this.trackPageView());
    }
}
