import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiHome } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";

const STEPS = [
    "Nationality",
    "Identity",
    "Academic Record",
    "Professional Info",
    "Documents"
];

const DOCUMENT_TYPES = ["cv", "degree", "certificates", "document"];

const DOCUMENT_LABELS = {
    cv: "CV",
    degree: "Degree",
    certificates: "Certificates",
    document: "Supporting document"
};

const emptyUploadStatus = {
    cv: "idle",
    degree: "idle",
    certificates: "idle",
    document: "idle"
};
const emptyProfile = {
    nationality: "",
    fullName: "",
    email: "",
    nationalId: "",
    phone: "",
    address: "",
    district: "",
    sector: "",
    dateOfBirth: "",
    gender: "",
    school: "",
    graduationYear: "",
    education: "",
    nesaGrade: "",
    nesaOption: "",
    experience: "",
    skills: "",
    professionalSummary: "",
    certifications: "",
    nidVerified: false,
    nesaVerified: false
};

function Profile() {
    const navigate = useNavigate();
    const user = getUser() || {};
    const pendingFiles = useRef({});
    const messageRef = useRef(null);
    const [step, setStep] = useState(0);
    const [profile, setProfile] = useState(emptyProfile);
    const [profileComplete, setProfileComplete] = useState(false);
    const [missingRequirements, setMissingRequirements] = useState([]);
    const [fileNames, setFileNames] = useState({
        cv: "",
        degree: "",
        certificates: "",
        document: ""
    });
    const [uploadStatus, setUploadStatus] = useState(emptyUploadStatus);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);

    const isRwandan = profile.nationality === "RWANDAN";

    const loadProfile = async () => {
        if (!user.id) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`/profile/${user.id}`);
            const data = response.data;
            setProfile({
                nationality: data.nationality || "",
                fullName: data.user?.fullName || user.fullName || "",
                email: data.user?.email || user.email || "",
                nationalId: data.nationalId || "",
                phone: data.phone || "",
                address: data.address || "",
                district: data.district || "",
                sector: data.sector || "",
                dateOfBirth: data.dateOfBirth || "",
                gender: data.gender || "",
                school: data.school || "",
                graduationYear: data.graduationYear || "",
                education: data.education || "",
                nesaGrade: data.nesaGrade || "",
                nesaOption: data.nesaOption || "",
                experience: data.experience || "",
                skills: data.skills || "",
                professionalSummary: data.professionalSummary || "",
                certifications: data.certifications || "",
                nidVerified: Boolean(data.nidVerified),
                nesaVerified: Boolean(data.nesaVerified)
            });
            setProfileComplete(Boolean(data.profileComplete));
            setFileNames({
                cv: data.cvUrl ? data.cvUrl.split(/[/\\]/).pop() : "",
                degree: data.degreeUrl ? data.degreeUrl.split(/[/\\]/).pop() : "",
                certificates: data.certificatesUrl ? data.certificatesUrl.split(/[/\\]/).pop() : "",
                document: data.supportingDocumentUrl ? data.supportingDocumentUrl.split(/[/\\]/).pop() : ""
            });
            setUploadStatus({
                cv: data.cvUrl ? "uploaded" : "idle",
                degree: data.degreeUrl ? "uploaded" : "idle",
                certificates: data.certificatesUrl ? "uploaded" : "idle",
                document: data.supportingDocumentUrl ? "uploaded" : "idle"
            });
        } catch (error) {
            console.error("Failed to load profile", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [user.id]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({
            ...current,
            [name]: value,
            ...(name === "nationality" ? { nidVerified: false, nesaVerified: false } : {})
        }));
    };

    const verifyNid = async () => {
        try {
            const response = await api.get(`/api/nid/${profile.nationalId.trim()}`);
            const data = response.data;
            setProfile((current) => ({
                ...current,
                fullName: data.fullName || current.fullName,
                dateOfBirth: data.dateOfBirth || current.dateOfBirth,
                gender: data.gender || current.gender,
                district: data.district || current.district,
                sector: data.sector || current.sector,
                address: data.address || current.address,
                nidVerified: true
            }));
            setMessageType("success");
            setMessage(`NID verified for ${data.fullName}.`);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "NID verification failed.");
        }
    };

    const verifyNesa = async () => {
        if (!profile.nationalId.trim()) {
            setMessageType("error");
            setMessage("Enter and verify your National ID before NESA lookup.");
            return;
        }

        try {
            const response = await api.get(`/api/nesa/${profile.nationalId.trim()}`);
            const data = response.data;
            setProfile((current) => ({
                ...current,
                school: data.school || "",
                nesaGrade: data.grade || "",
                nesaOption: data.option || "",
                graduationYear: data.year || "",
                education: data.school
                    ? `${data.school} (${data.year || "N/A"})`
                    : current.education,
                nesaVerified: true
            }));
            setMessageType("success");
            setMessage(`NESA record loaded: ${data.school}, grade ${data.grade}.`);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "NESA lookup failed.");
        }
    };

    useEffect(() => {
        if (message && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [message]);

    const persistProfile = async () => {
        const response = await api.put(`/profile/${user.id}`, profile);
        const updatedUser = {
            ...user,
            fullName: profile.fullName || user.fullName,
            email: profile.email || user.email
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setProfileComplete(Boolean(response.data.profileComplete));
        return response.data;
    };

    const refreshStatus = async () => {
        const statusResponse = await api.get(`/profile/${user.id}/status`);
        setProfileComplete(Boolean(statusResponse.data.profileComplete));
        setMissingRequirements(Array.isArray(statusResponse.data.missing) ? statusResponse.data.missing : []);
        return statusResponse.data;
    };

    const uploadFileByType = async (file, type) => {
        const formData = new FormData();
        formData.append("file", file);

        const endpoints = {
            cv: "cv",
            degree: "degree",
            certificates: "certificates",
            document: "document"
        };

        setUploadStatus((current) => ({ ...current, [type]: "uploading" }));

        try {
            const response = await api.post(`/profile/${user.id}/${endpoints[type]}`, formData);
            setProfileComplete(Boolean(response.data.profileComplete));
            setFileNames((current) => ({ ...current, [type]: file.name }));
            setUploadStatus((current) => ({ ...current, [type]: "uploaded" }));
            delete pendingFiles.current[type];
            return response.data;
        } catch (error) {
            setUploadStatus((current) => ({ ...current, [type]: "error" }));
            throw error;
        }
    };

    const uploadPendingDocuments = async () => {
        for (const type of DOCUMENT_TYPES) {
            const pendingFile = pendingFiles.current[type];
            if (pendingFile && uploadStatus[type] !== "uploaded") {
                await uploadFileByType(pendingFile, type);
            }
        }
    };

    useEffect(() => {
        if (!showCompleteModal) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            navigate("/applicant/jobs");
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [showCompleteModal, navigate]);

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");
        setMissingRequirements([]);

        try {
            await uploadPendingDocuments();
            await persistProfile();
            const status = await refreshStatus();

            if (status.profileComplete) {
                setShowCompleteModal(true);
            } else {
                setMessageType("error");
                const missingText = status.missing?.length
                    ? status.missing.join(", ")
                    : "one or more required items";
                setMessage(`Profile saved, but still incomplete. Missing: ${missingText}.`);
            }
        } catch (error) {
            setMessageType("error");
            const uploadError = error.response?.data;
            setMessage(typeof uploadError === "string" ? uploadError : "Failed to save profile or upload documents.");
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (event, type) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        pendingFiles.current[type] = file;
        setMessage("");

        try {
            await uploadFileByType(file, type);
            setMessageType("success");
            setMessage(`${DOCUMENT_LABELS[type]} uploaded successfully.`);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || `${DOCUMENT_LABELS[type]} upload failed. Please try again.`);
        }
    };

    const goToNextStep = async () => {
        if (!canProceed()) {
            return;
        }

        try {
            if (step > 0 && step < 4) {
                await persistProfile();
            }
            setStep(step + 1);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "Failed to save your progress. Please try again.");
        }
    };

    const canProceed = () => {
        if (step === 0) return profile.nationality === "RWANDAN" || profile.nationality === "NON_RWANDAN";
        if (step === 1) {
            const base = profile.fullName && profile.gender && profile.dateOfBirth && profile.district && profile.sector;
            return isRwandan ? base && profile.nidVerified : base;
        }
        if (step === 2) {
            const base = profile.school && profile.nesaGrade && profile.nesaOption && profile.graduationYear;
            return isRwandan ? base && profile.nesaVerified : base;
        }
        if (step === 3) {
            return profile.phone && profile.email && profile.experience && profile.skills && profile.professionalSummary;
        }
        return true;
    };

    const renderStep = () => {
        if (step === 0) {
            return (
                <div className="profile-step">
                    <h2 className="panel-title">What is your nationality?</h2>
                    <p className="page-copy">Rwandan applicants verify identity through NID and load academic records from NESA.</p>
                    <div className="radio-group">
                        <label className={`radio-card ${profile.nationality === "RWANDAN" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="nationality"
                                value="RWANDAN"
                                checked={profile.nationality === "RWANDAN"}
                                onChange={handleChange}
                            />
                            <span>Rwandan</span>
                        </label>
                        <label className={`radio-card ${profile.nationality === "NON_RWANDAN" ? "selected" : ""}`}>
                            <input
                                type="radio"
                                name="nationality"
                                value="NON_RWANDAN"
                                checked={profile.nationality === "NON_RWANDAN"}
                                onChange={handleChange}
                            />
                            <span>Non-Rwandan</span>
                        </label>
                    </div>
                </div>
            );
        }

        if (step === 1) {
            return (
                <div className="profile-step">
                    <h2 className="panel-title">Identity information</h2>
                    {isRwandan ? (
                        <>
                            <div className="field full">
                                <label htmlFor="nationalId">National ID (NID)</label>
                                <div className="inline-actions">
                                    <input
                                        id="nationalId"
                                        name="nationalId"
                                        value={profile.nationalId}
                                        onChange={handleChange}
                                        placeholder="16-digit National ID"
                                    />
                                    <button className="secondary-button" type="button" onClick={verifyNid}>
                                        Verify identity
                                    </button>
                                </div>
                                {profile.nidVerified && <span className="badge approved">Verified</span>}
                            </div>
                            <div className="form-grid">
                                <div className="field">
                                    <label htmlFor="fullName">Full name</label>
                                    <input id="fullName" name="fullName" value={profile.fullName} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="gender">Gender</label>
                                    <input id="gender" name="gender" value={profile.gender} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="dateOfBirth">Date of birth</label>
                                    <input id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="district">District</label>
                                    <input id="district" name="district" value={profile.district} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="sector">Sector</label>
                                    <input id="sector" name="sector" value={profile.sector} readOnly />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="form-grid">
                            <div className="field full">
                                <label htmlFor="fullName">Full name</label>
                                <input id="fullName" name="fullName" value={profile.fullName} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="gender">Gender</label>
                                <input id="gender" name="gender" value={profile.gender} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="dateOfBirth">Date of birth</label>
                                <input id="dateOfBirth" name="dateOfBirth" type="date" value={profile.dateOfBirth} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="district">District / City</label>
                                <input id="district" name="district" value={profile.district} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="sector">Sector / Region</label>
                                <input id="sector" name="sector" value={profile.sector} onChange={handleChange} required />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (step === 2) {
            return (
                <div className="profile-step">
                    <h2 className="panel-title">Academic record</h2>
                    {isRwandan ? (
                        <>
                            <div className="field full">
                                <label>NESA academic record</label>
                                <div className="inline-actions">
                                    <button className="secondary-button" type="button" onClick={verifyNesa}>
                                        Load from NESA API
                                    </button>
                                    {profile.nesaVerified && <span className="badge approved">Loaded</span>}
                                </div>
                            </div>
                            <div className="form-grid">
                                <div className="field">
                                    <label htmlFor="school">School</label>
                                    <input id="school" name="school" value={profile.school} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="nesaOption">Combination (Option)</label>
                                    <input id="nesaOption" name="nesaOption" value={profile.nesaOption} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="nesaGrade">Grade</label>
                                    <input id="nesaGrade" name="nesaGrade" value={profile.nesaGrade} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="graduationYear">Graduation year</label>
                                    <input id="graduationYear" name="graduationYear" value={profile.graduationYear} readOnly />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="form-grid">
                            <div className="field full">
                                <label htmlFor="school">School</label>
                                <input id="school" name="school" value={profile.school} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="nesaOption">Combination / Program</label>
                                <input id="nesaOption" name="nesaOption" value={profile.nesaOption} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="nesaGrade">Grade / Result</label>
                                <input id="nesaGrade" name="nesaGrade" value={profile.nesaGrade} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label htmlFor="graduationYear">Graduation year</label>
                                <input id="graduationYear" name="graduationYear" value={profile.graduationYear} onChange={handleChange} required />
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        if (step === 3) {
            return (
                <div className="profile-step">
                    <h2 className="panel-title">Professional information</h2>
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="phone">Phone number</label>
                            <input id="phone" name="phone" value={profile.phone} onChange={handleChange} required />
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input id="email" name="email" type="email" value={profile.email} onChange={handleChange} required />
                        </div>
                        <div className="field full">
                            <label htmlFor="experience">Work experience</label>
                            <textarea id="experience" name="experience" value={profile.experience} onChange={handleChange} required />
                        </div>
                        <div className="field full">
                            <label htmlFor="skills">Skills</label>
                            <textarea id="skills" name="skills" value={profile.skills} onChange={handleChange} placeholder="e.g. Java, React, Communication" required />
                        </div>
                        <div className="field full">
                            <label htmlFor="professionalSummary">Professional summary</label>
                            <textarea id="professionalSummary" name="professionalSummary" value={profile.professionalSummary} onChange={handleChange} placeholder="Brief overview of your career goals and strengths" required />
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="profile-step">
                <h2 className="panel-title">Upload documents</h2>
                <p className="page-copy">Each file uploads immediately. Wait for the green &quot;Uploaded&quot; message before saving.</p>
                <div className="form-grid">
                    {DOCUMENT_TYPES.map((type) => (
                        <div className="field" key={type}>
                            <label htmlFor={type}>{DOCUMENT_LABELS[type]} (required)</label>
                            <input
                                id={type}
                                type="file"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                onChange={(e) => uploadFile(e, type)}
                            />
                            {uploadStatus[type] === "uploading" && (
                                <div className="upload-status uploading">Uploading...</div>
                            )}
                            {uploadStatus[type] === "uploaded" && fileNames[type] && (
                                <div className="upload-status uploaded">Uploaded: {fileNames[type]}</div>
                            )}
                            {uploadStatus[type] === "error" && (
                                <div className="upload-status error">Upload failed — select the file again.</div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <ApplicantLayout title="My Profile">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Profile</div>
                        <h1 className="page-title">Complete your candidate profile</h1>
                        <p className="page-copy">
                            Follow each step to verify your identity, load academic records, and upload required documents.
                        </p>
                    </div>
                    <div className={`completion-pill ${profileComplete ? "complete" : ""}`}>
                        {profileComplete ? "Profile complete" : "Profile incomplete"}
                    </div>
                </div>

                {loading ? (
                    <p className="muted">Loading profile...</p>
                ) : (
                    <div className="panel profile-wizard">
                        <div className="stepper">
                            {STEPS.map((label, index) => (
                                <button
                                    key={label}
                                    type="button"
                                    className={`stepper-item ${index === step ? "active" : ""} ${index < step ? "done" : ""}`}
                                    onClick={() => setStep(index)}
                                >
                                    <span className="stepper-number">{index + 1}</span>
                                    <span className="stepper-label">{label}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={saveProfile}>
                            {renderStep()}

                            {message && (
                                <div ref={messageRef} className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>
                            )}

                            {missingRequirements.length > 0 && (
                                <div className="missing-list">
                                    <strong>Still required:</strong>
                                    <ul>
                                        {missingRequirements.map((item) => (
                                            <li key={item}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <div className="form-actions wizard-actions">
                                {step > 0 && (
                                    <button className="secondary-button" type="button" onClick={() => setStep(step - 1)}>
                                        Back
                                    </button>
                                )}
                                {step < STEPS.length - 1 ? (
                                    <button
                                        className="primary-button"
                                        type="button"
                                        disabled={!canProceed()}
                                        onClick={goToNextStep}
                                    >
                                        Continue
                                    </button>
                                ) : (
                                    <button className="primary-button" type="submit" disabled={saving}>
                                        {saving ? "Saving..." : "Save profile"}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}
            </section>

            {showCompleteModal && (
                <div className="modal-overlay success-overlay">
                    <div className="modal-panel success-modal">
                        <div className="success-icon-wrap">
                            <FiCheckCircle />
                        </div>
                        <h2 className="success-modal-title">Profile completed!</h2>
                        <p className="success-modal-copy">
                            Great work, {profile.fullName || user.fullName || "Applicant"}.
                            Your profile is complete and you can now apply for open vacancies.
                        </p>
                        <p className="muted success-modal-hint">
                            Redirecting to Available Jobs in a few seconds...
                        </p>
                        <div className="success-modal-actions">
                            <button
                                className="primary-button"
                                type="button"
                                onClick={() => navigate("/applicant/jobs")}
                            >
                                <FiBriefcase /> Browse jobs
                            </button>
                            <button
                                className="secondary-button"
                                type="button"
                                onClick={() => navigate("/applicant/dashboard")}
                            >
                                <FiHome /> Go to dashboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ApplicantLayout>
    );
}

export default Profile;
