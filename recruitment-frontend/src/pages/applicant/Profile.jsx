import { useEffect, useState } from "react";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";

const emptyProfile = {
    nationalId: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    gender: "",
    education: "",
    nesaGrade: "",
    nesaOption: "",
    experience: "",
    skills: "",
    certifications: "",
    nidVerified: false,
    nesaVerified: false
};

function Profile() {
    const user = getUser() || {};
    const [profile, setProfile] = useState(emptyProfile);
    const [profileComplete, setProfileComplete] = useState(false);
    const [cvName, setCvName] = useState("");
    const [documentName, setDocumentName] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const loadProfile = async () => {
        if (!user.id) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`/profile/${user.id}`);
            const data = response.data;
            setProfile({
                nationalId: data.nationalId || "",
                phone: data.phone || "",
                address: data.address || "",
                dateOfBirth: data.dateOfBirth || "",
                gender: data.gender || "",
                education: data.education || "",
                nesaGrade: data.nesaGrade || "",
                nesaOption: data.nesaOption || "",
                experience: data.experience || "",
                skills: data.skills || "",
                certifications: data.certifications || "",
                nidVerified: Boolean(data.nidVerified),
                nesaVerified: Boolean(data.nesaVerified)
            });
            setProfileComplete(Boolean(data.profileComplete));
            setCvName(data.cvUrl ? data.cvUrl.split(/[/\\]/).pop() : "");
            setDocumentName(data.supportingDocumentUrl ? data.supportingDocumentUrl.split(/[/\\]/).pop() : "");
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
        setProfile({
            ...profile,
            [event.target.name]: event.target.value
        });
    };

    const verifyNid = async () => {
        try {
            const response = await api.get(`/api/nid/${profile.nationalId.trim()}`);
            const data = response.data;
            setProfile((current) => ({
                ...current,
                address: data.address || current.address,
                dateOfBirth: data.dateOfBirth || current.dateOfBirth,
                gender: data.gender || current.gender,
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
            setMessage("Enter a National ID before NESA lookup.");
            return;
        }

        try {
            const response = await api.get(`/api/nesa/${profile.nationalId.trim()}`);
            setProfile((current) => ({
                ...current,
                nesaGrade: response.data.grade || "",
                nesaOption: response.data.option || "",
                education: response.data.school
                    ? `${response.data.school} (${response.data.year || "N/A"})`
                    : current.education,
                nesaVerified: true
            }));
            setMessageType("success");
            setMessage(`NESA record loaded: grade ${response.data.grade}, option ${response.data.option}.`);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "NESA lookup failed.");
        }
    };

    const saveProfile = async (event) => {
        event.preventDefault();
        setSaving(true);
        setMessage("");

        try {
            const response = await api.put(`/profile/${user.id}`, profile);
            setProfileComplete(Boolean(response.data.profileComplete));
            setMessageType("success");
            setMessage(response.data.profileComplete
                ? "Profile completed successfully. You can now apply for jobs."
                : "Profile saved. Complete all required fields and upload your CV to apply.");
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "Failed to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const uploadFile = async (event, type) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const endpoint = type === "cv" ? "cv" : "document";
            const response = await api.post(`/profile/${user.id}/${endpoint}`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setProfileComplete(Boolean(response.data.profileComplete));
            if (type === "cv") {
                setCvName(file.name);
            } else {
                setDocumentName(file.name);
            }
            setMessageType("success");
            setMessage(`${type === "cv" ? "CV" : "Document"} uploaded successfully.`);
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "Upload failed.");
        }
    };

    return (
        <ApplicantLayout title="My Profile">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Profile</div>
                        <h1 className="page-title">Complete your candidate profile</h1>
                        <p className="page-copy">
                            Your profile must be complete before you can apply for any vacancy.
                        </p>
                    </div>
                    <div className={`completion-pill ${profileComplete ? "complete" : ""}`}>
                        {profileComplete ? "Profile complete" : "Profile incomplete"}
                    </div>
                </div>

                {loading ? (
                    <p className="muted">Loading profile...</p>
                ) : (
                    <div className="panel">
                        <form onSubmit={saveProfile}>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="nationalId">National ID</label>
                                    <div className="inline-actions">
                                        <input
                                            id="nationalId"
                                            name="nationalId"
                                            value={profile.nationalId}
                                            onChange={handleChange}
                                            placeholder="16-digit National ID"
                                            required
                                        />
                                        <button className="secondary-button" type="button" onClick={verifyNid}>
                                            Verify NID
                                        </button>
                                    </div>
                                </div>

                                <div className="field full">
                                    <label>NESA academic record</label>
                                    <div className="inline-actions">
                                        <button className="secondary-button" type="button" onClick={verifyNesa}>
                                            Load from NESA API
                                        </button>
                                        {profile.nesaVerified && <span className="badge approved">Verified</span>}
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="phone">Phone</label>
                                    <input id="phone" name="phone" value={profile.phone} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="address">Address</label>
                                    <input id="address" name="address" value={profile.address} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="dateOfBirth">Date of birth</label>
                                    <input id="dateOfBirth" name="dateOfBirth" value={profile.dateOfBirth} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label htmlFor="gender">Gender</label>
                                    <input id="gender" name="gender" value={profile.gender} onChange={handleChange} />
                                </div>
                                <div className="field">
                                    <label htmlFor="nesaGrade">NESA grade</label>
                                    <input id="nesaGrade" name="nesaGrade" value={profile.nesaGrade} onChange={handleChange} readOnly />
                                </div>
                                <div className="field">
                                    <label htmlFor="nesaOption">NESA option</label>
                                    <input id="nesaOption" name="nesaOption" value={profile.nesaOption} onChange={handleChange} readOnly />
                                </div>
                                <div className="field full">
                                    <label htmlFor="education">Education</label>
                                    <input id="education" name="education" value={profile.education} onChange={handleChange} required />
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
                                    <label htmlFor="certifications">Certifications</label>
                                    <textarea id="certifications" name="certifications" value={profile.certifications} onChange={handleChange} placeholder="List relevant certifications" />
                                </div>
                                <div className="field">
                                    <label htmlFor="cv">CV (required)</label>
                                    <input id="cv" type="file" accept=".pdf,.doc,.docx" onChange={(e) => uploadFile(e, "cv")} />
                                    {cvName && <div className="muted">Uploaded: {cvName}</div>}
                                </div>
                                <div className="field">
                                    <label htmlFor="document">Supporting document</label>
                                    <input id="document" type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={(e) => uploadFile(e, "document")} />
                                    {documentName && <div className="muted">Uploaded: {documentName}</div>}
                                </div>
                            </div>

                            {message && <div className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>}

                            <div className="form-actions">
                                <button className="primary-button" type="submit" disabled={saving}>
                                    {saving ? "Saving..." : "Save profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </section>
        </ApplicantLayout>
    );
}

export default Profile;
