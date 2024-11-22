export const Utils = {
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('Failed to load JSON:', error);
            throw error;
        }
    },

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    updateURLParameter(key, value) {
        const newUrl = new URL(window.location);
        newUrl.searchParams.set(key, value);
        window.history.pushState({}, '', newUrl);
    }
};
