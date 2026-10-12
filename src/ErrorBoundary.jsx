import React from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Antigravity / Takt Error Boundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetStorage = () => {
    try {
      localStorage.removeItem('takt_collapsed_sections');
      localStorage.removeItem('takt_sidebar_collapsed');
      localStorage.removeItem('takt_guest_mode');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#fafafa] dark:bg-[#151821] text-slate-900 dark:text-[#e3e6ee] flex flex-col items-center justify-center p-6 select-none">
          <div className="max-w-md w-full bg-white dark:bg-[#1c202c] border border-slate-200 dark:border-[#31384c] rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
              <AlertCircle className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Something went wrong
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#919bb0] mt-1 leading-relaxed">
                Takt encountered an unexpected error during display. You can reload or reset cached layout state to restore the workspace instantly.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#151821] border border-slate-200 dark:border-[#2a3042] text-[11px] font-mono text-rose-600 dark:text-rose-400 text-left overflow-x-auto max-h-24">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload App</span>
              </button>

              <button
                onClick={this.handleResetStorage}
                className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#31384c] hover:bg-slate-100 dark:hover:bg-[#222736] text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                title="Clears corrupted UI layout state"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Layout</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
