import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  desc: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon: Icon, title, desc }) => (
  <div className="bg-surface border border-surface-muted rounded-[20px] p-7 transition-all duration-300 group hover:shadow-card hover:border-brand-500/30 hover:-translate-y-[3px]">
    <div className="w-[46px] h-[46px] bg-white border border-surface-muted rounded-lg flex items-center justify-center mb-5 shadow-sm shadow-black/5 group-hover:scale-110 transition-transform">
      <Icon size={22} className="text-brand-500" />
    </div>
    <h3 className="text-[1rem] font-bold text-ink mb-2">{title}</h3>
    <p className="text-[.875rem] text-ink-muted leading-[1.65]">{desc}</p>
  </div>
);

export default FeatureCard;
