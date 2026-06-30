function StatBarChart({ items }) {
    const maxValue = Math.max(...items.map((item) => item.value), 1);

    return (
        <div className="chart-bars">
            {items.map((item) => (
                <div className="chart-row" key={item.label}>
                    <div className="chart-label">{item.label}</div>
                    <div className="chart-track">
                        <div
                            className="chart-fill"
                            style={{
                                width: `${(item.value / maxValue) * 100}%`,
                                background: item.color || "#2563eb"
                            }}
                        />
                    </div>
                    <div className="chart-value">{item.value}</div>
                </div>
            ))}
        </div>
    );
}

export default StatBarChart;
