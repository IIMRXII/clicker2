document.addEventListener('DOMContentLoaded', () => {
    const registerButton = document.getElementById('register-button');
    const loginButton = document.getElementById('login-button');
    const clickButton = document.getElementById('click-button');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const clickArea = document.getElementById('click-area');
    const greeting = document.getElementById('greeting');
    const scoreText = document.getElementById('score');
    const adminArea = document.getElementById('admin-area');
    const userTableBody = document.getElementById('user-table-body');

    let userId;
    let isAdmin = false;

    // Регистрация
    registerButton.addEventListener('click', async () => {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',},
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            }),
        });

        if (response.ok) {
            alert('Пользователь зарегистрирован!');
        } else {
            alert('Ошибка при регистрации: ' + await response.text());
        }
    });

    // Авторизация
    loginButton.addEventListener('click', async () => {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: usernameInput.value,
                password: passwordInput.value
            }),
        });

        if (response.ok) {
            const user = await response.json();
            userId = user._id;
            isAdmin = user.isAdmin;
            clickArea.style.display = 'block';
            greeting.innerText = `Привет, ${usernameInput.value}!`;
            alert('Успешная авторизация!');

            // Если пользователь администратор, показываем пользователей
            if (isAdmin) {
                adminArea.style.display = 'block'; // Показываем область администратора
                fetchUsers(); // Загружаем пользователей
            }
        } else {
            alert('Ошибка при авторизации: ' + await response.text());
        }
    });

    // Загрузка данных пользователей (для администраторов)
    async function fetchUsers() {
        const response = await fetch('/api/admin/users');
        if (response.ok) {
            const users = await response.json();
            populateUserTable(users); // Заполняем таблицу пользователей
        } else {
            alert('Ошибка при получении данных пользователей!');
        }
    }

    // Заполнение таблицы пользователей
    function populateUserTable(users) {
        userTableBody.innerHTML = ''; // Очищаем таблицу
        users.forEach(user => {
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            const usernameCell = document.createElement('td');
            const scoreCell = document.createElement('td');
            const roleCell = document.createElement('td');
            const actionCell = document.createElement('td'); // Новая ячейка для действий

            idCell.innerText = user._id;
            usernameCell.innerText = user.username;
            scoreCell.innerText = user.score;
            roleCell.innerText = user.isAdmin ? 'Администратор' : 'Пользователь';

            // Создаем кнопку для редактирования
            const editButton = document.createElement('button');
            editButton.innerText = 'Редактировать';
            editButton.addEventListener('click', () => {
                document.getElementById('edit-user-id').value = user._id; // Заполняем ID пользователя
                document.getElementById('edit-score').value = user.score; // Заполняем текущий счет
                document.getElementById('edit-user').style.display = 'block'; // Показываем форму редактирования
            });

            actionCell.appendChild(editButton); // Добавляем кнопку редактирования в ячейку
            row.appendChild(idCell);
            row.appendChild(usernameCell);
            row.appendChild(scoreCell);
            row.appendChild(roleCell);
            row.appendChild(actionCell); // Добавляем ячейку действий
            userTableBody.appendChild(row);
        });
    }

    // Обновление счета
    const updateButton = document.getElementById('update-button');
    updateButton.addEventListener('click', async () => {
        const userId = document.getElementById('edit-user-id').value;
        const newScore = document.getElementById('edit-score').value;

        const response = await fetch(`/api/admin/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',},
            body: JSON.stringify({ score: newScore })
        });

        if (response.ok) {
            alert('Счет обновлён!');
            fetchUsers(); // Перезагружаем пользователей, чтобы обновить данные
            document.getElementById('edit-user').style.display = 'none'; // Скрываем форму редактирования
        } else {
            alert('Ошибка при обновлении счета: ' + await response.text());
        }
    });

    // Клик
    clickButton.addEventListener('click', async () => {
        const response = await fetch('/api/click/click', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: userId,
            }),
        });

        if (response.ok) {
            await updateScore();
        } else {
            alert('Ошибка при клике!');
        }
    });

    // Обновление счета
    async function updateScore() {
        const response = await fetch(`/api/click/${userId}`);
        const data = await response.json();
        scoreText.innerText = `Твой счет: ${data.score}`;
    }
});