interface LoadingOverlayProps {
    message?: string;
    subMessage?: string;
}

export function LoadingOverlay({ message = 'Starting hand tracking', subMessage = 'Allow camera access when your browser asks.', }: LoadingOverlayProps) {
    return (<div className="loading-overlay" role="status">
      <div className="activity" aria-hidden="true">
        {Array.from({ length: 8 }, (_, i) => <span key={i} style={{ '--i': i } as React.CSSProperties}/>)}
      </div>
      <p className="loading-overlay__text">{message}</p>
      {subMessage && <p className="loading-overlay__subtext">{subMessage}</p>}
    </div>);
}
