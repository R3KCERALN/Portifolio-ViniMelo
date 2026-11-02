import { motion, useReducedMotion } from 'motion/react';

interface Props {
  steps: string[];
}

const LABEL_W = 52; // px, coluna V1…V5
const RULER = ['00:15', '00:30', '00:45', '01:00'];

// Cores das etapas V1–V5 e a posição de cada clipe na escada (percentual da trilha), medidas na referência.
const CLIPS = [
  { color: '#c391ec', left: 4, width: 68 },
  { color: '#84b6f1', left: 14, width: 65 },
  { color: '#99dea5', left: 21, width: 65 },
  { color: '#f7ce84', left: 26, width: 67 },
  { color: '#fda3cf', left: 33, width: 67 },
];

const NEEDLE_AT = 13; // % da trilha

export default function ProcessSteps({ steps }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="relative mt-8 select-none">
      {/* régua */}
      <div className="flex h-7 items-end" aria-hidden="true">
        <span className="mono shrink-0 text-[0.7rem] text-[#88c4f2] md:text-[0.8rem]" style={{ width: LABEL_W + 14 }}>
          00:00:00:00
        </span>
        <div className="relative h-full flex-1">
          {RULER.map((mark, i) => (
            <span
              key={mark}
              className="mono absolute bottom-0 text-[0.75rem] text-dim"
              style={{ left: `${(i + 1) * 25}%`, transform: 'translateX(-100%)' }}
            >
              {mark}
            </span>
          ))}
        </div>
      </div>

      {/* trilhas: V5 em cima e V1 embaixo; no HTML a ordem é a das etapas */}
      <ol className="mt-2 flex flex-col-reverse border-t border-rule">
        {steps.map((step, i) => {
          const clip = CLIPS[i % CLIPS.length];
          const final = { opacity: 1, width: `${clip.width}%` };
          return (
            <li key={step} className="flex min-h-[2.375rem] items-center border-b border-rule py-[3px]">
              <span className="shrink-0 text-[0.9375rem] text-dim" style={{ width: LABEL_W }} aria-hidden="true">
                V{i + 1}
              </span>
              <div className="relative h-full flex-1" style={{ minHeight: '1.875rem' }}>
                <motion.div
                  className="absolute inset-y-0 flex items-center overflow-hidden rounded-[3px] px-3 text-[0.8125rem] leading-tight whitespace-nowrap text-background md:text-[0.875rem]"
                  style={{ background: clip.color, left: `${clip.left}%` }}
                  initial={{ opacity: 0.25, width: '8%' }}
                  {...(reduce
                    ? { animate: final, transition: { duration: 0 } }
                    : {
                        whileInView: final,
                        viewport: { once: true, amount: 0.6 },
                        transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' as const },
                      })}
                >
                  <span className="mr-2 font-bold">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate font-semibold">{step}</span>
                </motion.div>
              </div>
            </li>
          );
        })}
      </ol>

      {/* agulha */}
      <div className="pointer-events-none absolute inset-y-0 right-0" style={{ left: LABEL_W }} aria-hidden="true">
        <div className="absolute inset-y-0 w-px bg-[#68a3e7]" style={{ left: `${NEEDLE_AT}%` }}>
          <div
            className="absolute top-3 left-1/2 h-3 w-3 -translate-x-1/2 bg-[#68a3e7]"
            style={{ clipPath: 'polygon(0 0, 100% 0, 100% 55%, 50% 100%, 0 55%)' }}
          />
        </div>
      </div>
    </div>
  );
}
