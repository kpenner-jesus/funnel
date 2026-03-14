"use client";
function Counter({
  label, hint, value, min = 0, max = 999,
  onChange,
}: {
  label: string; hint: string; value: number; min?: number; max?: number;
  onChange: (n: number) => void;
}) {
  const adj = (d: number) => onChange(Math.min(max, Math.max(min, value + d)));

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    padding: "0.4rem 0.7rem",
    background: disabled ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.75)",
    border: "1px solid rgba(0,0,0,0.12)",
    borderRadius: 8,
    fontSize: "0.8rem",
    fontWeight: 600,
    color: disabled ? "rgba(0,0,0,0.2)" : "var(--text-secondary)",
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.15s ease",
    fontFamily: "var(--font-body)",
    lineHeight: 1,
    minWidth: "2.8rem",
    textAlign: "center" as const,
  });

  return (
    <div style={{ marginBottom: "2rem" }}>
      {/* Label */}
      <div style={{
        fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.1em",
        textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.875rem",
      }}>
        {label}
      </div>

      {/* Counter layout:
          Row 1: [−100] [−10] [−1]
          Row 2: big number in centre
          Row 3: [+1]  [+10] [+100]
          On wider screens all three rows collapse into one line */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>

        {/* Negative steps — never wrap */}
        <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
          {[-100, -10, -1].map((d) => {
            const dis = value + d < min;
            return (
              <button key={d} style={btnStyle(dis)} disabled={dis}
                onMouseEnter={(e) => {
                  if (!dis) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = dis ? "rgba(0,0,0,0.2)" : "var(--text-secondary)";
                }}
                onClick={() => adj(d)}>
                {d}
              </button>
            );
          })}
        </div>

        {/* Big number — grows to fill available space */}
        <div style={{
          fontFamily: "var(--font-display)", fontSize: "2.4rem", fontWeight: 500,
          flex: 1, textAlign: "center", lineHeight: 1,
        }}>
          {value}
        </div>

        {/* Positive steps — never wrap */}
        <div style={{ display: "flex", gap: "0.35rem", flexShrink: 0 }}>
          {[1, 10, 100].map((d) => {
            const dis = value + d > max;
            return (
              <button key={d} style={btnStyle(dis)} disabled={dis}
                onMouseEnter={(e) => {
                  if (!dis) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--accent)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--accent)";
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.color = dis ? "rgba(0,0,0,0.2)" : "var(--text-secondary)";
                }}
                onClick={() => adj(d)}>
                +{d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hint below the counter */}
      <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.5rem", fontWeight: 300 }}>
        {hint}
      </div>
    </div>
  );
}
