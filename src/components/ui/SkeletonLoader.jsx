import React from 'react';
import { motion } from 'framer-motion';

export const SkeletonCard = () => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm flex flex-col h-full">
      <div className="h-48 w-full bg-neutral-200 animate-pulse"></div>
      <div className="p-4 flex flex-col gap-3">
        <div className="h-5 w-3/4 bg-neutral-200 rounded animate-pulse"></div>
        <div className="h-4 w-1/2 bg-neutral-200 rounded animate-pulse"></div>
        <div className="mt-2 h-4 w-full bg-neutral-200 rounded animate-pulse"></div>
        <div className="h-4 w-full bg-neutral-200 rounded animate-pulse"></div>
        <div className="mt-4 flex justify-between items-center">
          <div className="h-6 w-1/3 bg-neutral-200 rounded animate-pulse"></div>
          <div className="h-8 w-1/4 bg-neutral-200 rounded-md animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonText = ({ lines = 3 }) => {
  return (
    <div className="space-y-3 w-full">
      {Array.from({ length: lines }).map((_, i) => (
        <div 
          key={i} 
          className={`h-4 bg-neutral-200 rounded animate-pulse ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};
