import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Baatology Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#070b12] text-white">
          <div className="max-w-md w-full p-6 rounded-2xl bg-slate-900 border border-red-500/40 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400">
              <span className="text-2xl">⚠️</span>
              <h2 className="text-lg font-bold">Rendering Issue Detected</h2>
            </div>
            <p className="text-sm text-slate-300">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <pre className="text-[11px] p-3 rounded bg-black/60 text-red-300/80 overflow-auto max-h-36 font-mono">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-xl text-xs uppercase tracking-wider"
            >
              Reload Interface
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
