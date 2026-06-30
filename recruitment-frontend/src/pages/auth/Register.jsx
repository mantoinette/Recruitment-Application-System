import { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import "../../assets/public.css";

const roleDescriptions = {
    APPLICANT: "Apply for jobs, complete your profile, and track application status.",
    HR: "Review applications, manage vacancies, and monitor recruitment activity.",
    ADMIN: "Manage system users, oversee platform activity, and view analytics."
};

function Register() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: "",
        role: "APPLICANT"
    });

    const handleChange = (event) => {
        setUser({
            ...user,
            [event.target.name]: event.target.value
        });
    };

    const registerUser = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            await api.post("/auth/register", user);
            navigate("/login");
        } catch (error) {
            console.error("Registration Error:", error);
            if (error.response) {
                const errorMessage = typeof error.response.data === "string"
                    ? error.response.data
                    : "Registration failed";
                setMessage(errorMessage);
            } else {
                setMessage("Cannot connect to backend. Make sure Spring Boot is running on http://localhost:8080.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="public-page">
            <header className="public-header">
                <Link className="public-brand" to="/">
                    <strong>RecruitPro</strong>
                    <span>Professional Recruitment Platform</span>
                </Link>

                <nav className="public-nav">
                    <Link to="/">Home</Link>
                    <Link className="public-button primary" to="/login">Login</Link>
                </nav>
            </header>

            <main className="auth-page">
                <section className="auth-card-wrap">
                    <div className="auth-card">
                        <h1 className="auth-title">Create your account</h1>
                        <p className="auth-copy">
                            Select your role and register to access the appropriate dashboard.
                        </p>

                        <form className="auth-form" onSubmit={registerUser}>
                            <div className="auth-field">
                                <label htmlFor="fullName">Full name</label>
                                <div className="auth-input-wrap">
                                    <FiUser />
                                    <input
                                        id="fullName"
                                        type="text"
                                        name="fullName"
                                        placeholder="Your full name"
                                        value={user.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="email">Email address</label>
                                <div className="auth-input-wrap">
                                    <FiMail />
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        placeholder="you@example.com"
                                        value={user.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="password">Password</label>
                                <div className="auth-input-wrap">
                                    <FiLock />
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        placeholder="Create a password"
                                        value={user.password}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="auth-field">
                                <label htmlFor="role">Account role</label>
                                <select
                                    id="role"
                                    name="role"
                                    className="auth-select"
                                    value={user.role}
                                    onChange={handleChange}
                                >
                                    <option value="APPLICANT">Applicant</option>
                                    <option value="HR">HR</option>
                                    <option value="ADMIN">Admin</option>
                                </select>
                            </div>

                            <p className="role-hint">{roleDescriptions[user.role]}</p>

                            {message && <div className="auth-message">{message}</div>}

                            <button className="public-button primary" type="submit" disabled={loading}>
                                <FiUserPlus /> {loading ? "Registering..." : "Register"}
                            </button>
                        </form>

                        <div className="auth-footer">
                            Already have an account? <Link to="/login">Login</Link>
                        </div>
                    </div>
                </section>

                <section className="auth-side">
                    <h2>One platform for every recruitment role.</h2>
                    <p>
                        Applicants complete their profile before applying. HR reviews submissions. Admins manage users and monitor system activity.
                    </p>
                    <div className="auth-checks">
                        <div className="auth-check">
                            <FiCheckCircle /> Role-based dashboard access
                        </div>
                        <div className="auth-check">
                            <FiCheckCircle /> Profile-first application workflow
                        </div>
                        <div className="auth-check">
                            <FiCheckCircle /> NID and NESA verification support
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Register;
