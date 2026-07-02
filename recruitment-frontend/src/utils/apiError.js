export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
    const data = error?.response?.data;

    if (!data) {
        return error?.message || fallback;
    }

    if (typeof data === "string") {
        return data;
    }

    if (typeof data === "object") {
        if (typeof data.message === "string" && data.message.trim()) {
            return data.message;
        }

        if (typeof data.error === "string" && data.error.trim()) {
            return data.error;
        }
    }

    return fallback;
}
