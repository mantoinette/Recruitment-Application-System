import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiAlertCircle, FiBell, FiCheckCircle, FiClock } from "react-icons/fi";
import api from "../../api/axios";
import ApplicantLayout from "../../layouts/ApplicantLayout";
import { getUser } from "../../utils/auth";

function Notifications() {
    const user = getUser() || {};
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadNotifications = async () => {
            if (!user.id) {
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/notifications/user/${user.id}`);
                setNotifications(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Failed to load notifications", error);
            } finally {
                setLoading(false);
            }
        };

        loadNotifications();
    }, [user.id]);

    const iconFor = (type) => {
        if (type === "APPROVAL") return <FiCheckCircle />;
        if (type === "REJECTION") return <FiAlertCircle />;
        if (type === "INTERVIEW") return <FiClock />;
        return <FiBell />;
    };

    const typeClass = (type) => {
        if (type === "APPROVAL") return "success";
        if (type === "REJECTION") return "error";
        if (type === "INTERVIEW") return "warning";
        return "info";
    };

    const markAllRead = async () => {
        if (!user.id) return;
        await api.put(`/notifications/user/${user.id}/read-all`);
        setNotifications((current) => current.map((item) => ({ ...item, read: true })));
    };

    const unreadCount = notifications.filter((item) => !item.read).length;

    return (
        <ApplicantLayout title="Notifications">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Inbox</div>
                        <h1 className="page-title">Notifications</h1>
                        <p className="page-copy">
                            Updates about your application status, interview schedule, and HR decisions.
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button className="secondary-button" type="button" onClick={markAllRead}>
                            Mark all as read ({unreadCount})
                        </button>
                    )}
                </div>

                <div className="panel">
                    {loading && <p className="muted">Loading notifications...</p>}
                    {!loading && notifications.length === 0 && (
                        <div className="vacancy-empty">
                            <FiBell />
                            <h3>No notifications yet</h3>
                            <p className="muted">You will be notified when HR reviews your application or schedules an interview.</p>
                            <Link className="secondary-button" to="/applicant/status">View application status</Link>
                        </div>
                    )}
                    {!loading && notifications.length > 0 && (
                        <div className="notification-list">
                            {notifications.map((item) => (
                                <div className={`notification-item ${typeClass(item.type)} ${item.read ? "read" : "unread"}`} key={item.id}>
                                    <div className="notification-icon">{iconFor(item.type)}</div>
                                    <div className="notification-body">
                                        <div className="step-title">
                                            {item.title}
                                            {!item.read && <span className="notification-unread-dot">New</span>}
                                        </div>
                                        <p className="muted">{item.message}</p>
                                        <div className="muted notification-time">
                                            {item.createdAt
                                                ? new Date(item.createdAt).toLocaleString()
                                                : "Recently"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Notifications;
