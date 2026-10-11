export function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function downloadRecording(url: string) {
    const a = document.createElement('a');
    a.href = url;
    a.download = `sepia-recording-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
