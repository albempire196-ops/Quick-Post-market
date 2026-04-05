import { memo } from "react";

const SkeletonCardInner = () => (
  <div className="liquid-glass rounded-[2rem] overflow-hidden animate-pulse">
    <div className="aspect-[4/3] bg-secondary/40" />
    <div className="p-4 sm:p-5 space-y-3">
      <div className="space-y-2">
        <div className="h-5 bg-secondary/50 rounded-xl w-3/4" />
        <div className="h-3.5 bg-secondary/30 rounded-lg w-1/2" />
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-border/10">
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3.5 h-3.5 bg-secondary/30 rounded-full" />
          ))}
        </div>
        <div className="h-6 bg-secondary/50 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

export const SkeletonCard = memo(SkeletonCardInner);

export const SkeletonGrid = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
    {[...Array(count)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);
