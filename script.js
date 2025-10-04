// Простая логика для приветственного экрана
document.addEventListener('DOMContentLoaded', function() {
    const startBtn = document.getElementById('start-game-btn');
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            alert('Игра пока в разработке! 🚧\n\nЭто только приветственный экран.\nПолная версия будет доступна позже.');
        });
    }
});
