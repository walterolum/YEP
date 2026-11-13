const nodes = [
  { id: 'ug', label: 'Uganda', x: 182, y: 176, tone: '#5EEAD4' },
  { id: 'ke', label: 'Kenya', x: 340, y: 208, tone: '#67E3FF' },
  { id: 'rw', label: 'Rwanda', x: 206, y: 318, tone: '#8CC6FF' },
  { id: 'tz', label: 'Tanzania', x: 352, y: 330, tone: '#5EEAD4' },
];

const connections = [
  { from: 'ug', to: 'ke', d: 'M182 176 Q 262 150 340 208' },
  { from: 'ug', to: 'rw', d: 'M182 176 Q 176 248 206 318' },
  { from: 'ke', to: 'tz', d: 'M340 208 Q 370 268 352 330' },
  { from: 'rw', to: 'tz', d: 'M206 318 Q 278 350 352 330' },
  { from: 'ug', to: 'tz', d: 'M182 176 Q 300 300 352 330' },
];

/**
 * Enterprise exchange architecture visual: a clean, precision network diagram
 * mapping regional participants in Uganda, Kenya, Rwanda and Tanzania.
 */
export function HeroVisual() {
  return (
    <figure className="relative mx-auto w-full max-w-[35rem] lg:mx-0">
      <div className="relative">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-navy-950/70 p-4 shadow-panel">
          <div className="relative overflow-hidden rounded-xl border border-white/10 bg-navy-900">
            <div className="flex items-center justify-between gap-3 px-4 pt-3.5 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-teal-400" aria-hidden="true" />
                <p className="text-2xs font-semibold uppercase tracking-[0.14em] text-cyan-200">
                  Regional Exchange Network
                </p>
              </div>
              <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-2xs font-semibold uppercase tracking-[0.08em] text-navy-100">
                East Africa
              </span>
            </div>

            <svg
              viewBox="0 0 520 500"
              className="h-auto w-full"
              role="img"
              aria-label="Network diagram connecting participants in Uganda, Kenya, Rwanda and Tanzania through a shared virtual exchange."
            >
              <defs />

              {/* Guide coordinate circles */}
              <circle cx="260" cy="252" r="160" fill="none" stroke="rgba(148,197,255,0.08)" strokeWidth="1" strokeDasharray="3 6" />
              <circle cx="260" cy="252" r="100" fill="none" stroke="rgba(148,197,255,0.12)" strokeWidth="1" />

              {/* Connections between nodes */}
              <g fill="none" stroke="#2DD4BF" strokeOpacity="0.45" strokeWidth="1.5">
                {connections.map((connection) => (
                  <path
                    key={`${connection.from}-${connection.to}`}
                    d={connection.d}
                    strokeDasharray="4 6"
                  />
                ))}
              </g>

              {/* Central Hub Node */}
              <circle cx="260" cy="252" r="32" fill="#0B1D33" stroke="#00CFFF" strokeOpacity="0.7" strokeWidth="1.5" />
              <circle cx="260" cy="252" r="24" fill="#168BFF" fillOpacity="0.2" />
              <text x="260" y="256" textAnchor="middle" fill="#F8FAFC" fontSize="10" fontWeight="700" letterSpacing="0.8">
                YouthRise
              </text>

              {/* Regional Country Nodes */}
              {nodes.map((node) => (
                <g key={node.id}>
                  <circle cx={node.x} cy={node.y} r="18" fill="#081426" stroke={node.tone} strokeOpacity="0.85" strokeWidth="1.5" />
                  <circle cx={node.x} cy={node.y} r="5" fill={node.tone} />
                  <g transform={`translate(${node.x + (node.x > 260 ? 24 : -24)} ${node.y + 4})`}>
                    <rect
                      x={node.x > 260 ? 0 : -64}
                      y="-11"
                      width="64"
                      height="22"
                      rx="4"
                      fill="#0C1F38"
                      stroke="rgba(148,197,255,0.2)"
                    />
                    <text
                      x={node.x > 260 ? 32 : -32}
                      y="4"
                      textAnchor="middle"
                      fill="#E2E8F0"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {node.label}
                    </text>
                  </g>
                </g>
              ))}
            </svg>

            <div className="grid grid-cols-3 gap-2 border-t border-white/10 px-3 pb-3 pt-3 text-white">
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <p className="text-2xs uppercase tracking-[0.08em] text-navy-200">Teams</p>
                <p className="mt-1 text-xs font-semibold text-white">Cross-border</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <p className="text-2xs uppercase tracking-[0.08em] text-navy-200">Curriculum</p>
                <p className="mt-1 text-xs font-semibold text-white">5 Milestones</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-2">
                <p className="text-2xs uppercase tracking-[0.08em] text-navy-200">Governance</p>
                <p className="mt-1 text-xs font-semibold text-white">DPPA 2019</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-2xs leading-4 text-navy-200">
        East Africa regional model connecting youth cohorts in Uganda, Kenya, Rwanda and Tanzania.
      </figcaption>
    </figure>
  );
}
