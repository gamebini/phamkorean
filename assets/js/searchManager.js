class SearchManager {
    constructor() {
        this.maxScroll = 0;
        this.setupEventListeners();
    }

    async performSearch(type = 'initial') {
        if (dialectManager.dialects.length === 0) {
            await dialectManager.loadData();
        }
        
        let searchTerm = '';
        const urlParams = new URLSearchParams(window.location.search);
        const urlWord = urlParams.get('word');
        
        if (urlWord && type === 'url') {
            searchTerm = urlWord;
            uiManager.switchToSearchView();
        } else {
            searchTerm = type === 'main' 
                ? document.getElementById('mainSearchInput').value
                : document.getElementById('searchInput').value;
            
            if (type === 'initial') {
                uiManager.switchToSearchView();
                document.getElementById('mainSearchInput').value = searchTerm;
            }
        }
    
        // URL 업데이트
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('word', searchTerm);
        window.history.pushState({}, '', newUrl);
    
        // 검색 실행
        const content = document.getElementById('dictionaryContent');
        
        if (!searchTerm) {
            content.innerHTML = '<div class="initial-message">검색어를 입력해주세요.</div>';
            return;
        }
    
        const results = dialectManager.search(searchTerm);
        this.displayResults(results, searchTerm, content);
    }

    displayResults(results, searchTerm, container) {
        if (results.length === 0) {
            container.innerHTML = '<div class="search-result-header">검색 결과가 없습니다.</div>';
            return;
        }

        container.innerHTML = `
            <div class="search-result-header">
                '<strong>${searchTerm}</strong>' 검색 결과 (<strong>${results.length}</strong>건)
            </div>
        `;

        results.forEach(dialect => {
            const entry = this.createWordEntry(dialect);
            container.appendChild(entry);
        });

        this.addCopyright(container);
        
        // 분석 이벤트 발생
        gtag('event', 'search', {
            'search_term': searchTerm,
            'results_count': results.length
        });
    }

    createWordEntry(dialect) {
        const entry = document.createElement('div');
        entry.className = 'word-entry';
        entry.innerHTML = `
            <div class="word-header">
                <div class="word-info">
                    <span class="word-title">${dialect.word}</span>
                    <span class="word-class">「${dialect.wordClass}」</span>
                    <span class="word-ipa">${dialect.ipa}</span>
                </div>
                <div class="button-group">
                    <button class="sound-button" onclick="dialectManager.playSound('${dialect.audio}', this)">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="share-button" onclick="searchManager.handleShare(this)" 
                            data-word="${dialect.word}" 
                            data-meaning="${dialect.meaning}" 
                            data-example="${dialect.example}">
                        <i class="fas fa-share-alt"></i>
                    </button>
                    <div class="share-dropdown">
                        ${this.createShareOptions()}
                    </div>
                </div>
            </div>
            <div class="word-content">
                <div class="word-meaning">${dialect.meaning}</div>
                <div class="word-example">${dialect.example}</div>
                <div class="word-video">
                    <div class="video-title">원본 영상</div>
                    <video controls onplay="searchManager.trackVideoPlay('${dialect.word}')">
                        <source src="${dialect.video}" type="video/mp4">
                        <p>브라우저가 비디오 재생을 지원하지 않습니다.</p>
                    </video>
                    <div class="video-source">출처: ${dialect.source}</div>
                </div>
            </div>
        `;

        entry.querySelector('.word-header').addEventListener('click', function(e) {
            if (!e.target.closest('.button-group')) {
                entry.classList.toggle('expanded');
            }
        });

        return entry;
    }

    createShareOptions() {
        return `
            <a href="#" class="share-option discord" onclick="event.preventDefault(); searchManager.shareToService('discord', this)">
                <i class="fab fa-discord"></i> Discord
            </a>
            <a href="#" class="share-option instagram" onclick="event.preventDefault(); searchManager.shareToService('instagram', this)">
                <i class="fab fa-instagram"></i> Instagram
            </a>
            <a href="#" class="share-option kakao" onclick="event.preventDefault(); searchManager.shareToService('kakao', this)">
                <i class="fas fa-comment"></i> KakaoTalk
            </a>
            <a href="#" class="share-option twitter" onclick="event.preventDefault(); searchManager.shareToService('twitter', this)">
                <i class="fab fa-twitter"></i> Twitter
            </a>
        `;
    }

    handleShare(button) {
        // 다른 드롭다운 모두 닫기
        document.querySelectorAll('.share-button').forEach(btn => {
            if (btn !== button) btn.classList.remove('active');
        });
        
        button.classList.toggle('active');
        event.stopPropagation();
    }

    shareToService(service, element) {
        const wordEntry = element.closest('.word-entry');
        const word = wordEntry.querySelector('.word-title').textContent;
        const meaning = wordEntry.querySelector('.word-meaning').textContent;
        const example = wordEntry.querySelector('.word-example').textContent;
        
        const shareUrl = `${window.location.origin}${window.location.pathname}?word=${encodeURIComponent(word)}`;
        
        switch(service) {
            case 'twitter':
                const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}`;
                window.open(twitterUrl, '_blank');
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
                            imageUrl: './assets/img/icon-192.png',
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
        
        // 공유 버튼 드롭다운 닫기
        element.closest('.word-entry').querySelector('.share-button').classList.remove('active');
        
        // 분석 이벤트 발생
        gtag('event', 'share', {
            'method': service,
            'content_type': 'dialect',
            'item_id': word
        });
    }

    async showAutocomplete(inputId, listId) {
        if (dialectManager.dialects.length === 0) {
            await dialectManager.loadData();
        }

        const input = document.getElementById(inputId);
        const list = document.getElementById(listId);
        const value = input.value.toLowerCase();

        if (!value) {
            list.style.display = 'none';
            return;
        }

        const matches = dialectManager.dialects.filter(item => 
            item.word.toLowerCase().includes(value)
        );

        if (matches.length > 0) {
            list.innerHTML = '';
            matches.forEach(item => {
                const div = document.createElement('div');
                div.className = 'autocomplete-item';
                div.textContent = item.word;
                div.onclick = () => {
                    input.value = item.word;
                    list.style.display = 'none';
                    this.performSearch(inputId === 'mainSearchInput' ? 'main' : 'initial');
                };
                list.appendChild(div);
            });
            list.style.display = 'block';
        } else {
            list.style.display = 'none';
        }
    }

    setupEventListeners() {
        ['searchInput', 'mainSearchInput'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => {
                    this.showAutocomplete(
                        id,
                        id === 'searchInput' ? 'autocompleteList' : 'mainAutocompleteList'
                    );
                });
                
                element.addEventListener('keyup', (event) => {
                    if (event.key === 'Enter') {
                        this.performSearch(id === 'mainSearchInput' ? 'main' : 'initial');
                    }
                });
            }
        });

        // 문서 클릭 시 드롭다운 닫기
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.button-group')) {
                document.querySelectorAll('.share-button').forEach(btn => {
                    btn.classList.remove('active');
                });
            }
            if (!e.target.closest('.search-box')) {
                document.querySelectorAll('.autocomplete-items').forEach(list => {
                    list.style.display = 'none';
                });
            }
        });

        // 스크롤 추적
        window.addEventListener('scroll', () => {
            const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            this.maxScroll = Math.max(this.maxScroll, scrollPercent);
        });
    }

    trackVideoPlay(wordTitle) {
        gtag('event', 'video_play', {
            'word_title': wordTitle
        });
    }

    addCopyright(container) {
        const copyright = document.createElement('div');
        copyright.className = 'copyright-notice';
        copyright.innerHTML = `
            Data by NewJeans<br>
            Made By One of Bunnies(freelancerbini@gmail.com)<br>
            © ${new Date().getFullYear()} 팜국어대사전. All rights reserved.
        `;
        container.appendChild(copyright);
    }
}

// 전역 인스턴스 생성
const searchManager = new SearchManager();
