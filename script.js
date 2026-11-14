const video = document.getElementById('interactive-video');
const audio = document.getElementById('background-audio');
const soundBtn = document.getElementById('sound-toggle');
const soundIcon = document.getElementById('sound-icon');
const loader = document.getElementById('loader');
const cursor = document.querySelector('.custom-cursor');
const interactiveElements = document.querySelectorAll('.main-nav a, .sound-btn');
const characters = document.querySelectorAll('.overlay-text .char');

// Elementos HUD
const hudX = document.getElementById('hud-x');
const hudY = document.getElementById('hud-y');
const hudFps = document.getElementById('hud-fps');
const hudTs = document.getElementById('hud-ts');

let targetProgress = 0;
let currentProgress = 0;
const ease = 0.06;
let fadeInterval = null;

video.muted = true;
video.pause();

// 1. LOADER
video.addEventListener('canplaythrough', () => {
    loader.classList.add('hidden');
});

setTimeout(() => {
    loader.classList.add('hidden');
}, 2500);

// 2. AUDIO FADE IN / OUT
function fadeAudio(type) {
    clearInterval(fadeInterval);
    const duration = 800;
    const step = 50;
    const volumeStep = step / duration;

    if (type === 'in') {
        audio.volume = 0;
        audio.play().catch(e => console.log("Error de reproducción:", e));
        soundIcon.textContent = 'SOUND ON';
        
        fadeInterval = setInterval(() => {
            if (audio.volume + volumeStep < 1) {
                audio.volume += volumeStep;
            } else {
                audio.volume = 1;
                clearInterval(fadeInterval);
            }
        }, step);
    } else {
        fadeInterval = setInterval(() => {
            if (audio.volume - volumeStep > 0) {
                audio.volume -= volumeStep;
            } else {
                audio.volume = 0;
                audio.pause();
                soundIcon.textContent = 'SOUND OFF';
                clearInterval(fadeInterval);
            }
        }, step);
    }
}

soundBtn.addEventListener('click', () => {
    if (audio.paused) {
        fadeAudio('in');
    } else {
        fadeAudio('out');
    }
});

// 3. MOVIMIENTO INTERACTIVO DEL VÍDEO
window.addEventListener('mousemove', (e) => {
    targetProgress = e.clientX / window.innerWidth;
});

window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
        targetProgress = e.touches[0].clientX / window.innerWidth;
    }
}, { passive: true });

const unlockAudio = () => {
    video.play().then(() => video.pause()).catch(() => {});
    window.removeEventListener('touchstart', unlockAudio);
};
window.addEventListener('touchstart', unlockAudio);

function renderVideo() {
    if (video.duration && !isNaN(video.duration)) {
        currentProgress += (targetProgress - currentProgress) * ease;
        video.currentTime = currentProgress * video.duration;
    }
    requestAnimationFrame(renderVideo);
}
requestAnimationFrame(renderVideo);

// 4. CURSOR HUD Y EFECTO TUBO DE LUZ EN LAS LETRAS
let cursorPos = { x: 0, y: 0 };
let cursorTarget = { x: 0, y: 0 };
const cursorEase = 0.18;
const maxDistance = 180; // Radio de alcance de la luz en píxeles

window.addEventListener('mousemove', (e) => {
    cursorTarget.x = e.clientX;
    cursorTarget.y = e.clientY;
    
    if (hudX && hudY) {
        hudX.textContent = e.clientX;
        hudY.textContent = e.clientY;
    }

    if (!cursor.classList.contains('visible')) {
        cursor.classList.add('visible');
    }

    // Calcular la luz de cada letra según la cercanía del ratón
    characters.forEach(char => {
        const rect = char.getBoundingClientRect();
        const charX = rect.left + rect.width / 2;
        const charY = rect.top + rect.height / 2;
        
        // Distancia euclidiana entre el ratón y la letra
        const distance = Math.hypot(e.clientX - charX, e.clientY - charY);

        if (distance < maxDistance) {
            // Factor de intensidad de 0 a 1
            const intensity = 1 - (distance / maxDistance);
            
            // Efecto de encendido progresivo + Glow de tubo neón
            const opacity = 0.25 + (intensity * 0.75);
            const glow = intensity * 25;
            
            char.style.color = `rgba(255, 255, 255, ${opacity.toFixed(2)})`;
            char.style.textShadow = `0 0 ${glow.toFixed(1)}px rgba(255, 255, 255, ${(intensity * 0.9).toFixed(2)}), 0 0 ${(glow * 1.5).toFixed(1)}px rgba(255, 255, 255, ${(intensity * 0.5).toFixed(2)})`;
            char.style.transform = `scale(${(1 + intensity * 0.05).toFixed(2)})`;
        } else {
            // Estado apagado por defecto
            char.style.color = 'rgba(255, 255, 255, 0.25)';
            char.style.textShadow = '0 0 0px rgba(255, 255, 255, 0)';
            char.style.transform = 'scale(1)';
        }
    });
});

document.addEventListener('mouseleave', () => {
    cursor.classList.remove('visible');
    // Restaurar estado tenue al salir el ratón
    characters.forEach(char => {
        char.style.color = 'rgba(255, 255, 255, 0.25)';
        char.style.textShadow = '0 0 0px rgba(255, 255, 255, 0)';
        char.style.transform = 'scale(1)';
    });
});

document.addEventListener('mouseenter', () => {
    cursor.classList.add('visible');
});

setInterval(() => {
    if (hudFps && hudTs) {
        hudFps.textContent = (59 + Math.random() * 2).toFixed(1);
        hudTs.textContent = Math.floor(100000 + Math.random() * 900000);
    }
}, 150);

function renderCursor() {
    cursorPos.x += (cursorTarget.x - cursorPos.x) * cursorEase;
    cursorPos.y += (cursorTarget.y - cursorPos.y) * cursorEase;
    
    cursor.style.transform = `translate3d(${cursorPos.x}px, ${cursorPos.y}px, 0)`;
    requestAnimationFrame(renderCursor);
}
requestAnimationFrame(renderCursor);

interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
        document.body.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
        document.body.classList.remove('cursor-hover');
    });
});