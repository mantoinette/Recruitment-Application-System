import { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiLock, FiLogIn, FiMail } from "react-icons/fi";
import "../../assets/public.css";

function Login() {

    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loading] = useState(false);

    const [loginData, setLoginData] = useState({
        email: "",
        password: ""
    });

    const handleChange = (event) => {
        setLoginData({
            ...loginData,
            [event.target.name]: event.target.value
        });
    };

    const loginUser = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", loginData);

            const loggedInUser = response.data;

            localStorage.setItem("user", JSON.stringify(loggedInUser));

            // ROLE-BASED REDIRECT
            const role = loggedInUser.role?.toUpperCase();

            if (role === "ADMIN") {
                navigate("/admin/dashboard");
            } else if (role === "HR") {
                navigate("/hr/dashboard");
            } else {
                navigate("/applicant/dashboard");
            }

        } catch (error) {
            const errorMessage =
                error.response?.data || "Invalid credentials";

            setMessage(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="public-page">

            <header className="public-header">
                <Link className="public-brand" to="/">
                    <strong>Recruitment</strong>
                    <span>Application Management System</span>
                </Link>

                <nav className="public-nav">
                    <Link to="/">Home</Link>
                    <Link className="public-button primary" to="/register">
                        Register
                    </Link>
                </nav>
            </header>

            <main className="auth-page">

                <section className="auth-card-wrap">

                    <div className="auth-card">

                        <h1 className="auth-title">Welcome back</h1>

                        <p className="auth-copy">
                            Sign in to continue to your workspace.
                        </p>

                        <form className="auth-form" onSubmit={loginUser}>

                            <div className="auth-field">
                                <label>Email address</label>
                                <div className="auth-input-wrap">
                                    <FiMail />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={loginData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label>Password</label>
                                <div className="auth-input-wrap">
                                    <FiLock />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="Enter password"
                                        value={loginData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            {message && (
                                <div className="auth-message">
                                    {message}
                                </div>
                            )}

                            <button
                                className="public-button primary"
                                type="submit"
                                disabled={loading}
                            >
                                <FiLogIn />
                                {loading ? "Logging in..." : "Login"}
                            </button>

                        </form>

                        <div className="auth-footer">
                            New applicant?{" "}
                            <Link to="/register">Create account</Link>
                        </div>

                    </div>

                </section>

                <section className="auth-side">

                    <h2>Access your recruitment workspace</h2>

                    <p>
                        Applicants, HR, and Admins each have their own dashboards.
                    </p>

                    <div className="auth-checks">

                        <div className="auth-check">
                            <FiCheckCircle /> Role-based navigation
                        </div>

                        <div className="auth-check">
                            <FiCheckCircle /> Secure authentication
                        </div>

                        <div className="auth-check">
                            <FiCheckCircle /> Recruitment workflow system
                        </div>

                    </div>

                </section>

            </main>

        </div>
    );
}

export default Login;