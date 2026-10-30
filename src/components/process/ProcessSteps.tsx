import { motion, useReducedMotion } from 'motion/react';

interface Props {
  steps: string[];
}

// Cores de clipe, na ordem das etapas; posição e largura variam para lembrar uma edição de verdade.
const CLIPS = [
  { color: '#a98bd6', left: 0, width: 38 },
  { color: '#6fa8dc', left: 14, width: 44 },
  { color: '#7cc48a', left: 30, width: 36 },
  { color: '#e8a0bf', left: 46, width: 30 },
  { color: '#e6c26e', left: 58, width: 40 },
];

const clipClass = 'relative flex h-full min-h-9 items-center overflow-hidden rounded-[3px] px-3 py-1 text-sm leading-tight text-[#111]';

// A largura final nunca passa do que sobra na trilha depois da margem.
const final = (clip: { left: number; width: number }) => ({ opacity: 1, width: `${Math.min(clip.width + 20, 100 - clip.left)}%` });

export default function ProcessSteps({ steps }: Props) {
  const reduce = useReducedMotion();

  return (
    <>
      <ol className="divide-y divide-[#111] overflow-hidden rounded-md border border-border bg-card">
        {steps.map((step, i) => {
          const clip = CLIPS[i % CLIPS.length];
          return (
            <li key={step} className="flex items-stretch">
              <span className="flex w-16 shrink-0 items-center justify-center border-r border-[#111] bg-[#262626] font-mono text-xs text-[#8a8a8a]">
                V{i + 1}
              </span>
              <div className="relative min-h-12 flex-1 bg-[#232323] py-1.5">
                <motion.div
                  className={clipClass}
                  style={{ background: clip.color, marginLeft: `${clip.left}%` }}
                  initial={{ opacity: 0.25, width: '8%' }}
                  {...(reduce
                    ? { animate: final(clip), transition: { duration: 0 } }
                    : {
                        whileInView: final(clip),
                        viewport: { once: true, amount: 0.6 },
                        transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' as const },
                      })}
                >
                  <span>{step}</span>
                </motion.div>
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
