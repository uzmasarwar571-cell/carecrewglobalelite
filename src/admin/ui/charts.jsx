/**
 * ─────────────────────────────────────────────────────────────
 *  DASHBOARD VISUALISATION
 * ─────────────────────────────────────────────────────────────
 *  Hand-built inline SVG rather than a charting library: the four
 *  forms this dashboard needs are simple, and shipping ~100KB of
 *  library to draw thirty rectangles is not a trade worth making.
 *
 *  Design rules applied throughout:
 *   · bars capped at 24px with a 4px rounded data-end, square at
 *     the baseline, separated by a 2px gap in the surface colour
 *   · one hue per chart — a single series carries no legend, and
 *     pipeline stages use an ordinal ramp of that same hue
 *   · hairline, recessive gridlines; values labelled selectively
 *   · text always wears an ink token, never the series colour
 *  Colours come from the validated palette in admin.css.
 * ─────────────────────────────────────────────────────────────
 */

import { useState } from 'react';

/* ── Formatting ────────────────────────────────────────────── */

/** 1,284 · 12.9K · 4.2M — keeps stat tiles from wrapping. */
export function compactNumber(value) {
  const number = Number(value) || 0;
  if (Math.abs(number) >= 1_000_000) return `${(number / 1_000_000).toFixed(1)}M`;
  if (Math.abs(number) >= 10_000) return `${(number / 1000).toFixed(1)}K`;
  return number.toLocaleString();
}

/* ── Stat tile ─────────────────────────────────────────────── */

/**
 * label · value · optional delta against a named period · optional
 * 12-point sparkline. The delta's colour states direction only, and
 * is always accompanied by an arrow glyph so it never relies on hue.
 */
export function StatTile({ label, value, delta, deltaLabel, trend, hint, icon: Icon }) {
  const showDelta = typeof delta === 'number' && Number.isFinite(delta);
  const positive = showDelta && delta > 0;
  const negative = showDelta && delta < 0;

  return (
    <div className="viz rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">{label}</p>
        {Icon && (
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          </span>
        )}
      </div>

      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-slate-900 dark:text-slate-50">
        {typeof value === 'number' ? compactNumber(value) : value}
      </p>

      <div className="mt-2.5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {showDelta && (
            <p
              className="flex items-center gap-1 text-xs font-medium"
              style={{ color: positive ? 'var(--viz-up)' : negative ? 'var(--viz-down)' : 'var(--viz-muted)' }}
            >
              <span aria-hidden="true">{positive ? '▲' : negative ? '▼' : '—'}</span>
              <span>
                {positive ? '+' : ''}
                {delta}
                {deltaLabel ? ` ${deltaLabel}` : ''}
              </span>
            </p>
          )}
          {hint && !showDelta && (
            <p className="truncate text-xs text-slate-400 dark:text-slate-500">{hint}</p>
          )}
        </div>

        {trend && trend.length > 1 && <Sparkline points={trend} />}
      </div>
    </div>
  );
}

/** 12-point trend line. Last segment takes the accent; the rest recedes. */
export function Sparkline({ points, width = 76, height = 26 }) {
  const values = points.slice(-12);
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;

  const coords = values.map((value, index) => [
    (index / Math.max(values.length - 1, 1)) * width,
    height - ((value - min) / span) * (height - 4) - 2,
  ]);

  const path = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lastX, lastY] = coords[coords.length - 1];
  const [prevX, prevY] = coords[coords.length - 2] ?? coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0 overflow-visible"
      aria-hidden="true"
    >
      <path
        d={path}
        fill="none"
        stroke="var(--viz-series-soft)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={`M${prevX.toFixed(1)} ${prevY.toFixed(1)} L${lastX.toFixed(1)} ${lastY.toFixed(1)}`}
        fill="none"
        stroke="var(--viz-series)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* End marker carries a surface ring so it stays legible on the line. */}
      <circle cx={lastX} cy={lastY} r="3.5" fill="var(--viz-series)" stroke="var(--viz-surface)" strokeWidth="2" />
    </svg>
  );
}

/* ── Column chart (leads over time) ────────────────────────── */

/**
 * A single series, so there is no legend — the card title says what
 * is plotted. Values live in the hover tooltip rather than on every
 * cap, which would be unreadable at thirty columns.
 *
 * @param {{label: string, value: number, sublabel?: string}[]} data
 */
export function ColumnChart({ data, height = 180, valueSuffix = '' }) {
  const [hover, setHover] = useState(null);

  if (!data.length) return null;

  const max = Math.max(...data.map((d) => d.value), 1);
  const ticks = niceTicks(max, 3);
  const axisMax = ticks[ticks.length - 1];

  const plotHeight = height - 24; // room for the x labels
  const slot = 100 / data.length; // percentage width per column
  // 2px of surface between neighbours, and never wider than 24px.
  const barWidth = `min(24px, calc(${slot}% - 2px))`;

  return (
    <div className="viz relative">
      {/* Gridlines + y ticks */}
      <div className="relative" style={{ height: plotHeight }}>
        {ticks.map((tick) => (
          <div
            key={tick}
            className="absolute inset-x-0 flex items-center"
            style={{ bottom: `${(tick / axisMax) * 100}%` }}
          >
            <span
              className="tabular -translate-y-1/2 pr-2 text-[10px] tabular-nums"
              style={{ color: 'var(--viz-muted)' }}
            >
              {tick}
            </span>
            <span className="h-px flex-1" style={{ backgroundColor: 'var(--viz-grid)' }} />
          </div>
        ))}

        {/* Columns */}
        <div className="absolute inset-0 ml-6 flex items-end">
          {data.map((point, index) => {
            const active = hover === index;
            const barHeight = (point.value / axisMax) * 100;
            return (
              <div
                key={point.label + index}
                className="flex h-full flex-1 cursor-default items-end justify-center"
                onMouseEnter={() => setHover(index)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(index)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="img"
                aria-label={`${point.label}: ${point.value}${valueSuffix}`}
                style={{ outline: 'none' }}
              >
                <div
                  className="rounded-t transition-opacity duration-150"
                  style={{
                    width: barWidth,
                    height: `${Math.max(barHeight, point.value > 0 ? 2 : 0)}%`,
                    backgroundColor: 'var(--viz-series)',
                    opacity: hover === null || active ? 1 : 0.45,
                    borderTopLeftRadius: 4,
                    borderTopRightRadius: 4,
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Baseline */}
        <div
          className="absolute inset-x-0 bottom-0 ml-6 h-px"
          style={{ backgroundColor: 'var(--viz-axis)' }}
        />
      </div>

      {/* X labels — thinned so they never collide */}
      <div className="ml-6 mt-1.5 flex">
        {data.map((point, index) => {
          const step = Math.ceil(data.length / 6);
          const show = index % step === 0 || index === data.length - 1;
          return (
            <span
              key={`${point.label}-label-${index}`}
              className="tabular flex-1 text-center text-[10px] tabular-nums"
              style={{ color: 'var(--viz-muted)' }}
            >
              {show ? point.label : ' '}
            </span>
          );
        })}
      </div>

      {/* Tooltip. The wrapper starts where the plot area starts (ml-6),
          so the percentage below is measured against the columns rather
          than the whole card — otherwise it drifts right across the chart. */}
      {hover !== null && (
        <div className="pointer-events-none absolute inset-y-0 left-6 right-0">
          <div
            className="absolute -top-1 z-10 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs shadow-lg dark:border-slate-700 dark:bg-slate-800"
            style={{ left: `${((hover + 0.5) / data.length) * 100}%` }}
          >
            <span className="font-semibold text-slate-900 dark:text-slate-100">
              {data[hover].value}
              {valueSuffix}
            </span>
            <span className="ml-1.5 text-slate-500 dark:text-slate-400">
              {data[hover].sublabel || data[hover].label}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Horizontal bar ranking ────────────────────────────────── */

/**
 * Magnitude ranking — a single hue, values labelled at the tip.
 * `ordinal` switches to the five-step ramp, for pipeline stages
 * where the order itself carries meaning.
 */
export function BarRanking({ data, ordinal = false, emptyLabel = 'Nothing to show yet.' }) {
  if (!data.length) {
    return (
      <p className="py-8 text-center text-[13px] text-slate-500 dark:text-slate-400">{emptyLabel}</p>
    );
  }

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="viz space-y-2.5">
      {data.map((item, index) => {
        const color = ordinal
          ? `var(--viz-ord-${Math.min(index + 1, 5)})`
          : 'var(--viz-series)';
        return (
          <div key={item.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr_auto] items-center gap-3">
            <span className="truncate text-[13px] text-slate-600 dark:text-slate-300" title={item.label}>
              {item.label}
            </span>

            <div
              className="h-2.5 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: 'var(--viz-grid)' }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${Math.max((item.value / max) * 100, item.value > 0 ? 3 : 0)}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            <span className="tabular w-10 text-right text-[13px] font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ── Helpers ───────────────────────────────────────────────── */

/** Rounds an axis maximum up to a clean number and splits it evenly. */
function niceTicks(max, count) {
  const rough = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rough || 1));
  const step = [1, 2, 2.5, 5, 10].find((m) => m * magnitude >= rough) * magnitude;
  const top = Math.ceil(max / step) * step;
  return Array.from({ length: Math.round(top / step) + 1 }, (_, index) => index * step).filter(
    (tick) => tick > 0
  );
}

/* ── Meter ─────────────────────────────────────────────────── */

/** Single proportion — used for the conversion rate readout. */
export function Meter({ value, max = 100, label, caption }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="viz">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <span className="text-[13px] text-slate-600 dark:text-slate-300">{label}</span>
        <span className="text-[13px] font-semibold text-slate-900 dark:text-slate-100">
          {percent.toFixed(0)}%
        </span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full"
        style={{ backgroundColor: 'var(--viz-series-soft)' }}
      >
        <div
          className="h-full rounded-full transition-[width] duration-500"
          style={{ width: `${percent}%`, backgroundColor: 'var(--viz-series)' }}
        />
      </div>
      {caption && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
      )}
    </div>
  );
}
