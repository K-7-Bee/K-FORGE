import type { RankDef } from '../engine/ranks';
import { cx } from './ui';

/** A rank's emblem with a soft glow in its colour. Locked ranks are shown dimmed and desaturated. */
export function RankEmblem({ rank, size = 96, locked, float, className }: { rank: RankDef; size?: number; locked?: boolean; float?: boolean; className?: string }) {
  return (
    <div className={cx('relative shrink-0', float && 'emblem-float', className)} style={{ width: size, height: size }}>
      {!locked && <div aria-hidden className="absolute inset-[12%] rounded-full blur-2xl" style={{ background: rank.color, opacity: 0.35 }} />}
      <img
        src={rank.image}
        alt={`${rank.name} emblem`}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={cx('relative size-full object-contain', locked && 'opacity-40 grayscale')}
        draggable={false}
      />
    </div>
  );
}
