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
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon size={24} className={iconColor} />
        </div>
        {trend && (
          <div
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
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
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
