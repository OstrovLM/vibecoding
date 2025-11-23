// Игровая логика
class Game {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 20;
        this.gameActive = false;
        this.currentTech = null;
        this.techInterval = null;
        this.timerInterval = null;
        this.isAcidTheme = false;
        this.commentTimeout = null;
        this.leaderboard = this.loadLeaderboard();
        
        // Списки увлечений
        this.femaleInterests = [
            'Дэн', 'театр', 'вокал', 'Бэбэ', 'джимник', 
            'инглиш мазафака ду ю спик ит?!', 'а яблочный спас', 
            'Леди Гага', 'сырные шарики', 'любовь и голуби'
        ];
        
        this.maleInterests = [
            'рыбалка', 'кулинария', 'Лада', 'дрон', 'сиденье унитаза', 
            'шоколад', 'пряники со сгущенкой', 'фотоаппарат', 
            'газон', 'предлог "за"', 'худи', 'красная шапка'
        ];
        
        // Общие слова (можно нажимать обе кнопки одновременно)
        this.commonWords = [
            'Камчатка', 'Дагестан', 'Карелия', 'Териберка', 'Байкал', 'гранат'
        ];
        
        // Запрещенные слова
        this.forbiddenWords = [
            'мариванна', 'белый', 'шишка', 'марка', 'ганджубас', 'косячок'
        ];
        
        this.allInterests = [...this.femaleInterests, ...this.maleInterests, ...this.commonWords];
        this.gameOver = false;
        this.commonWordButtonsPressed = new Set(); // Для отслеживания нажатий на общие слова
        this.commonWordTimeout = null;
        this.forbiddenWordTimer = null; // Таймер для запрещенных слов
        this.waitingForChoice = false; // Ожидание выбора перед показом следующего
        this.shownWords = new Set(); // Отслеживание показанных слов
        this.availableWords = [...this.allInterests, ...this.forbiddenWords]; // Все доступные слова
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.loadTheme();
        this.showWelcomeScreen();
    }
    
    loadTheme() {
        const savedTheme = localStorage.getItem('gameTheme');
        if (savedTheme === 'acid') {
            this.isAcidTheme = true;
            document.body.classList.add('acid-theme');
            document.getElementById('theme-btn').textContent = '🌞';
        }
    }
    
    bindEvents() {
        // Кнопка старта игры (показывает игровой экран)
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.showGameScreen();
        });
        
        // Кнопка "Поехали!" (начинает игру)
        document.getElementById('start-ready-btn').addEventListener('click', () => {
            this.startReadyGame();
        });
        
        // Переключатель темы
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Кнопки действий
        document.getElementById('lada-btn').addEventListener('click', () => {
            this.makeChoice('female');
        });
        
        document.getElementById('denis-btn').addEventListener('click', () => {
            this.makeChoice('male');
        });
        
        // Кнопка "Осуждаем!"
        document.getElementById('judge-btn').addEventListener('click', () => {
            this.makeChoice('judge');
        });
        
        // Кнопки результатов
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('back-to-menu-btn').addEventListener('click', () => {
            this.showWelcomeScreen();
        });
    }
    
    showWelcomeScreen() {
        document.getElementById('welcome-screen').classList.add('active');
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('result-screen').classList.remove('active');
    }
    
    showGameScreen() {
        // Показать игровой экран
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('result-screen').classList.remove('active');
        
        // Показать кнопку "Поехали!" и скрыть badge
        document.getElementById('start-ready-btn-container').style.display = 'block';
        document.getElementById('tech-badge').style.display = 'none';
        
        // Скрыть сообщение о проигрыше если оно было показано
        document.getElementById('game-over-message').style.display = 'none';
        document.getElementById('game-over-image').style.display = 'none';
        
        // Показать таблицу лидеров (на случай если она была скрыта после проигрыша)
        const leaderboard = document.querySelector('.leaderboard');
        if (leaderboard) {
            leaderboard.style.display = 'block';
        }
        
        // Сбросить состояние
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 20;
        this.gameActive = false;
        this.gameOver = false;
        this.currentTech = null;
        this.shownWords.clear(); // Сбросить список показанных слов
        
        // Остановить все интервалы если они есть
        if (this.techInterval) {
            clearInterval(this.techInterval);
            this.techInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.forbiddenWordTimer) {
            clearTimeout(this.forbiddenWordTimer);
            this.forbiddenWordTimer = null;
        }
        if (this.commonWordTimeout) {
            clearTimeout(this.commonWordTimeout);
            this.commonWordTimeout = null;
        }
        
        // Обновить UI
        this.updateScore();
        this.updateTimer();
        this.updateCombo();
        
        // Показать инструкции
        document.getElementById('instruction-text').textContent = 'Нажмите "Поехали!" чтобы начать!';
    }
    
    startReadyGame() {
        // Остановить все интервалы если они есть
        if (this.techInterval) {
            clearInterval(this.techInterval);
            this.techInterval = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 20;
        this.gameActive = true;
        this.gameOver = false;
        this.currentTech = null;
        this.shownWords.clear(); // Сбросить список показанных слов
        
        // Скрыть кнопку "Поехали!" и показать badge
        document.getElementById('start-ready-btn-container').style.display = 'none';
        document.getElementById('tech-badge').style.display = 'flex';
        
        // Обновить UI
        this.updateScore();
        this.updateTimer();
        this.updateCombo();
        
        // Сбросить badge
        document.getElementById('tech-text').textContent = 'Готов?';
        document.getElementById('tech-badge').classList.remove('forbidden', 'premium');
        
        // Начать показ увлечений
        this.startTechDisplay();
        
        // Запустить таймер
        this.startTimer();
        
        // Показать инструкции
        document.getElementById('instruction-text').textContent = 'Выберите правильное увлечение!';
        
        // Показать таблицу лидеров
        const leaderboard = document.querySelector('.leaderboard');
        if (leaderboard) {
            leaderboard.style.display = 'block';
        }
    }
    
    startGame() {
        // Алиас для совместимости
        this.showGameScreen();
    }
    
    startTechDisplay() {
        // Очистить предыдущий интервал если есть
        if (this.techInterval) {
            clearInterval(this.techInterval);
        }
        
        // Показать первое увлечение сразу
        this.showRandomInterest();
        
        // НЕ запускаем автоматический интервал - увлечения будут меняться только после выбора
    }
    
    showRandomInterest() {
        const techBadge = document.getElementById('tech-badge');
        const techText = document.getElementById('tech-text');
        
        // Очистить таймер запрещенного слова если есть
        if (this.forbiddenWordTimer) {
            clearTimeout(this.forbiddenWordTimer);
            this.forbiddenWordTimer = null;
        }
        
        // Получить доступные слова (не показанные ранее)
        const availableForbidden = this.forbiddenWords.filter(word => !this.shownWords.has(word));
        const availableInterests = this.allInterests.filter(word => !this.shownWords.has(word));
        
        // Если все слова показаны, сбросить список
        if (availableForbidden.length === 0 && availableInterests.length === 0) {
            this.shownWords.clear();
            availableForbidden.push(...this.forbiddenWords);
            availableInterests.push(...this.allInterests);
        }
        
        // 15% шанс на запрещенное слово (если есть доступные)
        if (availableForbidden.length > 0 && Math.random() < 0.15) {
            const randomIndex = Math.floor(Math.random() * availableForbidden.length);
            this.currentTech = availableForbidden[randomIndex];
            this.shownWords.add(this.currentTech);
            techBadge.classList.add('forbidden');
            techBadge.classList.remove('premium');
            
            // Запустить таймер на 3 секунды для запрещенного слова
            this.forbiddenWordTimer = setTimeout(() => {
                if (this.gameActive && !this.gameOver && this.currentTech && 
                    this.forbiddenWords.includes(this.currentTech.toLowerCase())) {
                    // Время вышло - проигрыш
                    this.gameOver = true;
                    this.endGameWithLoss();
                }
            }, 3000);
        } else if (availableInterests.length > 0) {
            // Показываем обычное увлечение (случайное, но не показанное ранее)
            const randomIndex = Math.floor(Math.random() * availableInterests.length);
            this.currentTech = availableInterests[randomIndex];
            this.shownWords.add(this.currentTech);
            techBadge.classList.remove('forbidden');
            techBadge.classList.remove('premium');
        } else {
            // Если нет доступных слов, показать случайное
            this.currentTech = this.allInterests[Math.floor(Math.random() * this.allInterests.length)];
            techBadge.classList.remove('forbidden');
            techBadge.classList.remove('premium');
        }
        
        techText.textContent = this.currentTech;
        this.waitingForChoice = true; // Теперь ждем выбора
        
        // Анимация появления
        techBadge.style.animation = 'none';
        setTimeout(() => {
            techBadge.style.animation = 'techAppear 0.5s ease-out';
        }, 10);
    }
    
    makeChoice(choice) {
        if (!this.gameActive || !this.currentTech || this.gameOver) return;
        
        const ladaBtn = document.getElementById('lada-btn');
        const denisBtn = document.getElementById('denis-btn');
        const judgeBtn = document.getElementById('judge-btn');
        
        const isForbidden = this.forbiddenWords.includes(this.currentTech.toLowerCase());
        const isFemale = this.femaleInterests.includes(this.currentTech);
        const isMale = this.maleInterests.includes(this.currentTech);
        const isCommon = this.commonWords.includes(this.currentTech);
        
        let isCorrect = false;
        let points = 0;
        let shouldGameOver = false;
        
        // Проверка на запрещенные слова
        if (isForbidden) {
            // Очистить таймер запрещенного слова
            if (this.forbiddenWordTimer) {
                clearTimeout(this.forbiddenWordTimer);
                this.forbiddenWordTimer = null;
            }
            
            if (choice === 'judge') {
                // Правильно нажали "Осуждаем!"
                isCorrect = true;
                points = 20; // Бонус за правильное осуждение
                this.combo += 1;
                // Показать следующее слово после правильного осуждения
                this.waitingForChoice = false;
                setTimeout(() => {
                    if (this.gameActive && !this.gameOver) {
                        this.showRandomInterest();
                    }
                }, 500);
            } else {
                // Неправильно - сразу проигрыш
                shouldGameOver = true;
                isCorrect = false;
            }
        } else if (isCommon) {
            // Общие слова - можно нажимать обе кнопки одновременно
            if (choice === 'female' || choice === 'male') {
                this.commonWordButtonsPressed.add(choice);
                
                // Проверяем, нажаты ли обе кнопки в течение 0.5 секунды
                if (this.commonWordButtonsPressed.has('female') && this.commonWordButtonsPressed.has('male')) {
                    // Обе кнопки нажаты - двойной бонус!
                    isCorrect = true;
                    points = (10 + (this.combo * 5)) * 2; // Двойной бонус
                    this.combo += 1;
                    
                    // Сбросить состояние
                    this.commonWordButtonsPressed.clear();
                    if (this.commonWordTimeout) {
                        clearTimeout(this.commonWordTimeout);
                        this.commonWordTimeout = null;
                    }
                } else {
                    // Только одна кнопка - ждем вторую
                    isCorrect = true;
                    points = 10 + (this.combo * 5); // Обычный бонус
                    this.combo += 1;
                    
                    // Установить таймаут для сброса
                    if (this.commonWordTimeout) {
                        clearTimeout(this.commonWordTimeout);
                    }
                    this.commonWordTimeout = setTimeout(() => {
                        this.commonWordButtonsPressed.clear();
                    }, 500);
                }
            } else if (choice === 'judge') {
                // Нажали "Осуждаем!" на общее слово - штраф
                isCorrect = false;
                this.score = Math.max(0, this.score - 10);
                this.combo = 0;
                this.commonWordButtonsPressed.clear();
                // Показать следующее слово после штрафа
                this.waitingForChoice = false;
                setTimeout(() => {
                    if (this.gameActive && !this.gameOver) {
                        this.showRandomInterest();
                    }
                }, 500);
            }
        } else {
            // Обычные увлечения
            this.commonWordButtonsPressed.clear(); // Сбросить для обычных слов
            if ((choice === 'female' && isFemale) || (choice === 'male' && isMale)) {
                isCorrect = true;
                points = 10 + (this.combo * 5);
                this.combo += 1;
            } else if (choice === 'judge') {
                // Нажали "Осуждаем!" на обычное увлечение - штраф
                isCorrect = false;
                this.score = Math.max(0, this.score - 10);
                this.combo = 0;
            } else {
                // Неправильный выбор
                isCorrect = false;
                this.combo = 0;
                this.score = Math.max(0, this.score - 5);
            }
        }
        
        // Унифицированная визуальная обратная связь
        if (isCorrect) {
            // Правильный ответ
            if (isCommon && this.commonWordButtonsPressed.has('female') && this.commonWordButtonsPressed.has('male')) {
                // Обе кнопки для общих слов
                ladaBtn.classList.add('correct');
                denisBtn.classList.add('correct');
                setTimeout(() => {
                    ladaBtn.classList.remove('correct');
                    denisBtn.classList.remove('correct');
                }, 300);
            } else if (choice === 'female') {
                ladaBtn.classList.add('correct');
                setTimeout(() => ladaBtn.classList.remove('correct'), 300);
            } else if (choice === 'male') {
                denisBtn.classList.add('correct');
                setTimeout(() => denisBtn.classList.remove('correct'), 300);
            } else if (choice === 'judge') {
                judgeBtn.classList.add('correct');
                setTimeout(() => judgeBtn.classList.remove('correct'), 300);
            }
            this.vibrate([50]);
        } else {
            // Неправильный ответ
            if (choice === 'female') {
                ladaBtn.classList.add('wrong');
                setTimeout(() => ladaBtn.classList.remove('wrong'), 300);
            } else if (choice === 'male') {
                denisBtn.classList.add('wrong');
                setTimeout(() => denisBtn.classList.remove('wrong'), 300);
            } else if (choice === 'judge') {
                judgeBtn.classList.add('wrong');
                setTimeout(() => judgeBtn.classList.remove('wrong'), 300);
            }
            this.vibrate([200, 100, 200]);
        }
        
        if (isCorrect) {
            this.score += points;
            this.updateScore();
            this.updateCombo();
        } else {
            this.updateScore();
        }
        
        // Проверка на проигрыш
        if (shouldGameOver) {
            this.gameOver = true;
            this.endGameWithLoss();
            return;
        }
        
        // Показать следующее увлечение после выбора
        // Для общих слов: если нажата только одна кнопка, не показываем следующее сразу (ждем вторую)
        // Если обе кнопки нажаты или это не общее слово - показываем следующее
        const bothButtonsPressed = isCommon && this.commonWordButtonsPressed.has('female') && this.commonWordButtonsPressed.has('male');
        const shouldShowNext = !isCommon || bothButtonsPressed || (isCommon && choice === 'judge');
        
        if (shouldShowNext) {
            // Показать следующее слово
            this.waitingForChoice = false;
            setTimeout(() => {
                if (this.gameActive && !this.gameOver) {
                    this.showRandomInterest();
                }
            }, 500); // Небольшая задержка для визуальной обратной связи
        } else if (isCommon && !bothButtonsPressed) {
            // Для общих слов с одной кнопкой - установить таймаут для показа следующего слова
            if (this.commonWordTimeout) {
                clearTimeout(this.commonWordTimeout);
            }
            this.commonWordTimeout = setTimeout(() => {
                this.commonWordButtonsPressed.clear();
                // Показать следующее слово после таймаута ожидания второй кнопки
                if (this.gameActive && !this.gameOver) {
                    this.waitingForChoice = false;
                    setTimeout(() => {
                        if (this.gameActive && !this.gameOver) {
                            this.showRandomInterest();
                        }
                    }, 100);
                }
            }, 500);
        }
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.gameActive) {
                this.timeLeft--;
                this.updateTimer();
                
                if (this.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateTimer() {
        document.getElementById('timer').textContent = this.timeLeft;
        
        // Изменение цвета таймера при приближении к концу
        const timerElement = document.getElementById('timer');
        if (this.timeLeft <= 3) {
            timerElement.style.color = '#ff6b6b';
            timerElement.style.animation = 'pulse 0.5s infinite';
        } else {
            timerElement.style.color = 'white';
            timerElement.style.animation = 'none';
        }
    }
    
    updateCombo() {
        document.getElementById('combo-count').textContent = this.combo;
    }
    
    endGame() {
        this.gameActive = false;
        
        // Остановить интервалы
        if (this.techInterval) {
            clearInterval(this.techInterval);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.forbiddenWordTimer) {
            clearTimeout(this.forbiddenWordTimer);
        }
        if (this.commonWordTimeout) {
            clearTimeout(this.commonWordTimeout);
        }
        
        // Показать результаты
        this.showResults();
    }
    
    endGameWithLoss() {
        this.gameActive = false;
        
        // Остановить интервалы
        if (this.techInterval) {
            clearInterval(this.techInterval);
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        if (this.forbiddenWordTimer) {
            clearTimeout(this.forbiddenWordTimer);
        }
        if (this.commonWordTimeout) {
            clearTimeout(this.commonWordTimeout);
        }
        
        // Показать экран проигрыша
        this.showLossScreen();
    }
    
    showResults() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('result-screen').classList.add('active');
        
        // Обновить финальный счет
        document.getElementById('final-score').textContent = this.score;
        
        // Определить сообщение в зависимости от результата
        let message = '';
        if (this.score >= 200) {
            message = 'Невероятно! 🚀';
        } else if (this.score >= 100) {
            message = 'Отлично! 🎉';
        } else if (this.score >= 50) {
            message = 'Хорошо! 👍';
        } else {
            message = 'Попробуйте ещё! 💪';
        }
        
        document.getElementById('result-message').textContent = message;
        
        // Скрыть сообщение о проигрыше
        document.getElementById('game-over-message').style.display = 'none';
        document.getElementById('game-over-image').style.display = 'none'; // Скрыть картинку
        document.getElementById('result-title').textContent = '🎉 Игра окончена!';
        
        // Обновить таблицу лидеров
        this.updateLeaderboard();
    }
    
    showLossScreen() {
        document.getElementById('game-screen').classList.remove('active');
        document.getElementById('result-screen').classList.add('active');
        
        // Показать сообщение о проигрыше
        document.getElementById('game-over-message').style.display = 'block';
        document.getElementById('game-over-image').style.display = 'block'; // Показать картинку
        document.getElementById('result-title').textContent = '💀 Проигрыш!';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('result-message').textContent = 'Вы не осудили запрещенное слово!';
        
        // Скрыть таблицу лидеров при проигрыше
        document.querySelector('.leaderboard').style.display = 'none';
        
        // Убедиться, что кнопки действий видны
        const resultActions = document.querySelector('.result-actions');
        if (resultActions) {
            resultActions.style.display = 'flex';
        }
    }
    
    // Переключение темы
    toggleTheme() {
        this.isAcidTheme = !this.isAcidTheme;
        const body = document.body;
        const themeBtn = document.getElementById('theme-btn');
        
        if (this.isAcidTheme) {
            body.classList.add('acid-theme');
            themeBtn.textContent = '🌞';
        } else {
            body.classList.remove('acid-theme');
            themeBtn.textContent = '🌙';
        }
        
        // Сохранить настройку
        localStorage.setItem('gameTheme', this.isAcidTheme ? 'acid' : 'normal');
    }
    
    // Показать комментарий
    showComment(text) {
        const bubble = document.getElementById('comment-bubble');
        const textEl = document.getElementById('comment-text');
        
        textEl.textContent = text;
        bubble.classList.add('show');
        
        // Очистить предыдущий таймер
        if (this.commentTimeout) {
            clearTimeout(this.commentTimeout);
        }
        
        // Скрыть через 2 секунды
        this.commentTimeout = setTimeout(() => {
            bubble.classList.remove('show');
        }, 2000);
    }
    
    // Вибро-отклик
    vibrate(pattern) {
        if ('vibrate' in navigator) {
            navigator.vibrate(pattern);
        }
    }
    
    // Загрузка таблицы лидеров
    loadLeaderboard() {
        const saved = localStorage.getItem('gameLeaderboard');
        return saved ? JSON.parse(saved) : [];
    }
    
    // Сохранение таблицы лидеров
    saveLeaderboard() {
        localStorage.setItem('gameLeaderboard', JSON.stringify(this.leaderboard));
    }
    
    // Обновление таблицы лидеров
    updateLeaderboard() {
        // Добавить текущий результат
        this.leaderboard.push({
            score: this.score,
            date: new Date().toLocaleDateString()
        });
        
        // Сортировать по очкам
        this.leaderboard.sort((a, b) => b.score - a.score);
        
        // Оставить только топ-10
        this.leaderboard = this.leaderboard.slice(0, 10);
        
        // Сохранить
        this.saveLeaderboard();
        
        // Отобразить
        this.displayLeaderboard();
    }
    
    // Отображение таблицы лидеров
    displayLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        list.innerHTML = '';
        
        this.leaderboard.forEach((entry, index) => {
            const item = document.createElement('div');
            item.className = 'leaderboard-item';
            item.innerHTML = `
                <span class="leaderboard-rank">${index + 1}.</span>
                <span>${entry.score} очков</span>
                <span class="leaderboard-score">${entry.date}</span>
            `;
            list.appendChild(item);
        });
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    new Game();
});
