// 이벤트 리스너 초기화 함수
function initializeEventListeners() {
    // 검색 관련 버튼들
    const initialSearchButton = document.querySelector('#initialView button');
    if (initialSearchButton) {
        initialSearchButton.addEventListener('click', () => {
            searchManager.performSearch('initial');
        });
    }

    const mainSearchButton = document.querySelector('.search-button');
    if (mainSearchButton) {
        mainSearchButton.addEventListener('click', () => {
            searchManager.performSearch('main');
        });
    }

    // 문의하기 버튼
    const requestButton = document.querySelector('.request-button');
    if (requestButton) {
        requestButton.addEventListener('click', () => {
            modalManager.showRequestModal();
        });
    }

    // 모달 관련 버튼들
    const betaModalButton = document.querySelector('#introModal button');
    if (betaModalButton) {
        betaModalButton.addEventListener('click', () => {
            modalManager.showBetaModal();
        });
    }

    const betaCloseButton = document.querySelector('#betaNoticeModal .close-modal');
    if (betaCloseButton) {
        betaCloseButton.addEventListener('click', () => {
            modalManager.closeBetaModal();
        });
    }

    const betaConfirmButton = document.querySelector('#betaNoticeModal button');
    if (betaConfirmButton) {
        betaConfirmButton.addEventListener('click', () => {
            modalManager.closeBetaModal();
        });
    }

    const requestCloseButton = document.querySelector('#requestModal .close-modal');
    if (requestCloseButton) {
        requestCloseButton.addEventListener('click', () => {
            modalManager.closeRequestModal();
        });
    }

    // 검색 입력창 이벤트
    ['searchInput', 'mainSearchInput'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            // 입력 이벤트
            input.addEventListener('input', () => {
                searchManager.showAutocomplete(
                    id,
                    id === 'searchInput' ? 'autocompleteList' : 'mainAutocompleteList'
                );
            });
            
            // 엔터키 이벤트
            input.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    searchManager.performSearch(id === 'mainSearchInput' ? 'main' : 'initial');
                }
            });
        }
    });

    // 문서 전체 클릭 이벤트
    document.addEventListener('click', (e) => {
        // 공유 드롭다운 닫기
        if (!e.target.closest('.button-group')) {
            document.querySelectorAll('.share-button').forEach(btn => {
                btn.classList.remove('active');
            });
        }
        
        // 자동완성 닫기
        if (!e.target.closest('.search-box')) {
            document.querySelectorAll('.autocomplete-items').forEach(list => {
                list.style.display = 'none';
            });
        }
    });

    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modalManager.closeAllModals();
            }
        });
    });

    // ESC 키로 모달 닫기
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            modalManager.closeAllModals();
        }
    });
}

// 분석 이벤트 초기화
function initializeAnalytics() {
    // 사용자 유형 추적
    const isNewUser = !localStorage.getItem('returning_user');
    if (isNewUser) {
        localStorage.setItem('returning_user', 'true');
    }
    
    gtag('event', 'user_type', {
        'platform': 'web',
        'is_new_user': isNewUser,
        'device_type': /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    });

    // 스크롤 깊이 추적
    let maxScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
        maxScroll = Math.max(maxScroll, scrollPercent);
    });

    // 페이지 이탈 시 체류시간 및 스크롤 깊이 전송
    window.addEventListener('beforeunload', () => {
        const timeOnPage = Math.round((Date.now() - window.performance.timing.navigationStart) / 1000);
        gtag('event', 'session_quality', {
            'time_on_page': timeOnPage,
            'scroll_depth': Math.round(maxScroll)
        });
    });
}

// 앱 초기화
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // 이벤트 리스너 초기화
        initializeEventListeners();
        
        // 분석 초기화
        initializeAnalytics();

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

    } catch (error) {
        console.error('앱 초기화 중 오류 발생:', error);
        alert('앱 로드 중 오류가 발생했습니다. 페이지를 새로고침 해주세요.');
    }
});

// 브라우저 히스토리 변경 감지
window.addEventListener('popstate', async (event) => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchWord = urlParams.get('word');

    if (searchWord) {
        await searchManager.performSearch('url');
    } else {
        uiManager.resetToInitialView();
    }
});
