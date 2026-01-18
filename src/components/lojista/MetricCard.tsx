import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconBgColor: string;
  iconColor: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  iconBgColor,
  iconColor,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-5">
        <div className={`w-14 h-14 ${iconBgColor} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} className={iconColor} strokeWidth={2.5} />
        </div>
        {trend && (
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${
              trend.isPositive
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-[#1f4461] tracking-tight">{value}</p>
      </div>
    </div>
  );
}
