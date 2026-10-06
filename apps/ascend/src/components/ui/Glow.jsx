// Soft blurred color blob for ambient light behind a panel. The pulse runs on
// an inner layer so it doesn't override the blob's own (low) opacity.
export default function Glow({ color, opacity = 0.2, className = "" }) {
  return (
    <div aria-hidden="true" className={`absolute pointer-events-none ${className}`} style={{ opacity }}>
      <div className="w-full h-full rounded-full blur-3xl glow-pulse" style={{ background: color }} />
    </div>
  );
}
