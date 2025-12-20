// Card untuk statistik dengan design natural
import { StatIcon } from "./icons/StatIcon.jsx";

const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendLabel,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="card p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
          {trend && (
            <p
              className={`text-xs mt-2 ${
                trend > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {trend > 0 ? "↑" : "↓"} {Math.abs(trend)} {trendLabel}
            </p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-md`}>
          <StatIcon type={icon} className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
