import { useEffect, useMemo, useState } from "react";
import {
    FiBriefcase,
    FiCalendar,
    FiCheckCircle,
    FiEdit2,
    FiMapPin,
    FiPlus,
    FiSearch,
    FiTrash2,
    FiX
} from "react-icons/fi";
import api from "../api/axios";

const emptyJob = {
    title: "",
    department: "",
    location: "",
    employmentType: "Full-time",
    shortDescription: "",
    fullDescription: "",
    deadline: "",
    status: "OPEN"
};

function VacancyManager({ title = "Manage job openings", description = "Create and maintain vacancies." }) {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState(emptyJob);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const loadJobs = async () => {
        try {
            const response = await api.get("/jobs");
            setJobs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load jobs", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const stats = useMemo(() => ({
        total: jobs.length,
        open: jobs.filter((job) => job.status === "OPEN").length,
        closed: jobs.filter((job) => job.status === "CLOSED").length
    }), [jobs]);

    const filteredJobs = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return jobs;
        }

        return jobs.filter((job) =>
            [job.title, job.department, job.location, job.employmentType]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [jobs, search]);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const resetForm = () => {
        setForm(emptyJob);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            if (editingId) {
                await api.put(`/jobs/${editingId}`, form);
                setMessageType("success");
                setMessage("Vacancy updated successfully.");
            } else {
                await api.post("/jobs", form);
                setMessageType("success");
                setMessage("Vacancy created and published to the home page.");
            }

            resetForm();
            await loadJobs();
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "Failed to save vacancy.");
        }
    };

    const startEdit = (job) => {
        setEditingId(job.id);
        setForm({
            title: job.title || "",
            department: job.department || "",
            location: job.location || "",
            employmentType: job.employmentType || "",
            shortDescription: job.shortDescription || "",
            fullDescription: job.fullDescription || "",
            deadline: job.deadline || "",
            status: job.status || "OPEN"
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vacancy?")) {
            return;
        }

        try {
            await api.delete(`/jobs/${id}`);
            if (editingId === id) {
                resetForm();
            }
            await loadJobs();
            setMessageType("success");
            setMessage("Vacancy deleted.");
        } catch (error) {
            setMessageType("error");
            setMessage(error.response?.data || "Failed to delete vacancy.");
        }
    };

    const formatDeadline = (deadline) => {
        if (!deadline) {
            return "No deadline";
        }
        return new Date(deadline).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="page vacancy-page">
            <div className="page-header vacancy-header">
                <div>
                    <div className="page-kicker">Vacancy Management</div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-copy">{description}</p>
                </div>
            </div>

            <div className="grid stats-grid vacancy-stats">
                <div className="stat-card vacancy-stat">
                    <div className="stat-label">Total vacancies</div>
                    <div className="stat-value">{stats.total}</div>
                </div>
                <div className="stat-card vacancy-stat open">
                    <div className="stat-label">Open positions</div>
                    <div className="stat-value">{stats.open}</div>
                </div>
                <div className="stat-card vacancy-stat closed">
                    <div className="stat-label">Closed positions</div>
                    <div className="stat-value">{stats.closed}</div>
                </div>
            </div>

            <div className="vacancy-layout">
                <div className="panel vacancy-form-panel">
                    <div className="vacancy-form-header">
                        <h2 className="panel-title">
                            {editingId ? <FiEdit2 /> : <FiPlus />}
                            {editingId ? "Edit vacancy" : "Create vacancy"}
                        </h2>
                        {editingId && (
                            <button className="icon-button" type="button" onClick={resetForm} aria-label="Cancel edit">
                                <FiX />
                            </button>
                        )}
                    </div>

                    <form className="vacancy-form" onSubmit={handleSubmit}>
                        <div className="form-section">
                            <div className="form-section-title">Basic details</div>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="title">Job title</label>
                                    <input
                                        id="title"
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="e.g. Software Engineer"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="department">Department</label>
                                    <input
                                        id="department"
                                        name="department"
                                        value={form.department}
                                        onChange={handleChange}
                                        placeholder="e.g. Information Technology"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="location">Location</label>
                                    <input
                                        id="location"
                                        name="location"
                                        value={form.location}
                                        onChange={handleChange}
                                        placeholder="e.g. Kigali, Rwanda"
                                        required
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor="employmentType">Employment type</label>
                                    <select id="employmentType" name="employmentType" value={form.employmentType} onChange={handleChange}>
                                        <option>Full-time</option>
                                        <option>Part-time</option>
                                        <option>Contract</option>
                                        <option>Internship</option>
                                    </select>
                                </div>
                                <div className="field">
                                    <label htmlFor="deadline">Application deadline</label>
                                    <input id="deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="status">Status</label>
                                    <select id="status" name="status" value={form.status} onChange={handleChange}>
                                        <option value="OPEN">Open</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <div className="form-section-title">Job description</div>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="shortDescription">Short description</label>
                                    <textarea
                                        id="shortDescription"
                                        name="shortDescription"
                                        value={form.shortDescription}
                                        onChange={handleChange}
                                        placeholder="Brief summary shown on the job board"
                                        required
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="fullDescription">Full description</label>
                                    <textarea
                                        id="fullDescription"
                                        name="fullDescription"
                                        value={form.fullDescription}
                                        onChange={handleChange}
                                        placeholder="Responsibilities, requirements, and benefits"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {message && (
                            <div className={`message ${messageType === "error" ? "error" : ""}`}>{message}</div>
                        )}

                        <div className="form-actions vacancy-form-actions">
                            {editingId && (
                                <button className="secondary-button" type="button" onClick={resetForm}>
                                    Cancel
                                </button>
                            )}
                            <button className="primary-button" type="submit">
                                {editingId ? "Update vacancy" : "Publish vacancy"}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="panel vacancy-list-panel">
                    <div className="vacancy-list-header">
                        <h2 className="panel-title"><FiBriefcase /> All vacancies</h2>
                        <div className="search-field vacancy-search">
                            <FiSearch />
                            <input
                                type="text"
                                placeholder="Search by title, department, location..."
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                            />
                        </div>
                    </div>

                    {loading && <p className="muted">Loading vacancies...</p>}

                    {!loading && filteredJobs.length === 0 && (
                        <div className="vacancy-empty">
                            <FiBriefcase />
                            <h3>No vacancies found</h3>
                            <p className="muted">
                                {search ? "Try a different search term." : "Create your first vacancy using the form."}
                            </p>
                        </div>
                    )}

                    {!loading && filteredJobs.length > 0 && (
                        <div className="vacancy-cards">
                            {filteredJobs.map((job) => (
                                <article className={`vacancy-card ${editingId === job.id ? "editing" : ""}`} key={job.id}>
                                    <div className="vacancy-card-top">
                                        <div>
                                            <h3 className="vacancy-card-title">{job.title}</h3>
                                            <div className="vacancy-card-meta">
                                                <span className="vacancy-tag">{job.department}</span>
                                                <span><FiMapPin /> {job.location}</span>
                                                <span>{job.employmentType}</span>
                                            </div>
                                        </div>
                                        <span className={`badge ${job.status === "OPEN" ? "approved" : "rejected"}`}>
                                            {job.status === "OPEN" ? "Open" : "Closed"}
                                        </span>
                                    </div>

                                    {job.shortDescription && (
                                        <p className="vacancy-card-copy">{job.shortDescription}</p>
                                    )}

                                    <div className="vacancy-card-footer">
                                        <span className="vacancy-deadline">
                                            <FiCalendar /> Deadline: {formatDeadline(job.deadline)}
                                        </span>
                                        <div className="vacancy-card-actions">
                                            <button className="secondary-button small" type="button" onClick={() => startEdit(job)}>
                                                <FiEdit2 /> Edit
                                            </button>
                                            <button className="danger-button small" type="button" onClick={() => handleDelete(job.id)}>
                                                <FiTrash2 /> Delete
                                            </button>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}

                    {!loading && jobs.length > 0 && (
                        <div className="vacancy-list-note">
                            <FiCheckCircle />
                            Open vacancies appear on the public home page for applicants.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default VacancyManager;
