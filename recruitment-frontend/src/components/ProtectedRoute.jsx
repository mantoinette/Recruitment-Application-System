import { Navigate } from "react-router-dom";
import { getUser, getRoleRoute } from "../utils/auth";

export function ProtectedRoute({ children, allowedRoles }) {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const role = typeof user.role === "string" ? user.role.toUpperCase() : user.role;

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to={getRoleRoute(role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
