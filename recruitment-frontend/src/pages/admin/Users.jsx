import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiUserPlus } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

const emptyForm = {
    fullName: "",
    email: "",
    password: "",
    role: "APPLICANT"
};

function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const loadUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const handleChange = (event) => {
        setForm({
            ...form,
            [event.target.name]: event.target.value
        });
    };

    const resetForm = () => {
        setForm(emptyForm);
        setEditingId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, form);
                setMessage("User updated successfully.");
            } else {
                await api.post("/users", form);
                setMessage("User created successfully.");
            }

            resetForm();
            await loadUsers();
        } catch (error) {
            setMessage(error.response?.data || "User action failed.");
        } finally {
            setLoading(false);
        }
    };

    const startEdit = (user) => {
        setEditingId(user.id);
        setForm({
            fullName: user.fullName || "",
            email: user.email || "",
            password: "",
            role: user.role || "APPLICANT"
        });
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Delete this user?")) {
            return;
        }

        try {
            await api.delete(`/users/${userId}`);
            setMessage("User deleted successfully.");
            await loadUsers();
        } catch (error) {
            setMessage(error.response?.data || "Delete failed.");
        }
    };

    return (
        <AdminLayout title="User Management">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Administration</div>
                        <h1 className="page-title">Manage system users</h1>
                        <p className="page-copy">
                            Create, update, and remove applicant, HR, and admin accounts.
                        </p>
                    </div>
                </div>

                <div className="grid two-column">
                    <div className="panel">
                        <h2 className="panel-title">
                            <FiUserPlus /> {editingId ? "Edit user" : "Create user"}
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="field full">
                                    <label htmlFor="fullName">Full name</label>
                                    <input
                                        id="fullName"
                                        name="fullName"
                                        value={form.fullName}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="email">Email</label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="password">
                                        Password {editingId ? "(leave blank to keep current)" : ""}
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={form.password}
                                        onChange={handleChange}
                                        required={!editingId}
                                    />
                                </div>
                                <div className="field full">
                                    <label htmlFor="role">Role</label>
                                    <select id="role" name="role" value={form.role} onChange={handleChange}>
                                        <option value="APPLICANT">Applicant</option>
                                        <option value="HR">HR</option>
                                        <option value="ADMIN">Admin</option>
                                    </select>
                                </div>
                            </div>

                            {message && <div className="message">{message}</div>}

                            <div className="form-actions">
                                {editingId && (
                                    <button className="secondary-button" type="button" onClick={resetForm}>
                                        Cancel
                                    </button>
                                )}
                                <button className="primary-button" type="submit" disabled={loading}>
                                    {loading ? "Saving..." : editingId ? "Update user" : "Create user"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="panel">
                        <h2 className="panel-title">All users</h2>
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user.id}>
                                        <td>{user.fullName}</td>
                                        <td>{user.email}</td>
                                        <td>{user.role}</td>
                                        <td className="table-actions">
                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() => startEdit(user)}
                                            >
                                                <FiEdit2 />
                                            </button>
                                            <button
                                                className="secondary-button"
                                                type="button"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
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

export default Users;
