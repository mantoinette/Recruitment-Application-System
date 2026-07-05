import { API_BASE_URL } from "../api/config";

export function statusLabel(status) {
    const value = typeof status === "string" ? status : status?.name;

    switch (value) {
        case "PENDING":
            return "Pending";
        case "UNDER_REVIEW":
            return "Under Review";
        case "INTERVIEW":
            return "Interview";
        case "APPROVED":
            return "Approved";
        case "REJECTED":
            return "Rejected";
        default:
            return value || "Pending";
    }
}

export function statusClass(status) {
    const value = typeof status === "string" ? status : status?.name || "PENDING";
    return value.toLowerCase().replace(/_/g, "-");
}

export function fileDownloadUrl(path) {
    if (!path) {
        return null;
    }

    return `${API_BASE_URL}/files/download?path=${encodeURIComponent(path)}`;
}
