import ApplicantLayout from "../../layouts/ApplicantLayout";

function Profile() {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (
        <ApplicantLayout title="My Profile">
            <section className="page">
                <div className="page-header">
                    <div>
                        <div className="page-kicker">Profile</div>
                        <h1 className="page-title">Account information</h1>
                        <p className="page-copy">
                            This is the account information returned after login and used for applicant routing.
                        </p>
                    </div>
                </div>

                <div className="panel profile-card">
                    <div className="profile-row">
                        <div className="profile-label">Full name</div>
                        <div className="profile-value">{user.fullName || "Not available"}</div>
                    </div>
                    <div className="profile-row">
                        <div className="profile-label">Email</div>
                        <div className="profile-value">{user.email || "Not available"}</div>
                    </div>
                    <div className="profile-row">
                        <div className="profile-label">Role</div>
                        <div className="profile-value">{user.role || "APPLICANT"}</div>
                    </div>
                    <div className="profile-row">
                        <div className="profile-label">User ID</div>
                        <div className="profile-value">{user.id || "Not available"}</div>
                    </div>
                </div>
            </section>
        </ApplicantLayout>
    );
}

export default Profile;
