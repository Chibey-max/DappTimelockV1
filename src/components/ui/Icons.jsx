// Clean SVG icon system — zero emojis, all crisp SVG paths
const Icon = ({ d, size = 16, color = 'currentColor', strokeWidth = 1.5, fill = 'none', viewBox = '0 0 24 24', style }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke={color}
    strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {Array.isArray(d) ? d.map((path, i) => <path key={i} d={path} />) : <path d={d} />}
  </svg>
);

export const LockIcon       = (p) => <Icon {...p} d={['M12 17v-2','M5 11V7a7 7 0 0 1 14 0v4','M3 11h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z']} />;
export const UnlockIcon     = (p) => <Icon {...p} d={['M8 11V7a4 4 0 0 1 8 0','M3 11h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z']} />;
export const ArrowUpIcon    = (p) => <Icon {...p} d="M12 19V5M5 12l7-7 7 7" />;
export const ArrowDownIcon  = (p) => <Icon {...p} d="M12 5v14M19 12l-7 7-7-7" />;
export const CheckIcon      = (p) => <Icon {...p} d="M20 6L9 17l-5-5" />;
export const XIcon          = (p) => <Icon {...p} d="M18 6L6 18M6 6l12 12" />;
export const BellIcon       = (p) => <Icon {...p} fill={p.filled ? (p.color || 'currentColor') : 'none'} d={['M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9','M10.3 21a1.94 1.94 0 0 0 3.4 0']} />;
export const CalendarIcon   = (p) => <Icon {...p} d={['M8 2v4','M16 2v4','M3 10h18','M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z']} />;
export const PencilIcon     = (p) => <Icon {...p} d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z" />;
export const TargetIcon     = (p) => <Icon {...p} d={['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z','M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z']} />;
export const LinkIcon       = (p) => <Icon {...p} d={['M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71','M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71']} />;
export const SearchIcon     = (p) => <Icon {...p} d={['M21 21l-4.35-4.35','M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z']} />;
export const ExternalLinkIcon = (p) => <Icon {...p} d={['M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6','M15 3h6v6','M10 14L21 3']} />;
export const SunIcon        = (p) => <Icon {...p} d={['M12 17A5 5 0 1 0 12 7a5 5 0 0 0 0 10z','M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42']} />;
export const MoonIcon       = (p) => <Icon {...p} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />;
export const ShieldIcon     = (p) => <Icon {...p} d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
export const ActivityIcon   = (p) => <Icon {...p} d="M22 12h-4l-3 9L9 3l-3 9H2" />;
export const TrendingUpIcon = (p) => <Icon {...p} d={['M23 6l-9.5 9.5-5-5L1 18','M17 6h6v6']} />;
export const TrendingDownIcon = (p) => <Icon {...p} d={['M23 18l-9.5-9.5-5 5L1 6','M17 18h6v-6']} />;
export const WalletIcon     = (p) => <Icon {...p} d={['M21 12V7H5a2 2 0 0 1 0-4h14v4','M3 5v14a2 2 0 0 0 2 2h16v-5','M18 12a2 2 0 0 0 0 4h4v-4z']} />;
export const ClockIcon      = (p) => <Icon {...p} d={['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M12 6v6l4 2']} />;
export const ChevronDownIcon = (p) => <Icon {...p} d="M6 9l6 6 6-6" />;
export const ChevronUpIcon  = (p) => <Icon {...p} d="M18 15l-6-6-6 6" />;
export const WarningIcon    = (p) => <Icon {...p} d={['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z','M12 9v4','M12 17h.01']} />;
export const InfoIcon       = (p) => <Icon {...p} d={['M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z','M12 8h.01','M12 12v4']} />;
export const NetworkIcon    = (p) => <Icon {...p} d={['M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18']} />;
export const GasIcon        = (p) => <Icon {...p} d={['M3 22V8l7-6 7 6v14','M10 22V15h4v7','M14 9h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2']} />;
export const CopyIcon       = (p) => <Icon {...p} d={['M8 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z','M16 2H8a2 2 0 0 0-2 2v2h10V4a2 2 0 0 0-2-2z']} />;
export const LayersIcon     = (p) => <Icon {...p} d={['M12 2L2 7l10 5 10-5-10-5z','M2 17l10 5 10-5','M2 12l10 5 10-5']} />;
export const ZapIcon        = (p) => <Icon {...p} d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />;
export const BarChartIcon   = (p) => <Icon {...p} d={['M12 20V10','M18 20V4','M6 20v-6']} />;
export const HashIcon       = (p) => <Icon {...p} d={['M4 9h16','M4 15h16','M10 3L8 21','M16 3l-2 18']} />;
export const RefreshIcon    = (p) => <Icon {...p} d={['M23 4v6h-6','M1 20v-6h6','M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15']} />;
export const VaultIcon      = (p) => <Icon {...p} d={['M12 22C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z','M12 8v4','M12 16h.01','M8 12h8']} />;
export const KeyIcon        = (p) => <Icon {...p} d={['M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4']} />;
