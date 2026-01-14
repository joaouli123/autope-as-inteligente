import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  subtitle?: string;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  subtitle,
}: StatsCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}
        >
          <Icon size={28} className={iconColor} />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2 uppercase tracking-wide">{title}</p>
        <p className="text-4xl font-extrabold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-2 font-medium">{subtitle}</p>}
      </div>
    </div>
  );
}
