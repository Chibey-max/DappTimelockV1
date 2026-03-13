'use client';
import { useEffect, useRef, useState } from 'react';

// Displays ETH price with odometer-style digit roll on change
export default function EthPriceTicker({ price, style = {} }) {
  const [displayed, setDisplayed] = useState(price);
  const [flashing,  setFlashing]  = useState(false);
  const prevRef = useRef(price);

  useEffect(() => {
    if (!price || price === prevRef.current) return;
    prevRef.current = price;
    setFlashing(true);
    setDisplayed(price);
    const t = setTimeout(() => setFlashing(false), 620);
    return () => clearTimeout(t);
  }, [price]);

  if (!displayed) return <span style={style}>—</span>;

  const formatted = `$${displayed.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <span
      className={`price-ticker${flashing ? ' price-flash' : ''}`}
      style={style}
      title={`ETH/USD: $${displayed.toLocaleString()}`}
    >
      {formatted.split('').map((ch, i) => (
        <span
          key={`${i}-${ch}`}
          className={`price-ticker-digit${flashing && /\d/.test(ch) ? ' rolling' : ''}`}
          style={{ animationDelay: `${i * 25}ms` }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
