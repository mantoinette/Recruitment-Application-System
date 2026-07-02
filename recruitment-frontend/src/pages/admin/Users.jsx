import { useEffect, useMemo, useState } from "react";
import {
    FiEdit2,
    FiKey,
    FiSearch,
    FiTrash2,
    FiUserPlus,
    FiUsers,
    FiUserX,
    FiX
} from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";
import { getApiErrorMessage } from "../../utils/apiError";

const emptyForm = {
    fullName: "",
    email: "",
    password: "",
    role: "APPLICANT"
};

function roleBadgeClass(role) {
    switch (role) {
        case "HR":
            return "role-hr";
        case "ADMIN":
            return "role-admin";
        default:
            return "role-applicant";
    }
}

function roleLabel(role) {
    switch (role) {
        case "HR":
            return "HR Manager";
        case "ADMIN":
            return "Administrator";
        default:
            return "Applicant";
    }
}

function Users() {
    const [users, setUsers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("success");
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");

    const loadUsers = async () => {
        try {
            const response = await api.get("/users");
            setUsers(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Failed to load users", error);
            setMessageType("error");
            setMessage(getApiErrorMessage(error, "Failed to load users."));
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const stats = useMemo(() => ({
        total: users.length,
        applicants: users.filter((user) => user.role === "APPLICANT").length,
        hr: users.filter((user) => user.role === "HR").length,
        admins: users.filter((user) => user.role === "ADMIN").length,
        inactive: users.filter((user) => user.active === false).length
    }), [users]);

    const filteredUsers = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) {
            return users;
        }

        return users.filter((user) =>
            [user.fullName, user.email, user.role]
                .filter(Boolean)
                .some((value) => value.toLowerCase().includes(query))
        );
    }, [users, search]);

    const handleChange = (event) => {
        setForm({ ...form, [event.target.name]: event.target.value });
    };

    const resetForm = () => {
        setForm(emptyForm);
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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");
        setLoading(true);

        try {
            if (editingId) {
                await api.put(`/users/${editingId}`, form);
                showSuccess("User updated successfully.");
            } else {
                await api.post("/users", form);
                showSuccess("User created successfully.");
            }

            resetForm();
            await loadUsers();
        } catch (error) {
            showError(getApiErrorMessage(error, "User action failed."));
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
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const toggleActive = async (user) => {
        try {
            await api.patch(`/users/${user.id}/active?active=${!user.active}`);
            showSuccess(`User ${user.active ? "deactivated" : "activated"} successfully.`);
            await loadUsers();
        } catch (error) {
            showError(getApiErrorMessage(error, "Failed to update user status."));
        }
    };

    const handleResetPassword = async (event) => {
        event.preventDefault();
        if (!resetPasswordUser || !newPassword.trim()) {
            return;
        }

        try {
            await api.put(`/users/${resetPasswordUser.id}/reset-password`, { password: newPassword });
            showSuccess(`Password reset for ${resetPasswordUser.fullName}.`);
            setResetPasswordUser(null);
            setNewPassword("");
        } catch (error) {
            showError(getApiErrorMessage(error, "Password reset failed."));
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) {
            return;
        }

        try {
            await api.delete(`/users/${user.id}`);
            if (editingId === user.id) {
                resetForm();
            }
            showSuccess("User deleted successfully.");
            await loadUsers();
        } catch (error) {
            showError(getApiErrorMessage(error, "Delete failed."));
        }
    };

    return (
        <AdminLayout title="User Management">
            <div className="page admin-page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Administration</div>
                        <h1 className="page-title">Manage system users</h1>
                        <p className="page-copy">
                            Create, edit, activate or deactivate accounts, reset passwords, and manage HR and applicant access.
                        </p>
                    </div>
                </div>

                <div className="grid stats-grid admin-stats">
                    <div className="stat-card admin-stat">
                        <div className="stat-label">Total users</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-card admin-stat applicants">
                        <div className="stat-label">Applicants</div>
                        <div className="stat-value">{stats.applicants}</div>
                    </div>
                    <div className="stat-card admin-stat hr">
                        <div className="stat-label">HR managers</div>
                        <div className="stat-value">{stats.hr}</div>
                    </div>
                    <div className="stat-card admin-stat admins">
                        <div className="stat-label">Administrators</div>
                        <div className="stat-value">{stats.admins}</div>
                    </div>
                    <div className="stat-card admin-stat inactive">
                        <div className="stat-label">Inactive accounts</div>
                        <div className="stat-value">{stats.inactive}</div>
                    </div>
                </div>

                <div className="admin-layout">
                    <div className="panel admin-form-panel">
                        <div className="admin-form-header">
                            <h2 className="panel-title">
                                {editingId ? <FiEdit2 /> : <FiUserPlus />}
                                {editingId ? "Edit user" : "Create user"}
                            </h2>
                            {editingId && (
                                <button className="icon-button" type="button" onClick={resetForm} aria-label="Cancel edit">
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-section">
                                <div className="form-section-title">Account details</div>
                                <div className="form-grid">
                                    <div className="field full">
                                        <label htmlFor="fullName">Full name</label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            placeholder="e.g. Jane Uwase"
                                            required
                                        />
                                    </div>
                                    <div className="field full">
                                        <label htmlFor="email">Email address</label>
                                        <input
                                            id="email"
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="user@example.com"
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
                                            placeholder={editingId ? "Optional" : "Minimum 6 characters"}
                                            required={!editingId}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="form-section">
                                <div className="form-section-title">Role & access</div>
                                <div className="form-grid">
                                    <div className="field full">
                                        <label htmlFor="role">System role</label>
                                        <select id="role" name="role" value={form.role} onChange={handleChange}>
                                            <option value="APPLICANT">Applicant</option>
                                            <option value="HR">HR Manager</option>
                                            <option value="ADMIN">Administrator</option>
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
                                <button className="primary-button" type="submit" disabled={loading}>
                                    {loading ? "Saving..." : editingId ? "Update user" : "Create user"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="panel admin-list-panel">
                        <div className="admin-list-header">
                            <div>
                                <h2 className="panel-title"><FiUsers /> All users</h2>
                                <div className="admin-list-count">{filteredUsers.length} account(s)</div>
                            </div>
                            <div className="admin-search">
                                <FiSearch />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or role"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                />
                            </div>
                        </div>

                        {filteredUsers.length === 0 ? (
                            <div className="admin-empty">
                                <FiUsers />
                                <h3>No users found</h3>
                                <p>Create a new account or adjust your search.</p>
                            </div>
                        ) : (
                            <div className="admin-table-wrap">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>User</th>
                                            <th>Role</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => (
                                            <tr key={user.id}>
                                                <td>
                                                    <div className="admin-user-cell">
                                                        <div className="admin-user-name">{user.fullName}</div>
                                                        <div className="admin-user-email">{user.email}</div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className={`badge ${roleBadgeClass(user.role)}`}>
                                                        {roleLabel(user.role)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <span className={`badge ${user.active === false ? "rejected" : "approved"}`}>
                                                        {user.active === false ? "Inactive" : "Active"}
                                                    </span>
                                                </td>
                                                <td>
                                                    <div className="admin-actions">
                                                        <button
                                                            className="admin-icon-btn"
                                                            type="button"
                                                            onClick={() => startEdit(user)}
                                                            title="Edit user"
                                                        >
                                                            <FiEdit2 />
                                                        </button>
                                                        <button
                                                            className="admin-icon-btn"
                                                            type="button"
                                                            onClick={() => setResetPasswordUser(user)}
                                                            title="Reset password"
                                                        >
                                                            <FiKey />
                                                        </button>
                                                        <button
                                                            className="admin-icon-btn warning"
                                                            type="button"
                                                            onClick={() => toggleActive(user)}
                                                            title={user.active === false ? "Activate user" : "Deactivate user"}
                                                        >
                                                            <FiUserX />
                                                        </button>
                                                        <button
                                                            className="admin-icon-btn danger"
                                                            type="button"
                                                            onClick={() => handleDelete(user)}
                                                            title="Delete user"
                                                        >
                                                            <FiTrash2 />
                                                        </button>
                                                    </div>
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

            {resetPasswordUser && (
                <div className="admin-modal-overlay" onClick={() => setResetPasswordUser(null)}>
                    <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
                        <h3><FiKey /> Reset password</h3>
                        <p className="admin-modal-copy">
                            Set a new password for <strong>{resetPasswordUser.fullName}</strong> ({resetPasswordUser.email}).
                        </p>
                        <form onSubmit={handleResetPassword}>
                            <div className="field full">
                                <label htmlFor="newPassword">New password</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(event) => setNewPassword(event.target.value)}
                                    placeholder="Enter new password"
                                    required
                                />
                            </div>
                            <div className="form-actions">
                                <button className="secondary-button" type="button" onClick={() => setResetPasswordUser(null)}>
                                    Cancel
                                </button>
                                <button className="primary-button" type="submit">Reset password</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

export default Users;
