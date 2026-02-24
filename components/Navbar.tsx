"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/Button";
import { motion } from "framer-motion";
import { MessageSquare, History, Settings, LogOut, Play } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navbar() {
    const { user, logout } = useAuth();
    const pathname = usePathname();

    if (!user) return null;

    const navItems = [
        { label: "New Talk", href: "/", icon: Play },
        { label: "History", href: "/conversations", icon: History },
        { label: "Settings", href: "/settings", icon: Settings },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-500/30">
                        <MessageSquare size={20} />
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        AI Talk Show
                    </span>
                </Link>

                <div className="hidden md:flex items-center space-x-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.href} href={item.href}>
                                <div className={cn(
                                    "relative flex items-center space-x-2 px-4 py-2 text-sm font-medium transition-colors rounded-lg",
                                    isActive
                                        ? "text-blue-600 dark:text-blue-400"
                                        : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-900"
                                )}>
                                    <item.icon size={18} />
                                    <span>{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>

                <div className="flex items-center space-x-4">
                    <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">User</span>
                        <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[150px]">
                            {user.email?.split('@')[0]}
                        </span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={logout} className="h-10 w-10 p-0 text-slate-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut size={20} />
                    </Button>
                </div>
            </div>
        </nav>
    );
}
