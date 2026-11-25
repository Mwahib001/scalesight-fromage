import { useId, useState, type ReactNode } from "react";
export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, ReactNode> = {
    brief: (
      <>
        <path d="M7 3h10l3 3v15H4V3h3M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    demand: (
      <>
        <path d="M3 3v18h18M7 16v-5m5 5V7m5 9v-8" />
      </>
    ),
    production: (
      <>
        <path d="m3 7 9-4 9 4-9 4-9-4Zm0 0v10l9 4 9-4V7M12 11v10" />
      </>
    ),
    expansion: (
      <>
        <path d="M4 21V9h16v12M3 9l2-6h14l2 6M8 21v-7h8v7M2 9h20" />
      </>
    ),
    options: (
      <>
        <path d="M4 4h16v16H4zM8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-4-3-8-1-9 0v15c3-2 6-2 9 0 3-2 6-2 9 0V5c-3-2-6-2-9 0Zm0 0v15" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6m0-10v1" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    warning: (
      <>
        <path d="M12 3 2 21h20L12 3ZM12 9v5m0 3v1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] ?? paths.info}
    </svg>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function Table({
  headers,
  rows,
  caption,
}: {
  headers: string[];
  rows: ReactNode[][];
  caption?: string;
}) {
  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label={caption ?? headers.join(", ")}
    >
      <table>
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th scope="col" key={i}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((c, j) =>
                j === 0 ? (
                  <th scope="row" key={j}>
                    {c}
                  </th>
                ) : (
                  <td key={j}>{c}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Tip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  return (
    <span
      className="tooltip"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={(event) => {
        if (!event.currentTarget.contains(document.activeElement))
          setOpen(false);
      }}
      onFocus={() => setOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.stopPropagation();
        }
      }}
    >
      <button
        type="button"
        className="tip-trigger"
        aria-describedby={id}
        aria-label={`Explain ${label}`}
        onClick={() => setOpen(true)}
      >
        <Icon name="info" size={15} />
      </button>
      <span className="tip-content" role="tooltip" id={id} hidden={!open}>
        {children}
      </span>
    </span>
  );
}
export function Note({
  children,
  risk = false,
}: {
  children: ReactNode;
  risk?: boolean;
}) {
  return (
    <div className={`note ${risk ? "risk" : ""}`}>
      <Icon name={risk ? "warning" : "info"} size={19} />
      <div>{children}</div>
    </div>
  );
}
