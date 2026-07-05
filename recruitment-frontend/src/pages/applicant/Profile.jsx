import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBriefcase, FiCheckCircle, FiHome, FiPlus, FiTrash2 } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";
import { getApiErrorMessage } from "../../utils/apiError";
import PageLoading from "../../components/PageLoading";

const STEPS = [
    "Country",
    "Identity",
    "Academic Background",
    "Professional Info",
    "Documents"
];

const COUNTRIES = [
    "Rwanda",
    "Burundi",
    "Kenya",
    "Uganda",
    "Tanzania",
    "Democratic Republic of the Congo",
    "South Sudan",
    "Ethiopia",
    "South Africa",
    "Nigeria",
    "Ghana",
    "United States",
    "United Kingdom",
    "France",
    "Germany",
    "Canada",
    "India",
    "China",
    "Other"
];

function normalizeNationality(value) {
    if (!value || value === "RWANDAN") {
        return "Rwanda";
    }
    if (value === "NON_RWANDAN") {
        return "";
    }
    return value;
}

function isRwandaCountry(country) {
    return country === "Rwanda";
}

const EDUCATION_LEVELS = [
    { value: "PRIMARY", label: "Primary" },
    { value: "HIGH_SCHOOL", label: "High School" },
    { value: "UNIVERSITY", label: "University" },
    { value: "MASTERS", label: "Masters" },
    { value: "PHD_DOCTORAL", label: "PhD / Doctoral" }
];

function isNesaLevel(level) {
    return level === "PRIMARY" || level === "HIGH_SCHOOL";
}

function educationLevelLabel(level) {
    return EDUCATION_LEVELS.find((item) => item.value === level)?.label || "Education";
}

function createBackground(level = "HIGH_SCHOOL") {
    return {
        localId: `${Date.now()}-${Math.random()}`,
        id: null,
        level,
        schoolName: "",
        graduationYear: "",
        grade: "",
        option: "",
        nesaVerified: false
    };
}

function mapBackgroundFromApi(background) {
    return {
        localId: background.id ? `db-${background.id}` : `${Date.now()}-${Math.random()}`,
        id: background.id || null,
        level: background.level || "",
        schoolName: background.schoolName || "",
        graduationYear: background.graduationYear || "",
        grade: background.grade || "",
        option: background.option || "",
        nesaVerified: Boolean(background.nesaVerified)
    };
}

function migrateLegacyBackgrounds(data) {
    if (Array.isArray(data.academicBackgrounds) && data.academicBackgrounds.length > 0) {
        return data.academicBackgrounds.map(mapBackgroundFromApi);
    }

    if (data.school) {
        return [mapBackgroundFromApi({
            level: "HIGH_SCHOOL",
            schoolName: data.school,
            graduationYear: data.graduationYear,
            grade: data.nesaGrade,
            option: data.nesaOption,
            nesaVerified: data.nesaVerified
        })];
    }

    return [];
}

function isBackgroundComplete(background, rwandan) {
    if (!background.level) {
        return false;
    }

    if (isNesaLevel(background.level)) {
        const nesaOk = !rwandan || background.nesaVerified;
        return nesaOk
            && background.schoolName
            && background.graduationYear
            && background.grade
            && background.option;
    }

    return Boolean(background.schoolName && background.graduationYear);
}

function buildProfilePayload(profile) {
    return {
        nationality: profile.nationality,
        fullName: profile.fullName,
        email: profile.email,
        nationalId: profile.nationalId,
        phone: profile.phone,
        address: profile.address,
        district: profile.district,
        sector: profile.sector,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        highestEducationLevel: profile.highestEducationLevel || null,
        academicBackgrounds: profile.academicBackgrounds
            .filter((background) => background.level)
            .map(({ localId, ...background }) => ({
                id: background.id || null,
                level: background.level,
                schoolName: background.schoolName || "",
                graduationYear: background.graduationYear || "",
                grade: background.grade || "",
                option: background.option || "",
                nesaVerified: Boolean(background.nesaVerified)
            })),
        school: profile.school,
        graduationYear: profile.graduationYear,
        education: profile.education,
        nesaGrade: profile.nesaGrade,
        nesaOption: profile.nesaOption,
        experience: profile.experience,
        skills: profile.skills,
        professionalSummary: profile.professionalSummary,
        certifications: profile.certifications,
        nidVerified: profile.nidVerified,
        nesaVerified: profile.nesaVerified
    };
}

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
    nationality: "Rwanda",
    fullName: "",
    email: "",
    nationalId: "",
    phone: "",
    address: "",
    district: "",
    sector: "",
    dateOfBirth: "",
    gender: "",
    highestEducationLevel: "",
    academicBackgrounds: [],
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
    const location = useLocation();
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

    const isRwandan = isRwandaCountry(profile.nationality);

    const loadProfile = async () => {
        if (!user.id) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get(`/profile/${user.id}`);
            const data = response.data;
            setProfile({
                nationality: normalizeNationality(data.nationality),
                fullName: data.user?.fullName || user.fullName || "",
                email: data.user?.email || user.email || "",
                nationalId: data.nationalId || "",
                phone: data.phone || "",
                address: data.address || "",
                district: data.district || "",
                sector: data.sector || "",
                dateOfBirth: data.dateOfBirth || "",
                gender: data.gender || "",
                highestEducationLevel: data.highestEducationLevel || "",
                academicBackgrounds: migrateLegacyBackgrounds(data),
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
    }, [user.id, location.pathname]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setProfile((current) => ({
            ...current,
            [name]: value,
            ...(name === "nationality"
                ? {
                    nidVerified: false,
                    nesaVerified: false,
                    nationalId: isRwandaCountry(value) ? current.nationalId : "",
                    district: isRwandaCountry(value) ? current.district : "",
                    sector: isRwandaCountry(value) ? current.sector : ""
                }
                : {}),
            ...(name === "nationalId" ? { nidVerified: false } : {})
        }));
    };

    const applyNidData = (data) => {
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
    };

    const verifyNid = async (nationalId = profile.nationalId.trim()) => {
        if (!nationalId || nationalId.length !== 16) {
            setMessageType("error");
            setMessage("Enter a valid 16-digit National ID.");
            return;
        }

        try {
            const response = await api.get(`/api/nid/${nationalId}`);
            applyNidData(response.data);
            setMessageType("success");
            setMessage(
                `NID verified. Birth year ${response.data.dateOfBirth?.slice(0, 4)}, `
                + `${response.data.gender}, ${response.data.district}, ${response.data.sector}.`
            );
        } catch (error) {
            setMessageType("error");
            setMessage(getApiErrorMessage(error, "NID verification failed."));
        }
    };

    useEffect(() => {
        if (!isRwandan || profile.nidVerified) {
            return undefined;
        }

        const nationalId = profile.nationalId.trim();
        if (nationalId.length !== 16 || !/^\d{16}$/.test(nationalId)) {
            return undefined;
        }

        const timer = window.setTimeout(() => {
            verifyNid(nationalId);
        }, 500);

        return () => window.clearTimeout(timer);
    }, [profile.nationalId, isRwandan, profile.nidVerified]);

    const verifyNesa = async (backgroundLocalId) => {
        if (!profile.nationalId.trim()) {
            setMessageType("error");
            setMessage("Enter and verify your National ID before NESA lookup.");
            return;
        }

        try {
            const response = await api.get(`/api/nesa/${profile.nationalId.trim()}`);
            const data = response.data;

            setProfile((current) => {
                const academicBackgrounds = current.academicBackgrounds.map((background) => {
                    if (background.localId !== backgroundLocalId) {
                        return background;
                    }

                    return {
                        ...background,
                        schoolName: data.school || "",
                        grade: data.grade || "",
                        option: data.option || "",
                        graduationYear: data.year || "",
                        nesaVerified: true
                    };
                });

                const primaryBackground = academicBackgrounds.find((background) =>
                    background.localId === backgroundLocalId
                );

                return {
                    ...current,
                    academicBackgrounds,
                    school: primaryBackground?.schoolName || current.school,
                    nesaGrade: primaryBackground?.grade || current.nesaGrade,
                    nesaOption: primaryBackground?.option || current.nesaOption,
                    graduationYear: primaryBackground?.graduationYear || current.graduationYear,
                    education: primaryBackground?.schoolName
                        ? `${primaryBackground.schoolName} (${primaryBackground.graduationYear || "N/A"})`
                        : current.education,
                    nesaVerified: academicBackgrounds
                        .filter((background) => isNesaLevel(background.level))
                        .every((background) => background.nesaVerified)
                };
            });

            setMessageType("success");
            setMessage(`NESA record loaded: ${data.school}, grade ${data.grade}.`);
        } catch (error) {
            setMessageType("error");
            setMessage(getApiErrorMessage(error, "NESA lookup failed."));
        }
    };

    const addBackground = (level) => {
        setProfile((current) => ({
            ...current,
            academicBackgrounds: [...current.academicBackgrounds, createBackground(level)]
        }));
    };

    const updateBackground = (backgroundLocalId, field, value) => {
        setProfile((current) => ({
            ...current,
            academicBackgrounds: current.academicBackgrounds.map((background) => (
                background.localId === backgroundLocalId
                    ? {
                        ...background,
                        [field]: value,
                        ...(field === "level" && isNesaLevel(value)
                            ? { nesaVerified: false }
                            : {}),
                        ...(field === "level" && !isNesaLevel(value)
                            ? { nesaVerified: false, grade: "", option: "" }
                            : {})
                    }
                    : background
            )),
            nesaVerified: false
        }));
    };

    const removeBackground = (backgroundLocalId) => {
        setProfile((current) => ({
            ...current,
            academicBackgrounds: current.academicBackgrounds.filter(
                (background) => background.localId !== backgroundLocalId
            )
        }));
    };

    useEffect(() => {
        if (message && messageRef.current) {
            messageRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [message]);

    const persistProfile = async () => {
        const response = await api.put(`/profile/${user.id}`, buildProfilePayload(profile));
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
            setMessage(getApiErrorMessage(error, "Failed to save profile or upload documents."));
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
            setMessage(getApiErrorMessage(error, `${DOCUMENT_LABELS[type]} upload failed. Please try again.`));
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
            setMessage(getApiErrorMessage(error, "Failed to save your progress. Please try again."));
        }
    };

    const canProceed = () => {
        if (step === 0) return Boolean(profile.nationality);
        if (step === 1) {
            const base = profile.fullName && profile.gender && profile.dateOfBirth && profile.district && profile.sector;
            return isRwandan ? base && profile.nidVerified : base;
        }
        if (step === 2) {
            if (!profile.highestEducationLevel) {
                return false;
            }
            if (!profile.academicBackgrounds.length) {
                return false;
            }
            return profile.academicBackgrounds.every((background) =>
                isBackgroundComplete(background, isRwandan)
            );
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
                    <h2 className="panel-title">Country of residence</h2>
                    <p className="page-copy">
                        Rwanda is selected by default. Rwandan applicants verify identity with NID and load academic records from NESA.
                    </p>
                    <div className="field full">
                        <label htmlFor="nationality">Country</label>
                        <select
                            id="nationality"
                            name="nationality"
                            className="auth-select"
                            value={profile.nationality || "Rwanda"}
                            onChange={handleChange}
                        >
                            {!profile.nationality && <option value="">Select your country</option>}
                            {COUNTRIES.map((country) => (
                                <option key={country} value={country}>{country}</option>
                            ))}
                        </select>
                    </div>
                    {!isRwandan && (
                        <p className="role-hint">
                            You will enter your identity and academic details manually in the next steps.
                        </p>
                    )}
                </div>
            );
        }

        if (step === 1) {
            return (
                <div className="profile-step">
                    <h2 className="panel-title">Identity information</h2>
                    {isRwandan ? (
                        <>
                            <p className="page-copy">
                                Digits 2-5 of your NID show your birth year. Digit 6 is 7 for women and 8 for men.
                                District, sector, and date of birth are filled automatically after verification.
                            </p>
                            <div className="field full">
                                <label htmlFor="nationalId">National ID (NID)</label>
                                <div className="inline-actions">
                                    <input
                                        id="nationalId"
                                        name="nationalId"
                                        value={profile.nationalId}
                                        onChange={handleChange}
                                        placeholder="16-digit National ID"
                                        maxLength={16}
                                        inputMode="numeric"
                                    />
                                    <button className="secondary-button" type="button" onClick={() => verifyNid()}>
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
                                <div className="field full">
                                    <label htmlFor="address">Address</label>
                                    <input id="address" name="address" value={profile.address} readOnly />
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
            const defaultAddLevel = isNesaLevel(profile.highestEducationLevel)
                ? profile.highestEducationLevel
                : "UNIVERSITY";

            return (
                <div className="profile-step">
                    <h2 className="panel-title">Academic background</h2>
                    <p className="page-copy">
                        Select your highest education level, then add one or more academic backgrounds.
                        Primary and high school records can be loaded from NESA for Rwandan applicants.
                        University level and above are entered manually.
                    </p>

                    <div className="field full">
                        <label htmlFor="highestEducationLevel">Highest education level</label>
                        <select
                            id="highestEducationLevel"
                            name="highestEducationLevel"
                            className="auth-select"
                            value={profile.highestEducationLevel}
                            onChange={handleChange}
                        >
                            <option value="">Select highest level</option>
                            {EDUCATION_LEVELS.map((level) => (
                                <option key={level.value} value={level.value}>{level.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="academic-background-actions">
                        <button
                            className="secondary-button"
                            type="button"
                            onClick={() => addBackground(defaultAddLevel)}
                            disabled={!profile.highestEducationLevel}
                        >
                            <FiPlus /> Add academic background
                        </button>
                    </div>

                    {profile.academicBackgrounds.length === 0 && (
                        <p className="role-hint">Add at least one academic background to continue.</p>
                    )}

                    {profile.academicBackgrounds.map((background, index) => (
                        <div className="academic-background-card" key={background.localId}>
                            <div className="academic-background-card-header">
                                <strong>Background {index + 1}</strong>
                                <button
                                    className="secondary-button danger-button"
                                    type="button"
                                    onClick={() => removeBackground(background.localId)}
                                >
                                    <FiTrash2 /> Remove
                                </button>
                            </div>

                            <div className="field full">
                                <label>Education level</label>
                                <select
                                    className="auth-select"
                                    value={background.level}
                                    onChange={(event) => updateBackground(
                                        background.localId,
                                        "level",
                                        event.target.value
                                    )}
                                >
                                    <option value="">Select level</option>
                                    {EDUCATION_LEVELS.map((level) => (
                                        <option key={level.value} value={level.value}>{level.label}</option>
                                    ))}
                                </select>
                            </div>

                            {isNesaLevel(background.level) ? (
                                <>
                                    {isRwandan && (
                                        <div className="field full">
                                            <label>NESA record</label>
                                            <div className="inline-actions">
                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={() => verifyNesa(background.localId)}
                                                >
                                                    Load from NESA
                                                </button>
                                                {background.nesaVerified && (
                                                    <span className="badge approved">Loaded</span>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                    <div className="form-grid">
                                        <div className="field full">
                                            <label>School</label>
                                            <input
                                                value={background.schoolName}
                                                onChange={(event) => updateBackground(
                                                    background.localId,
                                                    "schoolName",
                                                    event.target.value
                                                )}
                                                readOnly={isRwandan && background.nesaVerified}
                                                required
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Combination / option</label>
                                            <input
                                                value={background.option}
                                                onChange={(event) => updateBackground(
                                                    background.localId,
                                                    "option",
                                                    event.target.value
                                                )}
                                                readOnly={isRwandan && background.nesaVerified}
                                                required
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Grade</label>
                                            <input
                                                value={background.grade}
                                                onChange={(event) => updateBackground(
                                                    background.localId,
                                                    "grade",
                                                    event.target.value
                                                )}
                                                readOnly={isRwandan && background.nesaVerified}
                                                required
                                            />
                                        </div>
                                        <div className="field">
                                            <label>Year of completion</label>
                                            <input
                                                value={background.graduationYear}
                                                onChange={(event) => updateBackground(
                                                    background.localId,
                                                    "graduationYear",
                                                    event.target.value
                                                )}
                                                readOnly={isRwandan && background.nesaVerified}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : background.level ? (
                                <div className="form-grid">
                                    <div className="field full">
                                        <label>Institution / school name</label>
                                        <input
                                            value={background.schoolName}
                                            onChange={(event) => updateBackground(
                                                background.localId,
                                                "schoolName",
                                                event.target.value
                                            )}
                                            placeholder="e.g. University of Rwanda"
                                            required
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Year of completion</label>
                                        <input
                                            value={background.graduationYear}
                                            onChange={(event) => updateBackground(
                                                background.localId,
                                                "graduationYear",
                                                event.target.value
                                            )}
                                            placeholder="e.g. 2022"
                                            required
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Program / field (optional)</label>
                                        <input
                                            value={background.option}
                                            onChange={(event) => updateBackground(
                                                background.localId,
                                                "option",
                                                event.target.value
                                            )}
                                            placeholder="e.g. Computer Science"
                                        />
                                    </div>
                                    <div className="field">
                                        <label>Result / classification (optional)</label>
                                        <input
                                            value={background.grade}
                                            onChange={(event) => updateBackground(
                                                background.localId,
                                                "grade",
                                                event.target.value
                                            )}
                                            placeholder="e.g. Second Class Upper"
                                        />
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    ))}
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
                    <div className={`completion-pill ${loading ? "loading" : profileComplete ? "complete" : ""}`}>
                        {loading
                            ? "Checking profile status..."
                            : profileComplete
                                ? "Profile complete"
                                : "Profile incomplete"}
                    </div>
                </div>

                {loading ? (
                    <PageLoading message="Loading your profile..." />
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
