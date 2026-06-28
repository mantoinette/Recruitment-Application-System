import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <div className="sidebar">

            <h2>Recruitment</h2>

            <ul>

                <li>
                    <Link to="/">Dashboard</Link>
                </li>

                <li>
                    <Link to="/applications">
                        Applications
                    </Link>
                </li>

                <li>
                    <Link to="/status">
                        My Status
                    </Link>
                </li>

                <li>
                    <Link to="/profile">
                        Profile
                    </Link>
                </li>

            </ul>

        </div>
    );
}

export default Sidebar;