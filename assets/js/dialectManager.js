class DialectManager {
    constructor() {
        this.dialects = [];
        this.isLoading = false;
    }

    async loadData() {
        if (this.isLoading) return;
        this.isLoading = true;

        try {
            const response = await fetch(CONFIG.API_ENDPOINTS.DIALECT_DATA);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            this.dialects = data.dialects;
            console.log('데이터 로드 완료:', this.dialects);
            return this.dialects;
        } catch (error) {
            console.error('데이터 로드 실패:', error);
            throw error;
        } finally {
            this.isLoading = false;
        }
    }

    search(query) {
        if (!query) return [];
        query = query.toLowerCase();
        return this.dialects.filter(dialect => 
            dialect.word.toLowerCase().includes(query) ||
            dialect.meaning.toLowerCase().includes(query)
        );
    }

    getRandomWord() {
        if (this.dialects.length === 0) return null;
        const randomIndex = Math.floor(Math.random() * this.dialects.length);
        return this.dialects[randomIndex];
    }

    playSound(audioPath, button) {
        const icon = button.querySelector('i');
        const audio = new Audio(audioPath);
        
        audio.onended = () => {
            icon.className = 'fas fa-volume-up';
        };
        
        audio.play().catch(error => {
            console.error('오디오 재생 실패:', error);
            icon.className = 'fas fa-volume-up';
        });

        // 분석 이벤트 발생
        gtag('event', 'audio_play', {
            'audio_path': audioPath
        });
    }
}

// 전역 인스턴스 생성
const dialectManager = new DialectManager();
