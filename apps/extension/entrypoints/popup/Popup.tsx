export function Popup() {
  return (
    <div style={{ width: 320, padding: 20, background: '#0c0d10', color: '#f0f1f3', fontFamily: 'Inter, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: 18 }}>Plumb</h1>
      <p style={{ color: '#8a8f99', fontSize: 13, marginTop: 8 }}>
        Open <code>app.squads.so</code> and start an approval. Plumb will overlay decoded findings on the modal.
      </p>
      <hr style={{ borderColor: '#1d1f26', margin: '16px 0' }} />
      <p style={{ color: '#8a8f99', fontSize: 12 }}>
        Status:{' '}
        <span style={{ color: '#a3e635' }}>active</span>
      </p>
    </div>
  );
}
