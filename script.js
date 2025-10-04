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
        this.showWelcomeScreen();
    }
    
    bindEvents() {
        // Кнопка старта игры
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        // Кнопки действий
        document.getElementById('pupa-btn').addEventListener('click', () => {
            this.makeChoice('frontend');
        });
        
        document.getElementById('lupa-btn').addEventListener('click', () => {
            this.makeChoice('backend');
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
    }
    
    startTechDisplay() {
        // Показать первую технологию сразу
        this.showRandomTech();
        
        // Показывать новые технологии каждые 1-2 секунды
        this.techInterval = setInterval(() => {
            if (this.gameActive) {
                this.showRandomTech();
            }
        }, Math.random() * 1000 + 1000); // 1-2 секунды
    }
    
    showRandomTech() {
        const techBadge = document.getElementById('tech-badge');
        const techText = document.getElementById('tech-text');
        
        // 10% шанс на премию
        if (Math.random() < 0.1) {
            this.currentTech = 'Премия';
            techBadge.classList.add('premium');
        } else {
            this.currentTech = this.allTechs[Math.floor(Math.random() * this.allTechs.length)];
            techBadge.classList.remove('premium');
        }
        
        techText.textContent = this.currentTech;
        
        // Анимация появления
        techBadge.style.animation = 'none';
        setTimeout(() => {
            techBadge.style.animation = 'techAppear 0.5s ease-out';
        }, 10);
    }
    
    makeChoice(choice) {
        if (!this.gameActive || !this.currentTech) return;
        
        const pupaBtn = document.getElementById('pupa-btn');
        const lupaBtn = document.getElementById('lupa-btn');
        
        let isCorrect = false;
        let points = 0;
        
        if (this.currentTech === 'Премия') {
            // Премия дает очки за любую кнопку
            isCorrect = true;
            points = 50;
            this.combo += 1;
        } else {
            // Проверяем правильность выбора
            const isFrontend = this.frontendTechs.includes(this.currentTech);
            const isBackend = this.backendTechs.includes(this.currentTech);
            
            if ((choice === 'frontend' && isFrontend) || (choice === 'backend' && isBackend)) {
                isCorrect = true;
                points = 10 + (this.combo * 5); // Базовые очки + бонус за комбо
                this.combo += 1;
            } else {
                isCorrect = false;
                this.combo = 0; // Сброс комбо при ошибке
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
        } else {
            if (choice === 'frontend') {
                pupaBtn.classList.add('wrong');
                setTimeout(() => pupaBtn.classList.remove('wrong'), 300);
            } else {
                lupaBtn.classList.add('wrong');
                setTimeout(() => lupaBtn.classList.remove('wrong'), 300);
            }
        }
        
        if (isCorrect) {
            this.score += points;
            this.updateScore();
            this.updateCombo();
        }
        
        // Очистить текущую технологию
        this.currentTech = null;
        document.getElementById('tech-text').textContent = 'Готов?';
        document.getElementById('tech-badge').classList.remove('premium');
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
    }
}

// Инициализация игры
document.addEventListener('DOMContentLoaded', function() {
    new Game();
});
