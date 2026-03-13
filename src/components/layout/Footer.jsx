export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <span>
          TimelockedVault © 2025 — Non-custodial ETH time-locks on Ethereum
        </span>
        <div className="footer-links">
          {/* <a href="#">Docs</a> */}
          <a
            href={`https://sepolia.etherscan.io/address/${process.env.NEXT_PUBLIC_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contract
          </a>
          <a
            href='https://github.com/Chibey-max'
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
