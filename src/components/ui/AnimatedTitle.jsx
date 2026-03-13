"use client";
import { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  LockIcon,
  ArrowUpIcon,
  ActivityIcon,
  ExternalLinkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@/components/ui/Icons";

const TYPE_CONFIG = {
  deposit: { Icon: LockIcon, label: "Locked", color: "var(--gold)" },
  withdraw: { Icon: ArrowUpIcon, label: "Withdrawn", color: "var(--green)" },
  withdrawAll: {
    Icon: ArrowUpIcon,
    label: "Withdraw All",
    color: "var(--green)",
  },
  event: { Icon: ActivityIcon, label: "Event", color: "var(--blue)" },
  unknown: { Icon: ActivityIcon, label: "Event", color: "var(--blue)" },
};

function TxRow({ event, explorerBase }) {
  const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.unknown;
  const txUrl = `${explorerBase}/tx/${event.txHash}`;

  return (
    <div className="tx-row">
      <div
        className="tx-icon-wrap"
        style={{
          background: `color-mix(in srgb, ${cfg.color} 12%, transparent)`,
        }}
      >
        <cfg.Icon size={14} color={cfg.color} />
      </div>
      <div className="tx-body">
        <div className="tx-label">
          <span style={{ color: cfg.color }}>{cfg.label}</span>
          {event.vaultId != null && (
            <span className="vault-id-badge">
              #{String(event.vaultId).padStart(3, "0")}
            </span>
          )}
        </div>
        <div className="tx-meta">
          <span>{formatDate(event.timestamp)}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Block #{event.blockNum.toLocaleString()}</span>
        </div>
      </div>
      <div className="tx-right">
        <div className="tx-amount" style={{ color: cfg.color }}>
          {event.amount > 0 ? `${event.amount.toFixed(6)} ETH` : "—"}
        </div>
        <a
          href={txUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="tx-link"
        >
          <ExternalLinkIcon size={10} /> Etherscan
        </a>
      </div>
    </div>
  );
}

const FILTERS = [
  { id: "all", label: "All" },
  { id: "deposit", label: "Locks" },
  { id: "withdraw", label: "Withdrawals" },
];

export default function TransactionHistory({
  history,
  isLoading,
  explorerBase = "https://sepolia.etherscan.io",
}) {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState(false);

  const filtered = history.filter((e) =>
    filter === "all"
      ? true
      : filter === "deposit"
        ? e.type === "deposit"
        : e.type === "withdraw" || e.type === "withdrawAll",
  );
  const visible = expanded ? filtered : filtered.slice(0, 5);

  return (
    <div className="card card-accent-blue" style={{ marginTop: 0 }}>
      <div
        className="card-title"
        style={{ justifyContent: "space-between", marginBottom: 16 }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span className="card-title-bar" />
          Transaction History
        </div>
        <div style={{ display: "flex", gap: 3 }}>
          {FILTERS.map((f) => (
            <button
              key={f.id}
              className={`tab ${filter === f.id ? "active" : ""}`}
              onClick={() => setFilter(f.id)}
              style={{ padding: "3px 10px", fontSize: "0.62rem", flex: "none" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="skeleton"
              style={{ height: 58, borderRadius: 10 }}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon-wrap">
            <ActivityIcon size={20} color="var(--text-muted)" />
          </div>
          <div className="empty-title">No Transactions</div>
          <div className="empty-sub">On-chain activity will appear here</div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {visible.map((e) => (
              <TxRow key={e.id} event={e} explorerBase={explorerBase} />
            ))}
          </div>
          {filtered.length > 5 && (
            <button
              className="btn btn-secondary btn-full"
              style={{ marginTop: 10 }}
              onClick={() => setExpanded((e) => !e)}
            >
              {expanded ? (
                <>
                  <ChevronUpIcon size={13} /> Show Less
                </>
              ) : (
                <>
                  <ChevronDownIcon size={13} /> Show All {filtered.length}{" "}
                  Transactions
                </>
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}
