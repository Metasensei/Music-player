// Elementlarni tanlash
const aPlayer = document.querySelector("#player");
const h1 = document.querySelector("h1");
const pauseButton = document.querySelector(".pause");
const prevButton = document.querySelector(".prev");
const nextButton = document.querySelector(".next");
const list = document.querySelector(".list");
const currentTimeDisplay = document.querySelector("#current-time");
const totalTimeDisplay = document.querySelector("#total-time");
const timeSlider = document.querySelector("#time-slider");
const playIcon = document.querySelector(".play-icon");
const pauseIcon = document.querySelector(".pause-icon");
const searchInput = document.querySelector("#search-input");
const volumeSlider = document.querySelector("#volume-slider");
const video_intro_fa = document.querySelector(".video_intro_fa");
const voiceSearchButton = document.querySelector(".voice-search-btn");
const modeToggle = document.querySelector(".mode-toggle");
const addMusicForm = document.getElementById("add-music-form");

import { sortedData } from "./data.js";

const API_URL = "https://65b988deb71048505a8aeccc.mockapi.io/api/music";
const toggleModeButton = document.getElementById('toggle-mode');
const body = document.body;

// Rejimlar ro'yxati
const modes = ['light-mode', 'dark-mode', 'blue-mode', 'green-mode'];
let currentModeIndex = 0; // Boshlang'ich rejim

// LocalStorage'dan rang rejimini olish
const savedMode = localStorage.getItem('color-mode');
if (savedMode) {
    body.classList.add(savedMode);
    currentModeIndex = modes.indexOf(savedMode); // Tanlangan rejimni aniqlash
} else {
    body.classList.add(modes[currentModeIndex]);
    localStorage.setItem('color-mode', modes[currentModeIndex]);
}

// Rejimni o'zgartirish funksiyasi
function toggleMode() {
    // Eski rejimni olib tashlash
    body.classList.remove(modes[currentModeIndex]);

    // Keyingi rejimga o'tish
    currentModeIndex = (currentModeIndex + 1) % modes.length;

    // Yangi rejimni qo'shish
    const newMode = modes[currentModeIndex];
    body.classList.add(newMode);

    // LocalStorage'da saqlash
    localStorage.setItem('color-mode', newMode);

    // Iconni o'zgartirish
    updateToggleIcon(newMode);
}

// Tugma bosilganda rejimni o'zgartirish
toggleModeButton.addEventListener('click', toggleMode);

// Iconni o'zgartirish funksiyasi
function updateToggleIcon(mode) {
    const icon = toggleModeButton.querySelector('i');
    if (mode === 'light-mode') {
        icon.className = 'fas fa-sun';
    } else if (mode === 'dark-mode') {
        icon.className = 'fas fa-moon';
    } else if (mode === 'blue-mode') {
        icon.className = 'fas fa-tint';
    } else if (mode === 'green-mode') {
        icon.className = 'fas fa-leaf';
    }
}

// Boshlang'ich holatda to'g'ri iconni ko'rsatish
updateToggleIcon(modes[currentModeIndex]);

if (!sessionStorage.getItem("introPlayed")) {
    video_intro_fa.style.display = "block"; // Intro'ni ko'rsatish
    setTimeout(() => {
        video_intro_fa.style.display = "none"; // 3 sekunddan keyin yashirish
        sessionStorage.setItem("introPlayed", "true"); // Ko'rsatildi deb belgilash
    }, 3000); // 3 sekund
} else {
    video_intro_fa.style.display = "none"; // Allaqachon ko'rsatilgan bo'lsa, yashirish
}
function saveTrackTime(trackId, currentTime) {
    const trackTimes = JSON.parse(localStorage.getItem('trackTimes')) || {};
    trackTimes[trackId] = currentTime; // Trek vaqtini saqlash
    localStorage.setItem('trackTimes', JSON.stringify(trackTimes));
}

// LocalStorage'dan vaqtni olish funksiyasi
function getTrackTime(trackId) {
    const trackTimes = JSON.parse(localStorage.getItem('trackTimes')) || {};
    return trackTimes[trackId] || 0; // Trekning oxirgi vaqtini qaytaradi yoki 0
}

// Treklarni yuklash
let currentTrackId = 1;
let data = [];


// Ma'lumotlarni birlashtirish
async function fetchAllMusic() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`Xatolik: ${response.status}`);
        const apiData = await response.json();

        // Ma'lumotlarni bir xil formatga keltirish
        data = [
            ...sortedData.map(track => ({
                id: track.id,
                name: track.name,
                url_music: track.src, // `src` ni `url_music` ga o'zgartirish
            })),
            ...apiData,
        ];
        populateList(data);
    } catch (error) {
        console.error("Qo'shiqlarni olishda xato:", error);
    }
}
function updateListHighlight() {
    [...list.children].forEach((li) => {
        li.classList.remove("playing");
    });

    const activeTrack = [...list.children].find(
        (li) => li.textContent.trim() === h1.textContent.trim()
    );

    if (activeTrack) {
        activeTrack.classList.add("playing");
    }
}
function loadTrack(track) {
    if (!track.url_music && !track.src) {
        console.error("Trek uchun URL mavjud emas:", track);
        return; // Keyingi kodni bajarishni to'xtatadi
    }

    if (!aPlayer.paused) {
        aPlayer.pause();
    }

    aPlayer.src = track.url_music || track.src; // API yoki lokal treklar uchun URL
    h1.textContent = track.name || "Noma'lum trek"; // Agar `name` yo'q bo'lsa
    currentTrackId = track.id;

    // Trek vaqtini tiklash
    aPlayer.currentTime = getTrackTime(track.id) || 0;

    // Ro'yxatni yangilash
    populateList(data);

    aPlayer.oncanplay = () => {
        playTrack();
    };
}


// Trekni ijro etish
function playTrack() {
    aPlayer.play()
        .then(() => {
            if (playIcon) playIcon.style.display = "none";
            if (pauseIcon) pauseIcon.style.display = "block";
        })
        .catch((error) => {
            console.error("Ijro etishda xato:", error);
        });
}

function pauseTrack() {
    aPlayer.pause();
    if (playIcon) playIcon.style.display = "block";
    if (pauseIcon) pauseIcon.style.display = "none";
}



// Trekni to'xtatish
nextButton.addEventListener("click", () => {
    const nextTrackIndex = (currentTrackId % data.length) + 1; // Keyingi trekni aniqlash
    const nextTrack = data.find((track) => track.id === nextTrackIndex) || data[0];
    loadTrack(nextTrack);
});

prevButton.addEventListener("click", () => {
    const prevTrackIndex = currentTrackId === 1 ? data.length : currentTrackId - 1; // Oldingi trekni aniqlash
    const prevTrack = data.find((track) => track.id === prevTrackIndex) || data[data.length - 1];
    loadTrack(prevTrack);
});

pauseButton.addEventListener("click", () => {
    if (aPlayer.paused) {
        playTrack();
    } else {
        pauseTrack();
    }
});


// Trek ro'yxatini yangilash
function populateList(tracks) {
    list.innerHTML = "";
    tracks.forEach((track) => {
        const li = document.createElement("li");
        li.textContent = track.name;
        li.classList.toggle("playing", track.id === currentTrackId); // Tanlangan trekni belgilash
        li.addEventListener("click", () => {
            localStorage.setItem('id', track.id); // Tanlangan trek ID'sini saqlash
            loadTrack(track);
        });
        list.appendChild(li);
    });
}

// Qo'shiq qo'shish
if (addMusicForm) {
  addMusicForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const url_music = document.getElementById("url_music").value;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, url_music }),
      });

      if (!response.ok) throw new Error(`Xatolik: ${response.status}`);
      alert("Qo'shiq muvaffaqiyatli qo'shildi!");
      addMusicForm.reset();
      fetchAllMusic(); // Yangi qo'shiqni ko'rsatish uchun yangilash
    } catch (error) {
      console.error("Qo'shiq qo'shishda xato:", error);
    }
  });
}

// Progress barni boshqarish
if (aPlayer) {
    aPlayer.ontimeupdate = () => {
        const currentTime = aPlayer.currentTime;
        saveTrackTime(currentTrackId, currentTime); // Hozirgi vaqtdan davom ettirish uchun saqlash
    
        currentTimeDisplay.textContent = formatTime(currentTime);
        timeSlider.value = currentTime;
    
        const remainingTime = aPlayer.duration - currentTime;
        totalTimeDisplay.textContent = formatTime(remainingTime);
    };
    
    aPlayer.onloadedmetadata = () => {
        if (!isNaN(aPlayer.duration)) {
            timeSlider.max = aPlayer.duration;
            totalTimeDisplay.textContent = formatTime(aPlayer.duration);
        }
    };

  timeSlider.addEventListener("input", () => {
    aPlayer.currentTime = timeSlider.value;
  });
}
document.addEventListener("DOMContentLoaded", () => {
    const savedTrackId = parseInt(localStorage.getItem('id')) || 1;
    const savedTrack = data.find(track => track.id === savedTrackId);

    if (savedTrack) {
        loadTrack(savedTrack); // Saqlangan trekni yuklash
    } else {
        loadTrack(data[0]); // Birinchi trekni yuklash
    }
});
function navigateTrack(step) {
    const newTrackId = ((currentTrackId + step - 1 + data.length) % data.length) + 1;
    const nextTrack = data.find(track => track.id === newTrackId);

    if (nextTrack) {
        localStorage.setItem('id', nextTrack.id); // Yangi trek ID'sini saqlash
        loadTrack(nextTrack);
    }
}
aPlayer.onended = () => {
    navigateTrack(1); // Keyingi trakka o'tish
};
// Vaqtni formatlash
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

// Boshlang'ich yuklash
document.addEventListener("DOMContentLoaded", () => {
  fetchAllMusic(); // API va `data.js` dan ma'lumotlarni yuklash
});