import { useEffect, useState, useRef } from 'react';

interface TypedHeadlineProps {
  lines: string[];
  className?: string;
}

export default function TypedHeadline({ lines, className = '' }: TypedHeadlineProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showCaret, setShowCaret] = useState(true);
  const [isComplete, setIsComplete] = useState(false);
  const [lineHeight, setLineHeight] = useState(1.08);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const caretTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Instant reveal - no animation
      setDisplayedLines(lines);
      setIsComplete(true);
      setShowCaret(false);
      setLineHeight(1.1);
      return;
    }

    // Start typing animation after component mounts
    const startTyping = () => {
      if (currentLineIndex >= lines.length) {
        // All lines complete - fade out caret immediately and expand line-height
        setIsComplete(true);
        setShowCaret(false);
        setLineHeight(1.1);
        return;
      }

      const currentLine = lines[currentLineIndex];
      
      if (currentCharIndex < currentLine.length) {
        // Type next character with human-like variability
        const baseDelay = currentLineIndex === 0 ? 55 : currentLineIndex === 1 ? 60 : 73;
        const variance = baseDelay * (0.1 + Math.random() * 0.15);
        const delay = baseDelay + variance;

        timeoutRef.current = setTimeout(() => {
          const newLines = [...displayedLines];
          if (!newLines[currentLineIndex]) {
            newLines[currentLineIndex] = '';
          }
          newLines[currentLineIndex] += currentLine[currentCharIndex];
          setDisplayedLines(newLines);
          setCurrentCharIndex(currentCharIndex + 1);
        }, delay);
      } else {
        // Current line complete, pause before next line
        timeoutRef.current = setTimeout(() => {
          setCurrentLineIndex(currentLineIndex + 1);
          setCurrentCharIndex(0);
        }, 150);
      }
    };

    // Fade in headline block on first character
    if (currentLineIndex === 0 && currentCharIndex === 0 && displayedLines.length === 0) {
      timeoutRef.current = setTimeout(startTyping, 240);
    } else {
      startTyping();
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (caretTimeoutRef.current) clearTimeout(caretTimeoutRef.current);
    };
  }, [currentLineIndex, currentCharIndex, lines, displayedLines]);

  // Caret blink animation (only while typing)
  useEffect(() => {
    if (isComplete) {
      return;
    }

    const interval = setInterval(() => {
      setShowCaret(prev => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, [isComplete]);

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <h1 
      className={className}
      style={{
        lineHeight: `${lineHeight}`,
        letterSpacing: '-0.02em',
        opacity: prefersReducedMotion || displayedLines.length > 0 ? 1 : 0,
        transition: prefersReducedMotion ? 'none' : 'opacity 240ms ease-out, line-height 300ms ease-out',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        maxWidth: '100%',
      }}
    >
      {displayedLines.map((line, idx) => (
        <span key={idx} className="block">
          {line}
          {/* Only show caret on the current line being typed */}
          {idx === currentLineIndex && !isComplete && (
            <span 
              className="inline-block ml-0.5 w-[2px] h-[0.85em] align-middle bg-white"
              style={{
                opacity: showCaret ? 1 : 0.4,
                transition: 'opacity 150ms ease-in-out',
              }}
              aria-hidden="true"
            />
          )}
        </span>
      ))}
    </h1>
  );
}