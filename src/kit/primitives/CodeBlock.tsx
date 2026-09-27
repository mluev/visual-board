import { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/kit/lib/utils';

/** Default code language for a board (set from defineBoard({ lang })). */
export const CodeLangContext = createContext<string | undefined>(undefined);

const cache = new Map<string, string>();

/** Monospace code panel with Shiki highlighting (plain text until the highlighter loads). */
export function CodeBlock({ code, lang, className }: { code: string; lang?: string; className?: string }) {
  const boardLang = useContext(CodeLangContext);
  const language = lang ?? boardLang;
  const key = `${language}\u0000${code}`;
  const [html, setHtml] = useState(() => cache.get(key) ?? null);

  useEffect(() => {
    if (!language || language === 'text') return;
    if (cache.has(key)) return setHtml(cache.get(key)!);
    let live = true;
    import('shiki')
      .then(({ codeToHtml }) => codeToHtml(code, { lang: language, theme: 'github-light' }))
      .then((h) => {
        cache.set(key, h);
        if (live) setHtml(h);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [key, code, language]);

  const cls = cn('kit-code m-0 rounded-xl bg-subtle px-4 py-[14px] font-mono text-sm leading-[1.55] whitespace-pre-wrap', className);
  if (html) return <div className={cls} dangerouslySetInnerHTML={{ __html: html }} />;
  return <pre className={cls}>{code}</pre>;
}
