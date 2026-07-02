import { Link } from "react-router-dom";

function PublicFooter() {
    return (
        <footer className="public-footer">
            <div className="footer-grid">
                <div>
                    <strong className="footer-brand">RecruitPro</strong>
                    <p className="footer-copy">
                        A modern recruitment management platform connecting talented candidates with growing organizations.
                    </p>
                </div>

                <div>
                    <h4>Platform</h4>
                    <Link to="/#vacancies">Job vacancies</Link>
                    <Link to="/register">Create account</Link>
                    <Link to="/login">Sign in</Link>
                </div>

                <div>
                    <h4>Company</h4>
                    <p>Head office: Kigali, Rwanda</p>
                    <p>Email: careers@recruitpro.rw</p>
                    <p>Phone: +250 788 000 000</p>
                </div>
            </div>

            <div className="footer-bottom">
                <span>© {new Date().getFullYear()} RecruitPro. All rights reserved.</span>
                <span>Built for applicants, HR teams, and system administrators.</span>
            </div>
        </footer>
    );
}

export default PublicFooter;
