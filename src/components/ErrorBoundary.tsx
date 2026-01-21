import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white p-8">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong</h1>
                    <div className="bg-black/30 p-4 rounded-lg border border-red-500/30 max-w-2xl overflow-auto">
                        <p className="font-mono text-sm text-red-300">
                            {this.state.error?.message}
                        </p>
                    </div>
                    <button
                        className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                        onClick={() => window.location.reload()}
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
