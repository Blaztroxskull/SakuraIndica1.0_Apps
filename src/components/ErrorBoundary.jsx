import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-2xl w-full">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
            <p className="text-gray-700 mb-6">
              Maaf, aplikasi mengalami kesalahan yang tidak terduga. Silakan coba muat ulang halaman.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mb-6"
            >
              Muat Ulang Aplikasi
            </button>

            <details className="bg-gray-50 p-4 rounded border border-gray-200 overflow-auto max-h-64">
              <summary className="cursor-pointer text-sm text-gray-500 font-medium mb-2">Detail Teknis (untuk pengembang)</summary>
              <pre className="text-xs text-red-500 whitespace-pre-wrap font-mono">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo && this.state.errorInfo.componentStack}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
