const API_URL = "https://65b988deb71048505a8aeccc.mockapi.io/api/user";

async function login(username, password) {
    try {
        // MockAPI'dan barcha foydalanuvchilarni olish
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("API'dan ma'lumot olishda xato!");

        const users = await response.json();
        console.log("API Javobi:", users);

        // Username va passwordni tekshirish
        const user = users.find(
            (u) => u.username.trim() === username.trim() && u.password.trim() === password.trim()
        );

        if (user) {
            console.log("Login muvaffaqiyatli:", user);
            localStorage.setItem("authUser", JSON.stringify(user)); // Foydalanuvchini saqlash
            return true;
        } else {
            alert("Foydalanuvchi yoki parol noto'g'ri!");
            return false;
        }
    } catch (error) {
        console.error("Login xatosi:", error);
        return false;
    }
}

// Login formni boshqarish
document.getElementById("auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const success = await login(username, password);
    if (success) {
        window.location.href = "admin.html";
    }
});