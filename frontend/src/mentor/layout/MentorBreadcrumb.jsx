import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const MentorBreadcrumb = ({ items = [] }) => {
  const location = useLocation();

  // Auto-generate breadcrumb items based on current path if not provided
  const generateBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbItems = [
      { label: 'Dashboard', path: '/mentor/dashboard', icon: Home }
    ];

    if (pathSegments.length > 2) { // More than just '/mentor/dashboard'
      for (let i = 2; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const path = '/' + pathSegments.slice(0, i + 1).join('/');
        
        // Capitalize and format segment name
        const label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');

        breadcrumbItems.push({
          label,
          path,
        });
      }
    }

    return breadcrumbItems;
  };

  const breadcrumbItems = items.length > 0 ? items : generateBreadcrumbItems();

  // Don't show breadcrumb if only one item (dashboard)
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const IconComponent = item.icon;

        return (
          <React.Fragment key={item.path || index}>
            {/* Separator */}
            {index > 0 && (
              <ChevronRight size={16} className="text-gray-400" />
            )}

            {/* Breadcrumb item */}
            <div className="flex items-center space-x-1">
              {IconComponent && (
                <IconComponent size={16} className={isLast ? 'text-blue-600' : 'text-gray-500'} />
              )}

              {isLast ? (
                <span className="font-medium text-gray-900">{item.label}</span>
              ) : (
                <Link
                  to={item.path}
                  className="hover:text-blue-600 transition-colors"
                >
                  {item.label}
                </Link>
              )}
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default MentorBreadcrumb; 