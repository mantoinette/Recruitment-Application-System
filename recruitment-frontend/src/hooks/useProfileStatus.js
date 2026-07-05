import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api/axios";
import { getUser } from "../utils/auth";

export function useProfileStatus() {
    const user = getUser() || {};
    const location = useLocation();
    const [profileComplete, setProfileComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user.id) {
            setProfileComplete(false);
            setLoading(false);
            return undefined;
        }

        let cancelled = false;

        const loadStatus = async () => {
            setLoading(true);

            try {
                const response = await api.get(`/profile/${user.id}/status`);
                if (!cancelled) {
                    setProfileComplete(Boolean(response.data?.profileComplete));
                }
            } catch (error) {
                console.error("Failed to load profile status", error);
                if (!cancelled) {
                    setProfileComplete(false);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadStatus();

        return () => {
            cancelled = true;
        };
    }, [user.id, location.pathname]);

    return { profileComplete, loading, userId: user.id };
}
