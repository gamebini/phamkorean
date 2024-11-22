import { CONSTANTS } from './constants.js';
import { Utils } from './utils.js';
import { AnalyticsManager } from './analytics.js';

export class DialectManager {
    constructor() {
        this.dialects = [];
        this.isLoading = false;
    }

    async loadData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const data = await Utils.loadJSON('./assets/json/dialects.json');
            this.dialects = data.dialects;
            this.setRandomPlaceholder();
            return true;
        } catch (error) {
            console.error('Failed to load dialect data:', error);
            return false;
        } finally {
            this.isLoading = false;
        }
    }

    search(query) {
        if (!query?.trim()) return [];
        
        const normalizedQuery = query.toLowerCase().trim();
        return this.dialects.filter(dialect => 
            dialect.word.toLowerCase().includes(normalizedQuery) ||
            dialect.meaning.toLowerCase().includes(normalizedQuery)
        );
    }

    setRandomPlaceholder() {
        if (this.dialects.length === 0) return;

        const randomWord = Utils.getRandomElement(this.dialects).word;
        const placeholder = `'${randomWord}' 검색하기`;
        
        [CONSTANTS.SELECTORS.SEARCH_INPUT, CONSTANTS.SELECTORS.MAIN_SEARCH_INPUT]
            .forEach(selector => {
                const element = document.querySelector(selector);
                if (element) element.placeholder = placeholder;
            });
    }

        async function performSearch(type = 'initial') {
            // 데이터가 로드되지 않았다면 로드
            if (dialectManager.dialects.length === 0) {
                await dialectManager.loadData();
         }
            
            let searchTerm = '';
            const urlParams = new URLSearchParams(window.location.search);
            const urlWord = urlParams.get('word');
            
            if (urlWord && type === 'url') {
                searchTerm = urlWord;
                // URL 타입 검색에도 UI 전환 로직 추가
                document.getElementById('initialView').style.display = 'none';
                document.getElementById('header').style.display = 'block';
                document.getElementById('mainContent').style.display = 'block';
                document.getElementById('header').classList.add('visible');
                document.getElementById('dictionaryContent').classList.add('visible');
            } else {
                searchTerm = type === 'main' 
                    ? document.getElementById('mainSearchInput').value
                    : document.getElementById('searchInput').value;
                
                // 일반 검색일 때 UI 전환
                if (type === 'initial') {
                    document.getElementById('initialView').classList.add('move-up');
                    document.getElementById('header').style.display = 'block';
                    document.getElementById('mainContent').style.display = 'block';
                    document.getElementById('mainSearchInput').value = searchTerm;
                    
                    setTimeout(() => {
                        document.getElementById('header').classList.add('visible');
                        document.getElementById('dictionaryContent').classList.add('visible');
                        setTimeout(() => {
                            document.getElementById('initialView').style.display = 'none';
                        }, 500);
                    }, 300);
                }
            }
        
            // URL 업데이트
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('word', searchTerm);
            window.history.pushState({}, '', newUrl);
        
            // UI 상태 업데이트
            const content = document.getElementById('dictionaryContent');
        
            // 검색어 검증
            if (!searchTerm) {
                content.innerHTML = '<div class="initial-message">검색어를 입력해주세요.</div>';
                return;
            }
        
            // 검색 실행
            const filteredData = dialectManager.search(searchTerm);
        
            if (filteredData.length === 0) {
                content.innerHTML = '<div class="search-result-header">검색 결과가 없습니다.</div>';
                return;
            }
        
            // 검색 결과 표시
            content.innerHTML = `
                <div class="search-result-header">
                    '<strong>${searchTerm}</strong>' 검색 결과 (<strong>${filteredData.length}</strong>건)
                </div>
            `;

            filteredData.forEach(dialect => {
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
                            <button class="sound-button" onclick="event.stopPropagation(); playSound('${dialect.audio}', this)">
                                <i class="fas fa-volume-up"></i>
                            </button>
                            <button class="share-button" onclick="event.stopPropagation(); shareDialect(this)" data-word="${dialect.word}" data-meaning="${dialect.meaning}" data-example="${dialect.example}">
                                <i class="fas fa-share-alt"></i>
                            </button>
                            <div class="share-dropdown">
                                <a href="#" class="share-option discord" onclick="event.preventDefault(); shareToService('discord', this)">
                                    <i class="fab fa-discord"></i> Discord
                                </a>
                                <a href="#" class="share-option instagram" onclick="event.preventDefault(); shareToService('instagram', this)">
                                    <i class="fab fa-instagram"></i> Instagram
                                </a>
                                <a href="#" class="share-option kakao" onclick="event.preventDefault(); shareToService('kakao', this)">
                                    <i class="fas fa-comment"></i> KakaoTalk
                                </a>
                                <a href="#" class="share-option twitter" onclick="event.preventDefault(); shareToService('twitter', this)">
                                    <i class="fab fa-twitter"></i> Twitter
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="word-content">
                        <div class="word-meaning">${dialect.meaning}</div>
                        <div class="word-example">${dialect.example}</div>
                        <div class="word-video">
                            <div class="video-title">원본 영상</div>
                            <video controls>
                                <source src="${dialect.video}" type="video/mp4">
                                <p>브라우저가 비디오 재생을 지원하지 않습니다.</p>
                            </video>
                            <div class="video-source">출처: ${dialect.source}</div>
                        </div>
                    </div>
                `;
            
                // 클릭 이벤트 추가
                entry.querySelector('.word-header').addEventListener('click', function() {
                    entry.classList.toggle('expanded');
                });
        
            content.appendChild(entry);

            const copyright = document.createElement('div');
            copyright.className = 'copyright-notice';
            copyright.innerHTML = `
                Data by NewJeans<br>
                Made By One of Bunnies(freelancerbini@gmail.com)<br>
                © 2024 팜국어대사전. All rights reserved.
            `;
            content.appendChild(copyright);
            });
            setRandomPlaceholder();
            gtag('event', 'search', {
                'search_term': searchTerm,
                'search_type': type  // 'initial' 또는 'main'
            });

            if (filteredData.length > 0) {
                gtag('event', 'conversion', {
                    'send_to': 'G-D37XS581FJ',
                    'event_category': 'engagement',
                    'event_label': '단어_검색_완료'
                });
            }
        }
