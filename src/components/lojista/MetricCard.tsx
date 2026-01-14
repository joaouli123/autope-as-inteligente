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
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-14 h-14 ${iconBgColor} rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          <Icon size={28} className={iconColor} strokeWidth={2.5} />
        </div>
        {trend && (
          <div
            className={`px-3 py-1.5 rounded-full text-xs font-bold ${
              trend.isPositive
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
}
