class DialectManager {
   constructor() {
       this.dialects = [];
       this.loadData();
   }

   async loadData() {
       if (this.isLoading) return;
       this.isLoading = true;

       try {
           const response = await fetch('./assets/json/dialects.json');
           if (!response.ok) {
               throw new Error(`HTTP error! status: ${response.status}`);
           }
           const data = await response.json();
           this.dialects = data.dialects;
           console.log('데이터 로드 완료:', this.dialects);
           
           setRandomPlaceholder();
       } catch (error) {
           console.error('데이터 로드 실패:', error);
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

   saveData() {
       localStorage.setItem('dialectData', JSON.stringify(this.dialects));
   }

   exportData() {
       const dataStr = JSON.stringify({ dialects: this.dialects }, null, 2);
       const blob = new Blob([dataStr], { type: 'application/json' });
       const url = URL.createObjectURL(blob);
       
       const a = document.createElement('a');
       a.href = url;
       a.download = 'dialects_backup.json';
       a.click();
       
       URL.revokeObjectURL(url);
   }
}

const dialectManager = new DialectManager();

async function performSearch(type = 'initial') {
   if (dialectManager.dialects.length === 0) {
       await dialectManager.loadData();
   }
   const searchTerm = type === 'main' 
       ? document.getElementById('mainSearchInput').value
       : document.getElementById('searchInput').value;

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

   const content = document.getElementById('dictionaryContent');

   if (!searchTerm) {
       content.innerHTML = '<div class="initial-message">검색어를 입력해주세요.</div>';
       return;
   }

   if (dialectManager.dialects.length === 0) {
       await dialectManager.loadData();
   }

   const filteredData = dialectManager.search(searchTerm);

   if (filteredData.length === 0) {
       content.innerHTML = '<div class="search-result-header">검색 결과가 없습니다.</div>';
       return;
   }

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
               <span class="word-title">${dialect.word}</span>
               <span class="word-class">「${dialect.wordClass}」</span>
               <span class="word-ipa">${dialect.ipa}</span>
               <button class="sound-button" onclick="event.stopPropagation(); playSound('${dialect.audio}', this)">
                   <i class="fas fa-volume-up"></i>
               </button>
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
   
       entry.querySelector('.word-header').addEventListener('click', function() {
           entry.classList.toggle('expanded');
       });

       content.appendChild(entry);

       const copyright = document.createElement('div');
       copyright.className = 'copyright-notice';
       copyright.innerHTML = `
           Data by NewJeans<br>
           Made By Bini(freelancerbini@gmail.com)<br>
           © 2024 팜국어대사전. All rights reserved.
       `;
       content.appendChild(copyright);
   });
   setRandomPlaceholder();
}

async function showAutocomplete(inputId, listId) {
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
               performSearch(inputId === 'mainSearchInput' ? 'main' : 'initial');
           };
           list.appendChild(div);
       });
       list.style.display = 'block';
   } else {
       list.style.display = 'none';
   }
}

window.onload = async function() {
   await dialectManager.loadData();
   console.log('데이터 로드 완료:', dialectManager.dialects);
};

function showRequestModal() {
   const modal = document.getElementById('requestModal');
   modal.style.display = 'block';
   setTimeout(() => modal.classList.add('show'), 10);
}

function closeRequestModal() {
   const modal = document.getElementById('requestModal');
   modal.classList.remove('show');
   setTimeout(() => modal.style.display = 'none', 300);
}

document.addEventListener('DOMContentLoaded', () => {
   document.querySelector('.close-modal').addEventListener('click', closeRequestModal);
   
   document.getElementById('requestModal').addEventListener('click', (e) => {
       if (e.target === document.getElementById('requestModal')) {
           closeRequestModal();
       }
   });
});

document.querySelector('.request-button').onclick = showRequestModal;

function addExportImportButtons() {
   const header = document.querySelector('.header-content');
   
   const exportBtn = document.createElement('button');
   exportBtn.innerHTML = '<i class="fas fa-download"></i> 내보내기';
   exportBtn.onclick = () => dialectManager.exportData();
   
   const importBtn = document.createElement('button');
   importBtn.innerHTML = '<i class="fas fa-upload"></i> 가져오기';
   const fileInput = document.createElement('input');
   fileInput.type = 'file';
   fileInput.accept = '.json';
   fileInput.style.display = 'none';
   fileInput.onchange = (e) => {
       if (e.target.files.length > 0) {
           dialectManager.importData(e.target.files[0])
               .then(() => alert('데이터를 성공적으로 가져왔습니다.'))
               .catch(error => alert('데이터 가져오기 실패: ' + error));
       }
   };
   importBtn.onclick = () => fileInput.click();
   
   header.appendChild(exportBtn);
   header.appendChild(importBtn);
   header.appendChild(fileInput);
}

function playSound(audioPath, button) {
   const icon = button.querySelector('i');
   icon.className = 'fas fa-volume-high';
   
   const audio = new Audio(audioPath);
   
   audio.onended = function() {
       icon.className = 'fas fa-volume-up';
   };
   
   audio.play().catch(error => {
       console.log('오디오 재생에 실패했습니다:', error);
       icon.className = 'fas fa-volume-up';
   });
}

['searchInput', 'mainSearchInput'].forEach(id => {
   document.getElementById(id).addEventListener('input', () => {
       showAutocomplete(
           id,
           id === 'searchInput' ? 'autocompleteList' : 'mainAutocompleteList'
       );
   });
});

['searchInput', 'mainSearchInput'].forEach(id => {
   document.getElementById(id).addEventListener('keyup', function(event) {
       if (event.key === 'Enter') {
           performSearch(id === 'mainSearchInput' ? 'main' : 'initial');
       }
   });
});

document.addEventListener('click', function(e) {
   if (!e.target.closest('.search-box')) {
       document.querySelectorAll('.autocomplete-items').forEach(list => {
           list.style.display = 'none';
       });
   }
});

document.addEventListener('DOMContentLoaded', () => {
   dialectManager.loadData();
});

function setRandomPlaceholder() {
   if (dialectManager.dialects.length > 0) {
       const randomIndex = Math.floor(Math.random() * dialectManager.dialects.length);
       const randomWord = dialectManager.dialects[randomIndex].word;
       const placeholder = `'${randomWord}' 검색하기`;
       
       document.getElementById('searchInput').placeholder = placeholder;
       document.getElementById('mainSearchInput').placeholder = placeholder;
   }
}

document.addEventListener('DOMContentLoaded', () => {
   dialectManager.loadData().then(() => {
       setRandomPlaceholder();
       setInterval(setRandomPlaceholder, 1500);
   });
});

document.addEventListener('DOMContentLoaded', () => {
   dialectManager.loadData().then(() => {
       setRandomPlaceholder();
       setInterval(setRandomPlaceholder, 1500);
       showIntroModal();
   });
});

function showIntroModal() {
   const modal = document.getElementById('introModal');
   modal.style.display = 'block';
   setTimeout(() => modal.classList.add('show'), 10);
}

function showBetaModal() {
   const introModal = document.getElementById('introModal');
   introModal.style.display = 'none';
   
   const betaModal = document.getElementById('betaNoticeModal');
   betaModal.style.display = 'block';
   betaModal.classList.add('show');
}

function closeBetaModal() {
   const modal = document.getElementById('betaNoticeModal');
   modal.classList.remove('show');
   setTimeout(() => modal.style.display = 'none', 300);
}
