const CONFIG = {
    KAKAO_KEY: 'your-kakao-key',
    API_ENDPOINTS: {
        DIALECT_DATA: './assets/json/dialects.json'
    },
    PLACEHOLDERS: {
        SEARCH: '팜국어 검색하기...',
        INTERVAL: 1500 // ms
    },
    ANALYTICS: {
        GA_ID: 'your-ga-id'
    },
    STORAGE_KEYS: {
        VISITED: 'visited',
        RETURNING_USER: 'returning_user'
    }
};

// Analytics 설정
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', CONFIG.ANALYTICS.GA_ID);
