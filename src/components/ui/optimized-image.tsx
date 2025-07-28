import { memo, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: "lazy" | "eager";
  placeholder?: string;
  quality?: number;
  priority?: boolean;
}

export const OptimizedImage = memo(({
  src,
  alt,
  className,
  width,
  height,
  loading = "lazy",
  placeholder = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjhmOSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOWNhM2FmIiBmb250LXNpemU9IjE0Ij5Mb2FkaW5nLi4uPC90ZXh0Pjwvc3ZnPg==",
  quality = 85,
  priority = false
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setCurrentSrc(src);
  }, [src]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setError(true);
    setCurrentSrc(placeholder);
  }, [placeholder]);

  // Generate responsive image sizes
  const generateSrcSet = (baseSrc: string) => {
    const sizes = [320, 640, 768, 1024, 1280, 1920];
    return sizes
      .map(size => `${baseSrc}?w=${size}&q=${quality} ${size}w`)
      .join(', ');
  };

  const sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : loading}
        decoding="async"
        srcSet={!error ? generateSrcSet(src) : undefined}
        sizes={!error ? sizes : undefined}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100",
          error ? "opacity-50" : "",
          "w-full h-full object-cover"
        )}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin" />
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
            <p className="text-sm">Failed to load image</p>
          </div>
        </div>
      )}
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";