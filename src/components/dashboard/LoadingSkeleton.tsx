import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface LoadingSkeletonProps {
  variant?: 'stats' | 'table' | 'chart' | 'portfolio' | 'activity';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'stats', 
  count = 1 
}) => {
  const renderStatsSkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
        <div className="w-12 h-12 bg-gray-200 rounded-2xl"></div>
        <div className="w-16 h-4 bg-gray-200 rounded"></div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-20 h-8 bg-gray-200 rounded"></div>
        <div className="w-32 h-4 bg-gray-200 rounded"></div>
        <div className="w-24 h-3 bg-gray-200 rounded"></div>
      </CardContent>
    </Card>
  );

  const renderTableSkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-40 h-5 bg-gray-200 rounded"></div>
              <div className="w-32 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="p-6 bg-gray-50 rounded-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    <div className="w-20 h-3 bg-gray-200 rounded"></div>
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <div className="w-16 h-5 bg-gray-200 rounded"></div>
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-24 h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const renderChartSkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-36 h-5 bg-gray-200 rounded"></div>
              <div className="w-28 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="text-center p-4 bg-gray-50 rounded-2xl">
              <div className="w-8 h-8 bg-gray-200 rounded-xl mx-auto mb-2"></div>
              <div className="w-12 h-4 bg-gray-200 rounded mx-auto mb-1"></div>
              <div className="w-16 h-3 bg-gray-200 rounded mx-auto"></div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gray-50 rounded-2xl">
          <div className="w-full h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </CardContent>
    </Card>
  );

  const renderPortfolioSkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-36 h-5 bg-gray-200 rounded"></div>
              <div className="w-28 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-24 h-8 bg-gray-200 rounded-full"></div>
            <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl overflow-hidden">
              <div className="aspect-square bg-gray-200"></div>
              <div className="p-4 space-y-3">
                <div className="w-32 h-4 bg-gray-200 rounded"></div>
                <div className="w-full h-3 bg-gray-200 rounded"></div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="w-full h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-3 bg-gray-200 rounded"></div>
                  <div className="w-full h-3 bg-gray-200 rounded"></div>
                </div>
                <div className="flex space-x-1">
                  <div className="w-12 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                  <div className="w-10 h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
          <div className="w-40 h-5 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-6 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderActivitySkeleton = () => (
    <Card className="bg-white border border-gray-100 rounded-3xl p-8 animate-pulse">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-32 h-5 bg-gray-200 rounded"></div>
              <div className="w-28 h-3 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="flex space-x-2">
            <div className="w-12 h-6 bg-gray-200 rounded"></div>
            <div className="w-20 h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 mb-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="p-5 bg-gray-50 rounded-2xl border">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="w-40 h-4 bg-gray-200 rounded mb-1"></div>
                      <div className="w-full h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="w-16 h-4 bg-gray-200 rounded"></div>
                      <div className="w-20 h-5 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <div className="w-20 h-6 bg-gray-200 rounded-full"></div>
                      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                      <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
          <div className="w-32 h-5 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="text-center">
                <div className="w-8 h-6 bg-gray-200 rounded mx-auto mb-1"></div>
                <div className="w-12 h-3 bg-gray-200 rounded mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'stats':
        return renderStatsSkeleton();
      case 'table':
        return renderTableSkeleton();
      case 'chart':
        return renderChartSkeleton();
      case 'portfolio':
        return renderPortfolioSkeleton();
      case 'activity':
        return renderActivitySkeleton();
      default:
        return renderStatsSkeleton();
    }
  };

  if (count === 1) {
    return renderSkeleton();
  }

  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {renderSkeleton()}
        </div>
      ))}
    </div>
  );
};

// Specialized skeleton components for different dashboard sections
export const DashboardLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Skeleton */}
      <div className="mb-12 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-200 rounded-2xl"></div>
            <div className="space-y-2">
              <div className="w-48 h-8 bg-gray-200 rounded"></div>
              <div className="w-32 h-5 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="w-40 h-12 bg-gray-200 rounded-full"></div>
        </div>
      </div>

      {/* User Info Card Skeleton */}
      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 animate-pulse">
          <CardHeader className="pb-3">
            <div className="w-48 h-5 bg-gray-200 rounded"></div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="w-40 h-6 bg-gray-200 rounded"></div>
                <div className="w-56 h-4 bg-gray-200 rounded"></div>
                <div className="flex space-x-2">
                  <div className="w-24 h-6 bg-gray-200 rounded"></div>
                  <div className="w-20 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <LoadingSkeleton variant="stats" count={4} />
      </div>

      {/* Charts and Portfolio Row Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <LoadingSkeleton variant="chart" />
        <div className="lg:col-span-2">
          <LoadingSkeleton variant="portfolio" />
        </div>
      </div>

      {/* Analytics Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <LoadingSkeleton variant="chart" count={2} />
      </div>

      {/* Tables and Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <div className="lg:col-span-2">
          <LoadingSkeleton variant="table" />
        </div>
        <LoadingSkeleton variant="activity" />
      </div>
    </div>
  </div>
);