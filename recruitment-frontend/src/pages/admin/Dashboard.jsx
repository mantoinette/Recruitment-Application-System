function Dashboard() {
    return (
        <div className="dashboard">

            {/* Header */}
            <header className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Manage recruitment activities from one place.</p>
            </header>

            {/* Statistics Cards */}
            <div className="cards">

                <div className="card">
                    <h2>120</h2>
                    <p>Total Applicants</p>
                </div>

                <div className="card">
                    <h2>15</h2>
                    <p>Open Jobs</p>
                </div>

                <div className="card">
                    <h2>45</h2>
                    <p>Interviews Scheduled</p>
                </div>

                <div className="card">
                    <h2>8</h2>
                    <p>New Applications</p>
                </div>

            </div>

            {/* Quick Actions */}
            <div className="section">

                <h2>Quick Actions</h2>

                <button>Add New Job</button>
                <button>View Applicants</button>
                <button>Schedule Interview</button>
                <button>Generate Report</button>

            </div>

            {/* Recent Applicants */}
            <div className="section">

                <h2>Recent Applicants</h2>

                <table border="1" cellPadding="10">

                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Position</th>
                        <th>Status</th>
                    </tr>
                    </thead>

                    <tbody>
                    <tr>
                        <td>John Doe</td>
                        <td>Software Engineer</td>
                        <td>Pending</td>
                    </tr>

                    <tr>
                        <td>Jane Smith</td>
                        <td>Backend Developer</td>
                        <td>Interview</td>
                    </tr>

                    <tr>
                        <td>Peter Johnson</td>
                        <td>UI/UX Designer</td>
                        <td>Accepted</td>
                    </tr>
                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Dashboard;