import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StepCardProps {
  num: string;
  icon: LucideIcon;
  title: string;
  desc: string;
}

const StepCard: React.FC<StepCardProps> = ({ num, icon: Icon, title, desc }) => (
  <div className="relative z-10 flex flex-col items-center group">
    <div className="w-20 h-20 rounded-[12px] bg-white border border-surface-muted flex items-center justify-center relative mb-5 transition-transform group-hover:-translate-y-1 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <Icon size={26} className="text-brand-500" />
      <div className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-brand-100 text-brand-500 text-[.72rem] font-extrabold border-2 border-white flex items-center justify-center font-display">
        {num}
      </div>
    </div>
    <h3 className="text-[1rem] font-bold text-ink mb-1 tracking-tight">{title}</h3>
    <p className="text-[.82rem] text-ink-muted leading-[1.6] max-w-[180px] mx-auto">{desc}</p>
  </div>
);

export default StepCard;
