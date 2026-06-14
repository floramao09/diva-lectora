"use client";

import React from "react";

export function ProgressBar({
  value,
  colorClass = "bg-lavender",
  trackClass = "bg-white",
  height = 8,
}: {
  value: number;
  colorClass?: string;
  trackClass?: string;
  height?: number;
}) {
  return (
    <div
      className={`rounded-full overflow-hidden w-full ${trackClass}`}
      style={{ height }}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

export function Pill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full font-bold text-sm whitespace-nowrap transition-all flex-shrink-0 ${
        active
          ? "bg-lavender text-white shadow-md"
          : "bg-white/70 text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-3xl p-4 shadow-[0_4px_20px_-8px_rgba(150,120,180,0.25)] ${
        onClick ? "cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  children,
  icon,
  action,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mt-6 mb-2.5">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="font-display text-lg font-bold text-ink m-0">
          {children}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({
  emoji,
  title,
  text,
  cta,
  onCta,
}: {
  emoji: string;
  title: string;
  text: string;
  cta?: string;
  onCta?: () => void;
}) {
  return (
    <div className="text-center py-9 px-5 bg-white rounded-3xl shadow-[0_4px_20px_-8px_rgba(150,120,180,0.25)]">
      <div className="text-5xl">{emoji}</div>
      <p className="font-display font-bold text-lg text-ink mt-3 mb-1">
        {title}
      </p>
      <p className="text-sm text-inkSoft leading-relaxed mb-4">{text}</p>
      {cta && (
        <button
          onClick={onCta}
          className="border-none bg-lavender text-white font-extrabold text-sm px-6 py-3 rounded-full shadow-[0_6px_16px_-6px_rgba(180,150,220,0.7)]"
        >
          {cta}
        </button>
      )}
    </div>
  );
}

export function PageHeader({
  title,
  emoji,
  subtitle,
}: {
  title: string;
  emoji?: string;
  subtitle?: string;
}) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold text-ink m-0">
        {title} {emoji}
      </h1>
      {subtitle && <p className="text-sm text-inkSoft mt-1">{subtitle}</p>}
    </div>
  );
}
