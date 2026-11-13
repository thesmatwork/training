
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Download,
  IndianRupee,
  Leaf,
  RefreshCw,
  Sprout,
  TrendingUp,
  Wallet,
} from "lucide-react";
import "./Analytics.css";
import { api } from "../services/api.js";

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const number = (value) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 1,
  }).format(value);

const monthName = (value) =>
  new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });

const toCSV = (rows) => {
  const columns = [
    ["Farm", "farm"],
    ["Crop", "crop"],
    ["Month", "month"],
    ["Yield (kg)", "yield"],
    ["Revenue (INR)", "revenue"],
    ["Expenses (INR)", "expenses"],
  ];

  const escape = (value) =>
    `"${String(value ?? "").replace(/"/g, '""')}"`;

  return [
    columns.map(([label]) => escape(label)).join(","),
    ...rows.map((row) =>
      columns.map(([, key]) => escape(row[key])).join(",")
    ),
  ].join("\n");
};

function normalizeRecord(item, index) {
  const revenue = Number(item.revenue ?? item.total_revenue ?? 0);
  const expenses = Number(item.expenses ?? item.total_expenses ?? 0);

  return {
    id: item.id ?? item.record_id ?? index + 1,
    farm: item.farm ?? item.farm_name ?? "Unassigned Farm",
    crop: item.crop ?? item.crop_name ?? "Unspecified",
    month: String(item.month ?? item.date ?? "").slice(0, 7),
    yield: Number(item.yield ?? item.yield_kg ?? item.production ?? 0),
    revenue,
    expenses,
  };
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone,
}) {
  return (
    <article className="an-stat-card">
      <div className="an-stat-top">
        <span className={`an-stat-icon ${tone}`}>
          <Icon size={21} />
        </span>
        {trend !== undefined && (
          <span className={`an-trend ${trend >= 0 ? "positive" : "negative"}`}>
            {trend >= 0 ? (
              <ArrowUpRight size={15} />
            ) : (
              <ArrowDownRight size={15} />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="an-stat-title">{title}</p>
      <h3 className="an-stat-value">{value}</h3>
      <p className="an-stat-subtitle">{subtitle}</p>
    </article>
  );
}

function BarChart({ data, valueKey, color, formatValue, emptyMessage }) {
  const max = Math.max(...data.map((item) => item[valueKey]), 1);

  if (!data.length) {
    return <div className="an-chart-empty">{emptyMessage}</div>;
  }

  return (
    <div className="an-bar-chart">
      {data.map((item) => {
        const height = Math.max((item[valueKey] / max) * 100, 2);

        return (
          <div className="an-bar-column" key={item.label}>
            <span className="an-bar-value">
              {formatValue(item[valueKey])}
            </span>
            <div className="an-bar-track">
              <div
                className="an-bar"
                style={{
                  height: `${height}%`,
                  background: color,
                }}
                title={`${item.label}: ${formatValue(item[valueKey])}`}
              />
            </div>
            <span className="an-bar-label">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const colors = ["#23865b", "#e8aa45", "#6197d6", "#9a83d5", "#d97962"];

  if (!total) {
    return <div className="an-chart-empty">No expense data available.</div>;
  }

  let offset = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const segment = {
      ...item,
      percentage,
      color: colors[index % colors.length],
      offset,
    };
    offset += percentage;
    return segment;
  });

  return (
    <div className="an-donut-layout">
      <div className="an-donut-wrap">
        <svg viewBox="0 0 120 120" className="an-donut">
          <circle
            cx="60"
            cy="60"
            r="43"
            fill="none"
            stroke="#edf0eb"
            strokeWidth="15"
          />
          {segments.map((item) => (
            <circle
              key={item.name}
              cx="60"
              cy="60"
              r="43"
              fill="none"
              stroke={item.color}
              strokeWidth="15"
              pathLength="100"
              strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
              strokeDashoffset={-item.offset}
              transform="rotate(-90 60 60)"
            />
          ))}
          <text
            x="60"
            y="57"
            textAnchor="middle"
            fontSize="10"
            fill="#758176"
          >
            Expenses
          </text>
          <text
            x="60"
            y="72"
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            fill="#203d2d"
          >
            {money(total)}
          </text>
        </svg>
      </div>

      <div className="an-legend">
        {segments.map((item) => (
          <div className="an-legend-row" key={item.name}>
            <span
              className="an-legend-dot"
              style={{ background: item.color }}
            />
            <span className="an-legend-name">{item.name}</span>
            <span className="an-legend-value">
              {item.percentage.toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Analytics() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLive, setIsLive] = useState(false);
  const [farm, setFarm] = useState("all");
  const [crop, setCrop] = useState("all");
  const [period, setPeriod] = useState("6");
  const [fromMonth, setFromMonth] = useState("2026-05");
  const [toMonth, setToMonth] = useState("2026-10");

  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [farmsResult, cropsResult, expensesResult, harvestsResult] =
        await Promise.all([
          api("/api/v1/farms"),
          api("/api/v1/crops"),
          api("/api/v1/expenses"),
          api("/api/v1/harvests"),
        ]);

      const farms = Array.isArray(farmsResult) ? farmsResult : [];
      const crops = Array.isArray(cropsResult) ? cropsResult : [];
      const expenses = Array.isArray(expensesResult) ? expensesResult : [];
      const harvests = Array.isArray(harvestsResult) ? harvestsResult : [];

      const farmNames = new Map(farms.map((farm) => [farm.id, farm.farm_name || farm.name || "Unassigned Farm"]));
      const cropNames = new Map(crops.map((crop) => [crop.id, crop.crop_name || crop.name || "Unspecified"]));
      const grouped = new Map();

      const monthOf = (value) => {
        if (!value) return new Date().toISOString().slice(0, 7);
        const parsed = typeof value === "number"
          ? new Date(value < 1000000000000 ? value * 1000 : value)
          : new Date(value);
        return Number.isNaN(parsed.getTime())
          ? new Date().toISOString().slice(0, 7)
          : parsed.toISOString().slice(0, 7);
      };

      const add = ({ farmId, crop, date, yieldKg = 0, revenue = 0, expense = 0 }) => {
        const month = monthOf(date);
        const farmName = farmNames.get(farmId) || "Unassigned Farm";
        const cropName = crop || "Unspecified";
        const key = `${farmName}|${cropName}|${month}`;
        const current = grouped.get(key) || {
          farm: farmName, crop: cropName, month, yield: 0, revenue: 0, expenses: 0,
        };
        current.yield += Number(yieldKg) || 0;
        current.revenue += Number(revenue) || 0;
        current.expenses += Number(expense) || 0;
        grouped.set(key, current);
      };

      expenses.forEach((item) => add({
        farmId: item.farm_id,
        crop: cropNames.get(item.crop_id) || item.crop_name || "All crops",
        date: item.transaction_date || item.date || item.created_at,
        expense: item.amount,
      }));

      harvests.forEach((item) => add({
        farmId: item.farm_id,
        crop: item.crop_name || cropNames.get(item.crop_id),
        date: item.record_date || item.date || item.created_at,
        yieldKg: item.yield_kg || item.yield || item.production,
        revenue: item.revenue || item.total_amount,
      }));

      setRecords(Array.from(grouped.values()).map(normalizeRecord));
      setIsLive(true);
    } catch (err) {
      setError(err.message || "Unable to load analytics data.");
      setRecords([]);
      setIsLive(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Load data on initial page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const farms = useMemo(
    () => [...new Set(records.map((item) => item.farm))].sort(),
    [records]
  );

  const crops = useMemo(
    () => [...new Set(records.map((item) => item.crop))].sort(),
    [records]
  );

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const matchesFarm = farm === "all" || item.farm === farm;
      const matchesCrop = crop === "all" || item.crop === crop;
      const matchesFrom = !item.month || item.month >= fromMonth;
      const matchesTo = !item.month || item.month <= toMonth;

      return matchesFarm && matchesCrop && matchesFrom && matchesTo;
    });
  }, [records, farm, crop, fromMonth, toMonth]);

  const totals = useMemo(() => {
    const revenue = filtered.reduce((sum, row) => sum + row.revenue, 0);
    const expenses = filtered.reduce((sum, row) => sum + row.expenses, 0);
    const yieldTotal = filtered.reduce((sum, row) => sum + row.yield, 0);

    return {
      revenue,
      expenses,
      yield: yieldTotal,
      profit: revenue - expenses,
      margin: revenue ? ((revenue - expenses) / revenue) * 100 : 0,
      count: filtered.length,
    };
  }, [filtered]);

  const monthlyData = useMemo(() => {
    const grouped = new Map();

    filtered.forEach((row) => {
      const label = row.month || "Unknown";
      const current = grouped.get(label) || {
        label: label === "Unknown" ? label : monthName(label),
        month: label,
        yield: 0,
        revenue: 0,
        expenses: 0,
      };

      current.yield += row.yield;
      current.revenue += row.revenue;
      current.expenses += row.expenses;
      grouped.set(label, current);
    });

    return [...grouped.values()]
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6);
  }, [filtered]);

  const cropData = useMemo(() => {
    const grouped = new Map();

    filtered.forEach((row) => {
      const current = grouped.get(row.crop) || {
        label: row.crop,
        yield: 0,
      };
      current.yield += row.yield;
      grouped.set(row.crop, current);
    });

    return [...grouped.values()].sort((a, b) => b.yield - a.yield);
  }, [filtered]);

  const expenseData = useMemo(() => {
    const grouped = new Map();

    filtered.forEach((row) => {
      grouped.set(
        row.crop,
        (grouped.get(row.crop) || 0) + row.expenses
      );
    });

    return [...grouped.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  const bestCrop = cropData[0];
  const averageYield = totals.count ? totals.yield / totals.count : 0;

  const resetFilters = () => {
    setFarm("all");
    setCrop("all");
    setFromMonth("2026-05");
    setToMonth("2026-10");
  };

  const exportCSV = () => {
    if (!filtered.length) return;

    const blob = new Blob(["\uFEFF" + toCSV(filtered)], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "mana-polam-analytics.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const changePeriod = (value) => {
    setPeriod(value);

    if (value === "custom") return;

    const end = new Date(`${toMonth}-01T00:00:00`);
    const start = new Date(end);
    start.setMonth(start.getMonth() - Number(value) + 1);

    setFromMonth(
      `${start.getFullYear()}-${String(start.getMonth() + 1).padStart(2, "0")}`
    );
  };

  const dateRangeInvalid = fromMonth > toMonth;

  return (
    <main className="an-page">
      <header className="an-header">
        <div>
          <div className="an-eyebrow">
            <Activity size={15} />
            FARM PERFORMANCE
          </div>
          <h1>Analytics & Reports</h1>
          <p>
            Understand your farm's yield, expenses, revenue, and profitability.
          </p>
        </div>

        <div className="an-header-actions">
          <button
            className="an-btn an-btn-secondary"
            type="button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "an-spin" : ""} />
            Refresh
          </button>
          <button
            className="an-btn an-btn-primary"
            type="button"
            onClick={exportCSV}
            disabled={!filtered.length}
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </header>

      {!isLive && (
        <div className="an-demo-notice">
          <Activity size={18} />
          <div>
            <strong>Sample analytics data</strong>
            <p>
              These figures are illustrative, not actual farm measurements.
              Configure your analytics API to load real records.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="an-error" role="alert">
          <strong>Could not refresh analytics.</strong> {error}
          <p>
            Displaying the last available records. Check your API endpoint
            and try again.
          </p>
        </div>
      )}

      <section className="an-filter-panel">
        <div className="an-filter-heading">
          <div>
            <CalendarDays size={18} />
            <strong>Report filters</strong>
          </div>
          <button
            className="an-text-btn"
            type="button"
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>

        <div className="an-filters">
          <label className="an-field">
            <span>Farm</span>
            <select value={farm} onChange={(e) => setFarm(e.target.value)}>
              <option value="all">All farms</option>
              {farms.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="an-field">
            <span>Crop</span>
            <select value={crop} onChange={(e) => setCrop(e.target.value)}>
              <option value="all">All crops</option>
              {crops.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="an-field">
            <span>Quick range</span>
            <select
              value={period}
              onChange={(e) => changePeriod(e.target.value)}
            >
              <option value="3">Last 3 months</option>
              <option value="6">Last 6 months</option>
              <option value="12">Last 12 months</option>
              <option value="custom">Custom range</option>
            </select>
          </label>

          <label className="an-field">
            <span>From month</span>
            <input
              type="month"
              value={fromMonth}
              onChange={(e) => {
                setFromMonth(e.target.value);
                setPeriod("custom");
              }}
            />
          </label>

          <label className="an-field">
            <span>To month</span>
            <input
              type="month"
              value={toMonth}
              onChange={(e) => {
                setToMonth(e.target.value);
                setPeriod("custom");
              }}
            />
          </label>
        </div>

        {dateRangeInvalid && (
          <p className="an-validation">
            Start month must be earlier than or equal to end month.
          </p>
        )}

        <div className="an-filter-summary">
          Showing <strong>{filtered.length}</strong> records
          {farm !== "all" ? ` for ${farm}` : " across all farms"}
          {crop !== "all" ? ` · ${crop}` : ""}
        </div>
      </section>

      <section className="an-stats-grid">
        <StatCard
          title="Total Revenue"
          value={money(totals.revenue)}
          subtitle="Income from recorded harvests"
          icon={IndianRupee}
          tone="green"
        />
        <StatCard
          title="Total Expenses"
          value={money(totals.expenses)}
          subtitle="Recorded cultivation costs"
          icon={Wallet}
          tone="orange"
        />
        <StatCard
          title="Net Profit"
          value={money(totals.profit)}
          subtitle={`${totals.margin.toFixed(1)}% profit margin`}
          icon={TrendingUp}
          tone={totals.profit >= 0 ? "blue" : "red"}
        />
        <StatCard
          title="Total Crop Yield"
          value={`${number(totals.yield)} kg`}
          subtitle={`Average ${number(averageYield)} kg per record`}
          icon={Sprout}
          tone="purple"
        />
      </section>

      <section className="an-charts-grid">
        <article className="an-panel">
          <div className="an-panel-header">
            <div>
              <h2>Revenue vs expenses</h2>
              <p>Monthly financial performance</p>
            </div>
            <span className="an-panel-icon">
              <BarChart3 size={19} />
            </span>
          </div>

          <div className="an-chart-legend">
            <span><i className="an-dot revenue-dot" /> Revenue</span>
            <span><i className="an-dot expense-dot" /> Expenses</span>
          </div>

          {monthlyData.length ? (
            <div className="an-finance-chart">
              {monthlyData.map((item) => {
                const max = Math.max(
                  ...monthlyData.map((row) =>
                    Math.max(row.revenue, row.expenses)
                  ),
                  1
                );

                return (
                  <div className="an-finance-column" key={item.month}>
                    <div className="an-finance-bars">
                      <div
                        className="an-finance-bar revenue-bar"
                        style={{
                          height: `${(item.revenue / max) * 100}%`,
                        }}
                        title={`Revenue: ${money(item.revenue)}`}
                      />
                      <div
                        className="an-finance-bar expense-bar"
                        style={{
                          height: `${(item.expenses / max) * 100}%`,
                        }}
                        title={`Expenses: ${money(item.expenses)}`}
                      />
                    </div>
                    <span className="an-finance-label">{item.label}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="an-chart-empty">No financial records for this range.</div>
          )}
          <div className="an-chart-footnote">
            <span>Total revenue</span>
            <strong>{money(totals.revenue)}</strong>
          </div>
        </article>

        <article className="an-panel">
          <div className="an-panel-header">
            <div>
              <h2>Yield by crop</h2>
              <p>Production comparison in kilograms</p>
            </div>
            <span className="an-panel-icon">
              <Leaf size={19} />
            </span>
          </div>

          <BarChart
            data={cropData}
            valueKey="yield"
            color="#27845a"
            formatValue={(value) => `${number(value)} kg`}
            emptyMessage="No crop-yield data available."
          />

          {bestCrop && (
            <div className="an-insight">
              <span className="an-insight-icon">
                <CheckCircle2 size={18} />
              </span>
              <div>
                <strong>Highest recorded yield</strong>
                <p>
                  {bestCrop.label} — {number(bestCrop.yield)} kg in the
                  selected period.
                </p>
              </div>
            </div>
          )}
        </article>

        <article className="an-panel">
          <div className="an-panel-header">
            <div>
              <h2>Expense distribution</h2>
              <p>Expenses grouped by crop</p>
            </div>
            <span className="an-panel-icon">
              <Wallet size={19} />
            </span>
          </div>
          <DonutChart data={expenseData} />
        </article>

        <article className="an-panel">
          <div className="an-panel-header">
            <div>
              <h2>Monthly yield trend</h2>
              <p>Total crop production over time</p>
            </div>
            <span className="an-panel-icon">
              <TrendingUp size={19} />
            </span>
          </div>

          <BarChart
            data={monthlyData}
            valueKey="yield"
            color="#6197d6"
            formatValue={(value) => `${number(value)} kg`}
            emptyMessage="No monthly yield data available."
          />

          <div className="an-chart-footnote">
            <span>Records included</span>
            <strong>{totals.count}</strong>
          </div>
        </article>
      </section>

      <section className="an-panel an-table-panel">
        <div className="an-panel-header">
          <div>
            <h2>Farm performance details</h2>
            <p>Individual crop and financial records</p>
          </div>
          <span className="an-record-count">{filtered.length} records</span>
        </div>

        <div className="an-table-wrap">
          <table className="an-table">
            <thead>
              <tr>
                <th>Farm</th>
                <th>Crop</th>
                <th>Month</th>
                <th className="numeric">Yield (kg)</th>
                <th className="numeric">Revenue</th>
                <th className="numeric">Expenses</th>
                <th className="numeric">Net profit</th>
              </tr>
            </thead>
            <tbody>
              {!dateRangeInvalid && filtered.length ? (
                filtered.map((row) => {
                  const profit = row.revenue - row.expenses;

                  return (
                    <tr key={row.id}>
                      <td>
                        <span className="an-farm-name">
                          <span className="an-mini-leaf">
                            <Sprout size={14} />
                          </span>
                          {row.farm}
                        </span>
                      </td>
                      <td><span className="an-crop-pill">{row.crop}</span></td>
                      <td>{row.month ? monthName(row.month) : "—"}</td>
                      <td className="numeric">{number(row.yield)}</td>
                      <td className="numeric">{money(row.revenue)}</td>
                      <td className="numeric">{money(row.expenses)}</td>
                      <td className={`numeric ${profit >= 0 ? "profit" : "loss"}`}>
                        {money(profit)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="an-empty-cell">
                    {dateRangeInvalid
                      ? "Choose a valid date range."
                      : "No records match the selected filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="an-footer">
        <span>
          <Activity size={14} />
          {isLive ? "Connected data source" : "Illustrative sample data"}
        </span>
        <span>Revenue − expenses = net profit</span>
      </footer>
    </main>
  );
}
