import HrLayout from "../../layouts/HrLayout";
import VacancyManager from "../../components/VacancyManager";

function Jobs() {
    return (
        <HrLayout title="Job Vacancies">
            <VacancyManager
                title="Manage job openings"
                description="Create, update, close, or delete vacancies shown on the public home page."
            />
        </HrLayout>
    );
}

export default Jobs;
