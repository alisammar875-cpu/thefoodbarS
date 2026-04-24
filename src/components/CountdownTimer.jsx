import React, { useState, useEffect } from 'react';

export default function CountdownTimer({ hours = 0, minutes = 0, seconds = 0 }) {
  const [timeLeft, setTimeLeft] = useState(hours * 3600 + minutes * 60 + seconds);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLeft]);

  const h = Math.floor(timeLeft / 3600);
  const m = Math.floor((timeLeft % 3600) / 60);
  const s = timeLeft % 60;

  const format = (num) => String(num).padStart(2, '0');

  return (
    <div className="flex gap-2">
      <div className="flex flex-col items-center">
        <div className="bg-primary/20 backdrop-blur-md border border-primary/30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-display text-lg md:text-xl text-primary">
          {format(h)}
        </div>
        <span className="text-[8px] font-bold uppercase mt-1 opacity-50 tracking-widest">Hrs</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary/20 backdrop-blur-md border border-primary/30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-display text-lg md:text-xl text-primary">
          {format(m)}
        </div>
        <span className="text-[8px] font-bold uppercase mt-1 opacity-50 tracking-widest">Min</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary/20 backdrop-blur-md border border-primary/30 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl font-display text-lg md:text-xl text-primary">
          {format(s)}
        </div>
        <span className="text-[8px] font-bold uppercase mt-1 opacity-50 tracking-widest">Sec</span>
      </div>
    </div>
  );
}
