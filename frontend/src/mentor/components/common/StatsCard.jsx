import React from 'react';
import * as Icons from 'lucide-react';
import { COLORS } from '../../utils/constants.js';

const StatsCard = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', // 'positive', 'negative', 'neutral'
  icon, 
  iconColor, 
  subtitle,
  onClick,
  className = '' 
}) => {
  const renderIcon = (iconName, size = 24) => {
    const IconComponent = Icons[iconName];
    return IconComponent ? <IconComponent size={size} /> : <Icons.BarChart3 size={size} />;
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600';
      case 'negative':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <Icons.TrendingUp size={14} className="text-green-600" />;
      case 'negative':
        return <Icons.TrendingDown size={14} className="text-red-600" />;
      default:
        return <Icons.Minus size={14} className="text-gray-600" />;
    }
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow ${
        onClick ? 'cursor-pointer hover:border-blue-300' : ''
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">
            {title}
          </p>
          
          <p className="text-2xl font-bold text-gray-900 mb-2">
            {value}
          </p>

          {subtitle && (
            <p className="text-xs text-gray-500 mb-2">
              {subtitle}
            </p>
          )}

          {change && (
            <div className="flex items-center space-x-1">
              {getChangeIcon()}
              <span className={`text-sm font-medium ${getChangeColor()}`}>
                {change}
              </span>
            </div>
          )}
        </div>

        {icon && (
          <div 
            className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
            style={{ 
              backgroundColor: iconColor ? `${iconColor}20` : `${COLORS.PRIMARY}20`,
              color: iconColor || COLORS.PRIMARY
            }}
          >
            {renderIcon(icon)}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard; 