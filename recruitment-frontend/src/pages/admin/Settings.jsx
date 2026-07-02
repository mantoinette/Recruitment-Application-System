import { useEffect, useState } from "react";
import { FiSettings } from "react-icons/fi";
import api from "../../api/axios";
import AdminLayout from "../../layouts/AdminLayout";

function Settings() {
    const [settings, setSettings] = useState({
        company_name: "",
        support_email: "",
        support_phone: "",
        head_office: "",
        default_application_deadline_days: "30"
    });
    const [message, setMessage] = useState("");

    useEffect(() => {
        const loadSettings = async () => {
            const response = await api.get("/settings");
            setSettings((current) => ({ ...current, ...response.data }));
        };

        loadSettings();
    }, []);

    const handleChange = (event) => {
        setSettings({ ...settings, [event.target.name]: event.target.value });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setMessage("");

        try {
            await api.put("/settings", settings);
            setMessage("System settings updated successfully.");
        } catch (error) {
            setMessage(error.response?.data || "Failed to update settings.");
        }
    };

    return (
        <AdminLayout title="System Settings">
            <div className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Configuration</div>
                        <h1 className="page-title">System settings</h1>
                        <p className="page-copy">Manage company information and platform defaults.</p>
                    </div>
                </div>

                <div className="panel">
                    <h2 className="panel-title"><FiSettings /> General settings</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            <div className="field full">
                                <label htmlFor="company_name">Company name</label>
                                <input id="company_name" name="company_name" value={settings.company_name} onChange={handleChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="support_email">Support email</label>
                                <input id="support_email" name="support_email" value={settings.support_email} onChange={handleChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="support_phone">Support phone</label>
                                <input id="support_phone" name="support_phone" value={settings.support_phone} onChange={handleChange} />
                            </div>
                            <div className="field full">
                                <label htmlFor="head_office">Head office</label>
                                <input id="head_office" name="head_office" value={settings.head_office} onChange={handleChange} />
                            </div>
                            <div className="field">
                                <label htmlFor="default_application_deadline_days">Default deadline (days)</label>
                                <input id="default_application_deadline_days" name="default_application_deadline_days" value={settings.default_application_deadline_days} onChange={handleChange} />
                            </div>
                        </div>

                        {message && <div className="message">{message}</div>}

                        <div className="form-actions">
                            <button className="primary-button" type="submit">Save settings</button>
                        </div>
                    </form>
                </div>
            </div>
        </AdminLayout>
    );
}

export default Settings;
