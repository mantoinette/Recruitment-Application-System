import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiLayers, FiPlus, FiSearch, FiX } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { getApiErrorMessage } from "../../utils/apiError";

const emptyDepartment = { name: "", description: "", active: true };

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState(emptyDepartment);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const response = await api.get("/departments");
            setDepartments(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            setMessageType("error");
            setMessage(getApiErrorMessage(error, "Failed to load departments."));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const stats = useMemo(() => ({
        total: departments.length,
        active: departments.filter((department) => department.active).length,
        inactive: departments.filter((department) => !department.active).length
    }), [departments]);

    const filteredDepartments = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return departments;
        }

        return departments.filter((department) =>
            [department.name, department.description]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [departments, search]);

    const resetForm = () => {
        setForm(emptyDepartment);
        setEditingId(null);
    };

    const showSuccess = (text) => {
        setMessageType("success");
        setMessage(text);
    };

    const showError = (text) => {
        setMessageType("error");
        setMessage(text);
    };

    const startEdit = (department) => {
        setEditingId(department.id);
        setForm({
            name: department.name || "",
            description: department.description || "",
            active: department.active !== false
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            if (editingId) {
                await api.put(`/departments/${editingId}`, form);
                showSuccess("Department updated successfully.");
            } else {
                await api.post("/departments", form);
                showSuccess("Department created successfully.");
            }

            resetForm();
            await loadDepartments();
        } catch (error) {
            showError(getApiErrorMessage(error, "Failed to save department."));
        }
    };

    return (
        <AdminLayout title="Departments">
            <div className="page admin-page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Organization</div>
                        <h1 className="page-title">Manage departments</h1>
                        <p className="page-copy">
                            Create and maintain departments used for vacancies, reporting, and recruitment organization.
                        </p>
                    </div>
                </div>

                <div className="grid stats-grid admin-stats departments-stats">
                    <div className="stat-card admin-stat">
                        <div className="stat-label">Total departments</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-card admin-stat active-dept">
                        <div className="stat-label">Active</div>
                        <div className="stat-value">{stats.active}</div>
                    </div>
                    <div className="stat-card admin-stat inactive">
                        <div className="stat-label">Inactive</div>
                        <div className="stat-value">{stats.inactive}</div>
                    </div>
                </div>

                <div className="admin-layout">
                    <div className="panel admin-form-panel">
                        <div className="admin-form-header">
                            <h2 className="panel-title">
                                {editingId ? <FiEdit2 /> : <FiPlus />}
                                {editingId ? "Edit department" : "Add department"}
                            </h2>
                            {editingId && (
                                <button className="icon-button" type="button" onClick={resetForm} aria-label="Cancel edit">
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="form-section-title">Department details</div>
                                <div className="form-grid">
                                    <div className="field full">
                                        <label htmlFor="name">Department name</label>
                                        <input
                                            id="name"
                                            value={form.name}
                                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                                            placeholder="e.g. Information Technology"
                                            required
                                        />
                                    </div>
                                    <div className="field full">
                                        <label htmlFor="description">Description</label>
                                        <textarea
                                            id="description"
                                            value={form.description}
                                            onChange={(event) => setForm({ ...form, description: event.target.value })}
                                            placeholder="Brief description of the department's function"
                                            rows={4}
                                        />
                                    </div>
                                    <div className="field full">
                                        <label htmlFor="active">Status</label>
                                        <select
                                            id="active"
                                            value={form.active ? "true" : "false"}
                                            onChange={(event) => setForm({ ...form, active: event.target.value === "true" })}
                                        >
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {message && <div className={`message ${messageType}`}>{message}</div>}

                            <div className="form-actions">
                                {editingId && (
                                    <button className="secondary-button" type="button" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                                <button className="primary-button" type="submit">
                                    {editingId ? "Update department" : "Create department"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="panel admin-list-panel">
                        <div className="admin-list-header">
                            <div>
                                <h2 className="panel-title"><FiLayers /> All departments</h2>
                                <div className="admin-list-count">{filteredDepartments.length} department(s)</div>
                            </div>
                            <div className="admin-search">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search departments"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                        </div>

                        {loading ? (
                            <p className="muted">Loading departments...</p>
                        ) : filteredDepartments.length === 0 ? (
                            <div className="admin-empty">
                                <FiLayers />
                                <h3>No departments found</h3>
                                <p>Add a department or adjust your search.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Department</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDepartments.map((department) => (
                                            <tr key={department.id}>
                                                <td>
                                                    <div className="admin-user-cell">
                                                        <div className="admin-user-name">{department.name}</div>
                                                        <div className="admin-dept-description">
                                                            {department.description || "No description provided."}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${department.active ? "approved" : "rejected"}`}>
                                                        {department.active ? "Active" : "Inactive"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="admin-icon-btn"
                                                        type="button"
                                                        onClick={() => startEdit(department)}
                                                    >
                                                        <FiEdit2 /> Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Departments;
