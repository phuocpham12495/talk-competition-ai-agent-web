"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ConversationTurn, generateOpeningStatement, generateResponse } from "@/lib/ai";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { Save, RefreshCw, ChevronLeft, Loader2, Sparkles, Brain } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ActiveConversationContent() {
    const searchParams = useSearchParams();
    const topic = searchParams.get("topic") || "";
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    const [messages, setMessages] = useState<ConversationTurn[]>([]);
    const [isGenerating, setIsGenerating] = useState(true);
    const [isFinished, setIsFinished] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const maxTurns = 6;

    const currentTurn = useRef(0);
    const activeAgent = useRef<"Humor AI" | "Serious AI">("Humor AI");
    const lastMessage = useRef<string>("");
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (topic && user) {
            startConversation();
        }
    }, [topic, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isGenerating]);

    const startConversation = async () => {
        setIsGenerating(true);
        const firstMsg = await generateOpeningStatement(topic, "Humor AI");
        appendMessage("Humor AI", firstMsg);

        lastMessage.current = firstMsg;
        activeAgent.current = "Serious AI";
        currentTurn.current += 1;

        continueConversation();
    };

    const continueConversation = async () => {
        if (currentTurn.current >= maxTurns) {
            setIsGenerating(false);
            setIsFinished(true);
            return;
        }

        // Small delay before AI starts "typing"
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsGenerating(true);

        const nextMsg = await generateResponse(topic, activeAgent.current, lastMessage.current);
        appendMessage(activeAgent.current, nextMsg);

        lastMessage.current = nextMsg;
        activeAgent.current = activeAgent.current === "Humor AI" ? "Serious AI" : "Humor AI";
        currentTurn.current += 1;

        continueConversation();
    };

    const appendMessage = (agent: "Humor AI" | "Serious AI", text: string) => {
        setMessages(prev => [...prev, {
            id: Math.random().toString(36).substr(2, 9),
            agent,
            text,
            timestamp: Date.now()
        }]);
    };

    const saveConversation = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            await addDoc(collection(db, "conversations"), {
                userId: user.uid,
                topic,
                messages,
                createdAt: serverTimestamp(),
            });
            router.push("/conversations");
        } catch (error) {
            console.error("Error saving conversation:", error);
            alert("Failed to save conversation.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8 h-[calc(100vh-64px)] flex flex-col">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="rounded-full h-10 w-10 p-0">
                            <ChevronLeft size={24} />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                            Topic: {topic}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            {isFinished ? "Conversation Ended" : "AI agents are debating..."}
                        </p>
                    </div>
                </div>

                {isFinished && (
                    <Button
                        onClick={saveConversation}
                        isLoading={isSaving}
                        className="rounded-full shadow-lg shadow-blue-500/20"
                    >
                        <Save className="mr-2" size={18} />
                        Save Debate
                    </Button>
                )}
            </div>

            <Card className="flex-1 overflow-hidden flex flex-col p-0 border-slate-200 dark:border-slate-800 shadow-xl bg-slate-50/50 dark:bg-slate-900/50">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scroll-smooth"
                >
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
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
                                    "relative p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed",
                                    msg.agent === "Humor AI"
                                        ? "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-tl-none text-slate-800 dark:text-slate-200"
                                        : "bg-blue-600 text-white rounded-tr-none shadow-md shadow-blue-600/10"
                                )}>
                                    {msg.text}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isGenerating && !isFinished && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                                "flex flex-col max-w-[85%]",
                                activeAgent.current === "Humor AI" ? "items-start" : "items-end self-end"
                            )}
                        >
                            <div className="flex items-center space-x-2 bg-slate-200 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-none animate-pulse">
                                <div className="flex space-x-1">
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                                </div>
                                <span className="text-xs font-medium text-slate-500 italic">
                                    {activeAgent.current} is thinking...
                                </span>
                            </div>
                        </motion.div>
                    )}
                </div>

                {!isFinished && (
                    <div className="p-4 bg-white/50 dark:bg-slate-950/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
                        <div className="flex items-center space-x-3 text-slate-500 text-sm font-medium">
                            <Loader2 className="animate-spin" size={16} />
                            <span>Round {currentTurn.current + 1} of {maxTurns}</span>
                        </div>
                    </div>
                )}
            </Card>

            {isFinished && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 flex justify-center space-x-4"
                >
                    <Button variant="outline" className="rounded-full px-8" onClick={() => window.location.reload()}>
                        <RefreshCw className="mr-2" size={18} />
                        Restart Show
                    </Button>
                    <Link href="/">
                        <Button variant="ghost" className="rounded-full px-8">
                            New Topic
                        </Button>
                    </Link>
                </motion.div>
            )}
        </div>
    );
}

export default function ActiveConversationPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        }>
            <ActiveConversationContent />
        </Suspense>
    );
}
