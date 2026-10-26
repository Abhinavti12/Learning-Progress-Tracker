import React from 'react';

const ProgressBar = ({ progress = 0, size = 'md', showLabel = true, className = '' }) => {
  const percentage = Math.min(Math.max(Math.round(progress), 0), 100);

  // Color mapping based on Sage Mint (#B7D6A5) for progress & Botanical Green (#245B52) for mastery
  let barColor = 'bg-[#B7D6A5]'; // Sage Mint
  let badgeColor = 'text-[#245B52] bg-[#f2f8ed] border border-[#B7D6A5]';

  if (percentage === 100) {
    barColor = 'bg-[#245B52]'; // Botanical Green (Fully Mastered)
    badgeColor = 'text-[#132A2A] bg-[#B7D6A5] font-bold';
  } else if (percentage >= 50) {
    barColor = 'bg-[#B7D6A5]'; // Sage Mint
    badgeColor = 'text-[#245B52] bg-[#f2f8ed] border border-[#B7D6A5]';
  } else if (percentage > 0) {
    barColor = 'bg-[#E6A66A]'; // Copper Amber (Early progress / Needs attention)
    badgeColor = 'text-[#8b521c] bg-[#fdf4ec] border border-[#E6A66A]';
  } else {
    barColor = 'bg-[#DDD1B8]';
    badgeColor = 'text-[#132A2A]/60 bg-[#E5DCBE]/50';
  }

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-4' : 'h-2.5';

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
          <span className="text-[#132A2A]/70">Progress</span>
          <span className={`px-2 py-0.5 rounded-full ${badgeColor}`}>
            {percentage}%
          </span>
        </div>
      )}
      <div className={`w-full bg-[#E5DCBE] rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
