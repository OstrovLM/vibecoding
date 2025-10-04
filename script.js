// Игровая логика
class Game {
    constructor() {
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 10;
        this.gameActive = false;
        this.currentTech = null;
        this.techInterval = null;
        this.timerInterval = null;
        this.premiumActive = false;
        this.premiumButtonsPressed = new Set();
        this.premiumInterval = null;
        this.hasShownPremium = false;
        this.isAcidTheme = false;
        this.trapButtonVisible = false;
        this.commentTimeout = null;
        this.leaderboard = this.loadLeaderboard();
        
        // Списки технологий
        this.frontendTechs = [
            'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 
            'HTML', 'CSS', 'SASS', 'Webpack', 'Vite', 'Next.js', 
            'Nuxt.js', 'Tailwind', 'Bootstrap', 'jQuery'
        ];
        
        this.backendTechs = [
            'Node.js', 'Python', 'Java', 'C#', 'PHP', 'Go', 'Rust',
            'Django', 'Flask', 'Express', 'Spring', 'Laravel', 
            'PostgreSQL', 'MongoDB', 'Redis', 'Docker'
        ];
        
        this.allTechs = [...this.frontendTechs, ...this.backendTechs];
        
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
        // Кнопка старта игры
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Переключатель темы
        document.getElementById('theme-btn').addEventListener('click', () => {
            this.toggleTheme();
        });
        
        // Кнопки действий
        document.getElementById('pupa-btn').addEventListener('click', () => {
            this.makeChoice('frontend');
        });
        
        document.getElementById('lupa-btn').addEventListener('click', () => {
            this.makeChoice('backend');
        });
        
        // Кнопка-ловушка
        document.getElementById('trap-btn').addEventListener('click', () => {
            this.trapButtonClicked();
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
    
    startGame() {
        this.score = 0;
        this.combo = 0;
        this.timeLeft = 10;
        this.gameActive = true;
        
        // Показать игровой экран
        document.getElementById('welcome-screen').classList.remove('active');
        document.getElementById('game-screen').classList.add('active');
        document.getElementById('result-screen').classList.remove('active');
        
        // Обновить UI
        this.updateScore();
        this.updateTimer();
        this.updateCombo();
        
        // Начать показ технологий
        this.startTechDisplay();
        
        // Запустить таймер
        this.startTimer();
        
        // Показать инструкции
        document.getElementById('instruction-text').textContent = 'Нажмите кнопку когда увидите технологию!';
        
        // Скрыть кнопку-ловушку
        this.hideTrapButton();
    }
    
    startTechDisplay() {
        // Показать первую технологию сразу
        this.showRandomTech();
        
        // Показывать новые технологии каждые 0.7-1.2 секунды
        this.techInterval = setInterval(() => {
            if (this.gameActive) {
                this.showRandomTech();
                // Иногда показывать кнопку-ловушку
                this.showTrapButton();
            }
        }, Math.random() * 500 + 700); // 0.7-1.2 секунды
    }
    
    showRandomTech() {
        const techBadge = document.getElementById('tech-badge');
        const techText = document.getElementById('tech-text');
        
        // Гарантировать хотя бы одну премию за сессию
        let shouldShowPremium = false;
        if (!this.hasShownPremium && (Math.random() < 0.15 || this.timeLeft <= 3)) {
            shouldShowPremium = true;
            this.hasShownPremium = true;
        }
        
        if (shouldShowPremium) {
            this.currentTech = 'Премия';
            this.premiumActive = true;
            this.premiumButtonsPressed.clear();
            techBadge.classList.add('premium');
            this.startPremiumMode();
        } else {
            this.currentTech = this.allTechs[Math.floor(Math.random() * this.allTechs.length)];
            this.premiumActive = false;
            techBadge.classList.remove('premium');
            this.stopPremiumMode();
        }
        
        techText.textContent = this.currentTech;
        
        // Анимация появления
        techBadge.style.animation = 'none';
        setTimeout(() => {
            techBadge.style.animation = 'techAppear 0.5s ease-out';
        }, 10);
    }
    
    startPremiumMode() {
        // Обновить инструкции для премии
        document.getElementById('instruction-text').textContent = 'Нажимайте обе кнопки поочередно!';
        
        // Запустить интервал для премии (каждые 0.5 секунды)
        this.premiumInterval = setInterval(() => {
            if (this.premiumActive && this.gameActive) {
                this.processPremiumInput();
            }
        }, 500);
    }
    
    stopPremiumMode() {
        if (this.premiumInterval) {
            clearInterval(this.premiumInterval);
            this.premiumInterval = null;
        }
        document.getElementById('instruction-text').textContent = 'Нажмите кнопку когда увидите технологию!';
    }
    
    processPremiumInput() {
        // Проверяем, нажаты ли обе кнопки
        if (this.premiumButtonsPressed.has('frontend') && this.premiumButtonsPressed.has('backend')) {
            // Дать очки за правильное нажатие обеих кнопок
            this.score += 30;
            this.combo += 1;
            this.updateScore();
            this.updateCombo();
            
            // Сбросить состояние
            this.premiumButtonsPressed.clear();
            
            // Визуальная обратная связь
            document.getElementById('pupa-btn').classList.add('correct');
            document.getElementById('lupa-btn').classList.add('correct');
            setTimeout(() => {
                document.getElementById('pupa-btn').classList.remove('correct');
                document.getElementById('lupa-btn').classList.remove('correct');
            }, 300);
        }
    }
    
    makeChoice(choice) {
        if (!this.gameActive || !this.currentTech) return;
        
        const pupaBtn = document.getElementById('pupa-btn');
        const lupaBtn = document.getElementById('lupa-btn');
        
        let isCorrect = false;
        let points = 0;
        
        if (this.premiumActive) {
            // В режиме премии запоминаем нажатые кнопки
            this.premiumButtonsPressed.add(choice);
            return; // Не обрабатываем сразу, ждем обе кнопки
        } else {
            // Обычная логика для технологий
            const isFrontend = this.frontendTechs.includes(this.currentTech);
            const isBackend = this.backendTechs.includes(this.currentTech);
            
            if ((choice === 'frontend' && isFrontend) || (choice === 'backend' && isBackend)) {
                isCorrect = true;
                points = 10 + (this.combo * 5); // Базовые очки + бонус за комбо
                this.combo += 1;
            } else {
                isCorrect = false;
                this.combo = 0; // Сброс комбо при ошибке
                // Штраф за неправильное нажатие
                this.score = Math.max(0, this.score - 5);
            }
        }
        
        // Визуальная обратная связь
        if (isCorrect) {
            if (choice === 'frontend') {
                pupaBtn.classList.add('correct');
                setTimeout(() => pupaBtn.classList.remove('correct'), 300);
            } else {
                lupaBtn.classList.add('correct');
                setTimeout(() => lupaBtn.classList.remove('correct'), 300);
            }
            // Вибро-отклик для правильного ответа
            this.vibrate([50]);
        } else {
            if (choice === 'frontend') {
                pupaBtn.classList.add('wrong');
                setTimeout(() => pupaBtn.classList.remove('wrong'), 300);
            } else {
                lupaBtn.classList.add('wrong');
                setTimeout(() => lupaBtn.classList.remove('wrong'), 300);
            }
            // Вибро-отклик для неправильного ответа
            this.vibrate([200, 100, 200]);
        }
        
        if (isCorrect) {
            this.score += points;
            this.updateScore();
            this.updateCombo();
        } else {
            this.updateScore(); // Обновить счет после штрафа
        }
        
        // Очистить текущую технологию только если не в режиме премии
        if (!this.premiumActive) {
            this.currentTech = null;
            document.getElementById('tech-text').textContent = 'Готов?';
            document.getElementById('tech-badge').classList.remove('premium');
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
        if (this.premiumInterval) {
            clearInterval(this.premiumInterval);
        }
        
        // Остановить режим премии
        this.stopPremiumMode();
        
        // Показать результаты
        this.showResults();
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
        
        // Обновить таблицу лидеров
        this.updateLeaderboard();
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
    
    // Обработка кнопки-ловушки
    trapButtonClicked() {
        if (!this.gameActive) return;
        
        // Штраф за нажатие ловушки
        this.score = Math.max(0, this.score - 10);
        this.combo = 0;
        this.updateScore();
        this.updateCombo();
        
        // Показать комментарий
        this.showComment('Ой! Это была ловушка! 🍌');
        
        // Скрыть кнопку-ловушку
        this.hideTrapButton();
        
        // Вибро-отклик
        this.vibrate([100, 50, 100]);
    }
    
    // Показать/скрыть кнопку-ловушку
    showTrapButton() {
        if (Math.random() < 0.3 && !this.trapButtonVisible) { // 30% шанс
            this.trapButtonVisible = true;
            document.getElementById('trap-btn').classList.add('visible');
            this.showComment('Стоп! Не нажимай эту кнопку! 🚫');
        }
    }
    
    hideTrapButton() {
        this.trapButtonVisible = false;
        document.getElementById('trap-btn').classList.remove('visible');
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
