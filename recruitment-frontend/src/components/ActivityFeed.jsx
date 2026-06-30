function ActivityFeed({ items }) {
    if (!items || items.length === 0) {
        return <p className="muted">No recent activity yet.</p>;
    }

    return (
        <div className="activity-feed">
            {items.map((item) => (
                <div className="activity-item" key={item.id}>
                    <div className="activity-dot" style={{ background: item.color || "#2563eb" }} />
                    <div>
                        <div className="activity-title">{item.title}</div>
                        <div className="muted">{item.subtitle}</div>
                    </div>
                    <span className={`badge ${item.statusClass || "pending"}`}>{item.status}</span>
                </div>
            ))}
        </div>
    );
}

export default ActivityFeed;
