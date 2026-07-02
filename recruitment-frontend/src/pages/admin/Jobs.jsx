import AdminLayout from "../../layouts/AdminLayout";
import VacancyManager from "../../components/VacancyManager";

function Jobs() {
    return (
        <AdminLayout title="Job Vacancies">
            <VacancyManager
                title="Manage system vacancies"
                description="Super Admin control over all job postings across the recruitment platform."
            />
        </AdminLayout>
    );
}

export default Jobs;
