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

    const execModeRadios = document.getElementsByName('execMode');
    const manualConfig = document.getElementById('manualConfig');
    const sequenceConfig = document.getElementById('sequenceConfig');
    const nameListInput = document.getElementById('nameListInput');
    const pauseTimeInput = document.getElementById('pauseTimeInput');

    const manualInputArea = document.getElementById('manualInputArea');
    const sequenceStartArea = document.getElementById('sequenceStartArea');
    const startExecBtn = document.getElementById('startExecBtn');
    const nextBtn = document.getElementById('nextBtn');
    const displayName = document.getElementById('displayName');
    const homeBtn = document.getElementById('homeBtn');

    let sequenceNames = [];
    let currentSequenceIndex = 0;

    function getParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedWinner = urlParams.get('input') || '';
        const encodedNames = urlParams.get('names') || '';
        const mode = urlParams.get('mode') || 'winner';
        const execMode = urlParams.get('execMode') || 'manual';
        const pauseTime = parseInt(urlParams.get('pause') || '5', 10) * 1000;

        let winnerName = '';
        try {
            winnerName = encodedWinner ? atob(encodedWinner).toLowerCase() : '';
        } catch (e) { console.error('Failed to decode winner', e); }

        let namesList = [];
        try {
            namesList = encodedNames ? JSON.parse(atob(encodedNames)) : [];
        } catch (e) { console.error('Failed to decode names', e); }

        return { winnerName, namesList, mode, execMode, pauseTime };
    }

    function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const { execMode, namesList } = getParams();

        if (urlParams.has('input') || urlParams.has('names')) {
            moderatorScreen.classList.add('hidden');
            appScreen.classList.remove('hidden');

            if (execMode === 'sequence') {
                manualInputArea.classList.add('hidden');
                sequenceStartArea.classList.remove('hidden');
                sequenceNames = namesList;
            } else {
                manualInputArea.classList.remove('hidden');
                sequenceStartArea.classList.add('hidden');
            }
        } else {
            moderatorScreen.classList.remove('hidden');
            appScreen.classList.add('hidden');
        }
    }

    // Moderator Screen Logic
    execModeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'manual') {
                manualConfig.classList.remove('hidden');
                sequenceConfig.classList.add('hidden');
            } else {
                manualConfig.classList.add('hidden');
                sequenceConfig.classList.remove('hidden');
            }
        });
    });

    modSubmitBtn.addEventListener('click', () => {
        const execMode = document.querySelector('input[name="execMode"]:checked').value;
        const mode = document.querySelector('input[name="mode"]:checked').value;
        const pauseTime = pauseTimeInput.value || '5';
        let url = `${window.location.pathname}?execMode=${execMode}&mode=${mode}&pause=${pauseTime}`;

        if (execMode === 'manual') {
            const winner = winnerInput.value.trim();
            if (!winner) return;
            url += `&input=${btoa(winner)}`;
            modMessage.textContent = `The ${mode} has been configured to be: ${winner}`;
        } else {
            const namesText = nameListInput.value.trim();
            if (!namesText) return;
            const names = namesText.split('\n').map(n => n.trim()).filter(n => n);
            url += `&names=${btoa(JSON.stringify(names))}`;
            modMessage.textContent = `Sequence with ${names.length} names configured.`;
        }

        modMessage.classList.remove('hidden');
        winnerInput.disabled = true;
        nameListInput.disabled = true;
        pauseTimeInput.disabled = true;
        modSubmitBtn.disabled = true;
        document.querySelectorAll('input[name="mode"]').forEach(el => el.disabled = true);
        document.querySelectorAll('input[name="execMode"]').forEach(el => el.disabled = true);

        setTimeout(() => {
            window.location.href = url;
        }, 1500);
    });

    // Execution Logic
    function runExecution(nameToDisplay, isTarget) {
        const { mode, pauseTime } = getParams();

        appScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
        resultScreen.classList.remove('win', 'lose');
        pauseEffect.classList.remove('hidden');
        resultContent.classList.add('hidden');
        displayName.classList.add('hidden');

        setTimeout(() => {
            pauseEffect.classList.add('hidden');
            resultContent.classList.remove('hidden');

            if (nameToDisplay) {
                displayName.textContent = nameToDisplay;
                displayName.classList.remove('hidden');
            }

            let isWin;
            if (mode === 'loser') {
                isWin = !isTarget;
            } else {
                isWin = isTarget;
            }

            resultScreen.classList.add(isWin ? 'win' : 'lose');

            const { execMode } = getParams();
            if (execMode === 'sequence') {
                backBtn.classList.add('hidden');
                nextBtn.classList.remove('hidden');
                if (currentSequenceIndex >= sequenceNames.length) {
                    nextBtn.textContent = 'END';
                } else {
                    nextBtn.textContent = 'Next';
                }
            } else {
                backBtn.classList.remove('hidden');
                nextBtn.classList.add('hidden');
            }
        }, pauseTime);
    }

    submitBtn.addEventListener('click', () => {
        const enteredName = nameInput.value.trim().toLowerCase();
        const { winnerName } = getParams();
        const isTarget = (enteredName === winnerName && winnerName !== '');
        runExecution('', isTarget);
    });

    startExecBtn.addEventListener('click', () => {
        currentSequenceIndex = 0;
        showNextInSequence();
    });

    nextBtn.addEventListener('click', () => {
        if (currentSequenceIndex >= sequenceNames.length) {
            // END screen
            displayName.textContent = 'END';
            resultScreen.classList.remove('win', 'lose');
            nextBtn.classList.add('hidden');
            backBtn.classList.remove('hidden');
            backBtn.textContent = 'Restart';
            backBtn.onclick = () => window.location.reload();
        } else {
            showNextInSequence();
        }
    });

    function showNextInSequence() {
        const rawName = sequenceNames[currentSequenceIndex];
        const isTarget = rawName.endsWith('*');
        const cleanName = isTarget ? rawName.slice(0, -1) : rawName;
        currentSequenceIndex++;
        runExecution(cleanName, isTarget);
    }

    backBtn.addEventListener('click', () => {
        if (backBtn.textContent === 'Restart') {
             window.location.reload();
             return;
        }
        resultScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        nameInput.value = '';
    });

    homeBtn.addEventListener('click', () => {
        window.location.href = window.location.pathname;
    });

    init();
});
