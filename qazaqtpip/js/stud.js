// stud.js - викторина с ИИ-подсказками

let model = null;
let geminiReady = false;

// ВСТАВЬТЕ ВАШ API КЛЮЧ СЮДА
const GEMINI_API_KEY = 'ВАШ_API_КЛЮЧ_ЗДЕСЬ';

// ========== ИНИЦИАЛИЗАЦИЯ GEMINI ==========
async function initGemini() {
    try {
        if (typeof GoogleGenerativeAI === 'undefined') {
            console.log('📥 Загружаем библиотеку GoogleGenerativeAI...');
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/@google/generative-ai@0.1.3/dist/index.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }
        
        const GoogleGenerativeAI = window.GoogleGenerativeAI;
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        geminiReady = true;
        console.log('✅ Gemini AI готов для подсказок');
        return true;
    } catch (error) {
        console.error('❌ Ошибка Gemini:', error);
        geminiReady = false;
        return false;
    }
}

// ========== ИГРОВЫЕ ПЕРЕМЕННЫЕ ==========
let level = parseInt(localStorage.getItem("student_level") || 1);
let xp = parseInt(localStorage.getItem("student_xp") || 0);
let lives = parseInt(localStorage.getItem("student_lives") || 3);
let streak = 0;

// ========== РАСШИРЕННАЯ БАЗА ВОПРОСОВ (50+ вопросов) ==========
const questions = [
    // === Природа и озера ===
    { q: "Где находится озеро Бурабай (Боровое)?", a: ["Акмолинская область", "Алматинская область", "Карагандинская область"], correct: 0, hint: "Это курортная зона недалеко от Кокшетау" },
    { q: "Какое озеро известно своими целебными свойствами на востоке Казахстана?", a: ["Балхаш", "Алаколь", "Зайсан"], correct: 1, hint: "Название переводится как 'пестрое озеро', находится вблизи границы с Китаем" },
    { q: "Какое озеро уникально тем, что наполовину пресное, наполовину соленое?", a: ["Алаколь", "Балхаш", "Каспий"], correct: 1, hint: "Это озеро находится в Карагандинской области" },
    { q: "Какое самое большое озеро в мире омывает Казахстан?", a: ["Байкал", "Каспийское море", "Виктория"], correct: 1, hint: "Это не совсем море, но по площади больше многих стран" },
    { q: "Где находится озеро Зайсан?", a: ["Абайская область", "ВКО", "Павлодарская область"], correct: 1, hint: "Область на востоке Казахстана, граничащая с Россией и Китаем" },
    { q: "Какое озеро находится в Мангистауской области?", a: ["Балхаш", "Каспийское море", "Алаколь"], correct: 1, hint: "Это море-озеро омывает запад Казахстана" },
    
    // === Горы ===
    { q: "Где находится горнолыжный курорт Шымбулак?", a: ["Астана", "Алматы", "Шымкент"], correct: 1, hint: "Расположен в ущелье Заилийского Алатау" },
    { q: "Что такое Медео?", a: ["Каньон", "Высокогорный каток", "Озеро"], correct: 1, hint: "Здесь проходили чемпионаты по конькобежному спорту" },
    { q: "Главная достопримечательность Чарынского каньона?", a: ["Долина замков", "Голубая бухта", "Золотой мост"], correct: 0, hint: "Причудливые скалы напоминают средневековые замки" },
    { q: "Какая гора считается священной в Мангистау?", a: ["Бектау-Ата", "Кокшетау", "Хан-Тенгри"], correct: 0, hint: "Название переводится как 'Святой отец'" },
    { q: "Где находится гора Кокшетау?", a: ["Алматы", "Акмолинская область", "ВКО"], correct: 1, hint: "Находится рядом с озером Бурабай" },
    { q: "Илийский Алатау находится рядом с каким городом?", a: ["Астана", "Алматы", "Шымкент"], correct: 1, hint: "Это горная система, видимая из южной столицы" },
    
    // === Города ===
    { q: "Какой город называют 'южной столицей' Казахстана?", a: ["Шымкент", "Алматы", "Туркистан"], correct: 1, hint: "Бывшая столица республики" },
    { q: "В каком городе находится мавзолей Ходжи Ахмеда Ясави?", a: ["Алматы", "Туркистан", "Тараз"], correct: 1, hint: "Город считается духовной столицей тюркского мира" },
    { q: "Какой город стоит на берегу Каспийского моря?", a: ["Актау", "Атырау", "Актау и Атырау"], correct: 2, hint: "Оба города имеют выход к Каспию" },
    { q: "Какой город является столицей Казахстана?", a: ["Алматы", "Астана", "Шымкент"], correct: 1, hint: "Бывший Целиноград, Акмолинск, Нур-Султан" },
    { q: "Какой из этих городов самый древний на территории Казахстана?", a: ["Алматы", "Тараз", "Астана"], correct: 1, hint: "Был столицей Караханидского каганата" },
    { q: "В каком городе находится космодром 'Байконур'?", a: ["Байконур", "Кызылорда", "Шымкент"], correct: 0, hint: "Город с одноименным названием, арендованный Россией" },
    
    // === Культурное наследие ===
    { q: "Где находятся петроглифы Тамгалы?", a: ["Алматинская область", "Жамбылская область", "Туркестанская область"], correct: 0, hint: "Это объект ЮНЕСКО, наскальные рисунки эпохи бронзы" },
    { q: "Что такое 'Древний Отрар'?", a: ["Городище", "Крепость", "Мавзолей"], correct: 0, hint: "Родина Аль-Фараби, разрушен монголами" },
    { q: "Где находится музей 'Карлаг'?", a: ["Караганда", "Астана", "Семипалатинск"], correct: 0, hint: "Музей памяти жертв политических репрессий" },
    { q: "Кто такой Чокан Валиханов?", a: ["Поэт", "Ученый-путешественник", "Полководец"], correct: 1, hint: "Первый казахский ученый, исследователь" },
    { q: "Где находится усадьба Сырымбет?", a: ["Айыртауский район", "Алматинская область", "ВКО"], correct: 0, hint: "Родовое имение Чокана Валиханова" },
    { q: "Что означает 'Резиденция Абылай хана'?", a: ["Музей", "Крепость", "Дворец"], correct: 0, hint: "Находится в Петропавловске, историческая ставка хана" },
    
    // === История ===
    { q: "Кто является автором 'Слов назидания'?", a: ["Абай Кунанбаев", "Шакарим Кудайбердиев", "Мухтар Ауэзов"], correct: 0, hint: "Великий поэт и мыслитель" },
    { q: "Какая битва произошла в 1991 году у озера Балхаш?", a: ["Битва при Аныракае", "Сражение при Буланты", "Никакой"], correct: 2, hint: "Это современная история" },
    { q: "Как звали последнего хана Среднего жуза?", a: ["Кенесары", "Абылай", "Касым"], correct: 1, hint: "При нем Казахское ханство достигло расцвета" },
    { q: "В каком году была первая столица Казахстана?", a: ["1991", "1997", "1994"], correct: 0, hint: "Год обретения независимости" },
    { q: "Как называется древний город на Великом Шелковом пути в Жамбылской области?", a: ["Отрар", "Тараз", "Сайрам"], correct: 1, hint: "Был известен как Тараз" },
    
    // === Экология ===
    { q: "Что является главной причиной высыхания Аральского моря?", a: ["Ирригация", "Засуха", "Загрязнение"], correct: 0, hint: "Чрезмерный забор воды для хлопковых полей" },
    { q: "Какая проблема угрожает 66% территории Казахстана?", a: ["Опустынивание", "Загрязнение", "Землетрясения"], correct: 0, hint: "Потеря плодородных земель" },
    { q: "Что нельзя делать в национальном парке?", a: ["Фотографировать", "Сорить и разводить костры", "Ходить по тропам"], correct: 1, hint: "Это вредит природе" },
    { q: "Какой пластик можно перерабатывать?", a: ["PET (1)", "PS (6)", "PVC (3)"], correct: 0, hint: "Самый распространенный перерабатываемый пластик" },
    
    // === Кухня ===
    { q: "Какое национальное блюдо готовят из конины и теста?", a: ["Плов", "Бешбармак", "Манты"], correct: 1, hint: "Название переводится как 'пять пальцев'" },
    { q: "Какой напиток делают из кобыльего молока?", a: ["Шубат", "Кумыс", "Айран"], correct: 1, hint: "Полезен для здоровья, слабоалкогольный" },
    { q: "Из какого молока делают шубат?", a: ["Коровьего", "Козьего", "Верблюжьего"], correct: 2, hint: "Очень полезный кисломолочный напиток" },
    { q: "Что такое баурсак?", a: ["Печенье", "Пирожки", "Пончики"], correct: 2, hint: "Жареные во фритюре кусочки теста" },
    
    // === Традиции ===
    { q: "Что означает праздник Наурыз?", a: ["Новый год", "День весеннего равноденствия", "Урожай"], correct: 1, hint: "Традиционный восточный праздник" },
    { q: "Что такое 'шашу'?", a: ["Обряд осыпания сладостями", "Танец", "Песня"], correct: 0, hint: "Проводится на свадьбах и торжествах" },
    { q: "Как называется казахская колыбель?", a: ["Кереге", "Бесік", "Шанырак"], correct: 1, hint: "Ее укачивают и поют колыбельную" },
    { q: "Что такое 'той'?", a: ["Праздник", "Еда", "Одежда"], correct: 0, hint: "Торжество, свадьба" },
    
    // === Достопримечательности ===
    { q: "Где находится Бозжыра?", a: ["Мангистауская область", "Атырауская область", "Актюбинская область"], correct: 0, hint: "Ущелье с белыми скалами на плато Устюрт" },
    { q: "Что такое Кольсайские озера?", a: ["Три горных озера", "Одно озеро", "Водопад"], correct: 0, hint: "Находятся в 300 км от Алматы" },
    { q: "Где находится плато Устюрт?", a: ["Западный Казахстан", "Восточный Казахстан", "Северный Казахстан"], correct: 0, hint: "Пустынное плато в Мангистауской области" },
    { q: "Где находится Каркаралы?", a: ["Карагандинская область", "Акмолинская область", "Павлодарская область"], correct: 0, hint: "Горы и сосновые леса" },
    
    // === Интересные факты ===
    { q: "Какая страна самая большая по площади?", a: ["Россия", "Канада", "Казахстан"], correct: 2, hint: "9-я в мире по площади" },
    { q: "Сколько областей в Казахстане?", a: ["14", "17", "20"], correct: 1, hint: "Включая новые области" },
    { q: "Какой город находится на одной широте с Римом?", a: ["Алматы", "Астана", "Шымкент"], correct: 2, hint: "Южный город" },
    { q: "Какое животное изображено на гербе Алматы?", a: ["Барс", "Волк", "Орел"], correct: 0, hint: "Снежный ..." },
];

let current = 0;
let hintUsed = false;

// ========== ФУНКЦИИ ИГРЫ ==========
function updateUI() {
    document.getElementById("level").innerText = level;
    document.getElementById("xp").innerText = xp;
    document.getElementById("lives").innerText = lives;
    document.getElementById("streak").innerText = streak;
}

function loadQuestion() {
    if (questions.length === 0) return;
    
    let q = questions[current];
    document.getElementById("question").innerText = q.q;
    
    // Сохраняем текущий вопрос для подсказки
    document.getElementById("question").setAttribute("data-current-q", current);
    
    let box = document.getElementById("answers");
    box.innerHTML = "";
    
    q.a.forEach((ans, i) => {
        let btn = document.createElement("button");
        btn.innerText = ans;
        btn.classList.add("answer-btn");
        btn.onclick = () => answer(i, btn);
        box.appendChild(btn);
    });
    
    hintUsed = false;
}

async function answer(i, btn) {
    let q = questions[current];
    let isCorrect = (i === q.correct);
    
    if (isCorrect) {
        xp++;
        streak++;
        btn.classList.add("correct");
        
        // Бонус за серию
        if (streak >= 3) {
            xp++;
            showToast("🔥 Бонус +1 XP за серию из 3!");
        }
        
        // Повышение уровня
        if (xp >= 5) {
            level++;
            xp = 0;
            showToast("🎉 ПОЗДРАВЛЯЮ! Новый уровень " + level + "!");
        }
    } else {
        lives--;
        streak = 0;
        btn.classList.add("wrong");
        
        // Показываем правильный ответ
        let correctAnswer = q.a[q.correct];
        showToast(`❌ Правильный ответ: ${correctAnswer}`, 2000);
        
        if (lives <= 0) {
            showToast("💀 ИГРА ОКОНЧЕНА! Начинаем заново...");
            level = 1;
            xp = 0;
            lives = 3;
            streak = 0;
            current = 0;
        }
    }
    
    // Сохраняем прогресс
    localStorage.setItem("student_level", level);
    localStorage.setItem("student_xp", xp);
    localStorage.setItem("student_lives", lives);
    
    updateUI();
    
    // Переход к следующему вопросу
    setTimeout(() => {
        if (lives > 0) {
            current++;
            if (current >= questions.length) {
                showToast("🏆 ПОЗДРАВЛЯЮ! Ты прошел всю викторину! Начинаем заново!");
                current = 0;
            }
            loadQuestion();
        } else {
            // Перезапуск игры
            current = 0;
            loadQuestion();
        }
    }, 800);
}

// ========== ИИ-ПОДСКАЗКА ==========
async function getAIHint() {
    const questionEl = document.getElementById("question");
    const currentQIndex = parseInt(questionEl.getAttribute("data-current-q") || current);
    const currentQuestion = questions[currentQIndex];
    
    if (!currentQuestion) {
        showToast("Вопрос не найден");
        return;
    }
    
    // Показываем индикатор загрузки
    const hintBtn = document.querySelector(".ai-btn");
    const originalText = hintBtn?.innerHTML || "🤖 Подсказка";
    if (hintBtn) hintBtn.innerHTML = "🤔 Думаю...";
    
    try {
        if (geminiReady && model) {
            const prompt = `Ты - помощник в викторине о Казахстане.
Вопрос: "${currentQuestion.q}"
Варианты ответов: ${currentQuestion.a.join(", ")}
Правильный ответ: ${currentQuestion.a[currentQuestion.correct]}

Дай краткую, полезную подсказку (1-2 предложения), которая намекнет на правильный ответ, но не скажет его напрямую.
Подсказка должна быть на русском языке, дружелюбной и использовать эмодзи.`;
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            let hint = response.text();
            hint = hint.replace(/\*\*/g, '');
            showToast(`💡 Подсказка: ${hint}`, 4000);
        } else {
            // Локальные подсказки из базы
            if (currentQuestion.hint) {
                showToast(`💡 ${currentQuestion.hint}`, 3000);
            } else {
                showToast(`💡 Подумай о регионе Казахстана! 🌍`, 3000);
            }
        }
    } catch (error) {
        console.error("Ошибка ИИ:", error);
        // Локальная подсказка
        if (currentQuestion.hint) {
            showToast(`💡 ${currentQuestion.hint}`, 3000);
        } else {
            showToast(`💡 Подумай о регионе Казахстана! 🌍`, 3000);
        }
    }
    
    if (hintBtn) hintBtn.innerHTML = originalText;
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function showToast(message, duration = 3000) {
    // Создаем тост, если его нет
    let toast = document.querySelector('.custom-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'custom-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(90deg, #4f7cff, #7df9ff);
            color: white;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 14px;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            opacity: 0;
            transition: opacity 0.3s;
            pointer-events: none;
            white-space: nowrap;
            max-width: 90vw;
            white-space: normal;
            text-align: center;
        `;
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
        toast.style.opacity = '0';
    }, duration);
}

// ========== ОБРАБОТЧИК КНОПКИ ПОДСКАЗКИ ==========
function hint() {
    getAIHint();
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🎮 Запуск викторины...');
    
    // Инициализируем ИИ
    await initGemini();
    
    // Обновляем кнопку подсказки
    const hintBtn = document.querySelector('.ai-btn');
    if (hintBtn) {
        hintBtn.onclick = hint;
    }
    
    // Запускаем игру
    updateUI();
    loadQuestion();
    
    console.log(`✅ Викторина готова. Вопросов: ${questions.length}`);
});