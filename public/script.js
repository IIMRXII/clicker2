let score = 0;
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let autoClickerCost = 500; // Стоимость автокликера
let userId = localStorage.getItem('userId') || null;
let autoClickerActive = false;
let autoClickerInterval;
let offlineClicks = 0; // Количество кликов во время оффлайна
let lastClickTime = localStorage.getItem('lastClickTime') ? new Date(localStorage.getItem('lastClickTime')) : new Date();
const maxOfflineTime = 3 * 60 * 60 * 1000; // Максимальное время в оффлайне

if (!userId) {
    userId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none'; 
    loadUserData(); 
    handleOfflineClicks(); // Обрабатываем оффлайн клики при загрузке
});

// Загружаем данные пользователя
const loadUserData = async () => {
    try {
        const response = await fetch(`/api/user/${userId}`);
        if (!response.ok) throw new Error('Ошибка при загрузке данных пользователя');
        
        const data = await response.json();
        score = data.score;
        clickMultiplier = data.clickMultiplier;
        clickUpgradeCost = data.clickUpgradeCost;
        
        updateScoreDisplay();
        updateUpgradeButtonText();
        updateAutoClickerStatus();
    } catch (error) {
        console.error(error);
    }
};

const handleOfflineClicks = () => {
    const currentTime = new Date();
    const timeDiff = currentTime - new Date(lastClickTime);
    const secondsOffline = Math.floor(timeDiff / 1000);

    if (secondsOffline > 0 && secondsOffline <= maxOfflineTime / 1000) {
        offlineClicks += secondsOffline * clickMultiplier; // Считаем количество кликов
        score += offlineClicks; // Учитываем оффлайн клики в общем счете
        localStorage.setItem('offlineClicks', offlineClicks); // Сохраняем оффлайн клики
        updateScoreDisplay(); // Обновляем отображение счета
        alert(`Вы получили ${offlineClicks} очков за оффлайн время!`);
    }

    lastClickTime = currentTime; // Обновляем время последнего клика
    localStorage.setItem('lastClickTime', lastClickTime); // Сохраняем его
};

const updateScoreDisplay = () => {
    document.getElementById('scoreDisplay').innerText = `Счет: ${score}`;
};

const updateUpgradeButtonText = () => {
    document.getElementById('clickUpgradeButton').innerText = `Улучшить клики (${clickUpgradeCost} очков)`;
    document.getElementById('autoClickerButton').innerText = `Купить автокликер (${autoClickerCost} очков)`;
};

const updateAutoClickerStatus = () => {
    const status = autoClickerActive ? 'Автокликер активен' : 'Автокликер неактивен';
    document.getElementById('autoClickerStatus').innerText = status;
};

document.getElementById('clickButton').addEventListener('click', async () => {
    try {
        const response = await fetch('/api/click', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ userId })
        });

        if (!response.ok) throw new Error('Ошибка при выполнении запроса на клик');
        
        const data = await response.json();
        score = data.score; 
        updateScoreDisplay();
        lastClickTime = new Date(); // Обновляем время последнего клика
        localStorage.setItem('lastClickTime', lastClickTime);
    } catch (error) {
        console.error(error);
    }
});

document.getElementById('clickUpgradeButton').addEventListener('click', async () => {
    if (score >= clickUpgradeCost) {
        try {
            const response = await fetch('/api/upgrade', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ userId })
            });

            if (!response.ok) throw new Error('Ошибка при выполнении запроса на улучшение');
            
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

document.getElementById('autoClickerButton').addEventListener('click', async () => {
    if (score >= autoClickerCost) {
        try {
            score -= autoClickerCost; 
            autoClickerActive = true; // Активируем автокликер
            updateScoreDisplay();
            updateAutoClickerStatus();
        
            // Запускаем автокликер
            autoClickerInterval = setInterval(() => {
                score += clickMultiplier; // Увеличиваем счёт
                updateScoreDisplay();
            }, 1000);
        } catch (error) {
            console.error(error);
        }
    }
});
