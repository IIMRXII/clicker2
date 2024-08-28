let score = 0;
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let autoClickerCost = 500; // Стоимость автокликера
let userId = localStorage.getItem('userId') || null;
let autoClickerActive = false;
let autoClickerInterval;
let autoClickerDuration = parseInt(localStorage.getItem('autoClickerDuration')) || 0;
const maxOfflineTime = 3 * 60 * 60 * 1000;

// Генерируем userId, если его нет
if (!userId) {
    userId = Math.random().toString(36).substr(2, 9); // Генерация случайного userId
    localStorage.setItem('userId', userId); // Сохраняем его
}

// Убедимся, что модальное окно скрыто
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none'; // Скрыть меню при загрузке
    loadUserData(); // Загружаем данные пользователя
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
        updateScoreDisplay();
        updateUpgradeButtonText(); // Обновляем текст кнопки улучшений
        updateAutoClickerStatus(); // Обновляем статус автокликера
    } catch (error) {
        console.error(error);
    }
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
    document.getElementById('autoClickerTime').innerText = `Автокликер будет активен в оффлайн-режиме: ${formatTime(maxOfflineTime - autoClickerDuration)}`;
    document.getElementById('autoClickerButton').disabled = autoClickerActive || score < autoClickerCost; // Делаем кнопку неактивной если недостаточно очков
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
            body: JSON.stringify({ userId }) // Отправляем userId серверу
        });

        if (!response.ok) {
            throw new Error('Ошибка при выполнении запроса на клик');
        }

        const data = await response.json();
        score = data.score; // Обновляем счет
        updateScoreDisplay();
        updateAutoClickerStatus(); // Обновляем статус автокликера

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
                body: JSON.stringify({ userId }) // Отправляем userId серверу
            });

            if (!response.ok) {
                throw new Error('Ошибка при выполнении запроса на улучшение');
            }

            const data = await response.json();
            score = data.score; // Обновляем счет
            clickMultiplier = data.clickMultiplier; // Обновляем множитель кликов
            clickUpgradeCost = data.clickUpgradeCost; // Обновляем стоимость улучшения
            updateScoreDisplay(); // Обновляем отображение счета
            updateUpgradeButtonText(); // Обновляем текст кнопки после улучшения
        } catch (error) {
            console.error(error);
        }
    } else {
        alert('Недостаточно очков для улучшения!');
    }
});

// Обработчик покупки автокликера
document.getElementById('autoClickerButton').addEventListener('click', () => {
    if (score >= autoClickerCost) {
        score -= autoClickerCost; // Вычитаем стоимость автокликера
        autoClickerActive = true; // Активируем автокликер
        startAutoClicker(); // Запускаем автокликер
        updateScoreDisplay(); // Обновляем отображение счета
        updateAutoClickerStatus(); // Обновляем статус автокликера
    } else {
        alert('Недостаточно очков для покупки автокликера!');
    }
});

// Функция, чтобы стартовать автокликер
const startAutoClicker = () => {
    autoClickerInterval = setInterval(() => {
        score += clickMultiplier; // Увеличиваем счет на значение множителя
        updateScoreDisplay();
    }, 1000); // Каждую секунду добавляем очки
};

// Функция для открытия модального окна
document.getElementById('openUpgradeButton').onclick = () => {
    document.getElementById('upgradeModal').style.display = 'block'; 
};

// Закрытие модального окна
document.getElementById('closeModal').onclick = () => {
    document.getElementById('upgradeModal').style.display = 'none'; 
};

// Закрытие модального окна при клике вне его
window.onclick = (event) => {
    if (event.target === document.getElementById('upgradeModal')) {
        document.getElementById('upgradeModal').style.display = 'none'; 
    }
};
