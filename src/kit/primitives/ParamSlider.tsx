import { Slider } from '@/kit/ui/slider';

export type ParamDef = { name: string; min: number; max: number; step: number; value: number; unit?: string };

/** "name = value" label + slider in the block tone. Used by live charts and plots. */
export function ParamSlider({ param, value, onChange }: { param: ParamDef; value: number; onChange: (v: number) => void }) {
  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4">
      <span className="min-w-[90px] text-[15px] font-bold text-tone-ink tabular-nums">
        {param.name} = {+value.toFixed(6)}
        {param.unit ?? ''}
      </span>
      <Slider
        aria-label={param.name}
        min={param.min}
        max={param.max}
        step={param.step}
        value={[value]}
        onValueChange={(v) => onChange(Array.isArray(v) ? v[0] : (v as number))}
        className="[&_[data-slot=slider-range]]:bg-tone [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-thumb]]:border-2 [&_[data-slot=slider-thumb]]:border-tone [&_[data-slot=slider-track]]:h-1.5 [&_[data-slot=slider-track]]:bg-tone-tint"
      />
    </div>
  );
}
