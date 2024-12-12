const API_MUSIC_URL = "https://65b988deb71048505a8aeccc.mockapi.io/api/music";
const API_USERS_URL = "https://65b988deb71048505a8aeccc.mockapi.io/api/user";
const musicList = document.getElementById("music-list");
const addMusicForm = document.getElementById("add-music-form");

document.addEventListener("DOMContentLoaded", () => {
    const authUser = JSON.parse(localStorage.getItem("authUser"));
    if (!authUser || authUser.role !== "admin") {
        alert("Siz admin emassiz!");
        window.location.href = "login.html";
    } else {
        document.getElementById("user-name").textContent = `👤 ${authUser.username}`;
    }
});

document.getElementById("logout-btn").addEventListener("click", () => {
    localStorage.removeItem("authUser");
    window.location.href = "login.html";
});

async function fetchMusicList() {
    try {
        const response = await fetch(API_MUSIC_URL);
        const music = await response.json();
        renderMusicList(music);
    } catch (error) {
        console.error(error);
    }
}

function renderMusicList(music) {
    musicList.innerHTML = "";
    music.forEach((track) => {
        const li = document.createElement("li");
        li.className = "list-group-item d-flex justify-content-between align-items-center";
        li.innerHTML = `
            <span>${track.name} - <a href="${track.url_music}" target="_blank" class="text-decoration-none">Trek</a></span>
            <div>
                <button class="btn btn-warning btn-sm edit" data-id="${track.id}">Edit</button>
                <button class="btn btn-danger btn-sm delete" data-id="${track.id}">Delete</button>
            </div>
        `;
        musicList.appendChild(li);
    });
}

addMusicForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const url_music = document.getElementById("url_music").value;

    try {
        const response = await fetch(API_MUSIC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, url_music }),
        });
        if (!response.ok) throw new Error("Failed to add music");
        fetchMusicList();
        addMusicForm.reset();
    } catch (error) {
        console.error(error);
    }
});

musicList.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete")) {
        const id = e.target.getAttribute("data-id");
        try {
            await fetch(`${API_MUSIC_URL}/${id}`, { method: "DELETE" });
            fetchMusicList();
        } catch (error) {
            console.error(error);
        }
    } else if (e.target.classList.contains("edit")) {
        const id = e.target.getAttribute("data-id");
        const newName = prompt("Enter new track name:");
        const newUrl = prompt("Enter new track URL:");
        if (newName && newUrl) {
            try {
                await fetch(`${API_MUSIC_URL}/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newName, url_music: newUrl }),
                });
                fetchMusicList();
            } catch (error) {
                console.error(error);
            }
        }
    }
});

document.getElementById("add-admin-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const adminUsername = document.getElementById("admin-username").value;
    const adminPassword = document.getElementById("admin-password").value;

    try {
        const response = await fetch(API_USERS_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: adminUsername, password: adminPassword, role: "admin" }),
        });
        if (!response.ok) throw new Error("Failed to add admin");
        alert("New admin added successfully!");
        document.getElementById("add-admin-form").reset();
        bootstrap.Modal.getInstance(document.getElementById("addAdminModal")).hide();
    } catch (error) {
        console.error(error);
    }
});

document.getElementById("change-credentials-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const newUsername = document.getElementById("new-username").value;
    const newPassword = document.getElementById("new-password").value;
    const currentUser = JSON.parse(localStorage.getItem("authUser"));

    if (!currentUser) {
        alert("You must be logged in to change credentials.");
        return;
    }

    try {
        const response = await fetch(`${API_USERS_URL}/${currentUser.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: newUsername || currentUser.username,
                password: newPassword || currentUser.password,
            }),
        });

        if (!response.ok) throw new Error("Failed to update credentials");
        const updatedUser = await response.json();
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        document.getElementById("user-name").textContent = `👤 ${updatedUser.username}`;
        alert("Credentials updated successfully!");
        bootstrap.Modal.getInstance(document.getElementById("changeCredentialsModal")).hide();
    } catch (error) {
        console.error(error);
    }
});

// Initial Load
fetchMusicList();