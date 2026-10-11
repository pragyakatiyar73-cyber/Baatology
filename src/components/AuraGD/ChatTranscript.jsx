import React, { useEffect, useRef } from 'react';

/**
 * Scrollable chat transcript with AI and user bubbles.
 * Auto-scrolls to the latest message.
 */
export default function ChatTranscript({ messages, interimText }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimText]);

  if (messages.length === 0 && !interimText) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 px-4 text-center gap-3">
        <span className="text-4xl">🤖</span>
        <p className="text-sm">
          Click <span className="text-teal-400 font-semibold">"I Will Start"</span> or{' '}
          <span className="text-teal-400 font-semibold">"You Start First"</span> to begin
          your Group Discussion session.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex fade-in ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}
        >
          <div
            className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
              msg.role === 'ai'
                ? 'bg-slate-800/90 border border-slate-700/50 text-slate-200 rounded-tl-sm'
                : 'bg-teal-950/80 border border-teal-800/50 text-teal-100 rounded-tr-sm'
            }`}
          >
            {/* Sender label */}
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className={`text-[10px] font-bold tracking-wide ${
                msg.role === 'ai' ? 'text-teal-400' : 'text-emerald-400'
              }`}>
                {msg.role === 'ai' ? '🤖 AuraGD Evaluator' : '🎓 You'}
              </span>
              <span className="text-[9px] text-slate-600">{msg.timestamp}</span>
            </div>
            <p className="text-[13px]">{msg.text}</p>
          </div>
        </div>
      ))}

      {/* Live interim text bubble */}
      {interimText && (
        <div className="flex justify-end fade-in">
          <div className="max-w-[88%] rounded-2xl rounded-tr-sm px-3.5 py-2.5 bg-slate-700/50 border border-slate-600/30 text-slate-400">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[10px] font-bold text-slate-500">🎓 You (speaking...)</span>
              <span className="flex gap-0.5 items-center ml-1">
                {[0, 0.15, 0.3].map((d, i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-slate-500 animate-bounce"
                    style={{ animationDelay: `${d}s` }}
                  />
                ))}
              </span>
            </div>
            <p className="text-[13px] italic">{interimText}</p>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
