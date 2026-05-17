import React from 'react';
import { cn } from '../../lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  /** Set to true when the card contains dropdowns that need to overflow */
  overflow?: boolean;
  onClick?: () => void;
}

export function GlassCard({ children, className, overflow = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-2xl shadow-2xl',
        'relative',
        !overflow && 'overflow-hidden',
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent pointer-events-none rounded-2xl" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}