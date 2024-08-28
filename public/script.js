let score = 0;
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let userId = localStorage.getItem('userId') || null; // Получаем userId из localStorage
let autoClickerActive = false;
let autoClickerInterval; // Интервал для автокликера
let autoClickerDuration = parseInt(localStorage.getItem('autoClickerDuration')) || 0; // Время работы автокликера из localStorage
const maxOfflineTime = 3 * 60 * 60 * 1000; // 3 часа в миллисекундах

// Генерируем userId, если его нет
if (!userId) {
    userId = Math.random().toString(36).substr(2, 9); // Генерация случайного userId
    localStorage.setItem('userId', userId); // Сохраняем его
}

// Убедимся, что модальное окно скрыто
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none'; // Скрыть меню при загрузке
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

        // Проверяем, активен ли автокликер
        if (autoClickerActive) {
            startAutoClicker();
        }
    } catch (error) {
        console.error(error);
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
    document.getElementById('autoClickerButton').disabled = autoClickerActive; // Делаем кнопку неактивной после покупки
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
            updateScoreDisplay();
            updateUpgradeButtonText(); // Обновляем текст кнопки после улучшения
            document.getElementById('upgradeMessage').innerText = 'Улучшение успешно!';
        } catch (error) {
            console.error(error);
            document.getElementById('upgradeMessage').innerText = 'Ошибка при улучшении!';
        }
    } else {
        document.getElementById('upgradeMessage').innerText = 'Недостаточно очков для улучшения!';
    }
});

// Открытие модального окна
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

// Определите функцию для автокликера
const startAutoClicker = () => {
    autoClickerInterval = setInterval(() => {
        score += clickMultiplier; // Добавляем очки в зависимости от множителя
        updateScoreDisplay();
    }, 1000); // Интервал автокликера (например, 1 секунда)
};

// Загружаем данные пользователя при загрузке страницы
loadUserData();
