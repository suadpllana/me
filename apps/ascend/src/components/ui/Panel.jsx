// A "System window": translucent glass panel with a glowing top edge and
// optional HUD corner brackets. `accent` tints the border, glow and brackets.
export default function Panel({
  as = "section",
  accent,
  brackets = false,
  edge = true,
  flat = false,
  className = "",
  style,
  children,
  ...rest
}) {
  const Tag = as;
  const classes = [
    "sys-panel",
    edge && "sys-edge",
    brackets && "sys-brackets",
    flat && "sys-panel--flat",
    className,
  ]
    .filter(Boolean)
    .join(" ");
  return (
    <Tag className={classes} style={accent ? { "--accent": accent, ...style } : style} {...rest}>
      {children}
    </Tag>
  );
}

// Window title bar: ◆ LABEL ……… [right slot]
export function PanelTitle({ children, icon: Icon, right, className = "", id }) {
  return (
    <div className={`flex items-center justify-between gap-3 ${className}`}>
      <h2 id={id} className="sys-title flex items-center gap-2 min-w-0">
        {Icon ? (
          <Icon className="w-4 h-4 shrink-0 text-(--accent)" strokeWidth={2.2} aria-hidden="true" />
        ) : (
          <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-(--accent) shadow-[0_0_8px_var(--accent)] shrink-0" />
        )}
        <span className="truncate">{children}</span>
      </h2>
      {right}
    </div>
  );
}
