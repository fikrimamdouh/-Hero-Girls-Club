import { motion } from 'motion/react';
import { ReactNode } from 'react';

type Variant = 'cartoon' | 'elegant' | 'modern';

type EntryCardProps = {
  variant: Variant;
  icon: ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  onClick: () => void;
  className?: string;
};

const VARIANT_STYLES: Record<Variant, {
  card: string;
  iconBox: string;
  title: string;
  sub: string;
  arrow: string;
  badge: string;
}> = {
  cartoon: {
    card:
      'bg-gradient-to-br from-amber-300 via-orange-400 to-rose-500 border-b-[6px] border-orange-700/50 shadow-[0_14px_0_-2px_rgba(154,52,18,0.35),0_24px_44px_-12px_rgba(251,113,133,0.55)] hover:shadow-[0_10px_0_-2px_rgba(154,52,18,0.35),0_28px_50px_-12px_rgba(251,113,133,0.65)] active:translate-y-[6px] active:shadow-[0_4px_0_-2px_rgba(154,52,18,0.35),0_12px_22px_-8px_rgba(251,113,133,0.45)]',
    iconBox:
      'bg-white/95 text-orange-500 shadow-[inset_0_-3px_0_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.12)]',
    title: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.2)]',
    sub: 'text-white/90',
    arrow: 'text-white',
    badge: 'bg-white text-orange-600',
  },
  elegant: {
    card:
      'bg-white border border-rose-100 shadow-[0_18px_44px_-14px_rgba(244,63,94,0.25)] hover:border-rose-200 hover:shadow-[0_22px_50px_-12px_rgba(244,63,94,0.3)]',
    iconBox:
      'bg-gradient-to-br from-rose-50 to-pink-100 text-rose-600 ring-1 ring-rose-200',
    title: 'text-rose-950',
    sub: 'text-rose-600/75',
    arrow: 'text-rose-500',
    badge: 'bg-rose-100 text-rose-700',
  },
  modern: {
    card:
      'bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 ring-1 ring-pink-300/50 shadow-[0_18px_50px_-10px_rgba(217,70,239,0.5)] hover:shadow-[0_22px_60px_-10px_rgba(217,70,239,0.65)]',
    iconBox:
      'bg-white/25 text-white ring-1 ring-white/40 backdrop-blur-sm',
    title: 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.15)]',
    sub: 'text-white/85',
    arrow: 'text-white',
    badge: 'bg-white text-fuchsia-700',
  },
};

export default function EntryCard({
  variant,
  icon,
  title,
  subtitle,
  badge,
  onClick,
  className = '',
}: EntryCardProps) {
  const s = VARIANT_STYLES[variant];
  return (
    <motion.button
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative w-full overflow-hidden rounded-3xl px-5 py-5 text-right transition-all duration-200 sm:px-6 sm:py-6 ${s.card} ${className}`}
    >
      {badge && (
        <span className={`absolute left-4 top-4 rounded-full px-2.5 py-1 text-[10px] font-extrabold shadow-md sm:text-xs ${s.badge}`}>
          {badge}
        </span>
      )}
      <div className="flex items-center gap-4 sm:gap-5">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-2xl sm:h-16 sm:w-16 sm:text-3xl ${s.iconBox}`}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className={`font-arabic text-lg font-extrabold leading-tight sm:text-xl ${s.title}`}>
            {title}
          </div>
          {subtitle && (
            <div className={`mt-1 font-arabic text-xs leading-6 sm:text-sm ${s.sub}`}>
              {subtitle}
            </div>
          )}
        </div>
        <div
          className={`shrink-0 transition-transform duration-300 group-hover:-translate-x-1 ${s.arrow}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </div>
      </div>
    </motion.button>
  );
}
