/**
 * Axios configuration file
 *
 * Every request will automatically use
 * http://localhost:8080 as the backend URL
 */

import axios from "axios";

const api = axios.create({

    // Spring Boot URL
    baseURL: "http://localhost:8080"

});

export default api;