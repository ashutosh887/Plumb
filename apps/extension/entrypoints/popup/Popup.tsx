const styles = {
  root: {
    width: 320,
    padding: 20,
    background: 'hsl(240 10% 3.9%)',
    color: 'hsl(0 0% 98%)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  title: { margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-0.01em' },
  body: {
    color: 'hsl(240 5% 64.9%)',
    fontSize: 13,
    marginTop: 8,
    lineHeight: 1.5,
  },
  divider: {
    border: 0,
    borderTop: '1px solid hsl(240 3.7% 15.9%)',
    margin: '16px 0',
  },
  status: { color: 'hsl(240 5% 64.9%)', fontSize: 12 },
  statusActive: { color: 'hsl(0 0% 98%)' },
} as const;

export function Popup() {
  return (
    <div style={styles.root}>
      <h1 style={styles.title}>Plumb</h1>
      <p style={styles.body}>
        Open <code>app.squads.so</code> and start an approval. Plumb will overlay decoded findings
        on the modal.
      </p>
      <hr style={styles.divider} />
      <p style={styles.status}>
        Status: <span style={styles.statusActive}>active</span>
      </p>
    </div>
  );
}
