function PageLoading({ message = "Loading..." }) {
    return (
        <div className="page-loading" role="status" aria-live="polite">
            <div className="page-loading-spinner" aria-hidden="true" />
            <p className="muted">{message}</p>
        </div>
    );
}

export default PageLoading;
