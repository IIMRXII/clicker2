let score = 0;
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let userId = localStorage.getItem('userId') || null; 
let autoClickerActive = false;
let autoClickerInterval; 
let autoClickerDuration = parseInt(localStorage.getItem('autoClickerDuration')) || 0; 
const maxOfflineTime = 3 * 60 * 60 * 1000; 

if (!userId) {
    userId = Math.random().toString(36).substr(2, 9); 
    localStorage.setItem('userId', userId);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none'; 
    loadUserData(); // Загрузка данных пользователя
});

// Функция для загрузки данных пользователя
const loadUserData = async () => {
    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке данных пользователя');
        }
        const data = await response.json();
        score = data.score;
        clickMultiplier = data.clickMultiplier;
        clickUpgradeCost = data.clickUpgradeCost;
        autoClickerDuration = data.autoClickerDuration || 0;
        updateScoreDisplay();
        updateUpgradeButtonText(); 
        updateAutoClickerStatus(); 

        if (autoClickerActive) {
            startAutoClicker();
        } else {
            // Проверяем, нужно ли выполнить автоклики за офлайн-время
            handleOfflineClicks();
        }
    } catch (error) {
        console.error(error);
    }
};

const handleOfflineClicks = () => {
    const offlineTime = Date.now() - (localStorage.getItem('lastOnlineTimestamp') || Date.now());
    if (offlineTime > 0 && offlineTime <= maxOfflineTime) {
        const clicks = Math.floor(offlineTime / 1000) * clickMultiplier; // 1 клик за секунду
        score += clicks; // Увеличиваем счет
        localStorage.setItem('lastOfflineClicks', clicks); // Сохраняем количество кликов в локальном хранилище
        updateScoreDisplay();
        alert(`Вы получили ${clicks} очков за оффлайн время!`);
    }
};

const updateScoreDisplay = () => {
    document.getElementById('scoreDisplay').innerText = `Счет: ${score}`;
};

const updateUpgradeButtonText = () => {
    document.getElementById('clickUpgradeButton').innerText = `Улучшить клики (${clickUpgradeCost} очков)`;
};

const updateAutoClickerStatus = () => {
    const status = autoClickerActive ? 'Автокликер активен' : 'Автокликер неактивен';
    document.getElementById('autoClickerStatus').innerText = status;
    document.getElementById('autoClickerTime').innerText = `Автокликер будет активен в оффлайн-режиме: ${formatTime(maxOfflineTime - autoClickerDuration)}`;
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
    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error('Ошибка при выполнении запроса на клик');
        }

        const data = await response.json();
        score = data.score; 
        localStorage.setItem('lastOnlineTimestamp', Date.now()); // Обновляем время последнего подключения
        updateScoreDisplay();
    } catch (error) {
        console.error(error);
    }
});

// Обработчик улучшений
document.getElementById('clickUpgradeButton').addEventListener('click', async () => {
    if (score >= clickUpgradeCost) {
        try {
            const response = await fetch('/api/upgrade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId })
            });

            if (!response.ok) {
                throw new Error('Ошибка при выполнении запроса на улучшение');
            }

            const data = await response.json();
            score = data.score; 
            clickMultiplier = data.clickMultiplier; 
            clickUpgradeCost = data.clickUpgradeCost; 
            updateScoreDisplay(); 
            updateUpgradeButtonText(); 
        } catch (error) {
            console.error(error);
        }
    }
});

// Функция, чтобы стартовать автокликер
const startAutoClicker = () => {
    if (autoClickerInterval) return; // Если уже работает автокликер, ничего не делаем
    autoClickerActive = true;
    autoClickerInterval = setInterval(() => {
        score += clickMultiplier; // Увеличиваем счет на значение множителя
        autoClickerDuration += 1000; // Увеличиваем длительность автокликера
        updateScoreDisplay();
        updateAutoClickerStatus();
        
        if (autoClickerDuration >= maxOfflineTime) { // Если превысили время, останавливаем автокликер
            stopAutoClicker();
        }
    }, 1000); // Каждую секунду добавляем очки
};

const stopAutoClicker = () => {
    clearInterval(autoClickerInterval);
    autoClickerInterval = null;
    autoClickerActive = false;
    localStorage.setItem('autoClickerDuration', autoClickerDuration); // Сохраняем длительность автокликера
    updateAutoClickerStatus();
};

// Кнопка для активации автокликера
document.getElementById('autoClickerButton').addEventListener('click', () => {
    if (!autoClickerActive) {
        startAutoClicker(); // Запускаем автокликер
    }
});
