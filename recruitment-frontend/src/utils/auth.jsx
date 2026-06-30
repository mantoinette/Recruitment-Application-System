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

export function isAuthenticated() {
    return Boolean(getUser());
}

export function getRoleRoute(role) {
    switch (role) {
        case "HR":
            return "/hr/dashboard";
        case "ADMIN":
            return "/admin/dashboard";
        default:
            return "/applicant/dashboard";
    }
}

export function logout(navigate) {
    localStorage.removeItem("user");
    navigate("/login");
}
