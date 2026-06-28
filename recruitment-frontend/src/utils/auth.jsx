// src/utils/auth.js

export function getUser() {
    const user = localStorage.getItem("user");

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch (error) {
        console.error("Invalid user data in localStorage:", error);
        return null;
    }
}

export function logout(navigate) {
    localStorage.removeItem("user");

    // Redirect to login page
    navigate("/login");
}