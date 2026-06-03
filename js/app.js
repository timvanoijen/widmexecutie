document.addEventListener('DOMContentLoaded', () => {
    const nameInput = document.getElementById('nameInput');
    const submitBtn = document.getElementById('submitBtn');
    const backBtn = document.getElementById('backBtn');
    const appScreen = document.getElementById('app');
    const resultScreen = document.getElementById('resultScreen');
    const pauseEffect = document.getElementById('pauseEffect');
    const resultContent = document.getElementById('resultContent');

    const moderatorScreen = document.getElementById('moderatorScreen');
    const winnerInput = document.getElementById('winnerInput');
    const modSubmitBtn = document.getElementById('modSubmitBtn');
    const modMessage = document.getElementById('modMessage');

    function getWinnerName() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedWinner = urlParams.get('input') || '';
        try {
            return atob(encodedWinner).toLowerCase();
        } catch (e) {
            console.error('Failed to decode base64', e);
            return '';
        }
    }

    function init() {
        const path = window.location.pathname;
        const urlParams = new URLSearchParams(window.location.search);
        const hasInput = urlParams.has('input');
        const winnerName = getWinnerName();

        if (path.includes('/execution') || hasInput || winnerName) {
            moderatorScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');
        } else {
            moderatorScreen.classList.remove('hidden');
            appScreen.classList.add('hidden');
        }
    }

    modSubmitBtn.addEventListener('click', () => {
        const winner = winnerInput.value.trim();
        if (!winner) return;

        const encodedWinner = btoa(winner);
        modMessage.textContent = `The winner has been configured to be ${winner}`;
        modMessage.classList.remove('hidden');

        setTimeout(() => {
            window.location.href = `${window.location.pathname}?input=${encodedWinner}`;
        }, 1500);
    });

    submitBtn.addEventListener('click', () => {
        const enteredName = nameInput.value.trim().toLowerCase();
        const winnerName = getWinnerName();

        // Show result screen and pause effect
        appScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        resultScreen.classList.remove('win', 'lose');
        pauseEffect.classList.remove('hidden');
        resultContent.classList.add('hidden');

        // Pause effect (vibe)
        setTimeout(() => {
            pauseEffect.classList.add('hidden');
            resultContent.classList.remove('hidden');

            if (enteredName === winnerName && winnerName !== '') {
                resultScreen.classList.add('win');
            } else {
                resultScreen.classList.add('lose');
            }
        }, 3000); // 3 seconds pause
    });

    backBtn.addEventListener('click', () => {
        resultScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        nameInput.value = '';
    });

    init();
});
