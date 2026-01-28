import React from 'react';

interface AdminSectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export function AdminSectionHeader({ title, subtitle, className = '' }: AdminSectionHeaderProps) {
  return (
    <div className={`mb-6 text-center ${className}`}>
      <h2 className="text-2xl md:text-3xl font-serif font-semibold tracking-[0.08em] text-deep-ocean">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-1 text-sm md:text-base text-charcoal/80">
          {subtitle}
        </p>
      )}
    </div>
  );
}
