document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Kakao SDK 초기화
        if (window.Kakao) {
            window.Kakao.init(CONFIG.KAKAO_KEY);
        }

        // 데이터 로드
        await dialectManager.loadData();
        
        // 랜덤 플레이스홀더 시작
        uiManager.startPlaceholderInterval();
        
        // URL 파라미터 확인
        const urlParams = new URLSearchParams(window.location.search);
        const searchWord = urlParams.get('word');
        
        if (searchWord) {
            // URL에 검색어가 있으면 바로 검색 실행
            document.getElementById('searchInput').value = searchWord;
            document.getElementById('mainSearchInput').value = searchWord;
            await searchManager.performSearch('url');
        } else {
            // 첫 방문자 확인 및 모달 표시
            modalManager.checkFirstVisit();
        }

        // 사용자 분석 데이터 전송
        gtag('event', 'user_type', {
            'platform': 'web',
            'is_new_user': !localStorage.getItem(CONFIG.STORAGE_KEYS.RETURNING_USER),
            'device_type': /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        });

        // 재방문자 표시
        if (!localStorage.getItem(CONFIG.STORAGE_KEYS.RETURNING_USER)) {
            localStorage.setItem(CONFIG.STORAGE_KEYS.RETURNING_USER, 'true');
        }

    } catch (error) {
        console.error('앱 초기화 중 오류 발생:', error);
        // 에러 처리 UI 표시
    }
});

// 페이지 종료 시 분석 데이터 전송
window.addEventListener('beforeunload', () => {
    const timeOnPage = Math.round((Date.now() - window.performance.timing.navigationStart) / 1000);
    
    gtag('event', 'session_quality', {
        'time_on_page': timeOnPage,
        'scroll_depth': Math.round(searchManager.maxScroll)
    });
});
