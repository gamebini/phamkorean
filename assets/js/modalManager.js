class ModalManager {
    constructor() {
        this.setupEventListeners();
    }

    showIntroModal() {
        const modal = document.getElementById('introModal');
        if (modal) {
            modal.style.display = 'block';
            // display 속성이 적용된 후 show 클래스 추가
            requestAnimationFrame(() => {
                modal.classList.add('show');
            });
            
            gtag('event', 'modal_open', {
                'modal_type': 'intro'
            });
        }
    }

    checkFirstVisit() {
        // localStorage 체크 전에 intro 모달 표시
        const isFirstVisit = !localStorage.getItem('visited');
        if (isFirstVisit) {
            // 약간의 지연 후 모달 표시
            setTimeout(() => {
                this.showIntroModal();
            }, 500);
        }
    }

    showBetaModal() {
        // 첫 번째 모달 닫기
        const introModal = document.getElementById('introModal');
        introModal.style.display = 'none';
        
        // 베타 모달 표시
        const betaModal = document.getElementById('betaNoticeModal');
        betaModal.style.display = 'block';
        betaModal.classList.add('show');
        
        gtag('event', 'modal_open', {
            'modal_type': 'beta'
        });
    }

    closeBetaModal() {
        const modal = document.getElementById('betaNoticeModal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            
            // 베타 모달이 닫힌 후 첫 방문 여부 저장
            localStorage.setItem(CONFIG.STORAGE_KEYS.VISITED, 'true');
        }, 300);
    }

    showRequestModal() {
        const modal = document.getElementById('requestModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        
        gtag('event', 'modal_open', {
            'modal_type': 'request'
        });
    }

    closeRequestModal() {
        const modal = document.getElementById('requestModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
            setTimeout(() => modal.style.display = 'none', 300);
        });
    }

    handleModalClick(event) {
        // 모달 외부 클릭 시 닫기
        if (event.target.classList.contains('modal')) {
            const modalId = event.target.id;
            switch(modalId) {
                case 'betaNoticeModal':
                    this.closeBetaModal();
                    break;
                case 'requestModal':
                    this.closeRequestModal();
                    break;
                default:
                    this.closeAllModals();
            }
        }
    }

    setupEventListeners() {
        // 모달 외부 클릭 이벤트
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => this.handleModalClick(e));
        });

        // 닫기 버튼 이벤트
        document.querySelectorAll('.close-modal').forEach(button => {
            button.addEventListener('click', () => {
                const modal = button.closest('.modal');
                if (modal.id === 'betaNoticeModal') {
                    this.closeBetaModal();
                } else if (modal.id === 'requestModal') {
                    this.closeRequestModal();
                }
            });
        });

        // ESC 키 눌렀을 때 모달 닫기
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    checkFirstVisit() {
        const isFirstVisit = !localStorage.getItem(CONFIG.STORAGE_KEYS.VISITED);
        if (isFirstVisit) {
            this.showIntroModal();
        }
    }
}

// 전역 인스턴스 생성
const modalManager = new ModalManager();
