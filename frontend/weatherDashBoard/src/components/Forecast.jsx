import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import { getWeatherIconUrl, getWeatherEmoji } from "../utils/weatherIcons";
import { formatTemp, formatVisibility, capitalizeWords } from "../utils/formatWeather";
import "./Forecast.css";

/* ─── JSDoc Typedefs ─── */

/**
 * @typedef {object} OWMForecastItem
 * @property {number}  dt                   Unix timestamp (seconds)
 * @property {object}  main
 * @property {number}  main.temp            Temperature (°C)
 * @property {number}  main.feels_like      Feels-like temperature
 * @property {number}  [main.temp_min]      Min temperature
 * @property {number}  [main.temp_max]      Max temperature
 * @property {number}  main.pressure        Atmospheric pressure (hPa)
 * @property {number}  main.humidity        Humidity (%)
 * @property {number}  [main.sea_level]     Sea-level pressure
 * @property {number}  [main.grnd_level]    Ground-level pressure
 * @property {Array<{id:number, main:string, description:string, icon:string}>} weather
 * @property {object}  clouds
 * @property {number}  clouds.all           Cloudiness (%)
 * @property {object}  wind
 * @property {number}  wind.speed           Wind speed (m/s)
 * @property {number}  wind.deg             Wind direction (degrees)
 * @property {number}  [wind.gust]          Wind gust (m/s)
 * @property {number}  visibility           Visibility (meters)
 * @property {number}  pop                  Probability of precipitation (0–1)
 * @property {object}  [rain]
 * @property {number}  [rain['3h']]         Rain volume for last 3h (mm)
 * @property {object}  [snow]
 * @property {number}  [snow['3h']]         Snow volume for last 3h (mm)
 * @property {object}  sys
 * @property {string}  sys.pod              Part of day ('d' or 'n')
 * @property {string}  dt_txt              "YYYY-MM-DD HH:MM:SS"
 */

/**
 * @typedef {object} ChartPoint
 * @property {number}           x      SVG x coordinate
 * @property {number}           y      SVG y coordinate
 * @property {number}           temp   Rounded temperature
 * @property {OWMForecastItem}  item   Full original forecast entry
 */

/**
 * @typedef {object} DailySummary
 * @property {string}              dateKey    Date string key
 * @property {number}              dt         Representative unix timestamp
 * @property {string}              day        Short weekday ("Mon")
 * @property {number}              high       Max temp (rounded)
 * @property {number}              low        Min temp (rounded)
 * @property {string}              icon       Representative OWM icon code
 * @property {string}              condition  Most-common weather main
 * @property {OWMForecastItem[]}   items      All forecast entries for this day
 */

/* ─── Data helpers ─── */

/** Format unix timestamp → "8 PM", "2 AM", etc. */
function fmtTime(dt) {
  return new Date(dt * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
  });
}

/** Format unix timestamp → "8:00 PM" with minutes. */
function fmtTimeFull(dt) {
  return new Date(dt * 1000).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** Format unix timestamp → short weekday name "Mon", "Tue", etc. */
function fmtDay(dt) {
  return new Date(dt * 1000).toLocaleDateString("en-US", { weekday: "short" });
}

/** Get a stable date-string key from a unix timestamp. */
function dateKey(dt) {
  return new Date(dt * 1000).toDateString();
}

/** Check if a timestamp falls on today. */
function isToday(dt) {
  return dateKey(dt) === new Date().toDateString();
}

/**
 * Convert wind degrees to compass direction.
 * @param {number} deg
 * @returns {string}
 */
function degToCompass(deg) {
  if (deg === undefined || deg === null) return "";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const idx = Math.round(((deg % 360) + 360) % 360 / 22.5) % 16;
  return dirs[idx];
}

/**
 * Group forecast items by calendar day.
 * @param {OWMForecastItem[]} list
 * @returns {DailySummary[]}
 */
function getDailySummaries(list) {
  /** @type {Record<string, {dt:number, temps:number[], icons:string[], conditions:string[], items:OWMForecastItem[]}>} */
  const buckets = {};

  for (const item of list) {
    const key = dateKey(item.dt);
    if (!buckets[key]) {
      buckets[key] = { dt: item.dt, temps: [], icons: [], conditions: [], items: [] };
    }
    buckets[key].items.push(item);
    buckets[key].temps.push(item.main.temp);
    if (item.main.temp_max !== undefined) buckets[key].temps.push(item.main.temp_max);
    if (item.main.temp_min !== undefined) buckets[key].temps.push(item.main.temp_min);
    buckets[key].icons.push(item.weather?.[0]?.icon);
    buckets[key].conditions.push(item.weather?.[0]?.main);
  }

  return Object.entries(buckets).map(([key, b]) => {
    const dayIcons = b.icons.filter((i) => i?.endsWith("d"));
    const representative = dayIcons.length > 0 ? mode(dayIcons) : mode(b.icons);

    return {
      dateKey: key,
      dt: b.dt,
      day: fmtDay(b.dt),
      high: Math.round(Math.max(...b.temps)),
      low: Math.round(Math.min(...b.temps)),
      icon: representative,
      condition: mode(b.conditions),
      items: b.items,
    };
  });
}

/** Return the most-frequent element in an array. */
function mode(arr) {
  const counts = {};
  let maxCount = 0;
  let maxVal = arr[0];
  for (const v of arr) {
    counts[v] = (counts[v] || 0) + 1;
    if (counts[v] > maxCount) {
      maxCount = counts[v];
      maxVal = v;
    }
  }
  return maxVal;
}

/* ─── SVG temperature chart ─── */

const CHART_W = 800;
const CHART_H = 160;
const PAD_TOP = 45;
const PAD_BOTTOM = 10;
const PAD_X = 40;

/**
 * Build chart points from forecast items, retaining the original object.
 * @param {OWMForecastItem[]} items
 * @returns {ChartPoint[]}
 */
function buildChartPoints(items) {
  if (items.length < 2) return [];

  const temps = items.map((h) => Math.round(h.main.temp));
  const min = Math.min(...temps);
  const max = Math.max(...temps);
  const range = max - min || 1;

  const usableW = CHART_W - PAD_X * 2;
  const usableH = CHART_H - PAD_TOP - PAD_BOTTOM;

  return items.map((h, i) => {
    const t = Math.round(h.main.temp);
    const x = PAD_X + (i / (items.length - 1)) * usableW;
    const y = PAD_TOP + (1 - (t - min) / range) * usableH;
    return { x, y, temp: t, item: h };
  });
}

/** Catmull-Rom → cubic-Bézier smooth path */
function smoothLine(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
}

/**
 * Interactive temperature chart with clickable data points.
 * @param {{ points: ChartPoint[], selectedIdx: number|null, onSelect: (idx: number) => void }} props
 */
function TempChart({ points, selectedIdx, onSelect }) {
  if (points.length < 2) return null;

  const line = smoothLine(points);
  const first = points[0];
  const last = points[points.length - 1];
  const fillPath = `${line} L ${last.x},${CHART_H} L ${first.x},${CHART_H} Z`;

  return (
    <svg
      className="forecast-chart__svg"
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Hourly temperature chart. Click a point for details."
    >
      <defs>
        <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(245,158,11,0.35)" />
          <stop offset="100%" stopColor="rgba(245,158,11,0.03)" />
        </linearGradient>
      </defs>

      {/* filled area */}
      <path d={fillPath} fill="url(#chartFill)" />

      {/* line */}
      <path
        d={line}
        fill="none"
        stroke="#f59e0b"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* dots + labels — interactive */}
      {points.map((p, i) => {
        const isSelected = selectedIdx === i;
        return (
          <g
            key={i}
            className={`forecast-chart__point${isSelected ? " forecast-chart__point--active" : ""}`}
            onClick={(e) => { e.stopPropagation(); onSelect(i); }}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(i); } }}
            role="button"
            tabIndex={0}
            aria-label={`${p.temp}° at ${fmtTime(p.item.dt)}`}
            style={{ cursor: "pointer" }}
          >
            {/* Larger invisible hit area */}
            <circle cx={p.x} cy={p.y} r="16" fill="transparent" />

            {/* Visible dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={isSelected ? "6" : "3.5"}
              fill={isSelected ? "#fff" : "#f59e0b"}
              stroke={isSelected ? "#f59e0b" : "none"}
              strokeWidth={isSelected ? "2.5" : "0"}
              className="forecast-chart__dot"
            />

            {/* Temp label */}
            <text
              x={p.x}
              y={p.y - 14}
              textAnchor="middle"
              className={`forecast-chart__label${isSelected ? " forecast-chart__label--active" : ""}`}
            >
              {p.temp}°
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Hourly Detail Panel ─── */

/**
 * @param {{ item: OWMForecastItem, onClose: () => void, closing?: boolean }} props
 */
function HourlyDetail({ item, onClose, closing }) {
  const condition = item.weather?.[0];
  const iconUrl = getWeatherIconUrl(condition?.icon);
  const emoji = getWeatherEmoji(condition?.main);
  const compass = degToCompass(item.wind?.deg);
  const rainAmt = item.rain?.["3h"];
  const snowAmt = item.snow?.["3h"];

  return (
    <div
      className={`forecast-detail${closing ? " forecast-detail--closing" : ""}`}
      onClick={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Hourly weather details"
    >
      <div className="forecast-detail__header">
        <div className="forecast-detail__time-row">
          <div className="forecast-detail__icon">
            {iconUrl ? (
              <img src={iconUrl} alt={condition?.description || "weather"} width={44} height={44} />
            ) : (
              <span className="forecast-detail__emoji">{emoji}</span>
            )}
          </div>
          <div>
            <span className="forecast-detail__time">{fmtTimeFull(item.dt)}</span>
            <span className="forecast-detail__condition">
              {capitalizeWords(condition?.description) || condition?.main || "N/A"}
            </span>
          </div>
        </div>
        <button
          className="forecast-detail__close"
          onClick={onClose}
          aria-label="Close details"
          title="Close"
        >
          ✕
        </button>
      </div>

      <div className="forecast-detail__temp-main">
        {formatTemp(item.main.temp)}
      </div>

      <div className="forecast-detail__grid">
        <DetailRow label="Feels like" value={formatTemp(item.main.feels_like)} />
        <DetailRow label="Humidity" value={item.main.humidity !== undefined ? `${item.main.humidity}%` : null} />
        <DetailRow
          label="Wind"
          value={item.wind?.speed !== undefined
            ? `${item.wind.speed} m/s ${compass}${item.wind.deg !== undefined ? ` (${item.wind.deg}°)` : ""}`
            : null
          }
        />
        {item.wind?.gust !== undefined && (
          <DetailRow label="Gust" value={`${item.wind.gust} m/s`} />
        )}
        <DetailRow label="Pressure" value={item.main.pressure !== undefined ? `${item.main.pressure} hPa` : null} />
        <DetailRow label="Visibility" value={formatVisibility(item.visibility)} />
        <DetailRow label="Clouds" value={item.clouds?.all !== undefined ? `${item.clouds.all}%` : null} />
        <DetailRow label="Precipitation" value={item.pop !== undefined ? `${Math.round(item.pop * 100)}%` : null} />
        {rainAmt !== undefined && (
          <DetailRow label="Rain (3h)" value={`${rainAmt} mm`} />
        )}
        {snowAmt !== undefined && (
          <DetailRow label="Snow (3h)" value={`${snowAmt} mm`} />
        )}
        {item.main.sea_level !== undefined && (
          <DetailRow label="Sea level" value={`${item.main.sea_level} hPa`} />
        )}
        {item.main.grnd_level !== undefined && (
          <DetailRow label="Ground level" value={`${item.main.grnd_level} hPa`} />
        )}
      </div>
    </div>
  );
}

/** @param {{ label: string, value: string|null }} props */
function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "--") return null;
  return (
    <div className="forecast-detail__row">
      <span className="forecast-detail__row-label">{label}</span>
      <span className="forecast-detail__row-value">{value}</span>
    </div>
  );
}

/* ─── Main component ─── */

const FADE_MS = 180; // chart cross-fade duration — must match CSS transition

/**
 * @param {{ forecastData: object|null, onPointSelect?: (item: OWMForecastItem) => void }} props
 */
export default function Forecast({ forecastData, onPointSelect }) {
  const [selectedDateKey, setSelectedDateKey] = useState(null);
  const [selectedPointIdx, setSelectedPointIdx] = useState(null);
  const [lastDetailItem, setLastDetailItem] = useState(null);

  // Animation states
  const [chartFading, setChartFading] = useState(false);
  const [detailClosing, setDetailClosing] = useState(false);
  const dayTimerRef = useRef(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (dayTimerRef.current) clearTimeout(dayTimerRef.current);
    };
  }, []);

  const daily = useMemo(
    () => (forecastData?.list ? getDailySummaries(forecastData.list) : []),
    [forecastData]
  );

  // Default to today (first day) when data loads or selectedDateKey isn't valid
  const activeKey = useMemo(() => {
    if (selectedDateKey && daily.some((d) => d.dateKey === selectedDateKey)) {
      return selectedDateKey;
    }
    return daily.length > 0 ? daily[0].dateKey : null;
  }, [selectedDateKey, daily]);

  // Get the hourly items for the selected day
  const selectedDayItems = useMemo(() => {
    const found = daily.find((d) => d.dateKey === activeKey);
    return found ? found.items : [];
  }, [daily, activeKey]);

  const chartPoints = useMemo(
    () => buildChartPoints(selectedDayItems),
    [selectedDayItems]
  );

  // ── Animated day change ──
  const handleDaySelect = useCallback((key) => {
    if (key === activeKey) return;

    // Cancel any in-flight transition
    if (dayTimerRef.current) clearTimeout(dayTimerRef.current);

    // Start exit animations
    setChartFading(true);
    if (selectedPointIdx !== null) {
      setDetailClosing(true);
    }

    // After fade-out completes, swap data
    dayTimerRef.current = setTimeout(() => {
      setSelectedDateKey(key);
      setSelectedPointIdx(null);
      setDetailClosing(false);
      setLastDetailItem(null);

      // Wait one frame so React renders the new data while still faded,
      // then fade the chart back in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setChartFading(false);
        });
      });
    }, FADE_MS);
  }, [activeKey, selectedPointIdx]);

  // ── Point selection (unchanged logic) ──
  const handlePointSelect = useCallback((idx) => {
    const point = chartPoints[idx];

    setSelectedPointIdx((prev) => {
      const next = prev === idx ? null : idx;
      if (next === null) {
        setLastDetailItem(null);
      } else if (point) {
        setLastDetailItem(point.item);
      }
      return next;
    });

    if (point && onPointSelect) {
      onPointSelect(point.item);
    }
  }, [chartPoints, onPointSelect]);

  const handleCloseDetail = useCallback(() => {
    setSelectedPointIdx(null);
    setDetailClosing(true);
    setTimeout(() => {
      setDetailClosing(false);
      setLastDetailItem(null);
    }, FADE_MS);
  }, []);

  // Track the last valid detail item so it stays visible during close animation
  const selectedItem = selectedPointIdx !== null ? chartPoints[selectedPointIdx]?.item : null;

  // Show detail panel when selected OR during close animation
  const showDetail = Boolean(selectedItem || lastDetailItem || detailClosing);
  const detailItem = selectedItem ?? lastDetailItem;

  if (!forecastData?.list || forecastData.list.length === 0) return null;

  return (
    <section className="forecast-compact" aria-label="Forecast">
      <h3 className="forecast-compact__title">Forecast</h3>

      <div className="forecast-compact__card">
        {/* ── Temperature chart ── */}
        {chartPoints.length >= 2 && (
          <div className={`forecast-chart${chartFading ? " forecast-chart--fading" : ""}`}>
            <TempChart
              points={chartPoints}
              selectedIdx={selectedPointIdx}
              onSelect={handlePointSelect}
            />

            {/* Time labels row */}
            <div className="forecast-chart__times">
              {selectedDayItems.map((h, i) => (
                <button
                  key={h.dt}
                  className={`forecast-chart__time${selectedPointIdx === i ? " forecast-chart__time--active" : ""}`}
                  onClick={() => handlePointSelect(i)}
                  aria-label={`Select ${fmtTime(h.dt)}`}
                >
                  {fmtTime(h.dt)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Hourly detail panel ── */}
        {showDetail && detailItem && (
          <HourlyDetail
            item={detailItem}
            onClose={handleCloseDetail}
            closing={detailClosing}
          />
        )}

        {/* ── Divider ── */}
        <div className="forecast-compact__divider" />

        {/* ── Daily forecast row ── */}
        <div className="forecast-daily" role="tablist" aria-label="Select forecast day">
          {daily.map((d) => {
            const iconUrl = getWeatherIconUrl(d.icon);
            const emoji = getWeatherEmoji(d.condition);
            const today = isToday(d.dt);
            const isActive = d.dateKey === activeKey;

            return (
              <button
                key={d.dateKey}
                role="tab"
                aria-selected={isActive}
                className={`forecast-daily__item${isActive ? " forecast-daily__item--active" : ""}`}
                onClick={() => handleDaySelect(d.dateKey)}
                title={`View forecast for ${today ? "Today" : d.day}`}
              >
                <span className="forecast-daily__day">{today ? "Today" : d.day}</span>

                <div className="forecast-daily__icon">
                  {iconUrl ? (
                    <img
                      src={iconUrl}
                      alt={d.condition || "weather"}
                      width={36}
                      height={36}
                    />
                  ) : (
                    <span className="forecast-daily__emoji">{emoji}</span>
                  )}
                </div>

                <div className="forecast-daily__temps">
                  <span className="forecast-daily__high">{d.high}°</span>
                  <span className="forecast-daily__low">{d.low}°</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
