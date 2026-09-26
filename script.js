// Datos de los niveles con opciones múltiples
const levels = [
    {
        title: "Nivel 1: Nuestros Inicios",
        question: "¿Dónde sentimos nuestra conexión por primera vez?",
        options: ["En el colegio", "En el parque", "En la piscina", "En una fiesta"],
        correctIndexes: [2],
        photo: "fotos/nivel-1.jpg"
    },
    {
        title: "Nivel 2: Fechas Importantes",
        question: "¿Que día fué?",
        options: ["23", "30", "21", "Noviembre"],
        correctIndexes: [2],
        photo: "fotos/nivel-2.jpg"
    },
    {
        title: "Nivel 3: Pequeños Detalles",
        question: "¿Cuál fué mi primer regalo hacia usted",
        options: ["Flores", "Comida", "Cartas", "Peluche"],
        correctIndexes: [0],
        photo: "fotos/nivel-3.jpg"
    },
    {
        title: "Nivel 4: Nuestros Recuerdos",
        question: "¿Que haciamos más juntos?",
        options: ["Ver películas", "Videollamadas", "Jugar plato", "Hablar de nosotros"],
        correctIndexes: [0, 1, 2, 3],
        photo: "fotos/nivel-4.jpg"
    },
    {
        title: "Nivel 5: Algo Nuestro",
        question: "¿Qué apodo cariñoso le decia más seguido que le gustaba?",
        options: ["Bebé", "Gordita", "Amorrr", "Colatonnn"],
        correctIndexes: [1, 3],
        photo: "fotos/nivel-5.jpg"
    }
];

// Estado del juego
let lives = 2;
let currentStep = -1; // -1: Inicio, 0: Carta, 1-5: Niveles, 6: Fin
let maxStepUnlocked = 0; 
let isGameOver = false;

// Historial de respuestas seleccionadas para mostrarlas si se retrocede
const answeredLevels = {};


// Elementos del DOM
const startScreen = document.getElementById('start-screen');
const letterScreen = document.getElementById('letter-screen');
const levelScreen = document.getElementById('level-screen');
const levelPhotoScreen = document.getElementById('level-photo-screen');
const endScreen = document.getElementById('end-screen');
const gameoverScreen = document.getElementById('gameover-screen');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const continueLevelBtn = document.getElementById('continue-level-btn');
const levelPhoto = document.getElementById('level-photo');
const photoTitle = document.getElementById('photo-title');
const optionsContainer = document.getElementById('options-container');
const levelTitle = document.getElementById('level-title');
const questionText = document.getElementById('question-text');
const feedbackMsg = document.getElementById('feedback-msg');

const bgMusic = document.getElementById('bg-music');
const livesContainer = document.getElementById('lives-container');
const livesHearts = document.getElementById('lives-hearts');

const navContainer = document.getElementById('nav-container');
const btnBack = document.getElementById('btn-back');
const btnNext = document.getElementById('btn-next');

// Eventos
startBtn.addEventListener('click', () => {
    bgMusic.volume = 0.4;
    bgMusic.play().catch(e => console.log("Música bloqueada por el navegador."));
    goToStep(0);
});

restartBtn.addEventListener('click', () => {
    // Reiniciar juego
    lives = 2;
    maxStepUnlocked = 0;
    isGameOver = false;
    for (let key in answeredLevels) delete answeredLevels[key];

    goToStep(-1);
});

continueLevelBtn.addEventListener('click', () => {
    const nextStep = currentStep + 1;
    if (maxStepUnlocked < nextStep) maxStepUnlocked = nextStep;
    goToStep(nextStep);
});

btnBack.addEventListener('click', () => {
    if (currentStep > -1) goToStep(currentStep - 1);
});

btnNext.addEventListener('click', () => {
    // Desde la carta, el botón de navegación inicia las pruebas.
    if (currentStep === 0) {
        if (maxStepUnlocked < 1) maxStepUnlocked = 1;
        goToStep(1);
        return;
    }
    if (currentStep < maxStepUnlocked) goToStep(currentStep + 1);
});

function hideAllScreens() {
    startScreen.classList.remove('active');
    letterScreen.classList.remove('active');
    levelScreen.classList.remove('active');
    levelPhotoScreen.classList.remove('active');
    endScreen.classList.remove('active');
    gameoverScreen.classList.remove('active');
}

function updateNavButtons() {
    // Mostrar u ocultar contenedor de navegación
    if (currentStep === -1 || isGameOver) {
        navContainer.classList.add('hidden');
    } else {
        navContainer.classList.remove('hidden');
    }

    // Botón Atrás
    btnBack.disabled = (currentStep <= -1);

    // Botón Siguiente
    // No puede avanzar si está en el paso máximo desbloqueado (tiene que pasar la prueba)
    if ((currentStep >= maxStepUnlocked && currentStep !== 0) || currentStep >= 6) {
        btnNext.disabled = true;
    } else {
        btnNext.disabled = false;
    }
}

function updateLivesDisplay() {
    const heartImg = '<img src="https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png" class="apple-emoji-small" alt="corazón">';
    livesHearts.innerHTML = heartImg.repeat(lives);
    livesContainer.style.transform = "scale(1.2)";
    setTimeout(() => { livesContainer.style.transform = "scale(1)"; }, 200);
}

function goToStep(step) {
    if (isGameOver && step !== -1) return; // Si perdió, solo puede ir al inicio a reiniciar
    
    currentStep = step;
    hideAllScreens();
    
    // Controlar visibilidad de las vidas
    if (step >= 1 && step <= 5 && !isGameOver) {
        livesContainer.classList.remove('hidden');
        updateLivesDisplay();
    } else {
        livesContainer.classList.add('hidden');
    }

    updateNavButtons();

    switch(step) {
        case -1:
            startScreen.classList.add('active');
            break;
        case 0:
            letterScreen.classList.add('active');
            break;
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
            loadLevel(step - 1);
            levelScreen.classList.add('active');
            break;
        case 6:
            endScreen.classList.add('active');
            break;
    }
}

function loadLevel(levelIndex) {
    const currentLevel = levels[levelIndex];
    levelTitle.innerText = currentLevel.title;
    questionText.innerText = currentLevel.question;
    feedbackMsg.innerHTML = '';

    
    optionsContainer.innerHTML = '';
    
    const isAlreadyAnswered = answeredLevels[levelIndex] !== undefined;

    currentLevel.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.classList.add('option-btn');
        btn.innerText = optionText;
        
        if (isAlreadyAnswered) {
            btn.disabled = true;
            if (index === answeredLevels[levelIndex]) {
                btn.classList.add('correct');
            }
        } else {
            btn.addEventListener('click', () => checkAnswer(index, btn, levelIndex));
        }
        
        optionsContainer.appendChild(btn);
    });

    if (isAlreadyAnswered) {
        feedbackMsg.innerHTML = '¡Nivel completado! <img src="https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png" class="apple-emoji-small" alt="corazón">';
        feedbackMsg.style.color = "#2ecc71";
    }
}

function showLevelPhoto(levelIndex) {
    const level = levels[levelIndex];
    hideAllScreens();
    livesContainer.classList.remove('hidden');
    navContainer.classList.add('hidden');
    photoTitle.innerText = `¡Nivel ${levelIndex + 1} superado!`;
    levelPhoto.src = level.photo;
    levelPhotoScreen.classList.add('active');
}

function checkAnswer(selectedIndex, btnElement, levelIndex) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(b => b.disabled = true);
    
    const correctIndexes = levels[levelIndex].correctIndexes;
    
    if (correctIndexes.includes(selectedIndex)) {
        btnElement.classList.add('correct');
        feedbackMsg.innerHTML = '¡Correcto! <img src="https://em-content.zobj.net/source/apple/354/red-heart_2764-fe0f.png" class="apple-emoji-small" alt="corazón">';
        feedbackMsg.style.color = "#2ecc71";
        
        answeredLevels[levelIndex] = selectedIndex; // Guardar que ya se resolvió
        
        setTimeout(() => {
            showLevelPhoto(levelIndex);
        }, 1500);
    } else {
        btnElement.classList.add('incorrect');
        lives--;
        updateLivesDisplay();
        
        if (lives > 0) {
            feedbackMsg.innerText = "¡Ups! Esa no era. Te queda otra oportunidad.";
            feedbackMsg.style.color = "#e74c3c";
            
            setTimeout(() => {
                loadLevel(levelIndex); 
            }, 2000);
        } else {
            feedbackMsg.innerHTML = 'Te quedaste sin vidas <img src="https://em-content.zobj.net/source/apple/354/broken-heart_1f494.png" class="apple-emoji-small" alt="corazón roto">';
            feedbackMsg.style.color = "#e74c3c";
            
            setTimeout(() => {
                isGameOver = true;
                hideAllScreens();
                livesContainer.classList.add('hidden');
                navContainer.classList.add('hidden');
                gameoverScreen.classList.add('active');
            }, 2000);
        }
    }
}
