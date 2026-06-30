import { useEffect, useState } from "react";
import { FiBriefcase, FiPlus } from "react-icons/fi";
import api from "../../api/axios";
import HrLayout from "../../layouts/HrLayout";

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

function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [form, setForm] = useState(emptyJob);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const loadJobs = async () => {
        try {
            const response = await api.get("/jobs");
            setJobs(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load jobs", error);
        }
    };

    useEffect(() => {
        loadJobs();
    }, []);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            if (editingId) {
                await api.put(`/jobs/${editingId}`, form);
                setMessage("Vacancy updated successfully.");
            } else {
                await api.post("/jobs", form);
                setMessage("Vacancy created successfully.");
            }

            setForm(emptyJob);
            setEditingId(null);
            await loadJobs();
        } catch (error) {
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
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this vacancy?")) {
            return;
        }

        await api.delete(`/jobs/${id}`);
        await loadJobs();
    };

    return (
        <HrLayout title="Job Vacancies">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Vacancy Management</div>
                        <h1 className="page-title">Manage job openings</h1>
                        <p className="page-copy">Create and maintain vacancies visible on the public home page.</p>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">
                            <FiPlus /> {editingId ? "Edit vacancy" : "Create vacancy"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="title">Job title</label>
                                    <input id="title" name="title" value={form.title} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="department">Department</label>
                                    <input id="department" name="department" value={form.department} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="location">Location</label>
                                    <input id="location" name="location" value={form.location} onChange={handleChange} required />
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
                                    <label htmlFor="deadline">Deadline</label>
                                    <input id="deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} required />
                                </div>
                                <div className="field">
                                    <label htmlFor="status">Status</label>
                                    <select id="status" name="status" value={form.status} onChange={handleChange}>
                                        <option value="OPEN">Open</option>
                                        <option value="CLOSED">Closed</option>
                                    </select>
                                </div>
                                <div className="field full">
                                    <label htmlFor="shortDescription">Short description</label>
                                    <textarea id="shortDescription" name="shortDescription" value={form.shortDescription} onChange={handleChange} required />
                                </div>
                                <div className="field full">
                                    <label htmlFor="fullDescription">Full description</label>
                                    <textarea id="fullDescription" name="fullDescription" value={form.fullDescription} onChange={handleChange} required />
                                </div>
                            </div>

                            {message && <div className="message">{message}</div>}

                            <div className="form-actions">
                                {editingId && (
                                    <button className="secondary-button" type="button" onClick={() => { setEditingId(null); setForm(emptyJob); }}>
                                        Cancel
                                    </button>
                                )}
                                <button className="primary-button" type="submit">
                                    {editingId ? "Update vacancy" : "Create vacancy"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="panel">
                        <h2 className="panel-title"><FiBriefcase /> All vacancies</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id}>
                                        <td>{job.title}</td>
                                        <td>{job.department}</td>
                                        <td><span className={`badge ${job.status === "OPEN" ? "approved" : "rejected"}`}>{job.status}</span></td>
                                        <td className="table-actions">
                                            <button className="secondary-button" type="button" onClick={() => startEdit(job)}>Edit</button>
                                            <button className="secondary-button" type="button" onClick={() => handleDelete(job.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </HrLayout>
    );
}

export default Jobs;
