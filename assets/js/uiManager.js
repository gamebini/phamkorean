import { CONSTANTS } from './constants.js';
import { AnalyticsManager } from './analytics.js';

export class UIManager {
    static async initialize() {
        this.setupEventListeners();
        this.initializeModals();
        AnalyticsManager.initializeTracking();
        
        const urlParams = new URLSearchParams(window.location.search);
        const searchWord = urlParams.get('word');
        
        if (searchWord) {
            await this.setupSearchView(searchWord);
        } else if (!localStorage.getItem(CONSTANTS.STORAGE_KEYS.VISITED)) {
            this.showIntroModal();
            localStorage.setItem(CONSTANTS.STORAGE_KEYS.VISITED, 'true');
        }
    }

    static setupEventListeners() {
        // 검색 입력 리스너
        ['searchInput', 'mainSearchInput'].forEach(id => {
            const element = document.getElementById(id);
            if (!element) return;

            element.addEventListener('input', () => {
                const listId = id === 'searchInput' ? 'autocompleteList' : 'mainAutocompleteList';
                dialectManager.showAutocomplete(id, listId);
            });

            element.addEventListener('keyup', (event) => {
                if (event.key === 'Enter') {
                    dialectManager.performSearch(id === 'mainSearchInput' ? 'main' : 'initial');
                }
            });
        });

        // 모달 관련 리스너
        document.querySelector('.request-button')?.addEventListener('click', this.showRequestModal);
        document.querySelector('.close-modal')?.addEventListener('click', this.closeRequestModal);

        // 글로벌 클릭 핸들러
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-box')) {
                document.querySelectorAll('.autocomplete-items').forEach(list => {
                    list.style.display = 'none';
                });
            }
            if (!e.target.closest('.button-group')) {
                document.querySelectorAll('.share-button').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
        });
    }

    static initializeModals() {
        // 인트로 모달
        const introModal = document.querySelector(CONSTANTS.SELECTORS.MODALS.INTRO);
        const betaModal = document.querySelector(CONSTANTS.SELECTORS.MODALS.BETA);
        const requestModal = document.querySelector(CONSTANTS.SELECTORS.MODALS.REQUEST);

        if (introModal) {
            introModal.querySelector('.next-button')?.addEventListener('click', () => {
                this.showBetaModal();
            });
        }

        if (betaModal) {
            betaModal.querySelector('.close-modal')?.addEventListener('click', () => {
                this.closeBetaModal();
            });
        }

        if (requestModal) {
            requestModal.querySelector('.close-modal')?.addEventListener('click', () => {
                this.closeRequestModal();
            });
            requestModal.addEventListener('click', (e) => {
                if (e.target === requestModal) {
                    this.closeRequestModal();
                }
            });
        }
    }

    static showIntroModal() {
            const modal = document.getElementById('introModal');
            modal.style.display = 'block';
            setTimeout(() => modal.classList.add('show'), 10);
            AnalyticsManager.trackEvent('modal_open', {
                'modal_type': 'intro'
            });
        }

    static showBetaModal() {
        // 첫 번째 모달 즉시 숨기기
        const introModal = document.getElementById('introModal');
        introModal.style.display = 'none';
        
        // 두 번째 모달 표시
        const betaModal = document.getElementById('betaNoticeModal');
        betaModal.style.display = 'block';
        betaModal.classList.add('show');
        AnalyticsManager.trackEvent('modal_open', {
            'modal_type': 'beta'
        });
    }

    static closeBetaModal() {
        const modal = document.getElementById('betaNoticeModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    static showRequestModal() {
        const modal = document.getElementById('requestModal');
        modal.style.display = 'block';
        setTimeout(() => modal.classList.add('show'), 10);
        AnalyticsManager.trackEvent('modal_open', {
            'modal_type': 'request'
        });
    }

    static closeRequestModal() {
        const modal = document.getElementById('requestModal');
        modal.classList.remove('show');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    static async setupSearchView(searchWord) {
        // UI 설정
        document.getElementById('initialView').style.display = 'none';
        document.getElementById('header').style.display = 'block';
        document.getElementById('mainContent').style.display = 'block';
        document.getElementById('header').classList.add('visible');
        document.getElementById('dictionaryContent').classList.add('visible');
        
        // 검색어 설정
        document.getElementById('searchInput').value = searchWord;
        document.getElementById('mainSearchInput').value = searchWord;
        
        // 검색 실행
        await dialectManager.performSearch('url');
    }

    static shareDialect(button) {
        // 모든 다른 드롭다운 닫기
        document.querySelectorAll('.share-button').forEach(btn => {
            if (btn !== button) btn.classList.remove('active');
        });
        
        button.classList.toggle('active');
        event.stopPropagation();
    }

    static shareToService(service, element) {
        const wordEntry = element.closest('.word-entry');
        const word = wordEntry.querySelector('.word-title').textContent;
        const meaning = wordEntry.querySelector('.word-meaning').textContent;
        const example = wordEntry.querySelector('.word-example').textContent;
        
        const shareUrl = `https://phamkorean.kro.kr?word=${encodeURIComponent(word)}`;
        
        switch(service) {
            case 'twitter':
                const shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
                window.open(shareLink, '_blank');
                break;
            
            case 'discord':
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('Discord에 붙여넣을 수 있도록 클립보드에 복사되었습니다.');
                });
                break;
            
            case 'instagram':
                navigator.clipboard.writeText(shareUrl).then(() => {
                    alert('Instagram에 붙여넣을 수 있도록 클립보드에 복사되었습니다.');
                });
                break;
            
            case 'kakao':
                if (window.Kakao) {
                    Kakao.Link.sendDefault({
                        objectType: 'feed',
                        content: {
                            title: `팜국어: ${word}`,
                            description: `${meaning}\n${example}`,
                            imageUrl: 'https://phamkorean.kro.kr/assets/img/icon-192.png',
                            link: {
                                mobileWebUrl: shareUrl,
                                webUrl: shareUrl,
                            },
                        },
                        buttons: [
                            {
                                title: '웹으로 보기',
                                link: {
                                    mobileWebUrl: shareUrl,
                                    webUrl: shareUrl,
                                },
                            },
                        ],
                    });
                } else {
                    navigator.clipboard.writeText(shareUrl).then(() => {
                        alert('카카오톡에 붙여넣을 수 있도록 클립보드에 복사되었습니다.');
                    });
                }
                break;
        }
        
        // 공유 후 드롭다운 닫기
        element.closest('.word-entry').querySelector('.share-button').classList.remove('active');
        
        // 공유 이벤트 추적
        AnalyticsManager.trackEvent('share', {
            'method': service,
            'content_type': 'dialect',
            'item_id': word
        });
    }

    static playSound(audioPath, button) {
        const icon = button.querySelector('i');
        const audio = new Audio(audioPath);
        
        audio.onended = function() {
            icon.className = 'fas fa-volume-up';
        };
        
        audio.play().catch(error => {
            console.error('오디오 재생에 실패했습니다:', error);
            icon.className = 'fas fa-volume-up';
        });
        
        AnalyticsManager.trackEvent('audio_play', {
            'audio_path': audioPath
        });
        AnalyticsManager.trackEvent('pronunciation_play', {
            'word': button.closest('.word-header').querySelector('.word-title').textContent
        });
    }

    static trackVideoPlay(wordTitle) {
        AnalyticsManager.trackEvent('video_play', {
            'video_title': wordTitle
        });
    }
