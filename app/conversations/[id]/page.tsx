"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Calendar, MessageSquare, Sparkles, Brain, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ConversationDetailPage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();
    const [conversation, setConversation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (id && user) {
            fetchConversation();
        }
    }, [id, user]);

    const fetchConversation = async () => {
        try {
            const docRef = doc(db, "conversations", id as string);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.userId !== user?.uid) {
                    router.push("/conversations");
                    return;
                }
                setConversation({
                    ...data,
                    createdAtDate: data.createdAt?.toDate() || new Date()
                });
            }
        } catch (error) {
            console.error("Error fetching conversation:", error);
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!conversation) return null;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-6 flex items-center space-x-4">
                <Link href="/conversations">
                    <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                        <ChevronLeft size={24} />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white">
                        {conversation.topic}
                    </h1>
                    <div className="flex items-center text-sm text-slate-500 font-medium mt-1">
                        <Calendar size={14} className="mr-1" />
                        {conversation.createdAtDate.toLocaleString()}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {conversation.messages.map((msg: any, index: number) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                            "flex flex-col max-w-[85%]",
                            msg.agent === "Humor AI" ? "items-start" : "items-end self-end"
                        )}
                    >
                        <div className={cn(
                            "flex items-center space-x-2 mb-1 px-2",
                            msg.agent === "Humor AI" ? "flex-row" : "flex-row-reverse space-x-reverse"
                        )}>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                {msg.agent}
                            </span>
                            {msg.agent === "Humor AI" ? <Sparkles size={12} className="text-yellow-500" /> : <Brain size={12} className="text-blue-500" />}
                        </div>
                        <div className={cn(
                            "p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed border border-slate-200 dark:border-slate-800",
                            msg.agent === "Humor AI"
                                ? "bg-white dark:bg-slate-950 rounded-tl-none text-slate-800 dark:text-slate-200"
                                : "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10"
                        )}>
                            {msg.text}
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="mt-12 flex justify-center">
                <Link href="/">
                    <Button className="rounded-full px-8">
                        Start a New Debate
                    </Button>
                </Link>
            </div>
        </div>
    );
}
