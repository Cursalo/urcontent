import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  separator?: React.ReactNode;
  className?: string;
  maxItems?: number;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
  className = '',
  maxItems
}) => {
  // Add home item if requested
  const allItems = showHome
    ? [{ label: 'Inicio', href: '/', icon: <Home className="h-4 w-4" /> }, ...items]
    : items;

  // Handle max items with ellipsis
  let displayItems = allItems;
  let hasEllipsis = false;

  if (maxItems && allItems.length > maxItems) {
    hasEllipsis = true;
    const currentPage = allItems[allItems.length - 1];
    const firstItems = allItems.slice(0, Math.max(1, maxItems - 2));
    displayItems = [...firstItems, currentPage];
  }

  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center space-x-1', className)}>
      <ol className="flex items-center space-x-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isFirst = index === 0;
          
          // Show ellipsis before the last item if we truncated
          if (hasEllipsis && index === displayItems.length - 1 && displayItems.length > 1) {
            return (
              <React.Fragment key={`breadcrumb-${index}`}>
                <li className="flex items-center">
                  <Button variant="ghost" size="sm" className="h-auto p-1 text-muted-foreground" disabled>
                    <span className="text-sm">...</span>
                  </Button>
                </li>
                <li className="flex items-center">
                  {separator}
                </li>
                <li className="flex items-center">
                  <BreadcrumbItem item={item} isLast={isLast} />
                </li>
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={`breadcrumb-${index}`}>
              <li className="flex items-center">
                <BreadcrumbItem item={item} isLast={isLast} />
              </li>
              {!isLast && (
                <li className="flex items-center">
                  {separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

interface BreadcrumbItemProps {
  item: BreadcrumbItem;
  isLast: boolean;
}

const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({ item, isLast }) => {
  const content = (
    <div className="flex items-center gap-1.5">
      {item.icon}
      <span className={cn(
        'text-sm font-medium transition-colors',
        isLast || item.isCurrentPage
          ? 'text-foreground'
          : 'text-muted-foreground hover:text-foreground'
      )}>
        {item.label}
      </span>
    </div>
  );

  if (isLast || item.isCurrentPage || !item.href) {
    return (
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="flex items-center"
        aria-current={isLast ? 'page' : undefined}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Link to={item.href} className="flex items-center hover:underline">
        {content}
      </Link>
    </motion.div>
  );
};

export default Breadcrumbs;