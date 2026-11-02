import { Link } from 'react-router-dom';

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <defs>
        <linearGradient id="nx-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00DDF2" />
          <stop offset="1" stopColor="#A020F0" />
        </linearGradient>
      </defs>
      <path d="M20 2 36 11v18L20 38 4 29V11Z" fill="none" stroke="url(#nx-g)" strokeWidth="2.5" />
      <path d="M13 27V13l14 14V13" fill="none" stroke="#F7F8FF" strokeWidth="3" strokeLinecap="square" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link to="/" className="flex min-h-[44px] items-center gap-2.5" aria-label="NexaPC home" data-testid="link-logo">
      <LogoMark />
      <span className="font-display text-2xl font-bold tracking-wide">
        NEXA<span className="text-cyan">PC</span>
      </span>
    </Link>
  );
}
