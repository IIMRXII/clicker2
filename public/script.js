let score = parseInt(localStorage.getItem('score')) || 0; // Получаем счёт из localStorage или 0
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let autoClickerCost = 500;
let userId = localStorage.getItem('userId') || null; 
let autoClickerActive = false;
let autoClickerInterval;
let autoClickerDuration = parseInt(localStorage.getItem('autoClickerDuration')) || 0; 
const maxOfflineTime = 3 * 60 * 60 * 1000;

if (!userId) {
    userId = Math.random().toString(36).substr(2, 9); 
    localStorage.setItem('userId', userId); 
}

// Убедимся, что модальное окно скрыто
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none';
    loadUserData(); 
});

// Функция для загрузки данных пользователя
const loadUserData = async () => {
    const response = await fetch(`/api/user/${userId}`);
    if (response.ok) {
        const data = await response.json();
        score = Math.max(score, data.score); // Используем большее между сохранённым и серверным значением
        clickMultiplier = data.clickMultiplier;
        clickUpgradeCost = data.clickUpgradeCost;
        
        // Проверяем, был ли автокликер активен
        const autoClickerStatus = localStorage.getItem('autoClickerActive');
        if (autoClickerStatus === 'true') {
            const lastClickTime = parseInt(localStorage.getItem('autoClickerStart')) || Date.now();
            const elapsedTime = Date.now() - lastClickTime;

            // Если прошло время с момента, когда автокликер был активен
            if (elapsedTime < maxOfflineTime) {
                const earnedClicks = Math.floor(elapsedTime / 1000) * clickMultiplier; // Кол-во кликов
                score += earnedClicks; // Добавляем к счёту
                localStorage.setItem('score', score); // Сохраняем новый счёт
            }
            autoClickerActive = true;
            startAutoClicker();
            updateAutoClickerStatus();
        }
        
        updateScoreDisplay();
        updateUpgradeButtonText();
    }
};

const updateScoreDisplay = () => {
    document.getElementById('scoreDisplay').innerText = `Счет: ${score}`;
    localStorage.setItem('score', score); 
};

const updateUpgradeButtonText = () => {
    document.getElementById('clickUpgradeButton').innerText = `Улучшить клики (${clickUpgradeCost} очков)`;
};

const updateAutoClickerStatus = () => {
    const status = autoClickerActive ? 'Автокликер активен' : 'Автокликер неактивен';
    document.getElementById('autoClickerStatus').innerText = status;
    document.getElementById('autoClickerButton').disabled = autoClickerActive;
};

const formatTime = (time) => {
    const hours = Math.floor((time / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((time / (1000 * 60)) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

// Обработчик клика по кнопке
document.getElementById('clickButton').addEventListener('click', async () => {
    const response = await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ userId })
    });
    const data = await response.json();
    score = data.score; 
    updateScoreDisplay();
});

// Обработчик улучшений
document.getElementById('clickUpgradeButton').addEventListener('click', async () => {
    if (score >= clickUpgradeCost) {
        const response = await fetch('/api/upgrade', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await response.json();
        score = data.score; 
        clickMultiplier = data.clickMultiplier; 
        clickUpgradeCost = data.clickUpgradeCost; 
        updateScoreDisplay();
        updateUpgradeButtonText();
    } else {
        alert('Недостаточно очков для улучшения!');
    }
});

// Открытие модального окна
document.getElementById('openUpgradeButton').onclick = () => {
    document.getElementById('upgradeModal').style.display = 'block'; 
}

// Закрытие модального окна
document.getElementById('closeModal').onclick = () => {
    document.getElementById('upgradeModal').style.display = 'none'; 
}

// Закрытие модального окна при клике вне его
window.onclick = (event) => {
    if (event.target === document.getElementById('upgradeModal')) {
        document.getElementById('upgradeModal').style.display = 'none'; 
    }
}

// Функция для активации автокликера
document.getElementById('autoClickerButton').onclick = () => {
    if (!autoClickerActive) {
        if (score >= autoClickerCost) {
            score -= autoClickerCost; // Снимаем стоимость автокликера
            updateScoreDisplay();
            autoClickerActive = true; // Делаем автокликер активным
            updateAutoClickerStatus();
            localStorage.setItem('autoClickerActive', 'true'); // Сохраняем статус автокликера
            localStorage.setItem('autoClickerStart', Date.now()); // Сохраняем время начала
            startAutoClicker(); // Запускаем автокликер
        } else {
            alert('Недостаточно очков для покупки автокликера!');
        }
    }
};

// Функция для запуска автокликера
const startAutoClicker = () => {
    autoClickerInterval = setInterval(() => {
        score += clickMultiplier; // Увеличиваем счет за каждую итерацию
        updateScoreDisplay();
        
        // Увеличиваем время работы автокликера
        autoClickerDuration += 1000;
        localStorage.setItem('autoClickerDuration', autoClickerDuration); // Сохраняем текущую длительность

        // Проверяем время
        if (autoClickerDuration >= maxOfflineTime) {
            clearInterval(autoClickerInterval);
            autoClickerActive = false;
            localStorage.setItem('autoClickerActive', 'false'); // Сохраняем статус
            updateAutoClickerStatus();
        }
    }, 1000); // Каждую секунду
};

// Восстанавливаем состояние при перезагрузке
window.onload = () => {
    score = parseInt(localStorage.getItem('score')) || 0;
    clickMultiplier = parseInt(localStorage.getItem('clickMultiplier')) || 1;
    autoClickerActive = localStorage.getItem('autoClickerActive') === 'true';
    autoClickerDuration = parseInt(localStorage.getItem('autoClickerDuration')) || 0;
    updateScoreDisplay();
    updateUpgradeButtonText();

    if (autoClickerActive) {
        const lastClickTime = parseInt(localStorage.getItem('autoClickerStart')) || Date.now();
        const elapsedTime = Date.now() - lastClickTime;
        
        // Если прошло меньше 3 часов, добавим очки к счету
        if (elapsedTime < maxOfflineTime) {
            const earnedClicks = Math.floor(elapsedTime / 1000) * clickMultiplier; // Количество кликов
            score += earnedClicks; // Добавляем к счету
            localStorage.setItem('score', score); // Сохраняем новый счет
        }

        startAutoClicker(); // Запускаем автокликер, если он активен
        updateAutoClickerStatus();
    }
};
