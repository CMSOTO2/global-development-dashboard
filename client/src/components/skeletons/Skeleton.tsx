import { type HTMLAttributes } from "react";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Optional custom class; skeleton class is always applied */
  className?: string;
}

export function Skeleton({ className = "", ...props }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`.trim()}
      aria-hidden
      {...props}
    />
  );
}
