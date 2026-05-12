const elements = {
    itemInput: document.getElementById('itemInput'),
    addBtn: document.getElementById('addBtn'),
    listContainer: document.getElementById('shoppingList'),
    completedList: document.getElementById('completedList'),
    completedSection: document.getElementById('completedSection'),
    completedCount: document.getElementById('completedCount'),
    listTitle: document.getElementById('listTitle'),
    shoppingDate: document.getElementById('shoppingDate'),
    saveListBtn: document.getElementById('saveListBtn'),
    historyContainer: document.getElementById('historyContainer'),
    stats: document.getElementById('stats'),
    historyCount: document.getElementById('historyCount'),
    apiPhrase: document.getElementById('api-phrase'),
    themeToggle: document.getElementById('themeToggle'),
    themeIcon: document.getElementById('themeIcon')
};

let currentItems = JSON.parse(localStorage.getItem('currentShoppingList') || '[]');
let savedLists = JSON.parse(localStorage.getItem('shoppingHistory') || '[]');

const backupPhrases = [
    "Planejar as compras é o primeiro passo para uma casa organizada!",
    "Economize tempo e dinheiro mantendo sua lista sempre em dia.",
    "Fazer mercado com lista evita gastos desnecessários.",
    "Organização é a chave para uma rotina mais leve."
];

// FUNÇÃO PARA BUSCAR E TRADUZIR FRASE
async function fetchPortugueseAdvice() {
    try {
        // 1. Busca frase aleatória (em inglês) da Quotable API
        const response = await fetch('https://api.quotable.io/random?maxLength=80');
        if (!response.ok) throw new Error('Falha na API de citações');
        const data = await response.json();
        const englishText = data.content;

        // 2. Traduz para Português usando MyMemory API (Grátis)
        const translationResponse = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|pt`);
        const translationData = await translationResponse.json();
        
        elements.apiPhrase.innerText = `"${translationData.responseData.translatedText}"`;
    } catch (error) {
        console.error("Erro na API, usando backup:", error);
        elements.apiPhrase.innerText = backupPhrases[Math.floor(Math.random() * backupPhrases.length)];
    }
}

document.addEventListener('DOMContentLoaded', () => {
    elements.shoppingDate.value = new Date().toISOString().split('T')[0];
    
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeIcon.innerText = '☀️';
    }

    renderCurrentList();
    renderHistory();
    fetchPortugueseAdvice();
});

// Toggle de Tema
elements.themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
    elements.themeIcon.innerText = isLight ? '☀️' : '🌙';
});

function renderCurrentList() {
    elements.listContainer.innerHTML = '';
    elements.completedList.innerHTML = '';
    let doneCount = 0;

    currentItems.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = `item-row group flex items-center justify-between p-4 px-6 ${item.checked ? 'checked' : ''}`;
        li.innerHTML = `
            <div class="flex items-center gap-4 flex-1 cursor-pointer">
                <input type="checkbox" ${item.checked ? 'checked' : ''}>
                <span class="font-bold text-lg item-text">${item.text}</span>
            </div>
            <button class="delete-item opacity-0 group-hover:opacity-100 text-red-500 p-2">✕</button>
        `;

        li.querySelector('.flex-1').onclick = () => toggleItem(index);
        li.querySelector('.delete-item').onclick = (e) => {
            e.stopPropagation();
            removeItem(index);
        };

        if (item.checked) {
            elements.completedList.appendChild(li);
            doneCount++;
        } else {
            elements.listContainer.appendChild(li);
        }
    });

    elements.completedSection.classList.toggle('hidden', doneCount === 0);
    elements.completedCount.innerText = doneCount;
    elements.stats.innerText = `${currentItems.length} ITENS`;
    localStorage.setItem('currentShoppingList', JSON.stringify(currentItems));
}

function addItem() {
    const text = elements.itemInput.value.trim();
    if (text) {
        currentItems.push({ text, checked: false });
        elements.itemInput.value = '';
        renderCurrentList();
    }
}

function toggleItem(index) {
    currentItems[index].checked = !currentItems[index].checked;
    renderCurrentList();
}

function removeItem(index) {
    currentItems.splice(index, 1);
    renderCurrentList();
}

elements.saveListBtn.addEventListener('click', () => {
    const title = elements.listTitle.value.trim();
    if (!title || currentItems.length === 0) return alert("Preencha o título e adicione itens.");

    savedLists.unshift({ 
        id: Date.now(), 
        title, 
        date: elements.shoppingDate.value, 
        items: [...currentItems] 
    });
    
    localStorage.setItem('shoppingHistory', JSON.stringify(savedLists));
    currentItems = [];
    elements.listTitle.value = '';
    renderCurrentList();
    renderHistory();
});

function renderHistory() {
    elements.historyCount.innerText = savedLists.length;
    elements.historyContainer.innerHTML = '';

    savedLists.forEach(list => {
        const card = document.createElement('div');
        card.className = "history-card p-6 rounded-[2rem] border shadow-sm";
        card.innerHTML = `
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="font-extrabold tracking-tight">${list.title}</h3>
                    <p class="text-[10px] font-bold text-brandGreenMain mt-1">${list.date.split('-').reverse().join('/')}</p>
                </div>
                <button class="delete-history text-red-400 p-1">🗑️</button>
            </div>
            <div class="flex items-center justify-between mt-4">
                <span class="text-[10px] font-bold opacity-50">${list.items.length} ITENS</span>
                <button class="restore-list text-xs font-bold text-brandGreenMain">RESTAURAR</button>
            </div>
        `;

        card.querySelector('.delete-history').onclick = () => deleteHistory(list.id);
        card.querySelector('.restore-list').onclick = () => loadList(list.id);
        elements.historyContainer.appendChild(card);
    });
}

function deleteHistory(id) {
    if(confirm("Excluir histórico?")) {
        savedLists = savedLists.filter(l => l.id !== id);
        localStorage.setItem('shoppingHistory', JSON.stringify(savedLists));
        renderHistory();
    }
}

function loadList(id) {
    const list = savedLists.find(l => l.id === id);
    if (list) {
        currentItems = [...list.items];
        elements.listTitle.value = list.title;
        renderCurrentList();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

elements.addBtn.addEventListener('click', addItem);
elements.itemInput.addEventListener('keypress', (e) => e.key === 'Enter' && addItem());