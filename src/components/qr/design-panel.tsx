'use client';

import { useQRStore } from '@/lib/qr-store';
import {
  DOT_SHAPE_LABELS,
  EYE_FRAME_LABELS,
  EYE_BALL_LABELS,
  type DotShape,
  type EyeFrameShape,
  type EyeBallShape,
} from '@/lib/qr-types';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

function ShapeGrid<T extends string>({
  label,
  value,
  options,
  onChange,
  renderPreview,
}: {
  label: string;
  value: T;
  options: { key: T; label: string }[];
  onChange: (v: T) => void;
  renderPreview: (key: T) => React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      <div className="grid grid-cols-4 gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            aria-pressed={value === opt.key}
            className={cn(
              'flex flex-col items-center gap-1 p-2 rounded-lg border text-xs transition-all',
              value === opt.key
                ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                : 'border-border hover:border-primary/30 hover:bg-accent/50'
            )}
            title={opt.label}
          >
            {renderPreview(opt.key)}
            <span className="text-[10px] leading-tight text-center line-clamp-2">
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function DotPreview({ shape }: { shape: DotShape }) {
  const cls = 'w-5 h-5';
  switch (shape) {
    case 'square':
      return <div className={cn(cls, 'bg-current rounded-[1px]')} />;
    case 'rounded':
      return <div className={cn(cls, 'bg-current rounded-md')} />;
    case 'dots':
      return <div className={cn(cls, 'bg-current rounded-full')} />;
    case 'classy':
      return <div className={cn(cls, 'bg-current rounded-full')} />;
    case 'classy-rounded':
      return <div className={cn(cls, 'bg-current rounded-lg')} />;
    case 'diamond':
      return (
        <div
          className={cn(cls, 'bg-current')}
          style={{ transform: 'rotate(45deg)', width: '14px', height: '14px' }}
        />
      );
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <polygon
            points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"
            className="fill-current"
          />
        </svg>
      );
    case 'extra-rounded':
      return <div className={cn(cls, 'bg-current rounded-2xl')} />;
    case 'triangle':
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <polygon points="12,3 23,21 1,21" className="fill-current" />
        </svg>
      );
    case 'hexagon':
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <polygon
            points="12,2 21,7 21,17 12,22 3,17 3,7"
            className="fill-current"
          />
        </svg>
      );
    case 'flower':
      return (
        <svg viewBox="0 0 24 24" className={cls}>
          <circle cx="9" cy="12" r="3.2" className="fill-current" />
          <circle cx="15" cy="12" r="3.2" className="fill-current" />
          <circle cx="12" cy="9" r="3.2" className="fill-current" />
          <circle cx="12" cy="15" r="3.2" className="fill-current" />
          <circle cx="12" cy="12" r="2.8" className="fill-current" />
        </svg>
      );
  }
}

function EyeFramePreview({ shape }: { shape: EyeFrameShape }) {
  const cls = 'w-5 h-5';
  switch (shape) {
    case 'square':
      return (
        <div className={cn(cls, 'border-2 border-current rounded-[1px]')} />
      );
    case 'dot':
      return (
        <div className={cn(cls, 'border-2 border-current rounded-full')} />
      );
    case 'rounded':
      return (
        <div className={cn(cls, 'border-2 border-current rounded-md')} />
      );
    case 'extra-rounded':
      return (
        <div className={cn(cls, 'border-2 border-current rounded-lg')} />
      );
    case 'circle':
      return (
        <div className={cn(cls, 'border-2 border-current rounded-full')} />
      );
  }
}

function EyeBallPreview({ shape }: { shape: EyeBallShape }) {
  const cls = 'w-5 h-5';
  switch (shape) {
    case 'square':
      return <div className={cn(cls, 'bg-current rounded-[1px]')} />;
    case 'dot':
      return <div className={cn(cls, 'bg-current rounded-full')} />;
    case 'rounded':
      return <div className={cn(cls, 'bg-current rounded-md')} />;
    case 'circle':
      return <div className={cn(cls, 'bg-current rounded-full')} />;
  }
}

const dotOptions = Object.keys(DOT_SHAPE_LABELS).map((key) => ({
  key: key as DotShape,
  label: DOT_SHAPE_LABELS[key as DotShape],
}));

const eyeFrameOptions = Object.keys(EYE_FRAME_LABELS).map((key) => ({
  key: key as EyeFrameShape,
  label: EYE_FRAME_LABELS[key as EyeFrameShape],
}));

const eyeBallOptions = Object.keys(EYE_BALL_LABELS).map((key) => ({
  key: key as EyeBallShape,
  label: EYE_BALL_LABELS[key as EyeBallShape],
}));

export function DesignPanel() {
  const { dotShape, setDotShape, eyeFrame, setEyeFrame, eyeBall, setEyeBall } =
    useQRStore();

  return (
    <div className="space-y-5">
      <ShapeGrid
        label="Форма точек"
        value={dotShape}
        options={dotOptions}
        onChange={setDotShape}
        renderPreview={(key) => <DotPreview shape={key} />}
      />
      <ShapeGrid
        label="Рамка глаза"
        value={eyeFrame}
        options={eyeFrameOptions}
        onChange={setEyeFrame}
        renderPreview={(key) => <EyeFramePreview shape={key} />}
      />
      <ShapeGrid
        label="Центр глаза"
        value={eyeBall}
        options={eyeBallOptions}
        onChange={setEyeBall}
        renderPreview={(key) => <EyeBallPreview shape={key} />}
      />
    </div>
  );
}
