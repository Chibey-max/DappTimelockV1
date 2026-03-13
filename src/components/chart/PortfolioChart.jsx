"use client";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
);

const FONT = "'JetBrains Mono', monospace";
const AAVE_APY = 0.035;
const STETH_APY = 0.037;

function formatLabel(ts) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function PortfolioChart({ history, ethPrice, currentBalance }) {
  if (!history || history.length < 2) return null;

  const labels = history.map((s) => formatLabel(s.ts));
  const ethValues = history.map((s) => parseFloat(s.eth.toFixed(6)));

  const firstSnap = history[0];
  const ageYears = (Date.now() - firstSnap.ts) / (365.25 * 86400000);
  const aaveYield = firstSnap.eth * AAVE_APY * ageYears;
  const stethYield = firstSnap.eth * STETH_APY * ageYears;
  const pnlEth = currentBalance - firstSnap.eth;
  const pnlPct = firstSnap.eth > 0 ? (pnlEth / firstSnap.eth) * 100 : 0;

  const isUp = pnlEth >= 0;

  const data = {
    labels,
    datasets: [
      {
        label: "ETH Locked",
        data: ethValues,
        borderColor: "#f5a623",
        backgroundColor: (ctx) => {
          // Gradient fill from gold → transparent
          const chart = ctx.chart;
          const { ctx: c, chartArea } = chart;
          if (!chartArea) return "rgba(245,166,35,0.08)";
          const grad = c.createLinearGradient(
            0,
            chartArea.top,
            0,
            chartArea.bottom,
          );
          grad.addColorStop(0, "rgba(245, 166, 35, 0.25)");
          grad.addColorStop(0.6, "rgba(245, 166, 35, 0.06)");
          grad.addColorStop(1, "rgba(245, 166, 35, 0)");
          return grad;
        },
        borderWidth: 2,
        pointRadius: (ctx) => {
          // Only show points at first, last, and local extremes
          const len = ctx.dataset.data.length;
          return ctx.dataIndex === 0 || ctx.dataIndex === len - 1 ? 4 : 0;
        },
        pointHoverRadius: 6,
        pointBackgroundColor: "#f5a623",
        pointBorderColor: "rgba(13, 21, 38, 0.8)",
        pointBorderWidth: 2,
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2.6,
    animation: { duration: 500, easing: "easeOutQuart" },
    layout: { padding: { top: 12, right: 16, bottom: 0, left: 0 } },

    interaction: {
      mode: "index",
      intersect: false,
      axis: "x",
    },

    plugins: {
      legend: { display: false },

      tooltip: {
        backgroundColor: "rgba(13, 21, 38, 0.95)",
        borderColor: "rgba(42, 68, 112, 0.8)",
        borderWidth: 1,
        padding: 14,
        cornerRadius: 10,
        titleColor: "#7a92b3",
        titleFont: { family: FONT, size: 10, weight: "500" },
        bodyColor: "#e8edf5",
        bodyFont: { family: FONT, size: 13, weight: "700" },
        displayColors: false,
        callbacks: {
          title: (items) => formatLabel(history[items[0].dataIndex]?.ts),
          label: (ctx) => {
            const eth = ctx.raw;
            const usd = ethPrice
              ? `\n$${(eth * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              : "";
            return `${eth.toFixed(6)} ETH${usd}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: "#7a92b3",
          font: { family: FONT, size: 10 },
          maxTicksLimit: 7,
          maxRotation: 0,
          padding: 8,
        },
      },
      y: {
        beginAtZero: false,
        position: "left",
        grid: {
          color: "rgba(30, 48, 80, 0.5)",
          lineWidth: 1,
          drawTicks: false,
        },
        border: { display: false },
        ticks: {
          color: "#7a92b3",
          font: { family: FONT, size: 10 },
          padding: 12,
          maxTicksLimit: 5,
          callback: (v) => `${v.toFixed(3)} Ξ`,
        },
      },
    },
  };

  const pnlColor = isUp ? "var(--green)" : "var(--red)";

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <div className="card-title" style={{ marginBottom: 0 }}>
          Portfolio History
        </div>
        <div style={{ textAlign: "right" }}>
          <div
            style={{
              fontSize: "1.3rem",
              fontWeight: 800,
              fontFamily: "Syne, sans-serif",
              color: "var(--text-primary)",
            }}
          >
            {currentBalance.toFixed(4)} Ξ
          </div>
          {ethPrice && (
            <div
              style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}
            >
              $
              {(currentBalance * ethPrice).toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}
            </div>
          )}
        </div>
      </div>

      {/* P&L badge */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 16,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            background: isUp ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: pnlColor,
            border: `1px solid ${isUp ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`,
            borderRadius: 20,
            padding: "2px 10px",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {isUp ? "▲" : "▼"} {Math.abs(pnlPct).toFixed(1)}%
        </span>
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
          {isUp ? "+" : ""}
          {pnlEth.toFixed(4)} Ξ all time
        </span>
      </div>

      <Line data={data} options={options} />

      {/* Yield comparison — cleaner horizontal strip */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginTop: 20,
          paddingTop: 16,
          borderTop: "1px solid var(--border)",
        }}
      >
        {[
          {
            label: `Aave (~${(AAVE_APY * 100).toFixed(1)}% APY)`,
            value: aaveYield,
            color: "#3b82f6",
          },
          {
            label: `stETH (~${(STETH_APY * 100).toFixed(1)}% APY)`,
            value: stethYield,
            color: "#8b5cf6",
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "10px 14px",
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: "var(--text-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 4,
              }}
            >
              If in {label}
            </div>
            <div
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color,
                fontFamily: "Syne, sans-serif",
              }}
            >
              +{value.toFixed(5)} Ξ
            </div>
            <div
              style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 2 }}
            >
              yield while locked
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
