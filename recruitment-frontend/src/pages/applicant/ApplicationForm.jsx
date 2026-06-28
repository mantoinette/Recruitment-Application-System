import { useState } from "react";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";

function ApplicationForm() {

    // Store applicant information
    const [application, setApplication] = useState({
        phone: "",
        address: "",
        education: "",
        experience: ""
    });

    const [cvFile, setCvFile] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loading, setLoading] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    // Handle text field changes
    const handleChange = (e) => {
        setApplication({
            ...application,
            [e.target.name]: e.target.value
        });
    };

    // Handle file selection
    const handleFileChange = (e) => {
        setCvFile(e.target.files[0] || null);
    };

    // Submit application
    const submitApplication = async (event) => {

        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            const formData = new FormData();

            formData.append("userId", user.id);
            formData.append("phone", application.phone);
            formData.append("address", application.address);
            formData.append("education", application.education);
            formData.append("experience", application.experience);
            formData.append("file", cvFile);

            await api.post(
                "/applications",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            setApplication({
                phone: "",
                address: "",
                education: "",
                experience: ""
            });
            setCvFile(null);
            setMessageType("success");
            setMessage("Application submitted successfully.");

        } catch (error) {

            console.error(error);
            const errorMessage = error.response?.data || "Failed to submit application. Please check the backend and try again.";
            setMessageType("error");
            setMessage(errorMessage);

        } finally {
            setLoading(false);
        }
    };

    return (
        <ApplicantLayout title="Submit Application">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Application</div>
                        <h1 className="page-title">Submit your candidate details</h1>
                        <p className="page-copy">
                            Keep your information accurate so HR can review your application without delays.
                        </p>
                    </div>
                </div>

                <div className="panel">
                    <form onSubmit={submitApplication}>
                        <div className="form-grid">
                            <div className="field">
                                <label htmlFor="phone">Phone number</label>
                                <input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    placeholder="e.g. +27 72 000 0000"
                                    value={application.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="field">
                                <label htmlFor="address">Address</label>
                                <input
                                    id="address"
                                    type="text"
                                    name="address"
                                    placeholder="City, province"
                                    value={application.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="field full">
                                <label htmlFor="education">Education</label>
                                <input
                                    id="education"
                                    type="text"
                                    name="education"
                                    placeholder="Highest qualification or current studies"
                                    value={application.education}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="field full">
                                <label htmlFor="experience">Work experience</label>
                                <textarea
                                    id="experience"
                                    name="experience"
                                    placeholder="Summarize your relevant work experience"
                                    value={application.experience}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="field full">
                                <label htmlFor="cv">CV file name</label>
                                <input
                                    id="cv"
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    required
                                />
                                {cvFile && <div className="muted">Selected: {cvFile.name}</div>}
                            </div>
                        </div>

                        {message && (
                            <div className={`message ${messageType === "error" ? "error" : ""}`}>
                                {message}
                            </div>
                        )}

                        <div className="form-actions">
                            <button className="primary-button" type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit application"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default ApplicationForm;
