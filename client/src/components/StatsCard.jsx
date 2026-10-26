import React from 'react';

const StatsCard = ({ title, value, subtitle, icon: Icon, color = 'botanical' }) => {
  const colorSchemes = {
    botanical: {
      bg: 'bg-[#245B52]/10',
      text: 'text-[#245B52]',
      border: 'border-[#245B52]/20',
      glow: 'hover:border-[#245B52]'
    },
    sage: {
      bg: 'bg-[#B7D6A5]/25',
      text: 'text-[#245B52]',
      border: 'border-[#B7D6A5]/40',
      glow: 'hover:border-[#B7D6A5]'
    },
    copper: {
      bg: 'bg-[#E6A66A]/15',
      text: 'text-[#8b521c]',
      border: 'border-[#E6A66A]/30',
      glow: 'hover:border-[#E6A66A]'
    },
    forest: {
      bg: 'bg-[#132A2A]/10',
      text: 'text-[#132A2A]',
      border: 'border-[#132A2A]/20',
      glow: 'hover:border-[#132A2A]'
    },
    // Aliases for compatibility
    indigo: {
      bg: 'bg-[#245B52]/10',
      text: 'text-[#245B52]',
      border: 'border-[#245B52]/20',
      glow: 'hover:border-[#245B52]'
    },
    emerald: {
      bg: 'bg-[#B7D6A5]/25',
      text: 'text-[#245B52]',
      border: 'border-[#B7D6A5]/40',
      glow: 'hover:border-[#B7D6A5]'
    },
    amber: {
      bg: 'bg-[#E6A66A]/15',
      text: 'text-[#8b521c]',
      border: 'border-[#E6A66A]/30',
      glow: 'hover:border-[#E6A66A]'
    },
    rose: {
      bg: 'bg-[#E6A66A]/20',
      text: 'text-[#8b521c]',
      border: 'border-[#E6A66A]/40',
      glow: 'hover:border-[#E6A66A]'
    },
    blue: {
      bg: 'bg-[#245B52]/10',
      text: 'text-[#245B52]',
      border: 'border-[#245B52]/20',
      glow: 'hover:border-[#245B52]'
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.botanical;

  return (
    <div className={`group bg-white/95 p-6 rounded-3xl border border-[#DDD1B8] shadow-sm transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] ${scheme.glow}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-[#132A2A]/60">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#132A2A]">{value}</p>
          {subtitle && (
            <p className="mt-1 text-xs text-[#132A2A]/60">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className={`p-3.5 rounded-2xl ${scheme.bg} ${scheme.text} transition-transform group-hover:scale-110`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
