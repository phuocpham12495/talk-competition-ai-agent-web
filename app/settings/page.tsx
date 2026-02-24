"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { User, Shield, Bell, LogOut, ChevronRight, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { user, logout, loading } = useAuth();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const router = useRouter();

    if (loading) return null;
    if (!user) {
        router.push("/login");
        return null;
    }

    return (
        <div className="container mx-auto max-w-2xl px-4 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Settings</h1>
                <p className="text-slate-500 font-medium">Manage your account and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Profile Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 px-1">
                        <User size={18} className="text-blue-600" />
                        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">Account Profile</h2>
                    </div>
                    <Card className="p-0 overflow-hidden">
                        <div className="p-6 flex items-center space-x-4">
                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
                                {user.email?.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                    {user.displayName || user.email?.split('@')[0]}
                                </h3>
                                <p className="text-sm text-slate-500 truncate">{user.email}</p>
                            </div>
                            <Button variant="outline" size="sm" className="rounded-full">
                                Edit
                            </Button>
                        </div>
                    </Card>
                </section>

                {/* Security Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 px-1 text-slate-500">
                        <Shield size={18} className="text-blue-600" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Security</h2>
                    </div>
                    <Card className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                        <div className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer group">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Multi-Factor Auth</p>
                                    <p className="text-xs text-slate-500">Add phone verification for extra security</p>
                                </div>
                            </div>
                            <ChevronRight size={18} className="text-slate-300 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
                        </div>
                    </Card>
                </section>

                {/* Preferences Section */}
                <section>
                    <div className="flex items-center space-x-2 mb-4 px-1 text-slate-500">
                        <Bell size={18} className="text-blue-600" />
                        <h2 className="text-sm font-bold uppercase tracking-wider">Preferences</h2>
                    </div>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">Push Notifications</p>
                                    <p className="text-xs text-slate-500">Get notified about agent responses</p>
                                </div>
                            </div>
                            <div
                                className={cn(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2",
                                    notificationsEnabled ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"
                                )}
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            >
                                <span
                                    className={cn(
                                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                                        notificationsEnabled ? "translate-x-5" : "translate-x-0"
                                    )}
                                />
                            </div>
                        </div>
                    </Card>
                </section>

                {/* Danger Zone */}
                <div className="pt-4">
                    <Button
                        variant="danger"
                        className="w-full h-12 text-sm font-bold rounded-xl shadow-red-500/10"
                        onClick={logout}
                    >
                        <LogOut className="mr-2" size={18} />
                        Sign Out
                    </Button>
                    <p className="text-center text-xs text-slate-400 mt-4">
                        AI Talk Show v1.0.0 • Connected as {user.email}
                    </p>
                </div>
            </div>
        </div>
    );
}
