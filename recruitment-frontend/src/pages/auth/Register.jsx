import { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import PublicFooter from "../../components/PublicFooter";
import PublicHeader from "../../components/PublicHeader";
import registerImage from "../../assets/auth-register.png";
import "../../assets/public.css";

function Register() {
    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const [user, setUser] = useState({
        fullName: "",
        email: "",
        password: ""
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
            await api.post("/auth/register", {
                ...user,
                role: "APPLICANT"
            });
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
            <PublicHeader />

            <main className="auth-page">
                <section className="auth-card-wrap">
                    <div className="auth-card">
                        <h1 className="auth-title">Create your account</h1>
                        <p className="auth-copy">
                            Create an applicant account to browse jobs, complete your profile, and apply online.
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

                <section className="auth-side auth-side-panel">
                    <img src={registerImage} alt="" className="auth-side-image" aria-hidden="true" />
                    <div className="auth-side-overlay" />
                    <div className="auth-side-content">
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
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
}

export default Register;
