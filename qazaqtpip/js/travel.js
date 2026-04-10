// travel.js с Gemini AI и ссылками на карту

let model = null;
let geminiReady = false;

// ВСТАВЬТЕ ВАШ API КЛЮЧ СЮДА (получите на https://aistudio.google.com/)
const GEMINI_API_KEY = 'AIzaSyCaAyyO4ltDwJdJCRl_rlm4oY8uEx3V8OU';

// ========== ДАННЫЕ ЛОКАЦИЙ С КООРДИНАТАМИ ==========
const locationsData = {
    "Музейный комплекс «Резиденция Абылай хана»": { lat: 54.8730, lng: 69.1500 },
    "Усадьба Сырымбет": { lat: 53.0500, lng: 69.2000 },
    "Мемориальный комплекс Карасай и Агынтай батыров": { lat: 53.1000, lng: 69.3000 },
    "Петроглифы Тамгалы": { lat: 43.8730, lng: 75.5400 },
    "Древний Отрар и мавзолей Арыстан-Баб": { lat: 42.8530, lng: 68.3000 },
    "Карлаг": { lat: 49.6700, lng: 73.1000 },
    "Сибинские озера": { lat: 49.4000, lng: 82.0000 },
    "Алматы": { lat: 43.2380, lng: 76.9450 },
    "Шымкент": { lat: 42.3170, lng: 69.5900 },
    "Астана": { lat: 51.1605, lng: 71.4704 },
    "Актау": { lat: 43.6500, lng: 51.1500 },
    "Тараз": { lat: 42.9000, lng: 71.3650 },
    "Бурабай": { lat: 53.0830, lng: 70.3000 },
    "Туркистан": { lat: 43.2973, lng: 68.2517 },
    "Алатау": { lat: 43.1500, lng: 77.3000 },
    "Кокшетау": { lat: 53.2833, lng: 69.3833 },
    "Имантау": { lat: 53.2000, lng: 69.1000 },
    "Чарын": { lat: 43.3791, lng: 79.1233 },
    "Бектау-Ата": { lat: 47.6500, lng: 74.7000 },
    "Бурабай (Боровое)": { lat: 53.082337, lng: 70.306888 },
    "Озеро Алаколь": { lat: 46.081111, lng: 81.764167 },
    "Шымбулак": { lat: 43.128269, lng: 77.081425 },
    "Кольсайские озёра": { lat: 42.936145, lng: 78.324983 },
    "Чарынский каньон": { lat: 43.379167, lng: 79.123333 },
    "Каспийское море": { lat: 41.777000, lng: 50.759000 },
    "Бозжыра": { lat: 43.413967, lng: 54.073425 },
    "Озеро Балхаш": { lat: 46.467723, lng: 76.187440 },
    "Байконур": { lat: 45.858920, lng: 63.313350 },
    "Медео": { lat: 43.157500, lng: 77.058611 },
    "Маркаколь": { lat: 48.745823, lng: 85.760390 },
    "Плато Устюрт": { lat: 43.833333, lng: 55.266667 },
    "Каркаралы": { lat: 49.405833, lng: 75.474167 },
    "Озеро Зайсан": { lat: 48.013436, lng: 83.860912 }
};

// ========== КУРС ВАЛЮТ ==========
let currentRates = { usd: 470, eur: 510 };

async function updateExchangeRates() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        if (response.ok) {
            const data = await response.json();
            currentRates.usd = data.rates.KZT || 470;
            currentRates.eur = data.rates.EUR ? Math.round(data.rates.KZT / data.rates.EUR * 100) / 100 : 510;
            console.log('Курс обновлен:', currentRates);
            return true;
        }
    } catch (error) {
        console.log('Не удалось обновить курс');
    }
    return false;
}

// ========== ФУНКЦИЯ СОЗДАНИЯ ССЫЛКИ НА КАРТУ ==========
function createMapLink(title, lat, lng) {
    let link = document.createElement('a');
    link.href = `/qazaqtpip/map.html?title=${encodeURIComponent(title)}&lat=${lat}&lng=${lng}`;
    link.target = '_blank';
    link.textContent = '📍 Смотреть на карте';
    link.className = 'map-link';
    link.style.cssText = 'display: inline-block; margin-top: 10px; color: #7df9ff; text-decoration: none; font-weight: 500; font-size: 0.8rem;';
    link.onmouseover = () => link.style.textDecoration = 'underline';
    link.onmouseout = () => link.style.textDecoration = 'none';
    return link;
}

// ========== ИНИЦИАЛИЗАЦИЯ GEMINI (ПРАВИЛЬНАЯ ПОСЛЕДОВАТЕЛЬНОСТЬ) ==========
async function loadGeminiLibrary() {
    return new Promise((resolve, reject) => {
        if (typeof window.GoogleGenerativeAI !== 'undefined') {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@google/generative-ai@0.1.3/dist/index.min.js';
        script.onload = () => {
            console.log('✅ Библиотека Gemini загружена');
            resolve();
        };
        script.onerror = () => {
            console.error('❌ Ошибка загрузки библиотеки Gemini');
            reject();
        };
        document.head.appendChild(script);
    });
}

async function initGemini() {
    try {
        // Сначала загружаем библиотеку
        await loadGeminiLibrary();
        
        // Теперь инициализируем модель
        const GoogleGenerativeAI = window.GoogleGenerativeAI;
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        geminiReady = true;
        console.log('✅ Gemini AI готов');
        return true;
    } catch (error) {
        console.error('❌ Ошибка Gemini:', error);
        geminiReady = false;
        return false;
    }
}

// Локальные ответы (запасной вариант)
function getLocalAnswer(q) {
    const lowerQ = q.toLowerCase();
    if (lowerQ.includes('алматы')) return '🏔️ **Алматы** — южная столица. Обязательно посетите Кок-Тобе, Медео и Шымбулак!';
    if (lowerQ.includes('астана')) return '🏙️ **Астана** — город будущего. Топ мест: Байтерек, Хан Шатыр, мечеть Хазрет Султан.';
    if (lowerQ.includes('бурабай')) return '🏞️ **Бурабай** — жемчужина Казахстана. Озера, горы, свежий воздух!';
    if (lowerQ.includes('чарын')) return '🏜️ **Чарынский каньон** — Долина замков. Возраст более 12 млн лет.';
    if (lowerQ.includes('туркистан')) return '🕌 **Туркистан** — духовная столица. Мавзолей Ходжи Ахмеда Ясави — объект ЮНЕСКО.';
    if (lowerQ.includes('экология') || lowerQ.includes('мусор')) return '🌱 **Туризм без вреда**: убирайте мусор, не кормите животных, используйте многоразовые бутылки!';
    if (lowerQ.includes('калькулятор') || lowerQ.includes('бюджет')) return '💰 Используйте калькулятор ниже, чтобы рассчитать бюджет поездки по Казахстану!';
    if (lowerQ.includes('карта')) return '🗺️ Перейдите на вкладку "Карта" в боковом меню, чтобы увидеть все достопримечательности!';
    return '🗺️ Рекомендую посетить Чарынский каньон, Бурабай или Туркистан. Уточните вопрос!';
}

// Функция ИИ
async function askAI() {
    const searchInput = document.getElementById('searchInput');
    const aiResponse = document.getElementById('aiResponse');
    const q = searchInput?.value.trim();
    
    if (!q) {
        if (aiResponse) {
            aiResponse.style.display = 'block';
            aiResponse.innerHTML = '🤖 <strong>ИИ-гид:</strong> Напишите ваш вопрос! Например: "Что посмотреть в Алматы?" или "Расскажи о Бурабае"';
        }
        return;
    }
    
    if (aiResponse) {
        aiResponse.style.display = 'block';
        aiResponse.innerHTML = '🤖 <strong>ИИ-гид:</strong> Думаю над ответом... <i class="fas fa-spinner fa-spin"></i>';
    }
    
    try {
        if (geminiReady && model) {
            const result = await model.generateContent(q);
            const response = await result.response;
            let answer = response.text();
            answer = answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            answer = answer.replace(/\n/g, '<br>');
            if (aiResponse) aiResponse.innerHTML = `🤖 <strong>ИИ-гид:</strong><br><br>${answer}`;
        } else {
            if (aiResponse) aiResponse.innerHTML = `🤖 <strong>ИИ-гид:</strong> ${getLocalAnswer(q)}`;
        }
    } catch (error) {
        console.error('Ошибка:', error);
        if (aiResponse) aiResponse.innerHTML = `🤖 <strong>ИИ-гид:</strong> ${getLocalAnswer(q)}`;
    }
}

// ========== КАЛЬКУЛЯТОР ==========
const PRICES_DB = {
    accommodation: {
        'Алматы': { budget: 12000, mid: 25000, premium: 50000 },
        'Астана': { budget: 11000, mid: 23000, premium: 48000 },
        'Шымкент': { budget: 8000, mid: 18000, premium: 35000 },
        'Актау': { budget: 9000, mid: 20000, premium: 40000 },
        'Туркистан': { budget: 7000, mid: 15000, premium: 30000 },
        'Бурабай': { budget: 10000, mid: 22000, premium: 45000 },
        'default': { budget: 9000, mid: 20000, premium: 40000 }
    },
    food: { budget: 5000, mid: 10000, premium: 20000 },
    localTransport: { budget: 400, mid: 1500, premium: 5000 },
    season: { high: 1.3, mid: 1.0, low: 0.85 }
};

function detectCity(input) {
    const cities = ['Алматы', 'Астана', 'Шымкент', 'Актау', 'Туркистан', 'Бурабай'];
    for (let city of cities) {
        if (input.toLowerCase().includes(city.toLowerCase())) return city;
    }
    return 'default';
}

function getSeasonFactor() {
    const month = new Date().getMonth() + 1;
    if ([6,7,8,12,1,2].includes(month)) return PRICES_DB.season.high;
    if ([5,9].includes(month)) return PRICES_DB.season.mid;
    return PRICES_DB.season.low;
}

function formatMoney(n) {
    return new Intl.NumberFormat('ru-RU').format(Math.round(n));
}

function calculateBudget() {
    const days = Number(document.getElementById('bc-days')?.value) || 1;
    const people = Number(document.getElementById('bc-people')?.value) || 1;
    const region = document.getElementById('bc-region')?.value.trim() || '';
    const contingencyPct = Number(document.getElementById('bc-contingency')?.value) || 10;
    const includeExcursions = document.getElementById('include-excursions')?.checked || false;
    
    let travelStyle = 'mid';
    const selectedRadio = document.querySelector('input[name="travel-style"]:checked');
    if (selectedRadio) travelStyle = selectedRadio.value;
    
    const city = detectCity(region);
    const cityPrices = PRICES_DB.accommodation[city] || PRICES_DB.accommodation.default;
    
    const accommodationTotal = cityPrices[travelStyle] * days * people;
    const foodTotal = PRICES_DB.food[travelStyle] * days * people;
    const transportTotal = PRICES_DB.localTransport[travelStyle] * days * people;
    
    let excursionsTotal = 0;
    if (includeExcursions) {
        excursionsTotal = (travelStyle === 'premium' ? 15000 : 5000) * people;
    }
    
    const seasonFactor = getSeasonFactor();
    const subtotal = (accommodationTotal + foodTotal + transportTotal + excursionsTotal) * seasonFactor;
    const contingency = subtotal * (contingencyPct / 100);
    const total = subtotal + contingency;
    
    const totalUSD = Math.round(total / currentRates.usd);
    const totalEUR = Math.round(total / currentRates.eur);
    
    const resultBox = document.getElementById('bc-result');
    const breakdown = document.getElementById('bc-breakdown');
    const totalEl = document.getElementById('bc-total');
    const usdEl = document.getElementById('bc-usd');
    const eurEl = document.getElementById('bc-eur');
    
    if (breakdown) {
        breakdown.innerHTML = `
            <ul style="list-style:none; padding-left:0;">
                <li><strong>📍 Регион</strong>: ${region || 'не указан'} (${city})</li>
                <li><strong>🏨 Проживание</strong>: ${formatMoney(accommodationTotal)} KZT</li>
                <li><strong>🍽️ Питание</strong>: ${formatMoney(foodTotal)} KZT</li>
                <li><strong>🚗 Транспорт</strong>: ${formatMoney(transportTotal)} KZT</li>
                ${includeExcursions ? `<li><strong>🏛️ Экскурсии</strong>: ${formatMoney(excursionsTotal)} KZT</li>` : ''}
                <li><strong>📅 Сезон</strong>: x${seasonFactor}</li>
                <li><strong>🛡️ Резерв (${contingencyPct}%)</strong>: ${formatMoney(contingency)} KZT</li>
            </ul>
        `;
    }
    if (totalEl) totalEl.textContent = formatMoney(total);
    if (usdEl) usdEl.textContent = totalUSD;
    if (eurEl) eurEl.textContent = totalEUR;
    if (resultBox) resultBox.style.display = 'block';
}

function resetBudget() {
    const regionInput = document.getElementById('bc-region');
    const daysInput = document.getElementById('bc-days');
    const peopleInput = document.getElementById('bc-people');
    const contingencyInput = document.getElementById('bc-contingency');
    const excursionsCheck = document.getElementById('include-excursions');
    const resultBox = document.getElementById('bc-result');
    
    if (regionInput) regionInput.value = '';
    if (daysInput) daysInput.value = 3;
    if (peopleInput) peopleInput.value = 1;
    if (contingencyInput) contingencyInput.value = 10;
    if (excursionsCheck) excursionsCheck.checked = false;
    if (resultBox) resultBox.style.display = 'none';
    
    document.querySelectorAll('.travel-style-option').forEach(opt => {
        opt.classList.remove('selected');
        const radio = opt.querySelector('input');
        if (radio && radio.value === 'mid') {
            opt.classList.add('selected');
            radio.checked = true;
        } else if (radio) {
            radio.checked = false;
        }
    });
}

// ========== ОСНОВНАЯ ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🔧 Инициализация travel.html...');
    
    // Запускаем инициализацию Gemini (асинхронно, не блокируя UI)
    initGemini();
    
    // Обновляем курс валют
    updateExchangeRates();
    
    // Добавляем ссылки на карту
    const allCards = document.querySelectorAll('.card');
    console.log(`📦 Найдено карточек: ${allCards.length}`);
    
    allCards.forEach((card, index) => {
        const titleElement = card.querySelector('h3');
        if (!titleElement) {
            console.log(`⚠️ Карточка ${index}: нет заголовка h3`);
            return;
        }
        
        const title = titleElement.innerText;
        const extra = card.querySelector('.extra');
        
        if (!extra) {
            console.log(`⚠️ Карточка "${title}": нет блока .extra`);
            return;
        }
        
        if (extra.querySelector('.map-link')) {
            console.log(`✅ Карточка "${title}": ссылка уже есть`);
            return;
        }
        
        let locationData = null;
        if (locationsData[title]) {
            locationData = locationsData[title];
            console.log(`🎯 Точное совпадение для "${title}"`);
        } else {
            for (let key in locationsData) {
                if (title.includes(key) || key.includes(title)) {
                    locationData = locationsData[key];
                    console.log(`🔍 Частичное совпадение: "${title}" → "${key}"`);
                    break;
                }
            }
        }
        
        if (locationData) {
            const mapLink = createMapLink(title, locationData.lat, locationData.lng);
            extra.appendChild(mapLink);
            console.log(`✅ Добавлена ссылка для: ${title}`);
        } else {
            console.log(`❌ Не найдены координаты для: "${title}"`);
        }
    });
    
    // Поиск
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const askAiBtn = document.getElementById('askAiBtn');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const q = searchInput?.value.toLowerCase() || '';
            allCards.forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
            });
        });
    }
    
    if (askAiBtn) {
        askAiBtn.addEventListener('click', askAI);
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const q = searchInput.value.toLowerCase();
                allCards.forEach(card => {
                    card.style.display = card.innerText.toLowerCase().includes(q) ? 'flex' : 'none';
                });
            }
        });
    }
    
    // Фильтрация
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filter = btn.getAttribute('data-filter');
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            allCards.forEach(card => {
                const cardType = card.getAttribute('data-type');
                if (filter === 'all') {
                    card.style.display = 'flex';
                } else {
                    card.style.display = cardType === filter ? 'flex' : 'none';
                }
            });
        });
    });
    
    // Калькулятор
    const calcBtn = document.getElementById('bc-calc');
    const resetBtn = document.getElementById('bc-reset');
    const refreshBtn = document.getElementById('refreshPricesBtn');
    
    if (calcBtn) calcBtn.addEventListener('click', calculateBudget);
    if (resetBtn) resetBtn.addEventListener('click', resetBudget);
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Обновление...';
            await updateExchangeRates();
            if (refreshBtn) refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Обновить курс';
            calculateBudget();
        });
    }
    
    // Выбор стиля путешествия
    document.querySelectorAll('.travel-style-option').forEach(option => {
        option.addEventListener('click', () => {
            const radio = option.querySelector('input');
            if (radio) {
                document.querySelectorAll('.travel-style-option').forEach(opt => opt.classList.remove('selected'));
                option.classList.add('selected');
                radio.checked = true;
            }
        });
    });
    
    console.log('✅ Инициализация завершена');
});