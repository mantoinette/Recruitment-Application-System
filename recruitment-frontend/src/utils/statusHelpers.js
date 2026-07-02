export function statusLabel(status) {
    switch (status) {
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
            return status || "Pending";
    }
}

export function statusClass(status) {
    return (status || "PENDING").toLowerCase().replace(/_/g, "-");
}

export function fileDownloadUrl(path) {
    if (!path) {
        return null;
    }

    return `http://localhost:8080/files/download?path=${encodeURIComponent(path)}`;
}
