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
            <a href="#" class="share-option kakao" onclick="event.
