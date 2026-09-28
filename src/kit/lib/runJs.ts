/** Runs learner JavaScript against test calls in a throwaway Web Worker (no DOM access, 2s timeout). */

export type TestCase = { call: string; expect: unknown };
export type TestRun = { error?: string; logs: string[]; results?: { ok: boolean; got: string }[] };

const WORKER = `onmessage=e=>{const{code,tests}=e.data;const logs=[];const console={log:(...a)=>logs.push(a.map(x=>typeof x==='string'?x:JSON.stringify(x)).join(' '))};let fns;try{fns=new Function('console',code+'\\n;return ['+tests.map(t=>'()=>('+t.call+')').join(',')+']')(console)}catch(err){postMessage({error:String(err),logs});return}const results=fns.map((f,i)=>{try{const g=f();return{ok:JSON.stringify(g)===JSON.stringify(tests[i].expect),got:g===undefined?'undefined':JSON.stringify(g)}}catch(err){return{ok:false,got:String(err)}}});postMessage({results,logs})}`;

export function runJs(code: string, tests: TestCase[], timeoutMs = 2000): Promise<TestRun> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([WORKER], { type: 'text/javascript' }));
    const w = new Worker(url);
    const done = (r: TestRun) => {
      clearTimeout(timer);
      w.terminate();
      URL.revokeObjectURL(url);
      resolve(r);
    };
    const timer = setTimeout(() => done({ error: `Timed out after ${timeoutMs / 1000}s — is there an infinite loop?`, logs: [] }), timeoutMs);
    w.onmessage = (e) => done(e.data as TestRun);
    w.onerror = (e) => done({ error: e.message, logs: [] });
    w.postMessage({ code, tests });
  });
}

export const isRunnable = (language: string) => /^(js|javascript)$/i.test(language);
