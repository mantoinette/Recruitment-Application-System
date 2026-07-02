import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error("UI error:", error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{ padding: 32, fontFamily: "Segoe UI, sans-serif", color: "#172033" }}>
                    <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
                    <p style={{ color: "#69778a" }}>
                        The page failed to load. Try refreshing, or go back to the dashboard.
                    </p>
                    <pre style={{ background: "#f8fafc", padding: 16, borderRadius: 8, overflow: "auto" }}>
                        {this.state.error?.message || String(this.state.error)}
                    </pre>
                    <a href="/hr/dashboard" style={{ color: "#2f6fed", fontWeight: 700 }}>
                        Back to HR Dashboard
                    </a>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
