import { Providers } from './providers';
import './globals.css';

export const metadata = {
  title:       'TimelockedVault',
  description: 'Secure ETH Time-Locks on Sepolia',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="dark">
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
