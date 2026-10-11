interface ErrorOverlayProps {
    message: string;
    onRetry?: () => void;
    onHome?: () => void;
}

export function ErrorOverlay({ message, onRetry, onHome }: ErrorOverlayProps) {
    return (<div className="error-overlay" role="alertdialog" aria-labelledby="error-title" aria-describedby="error-message">
      <div className="error-overlay__card">
        <div className="error-overlay__icon" aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7.5A1.5 1.5 0 0 1 4.5 6h2.2l1.4-2h7.8l1.4 2h2.2A1.5 1.5 0 0 1 21 7.5v10a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/>
            <circle cx="12" cy="12.5" r="3.5"/>
            <path d="M3 3l18 18"/>
          </svg>
        </div>
        <h2 className="error-overlay__title" id="error-title">Sepia can’t start</h2>
        <p className="error-overlay__message" id="error-message">{message}</p>
        <div className="error-overlay__actions">
          <button type="button" className="button button--primary" onClick={onRetry ?? (() => window.location.reload())}>
            Try again
          </button>
          {onHome && (<button type="button" className="button button--secondary" onClick={onHome}>
              Back to home
            </button>)}
        </div>
      </div>
    </div>);
}
