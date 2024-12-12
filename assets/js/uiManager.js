class UIManager {
    constructor() {
        this.placeholderInterval = null;
        this.setupEventListeners();
    }

    switchToSearchView() {
        const initialView = document.getElementById('initialView');
        const header = document.getElementById('header');
        const mainContent = document.getElementById('mainContent');

        initialView.classList.add('move-up');
        header.style.display = 'block';
        mainContent.style.display = 'block';

        setTimeout(() => {
            header.classList.add('visible');
            document.getElementById('dictionaryContent').classList.add('visible');
            setTimeout(() => {
                initialView.style.display = 'none';
            }, 500);
        }, 300);
    }

    setRandomPlaceholder() {
        if (dialectManager.dialects.length > 0) {
            const randomWord = dialectManager.getRandomWord().word;
            const placeholder = `'${randomWord}' 검색하기`;
            
            document.getElementById('searchInput').placeholder = placeholder;
            document.getElementById('mainSearchInput').placeholder = placeholder;
        }
    }

    startPlaceholderInterval() {
        this.setRandomPlaceholder();
        this.placeholderInterval = setInterval(() => {
            this.setRandomPlaceholder();
        }, CONFIG.PLACEHOLDERS.INTERVAL);
    }

    stopPlaceholderInterval() {
        if (this.placeholderInterval) {
            clearInterval(this.placeholderInterval);
            this.placeholderInterval = null;
        }
    }

    setupEventListeners() {
        // 윈도우 리사이즈 이벤트
        window.addEventListener('resize', this.handleResize.bind(this));

        // 스크롤 이벤트
        window.addEventListener('scroll', this.handleScroll.bind(this));

        // 뒤로가기 이벤트
        window.addEventListener('popstate', this.handlePopState.bind(this));
    }

    handleResize() {
        // 모바일 뷰포트 높이 조정
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    handleScroll() {
        // 스크롤에 따른 헤더 상태 변경
        const header = document.getElementById('header');
        if (window.scrollY > 50) {
            header.classList.add('compact');
        } else {
            header.classList.remove('compact');
        }
    }

    handlePopState(event) {
        // 브라우저 뒤로가기/앞으로가기 처리
        const urlParams = new URLSearchParams(window.location.search);
        const searchWord = urlParams.get('word');

        if (searchWord) {
            searchManager.performSearch('url');
        } else {
            this.resetToInitialView();
        }
    }

    resetToInitialView() {
        const initialView = document.getElementById('initialView');
        const header = document.getElementById('header');
        const mainContent = document.getElementById('mainContent');

        initialView.style.display = 'flex';
        header.style.display = 'none';
        mainContent.style.display = 'none';
        
        // 검색창 초기화
        document.getElementById('searchInput').value = '';
        document.getElementById('mainSearchInput').value = '';
    }

    showLoading() {
        // 로딩 인디케이터 표시
        const loading = document.createElement('div');
        loading.className = 'loading-indicator';
        loading.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        document.body.appendChild(loading);
    }

    hideLoading() {
        // 로딩 인디케이터 제거
        const loading = document.querySelector('.loading-indicator');
        if (loading) {
            loading.remove();
        }
    }
}

// 전역 인스턴스 생성
const uiManager = new UIManager();
