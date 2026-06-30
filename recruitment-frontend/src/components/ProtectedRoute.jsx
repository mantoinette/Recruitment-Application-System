import { Navigate } from "react-router-dom";
import { getUser, getRoleRoute } from "../utils/auth";

export function ProtectedRoute({ children, allowedRoles }) {
    const user = getUser();

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={getRoleRoute(user.role)} replace />;
    }

    return children;
}

export default ProtectedRoute;
