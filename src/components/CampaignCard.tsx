import React from 'react';
import { Link } from 'react-router-dom';


interface CampaignCardProps {
  tag: string;
  src: string;
  author: string;
  authorSeed: string;
  title: string;
  desc: string;
  target: string;
}

const CampaignCard: React.FC<CampaignCardProps> = ({ 
  tag, src, author, authorSeed, title, desc, target 
}) => {
  return (
    <div className="group bg-white/70 backdrop-blur-md border border-white/40 rounded-[24px] overflow-hidden flex flex-col transition-all duration-300 hover:shadow-2xl hover:shadow-brand-500/10 hover:-translate-y-1 h-full">
      {/* Visual Header */}
      <div className="h-[200px] overflow-hidden relative m-2 rounded-[18px]">
        <img 
          src={src} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
        />
        <div className="absolute top-3 right-3 bg-white/40 backdrop-blur-xl border border-white/40 px-3 py-1 rounded-full text-ink text-[0.65rem] font-bold uppercase tracking-wider">
          {tag}
        </div>
      </div>
      
      {/* Content Body */}
      <div className="p-6 pt-2 flex-1 flex flex-col">
        {/* Author Info */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-full overflow-hidden border border-white shadow-sm bg-surface-muted">
            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${authorSeed}`} alt={author} />
          </div>
          <span className="text-[0.7rem] text-ink-muted font-medium tracking-tight">{author}</span>
        </div>

        {/* Title */}
        <h3 className="font-display font-semibold text-[1.1rem] text-ink leading-snug mb-2 flex-1 group-hover:text-brand-600 transition-colors">
          {title}
        </h3>

        {/* Description */}
        <p className="text-[0.85rem] text-ink-muted leading-relaxed mb-6">
          {desc}
        </p>

        <div className="mt-auto space-y-4">
          {/* Funding Stats */}
          <div className="flex justify-between items-center text-sm pt-2">
            <div>
              <div className="text-[0.6rem] text-ink-faint font-bold uppercase tracking-tighter">Goal</div>
              <div className="font-display font-bold text-ink">{target}</div>
            </div>
          </div>

          {/* Primary Action */}
          <Link
            to="/login"
            className="block w-full py-2.5 rounded-xl bg-brand-500 text-white font-bold text-[0.8rem] text-center transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95 no-underline"
          >
            Fund Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;
