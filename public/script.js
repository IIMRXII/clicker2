let score = parseInt(localStorage.getItem('score')) || 0; // Получаем счёт из localStorage или 0
let clickMultiplier = 1;
let clickUpgradeCost = 100;
let autoClickerCost = 500; // Стоимость автокликера
let userId = localStorage.getItem('userId') || null; 
let autoClickerActive = false;
let autoClickerInterval; // Интервал для автокликера

// Генерируем userId, если его нет
if (!userId) {
    userId = Math.random().toString(36).substr(2, 9);
    localStorage.setItem('userId', userId);
}

// Убедимся, что модальное окно скрыто
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('upgradeModal').style.display = 'none';
    loadUserData(); // Загружаем данные пользователя
});

// Функция для загрузки данных пользователя
const loadUserData = async () => {
    const response = await fetch(`/api/user/${userId}`);
    if (response.ok) {
        const data = await response.json();
        score = Math.max(score, data.score);
        clickMultiplier = data.clickMultiplier;
        clickUpgradeCost = data.clickUpgradeCost; 
        
        updateScoreDisplay();
        updateUpgradeButtonText();
        updateAutoClickerStatus();
    }
};

const updateScoreDisplay = () => {
    document.getElementById('scoreDisplay').innerText = `Счет: ${score}`;
    localStorage.setItem('score', score); // Сохраняем счет в localStorage
};

const updateUpgradeButtonText = () => {
    document.getElementById('clickUpgradeButton').innerText = `Улучшить клики (${clickUpgradeCost} очков)`;
};

const updateAutoClickerStatus = () => {
    const status = autoClickerActive ? 'Автокликер активен' : 'Автокликер неактивен';
    document.getElementById('autoClickerStatus').innerText = status;
    document.getElementById('autoClickerButton').disabled = autoClickerActive; // Делаем кнопку неактивной после покупки
};

// Обработчик клика по кнопке
document.getElementById('clickButton').addEventListener('click', async () => {
    const response = await fetch('/api/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    
    const data = await response.json();
    score = data.score; // Обновляем счет

    // Анимация счётчика
    const scoreDisplay = document.getElementById('scoreDisplay');
    scoreDisplay.classList.add('updated'); // Добавляем класс для анимации
    updateScoreDisplay(); // Обновляем отображение счёта

    // Убираем класс через 1000 мс
    setTimeout(() => {
        scoreDisplay.classList.remove('updated');
    }, 1000);
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
        score = data.score; // Обновляем счет
        clickMultiplier = data.clickMultiplier; // Обновляем множитель кликов
        clickUpgradeCost = data.clickUpgradeCost; // Обновляем стоимость улучшения

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
    }, 1000); // Каждую секунду
};

// Восстановление состояния при перезагрузке
window.onload = () => {
    score = parseInt(localStorage.getItem('score')) || 0;
    clickMultiplier = parseInt(localStorage.getItem('clickMultiplier')) || 1;
    autoClickerActive = localStorage.getItem('autoClickerActive') === 'true';
    
    updateScoreDisplay();
    updateUpgradeButtonText();
    
    if (autoClickerActive) {
        startAutoClicker(); // Запускаем автокликер, если он активен
        updateAutoClickerStatus();
    }
};