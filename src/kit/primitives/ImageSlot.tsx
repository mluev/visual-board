import { useEffect, useRef, useState } from 'react';
import { cn } from '@/kit/lib/utils';

/**
 * An image area. With `src` it shows the image. With `slotId` and no src, the learner (or you) can
 * drop or pick an image; it is saved to public/uploads/<slotId>.<ext> and loaded again next time.
 */
export function ImageSlot({ src, slotId, alt, placeholder = 'Drop an image here, or click to choose one', className }: { src?: string; slotId?: string; alt: string; placeholder?: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(src ?? null);
  const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (src) return setUrl(src);
    if (!slotId) return;
    let live = true;
    fetch(`/api/uploads/${slotId}`)
      .then((r) => (r.ok ? r.text() : ''))
      .then((t) => live && t && setUrl((JSON.parse(t) as { url: string }).url))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [src, slotId]);

  const upload = (file: File | undefined) => {
    if (!file || !slotId || !file.type.startsWith('image/')) return;
    setBusy(true);
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const r = await fetch(`/api/uploads/${slotId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dataUrl: reader.result }) });
        if (r.ok) setUrl(((await r.json()) as { url: string }).url);
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (url) return <img src={url} alt={alt} draggable={false} className={cn('absolute inset-0 size-full object-contain select-none', className)} />;
  return (
    <button
      type="button"
      disabled={!slotId}
      onClick={() => input.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files[0]);
      }}
      className={cn('absolute inset-0 flex size-full items-center justify-center border-2 border-dashed p-6 text-center text-[15px] text-ink-3 transition-colors', over ? 'border-tone bg-tone-soft' : 'border-line bg-subtle', className)}
    >
      {busy ? 'Uploading…' : slotId ? placeholder : 'No image'}
      <input ref={input} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
    </button>
  );
}
