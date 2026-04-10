function openQuest(type) {
    const modal = document.getElementById("ecoModal");
    const title = document.getElementById("ecoTitle");
    const desc = document.getElementById("ecoDesc");
    const quest = document.getElementById("ecoQuest");

    if (type === "aral") {
        title.innerText = "Аральское море";
        desc.innerText = "Причины: чрезмерная ирригация. Последствия: усыхание, пыльные бури, солевые бури, ухудшение климата.";
        quest.innerHTML = `
            <p>Что поможет сохранить Арал?</p>
            <button onclick="reward('🌱 Лесополосы')">🌱 Посадка лесополос</button>
            <button onclick="reward('💧 Рациональное использование воды')">💧 Рациональное использование воды</button>
            <button onclick="reward('🏭 Модернизация ирригации')">🏭 Модернизация ирригации</button>
        `;
    }

    if (type === "desert") {
        title.innerText = "Опустынивание";
        desc.innerText = "Причины: чрезмерный выпас скота, вырубка лесов, изменение климата. 66% территории Казахстана подвержено опустыниванию.";
        quest.innerHTML = `
            <p>Что поможет бороться с опустыниванием?</p>
            <button onclick="reward('🌱 Лесопосадки')">🌱 Лесопосадки</button>
            <button onclick="reward('🌾 Рациональное земледелие')">🌾 Рациональное земледелие</button>
            <button onclick="reward('🐫 Контроль выпаса')">🐫 Контроль выпаса скота</button>
        `;
    }

    if (type === "water") {
        title.innerText = "Загрязнение рек и озёр";
        desc.innerText = "Причины: промышленные стоки, бытовые отходы, сельскохозяйственные удобрения. Страдают реки Иртыш, Сырдарья, Или.";
        quest.innerHTML = `
            <p>Что поможет сохранить чистоту воды?</p>
            <button onclick="reward('💧 Очистные сооружения')">💧 Очистные сооружения</button>
            <button onclick="reward('♻️ Экопросвещение')">♻️ Экопросвещение</button>
            <button onclick="reward('⚖️ Экологическое законодательство')">⚖️ Экологическое законодательство</button>
        `;
    }

    modal.style.display = "flex";
}

function closeModal() {
    document.getElementById("ecoModal").style.display = "none";
}

function reward(badge) {
    alert("🏆 Ты получил награду: " + badge + "\n\nСпасибо за заботу об экологии Казахстана!");
    closeModal();
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    let modal = document.getElementById("ecoModal");
    if (event.target === modal) {
        closeModal();
    }
}