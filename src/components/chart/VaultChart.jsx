'use client';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  BarElement, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const FONT = "'JetBrains Mono', monospace";

export default function VaultChart({ vaults, ethPrice }) {
  if (!vaults || vaults.length === 0) return null;

  const now    = Date.now();
  const labels = vaults.map(v => `#${String(v.id).padStart(3, '0')}`);

  const lockedData   = vaults.map(v => now < v.unlockTime  ? v.amountNum : 0);
  const unlockedData = vaults.map(v => now >= v.unlockTime ? v.amountNum : 0);

  const data = {
    labels,
    datasets: [
      {
        label:           'Locked',
        data:            lockedData,
        backgroundColor: 'rgba(245, 166, 35, 0.85)',
        hoverBackgroundColor: 'rgba(245, 166, 35, 1)',
        borderRadius:    { topLeft: 6, topRight: 6 },
        borderSkipped:   false,
        barPercentage:   0.55,
        categoryPercentage: 0.7,
      },
      {
        label:           'Unlocked',
        data:            unlockedData,
        backgroundColor: 'rgba(34, 197, 94, 0.85)',
        hoverBackgroundColor: 'rgba(34, 197, 94, 1)',
        borderRadius:    { topLeft: 6, topRight: 6 },
        borderSkipped:   false,
        barPercentage:   0.55,
        categoryPercentage: 0.7,
      },
    ],
  };

  const options = {
    responsive:          true,
    maintainAspectRatio: true,
    aspectRatio:         2.4,
    animation:           { duration: 400, easing: 'easeOutQuart' },
    layout:              { padding: { top: 8, right: 8, bottom: 0, left: 0 } },

    plugins: {
      legend: {
        position: 'top',
        align:    'end',
        labels: {
          color:      '#7a92b3',
          font:       { family: FONT, size: 11 },
          boxWidth:   10,
          boxHeight:  10,
          borderRadius: 3,
          useBorderRadius: true,
          padding:    16,
        },
      },
      tooltip: {
        backgroundColor:  'rgba(13, 21, 38, 0.95)',
        borderColor:      'rgba(42, 68, 112, 0.8)',
        borderWidth:      1,
        padding:          12,
        cornerRadius:     10,
        titleColor:       '#e8edf5',
        titleFont:        { family: FONT, size: 12, weight: '600' },
        bodyColor:        '#7a92b3',
        bodyFont:         { family: FONT, size: 11 },
        displayColors:    true,
        boxWidth:         8,
        boxHeight:        8,
        boxPadding:       4,
        callbacks: {
          title: items => `Vault ${items[0].label}`,
          label: ctx => {
            const eth = ctx.raw;
            if (eth === 0) return null;
            const usd = ethPrice
              ? `  ≈ $${(eth * ethPrice).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : '';
            return `  ${ctx.dataset.label}: ${eth.toFixed(6)} ETH${usd}`;
          },
        },
      },
    },

    scales: {
      x: {
        grid:   { display: false },
        border: { display: false },
        ticks:  {
          color:  '#7a92b3',
          font:   { family: FONT, size: 11 },
          padding: 6,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color:       'rgba(30, 48, 80, 0.5)',
          lineWidth:   1,
          drawTicks:   false,
        },
        border: { display: false, dash: [4, 4] },
        ticks:  {
          color:      '#7a92b3',
          font:       { family: FONT, size: 10 },
          padding:    10,
          maxTicksLimit: 5,
          callback:   v => v === 0 ? '0' : `${v.toFixed(v < 0.01 ? 4 : 3)} Ξ`,
        },
      },
    },
  };

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div className="card-title">Vault Balances</div>
      <Bar data={data} options={options} />
    </div>
  );
}
