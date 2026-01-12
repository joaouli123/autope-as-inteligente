import React from 'react';
import { 
  Disc, Droplet, Activity, Zap, Package, Settings, 
  CircleDashed, Filter, Sparkles, GitMerge
} from 'lucide-react';

// Custom AI Icon Component
export const AIIcon = ({ size = 24, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Central Chip */}
    <rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
    {/* Top Pins */}
    <path d="M9 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 2V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Bottom Pins */}
    <path d="M9 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M15 19V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Left Pins */}
    <path d="M2 9H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 12H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M2 15H5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* Right Pins */}
    <path d="M19 9H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 12H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M19 15H22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    {/* AI Text */}
    <text x="12" y="13" textAnchor="middle" dominantBaseline="middle" fill="currentColor" fontSize="7" fontWeight="bold" style={{ fontFamily: 'sans-serif' }}>AI</text>
  </svg>
);

// Icon Mapping for Categories
export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Freios': return <Disc size={20} strokeWidth={1.5} />;
    case 'Motor': return <Settings size={20} strokeWidth={1.5} />;
    case 'Transmissão': return <GitMerge size={20} strokeWidth={1.5} />;
    case 'Óleo': return <Droplet size={20} strokeWidth={1.5} />;
    case 'Suspensão': return <Activity size={20} strokeWidth={1.5} />;
    case 'Pneus': return <CircleDashed size={20} strokeWidth={1.5} />;
    case 'Elétrica': return <Zap size={20} strokeWidth={1.5} />;
    case 'Acess.': return <Package size={20} strokeWidth={1.5} />;
    case 'Limpeza': return <Sparkles size={20} strokeWidth={1.5} />;
    default: return <Filter size={20} strokeWidth={1.5} />;
  }
};
