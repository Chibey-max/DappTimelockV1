'use client';

// Splits text into words, each word animates in with a staggered delay
export default function AnimatedTitle({ lines = [], className = '' }) {
  let wordIndex = 0;
  return (
    <h1 className={`hero-title ${className}`}>
      {lines.map((line, li) => (
        <span key={li} style={{ display: 'block' }}>
          {line.split(' ').map((word, wi) => {
            const delay = (wordIndex++ * 90) + 80;
            const isAccent = word.startsWith('[') && word.endsWith(']');
            const text = isAccent ? word.slice(1, -1) : word;
            return (
              <span key={wi}>
                <span
                  className="hero-title-word"
                  style={{ animationDelay: `${delay}ms` }}
                >
                  {isAccent ? <span style={{ color: 'var(--gold)' }}>{text}</span> : text}
                </span>
                {wi < line.split(' ').length - 1 && ' '}
              </span>
            );
          })}
        </span>
      ))}
    </h1>
  );
}
