import { useEffect, useState } from "react";
import { FiLayers } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

const emptyDepartment = { name: "", description: "", active: true };

function Departments() {
    const [departments, setDepartments] = useState([]);
    const [form, setForm] = useState(emptyDepartment);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");

    const loadDepartments = async () => {
        const response = await api.get("/departments");
        setDepartments(Array.isArray(response.data) ? response.data : []);
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            if (editingId) {
                await api.put(`/departments/${editingId}`, form);
                setMessage("Department updated.");
            } else {
                await api.post("/departments", form);
                setMessage("Department created.");
            }

            setForm(emptyDepartment);
            setEditingId(null);
            await loadDepartments();
        } catch (error) {
            setMessage(error.response?.data || "Failed to save department.");
        }
    };

    return (
        <AdminLayout title="Departments">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Organization</div>
                        <h1 className="page-title">Manage departments</h1>
                        <p className="page-copy">Create and maintain departments used across the recruitment system.</p>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">{editingId ? "Edit department" : "Add department"}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="name">Department name</label>
                                    <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                                </div>
                                <div className="field full">
                                    <label htmlFor="description">Description</label>
                                    <textarea id="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div className="field full">
                                    <label htmlFor="active">Status</label>
                                    <select id="active" value={form.active ? "true" : "false"} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
                                        <option value="true">Active</option>
                                        <option value="false">Inactive</option>
                                    </select>
                                </div>
                            </div>
                            {message && <div className="message">{message}</div>}
                            <div className="form-actions">
                                <button className="primary-button" type="submit">{editingId ? "Update" : "Create"}</button>
                            </div>
                        </form>
                    </div>

                    <div className="panel">
                        <h2 className="panel-title"><FiLayers /> All departments</h2>
                        <table className="table">
                            <thead>
                                <tr><th>Name</th><th>Status</th><th>Actions</th></tr>
                            </thead>
                            <tbody>
                                {departments.map((department) => (
                                    <tr key={department.id}>
                                        <td>{department.name}</td>
                                        <td><span className={`badge ${department.active ? "approved" : "rejected"}`}>{department.active ? "Active" : "Inactive"}</span></td>
                                        <td>
                                            <button className="secondary-button" type="button" onClick={() => { setEditingId(department.id); setForm(department); }}>Edit</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Departments;
