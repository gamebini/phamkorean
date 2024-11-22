import { CONSTANTS } from './constants.js';
import { DialectManager } from './dialectManager.js';
import { UIManager } from './uiManager.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dialectManager = new DialectManager();
    await dialectManager.loadData();
    
    await UIManager.initialize();

    const urlParams = new URLSearchParams(window.location.search);
    const searchWord = urlParams.get('word');
    
    if (searchWord) {
        await dialectManager.performSearch('url');
    }
});
