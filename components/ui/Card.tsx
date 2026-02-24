import * as React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    hoverable?: boolean;
}

export function Card({ className, hoverable, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 transition-all",
                hoverable && "hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer",
                className
            )}
            {...props}
        />
    );
}
