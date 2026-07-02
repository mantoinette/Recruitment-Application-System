import { Navigate, useParams } from "react-router-dom";

function JobDetail() {
    const { id } = useParams();
    return <Navigate to={`/?job=${id}`} replace />;
}

export default JobDetail;
