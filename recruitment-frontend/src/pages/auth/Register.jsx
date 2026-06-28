import { useState } from "react";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import { FiCheckCircle, FiLock, FiMail, FiUser, FiUserPlus } from "react-icons/fi";
import "../../assets/public.css";

function Register() {

    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

     //Stores form data

    const [user, setUser] = useState({

        fullName: "",
        email: "",
        password: ""

    });


     // Updates form fields

    const handleChange = (event) => {

        setUser({

            ...user,

            [event.target.name]: event.target.value

        });

    };

    /**
     * Sends data to backend
     */
    const registerUser = async (event) => {

        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {

            await api.post(
                "/auth/register",
                user
            );

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
                    <strong>Recruitment</strong>
                    <span>Application Management System</span>
                </Link>

                <nav className="public-nav">
                    <Link to="/">Home</Link>
                    <Link className="public-button primary" to="/login">
                        Login
                    </Link>
                </nav>
            </header>

            <main className="auth-page">
                <section className="auth-card-wrap">
                    <div className="auth-card">
                        <h1 className="auth-title">Create applicant account</h1>
                        <p className="auth-copy">
                            Register as an applicant, then submit your profile and CV for HR review.
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

                <section className="auth-side">
                    <h2>Your account starts as an applicant.</h2>
                    <p>
                        Public registration creates applicant access only. HR and administrator accounts are managed separately for security.
                    </p>
                    <div className="auth-checks">
                        <div className="auth-check">
                            <FiCheckCircle /> Submit your full profile and CV
                        </div>
                        <div className="auth-check">
                            <FiCheckCircle /> Track whether your application is pending, approved, or rejected
                        </div>
                        <div className="auth-check">
                            <FiCheckCircle /> Receive status updates from the recruitment team
                        </div>
                    </div>
                </section>
            </main>
        </div>

    );
}

export default Register;
