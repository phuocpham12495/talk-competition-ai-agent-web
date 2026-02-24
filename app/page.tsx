"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, Send, History } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [topic, setTopic] = useState("");
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    router.push(`/conversation/active?topic=${encodeURIComponent(topic.trim())}`);
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="flex flex-col items-center text-center space-y-6 mb-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-blue-600 p-4 rounded-3xl shadow-xl shadow-blue-500/20 text-white"
        >
          <Sparkles size={48} />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            AI <span className="text-blue-600">Talk Show</span>
          </h1>
          <p className="mt-4 text-xl text-slate-600 dark:text-slate-400 max-w-2xl">
            Watch humor and seriousness collide in a dynamic debate over any topic you choose!
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="grid gap-8 md:p-10 border-blue-100 dark:border-blue-900 shadow-xl shadow-blue-500/5">
          <form onSubmit={handleStart} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-slate-500 ml-1">
                Conversation Topic
              </label>
              <div className="relative">
                <Input
                  className="pl-12 h-16 text-lg"
                  placeholder="e.g. Is pineapple valid on pizza?"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <MessageSquare size={24} />
                </div>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full h-16 text-xl group">
              Start the Show
              <Send className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
            </Button>
          </form>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 font-medium">Or check your previous debates</p>
            <Link href="/conversations">
              <Button variant="outline" className="rounded-full">
                <History className="mr-2" size={18} />
                View History
              </Button>
            </Link>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-950 border-blue-100 dark:border-blue-900">
          <h3 className="text-lg font-bold text-blue-900 dark:text-blue-100 mb-2 flex items-center">
            <span className="mr-2 text-2xl">😂</span> Humor AI
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-300 opacity-80">
            Highly sarcastic, witty, and always looking for the punchline. Expect plenty of irony and lighthearted jabs.
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-slate-950 border-purple-100 dark:border-purple-900">
          <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100 mb-2 flex items-center">
            <span className="mr-2 text-2xl">🧐</span> Serious AI
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-300 opacity-80">
            Analytical, logical, and deeply serious. Focuses on facts, philosophy, and practical consequences.
          </p>
        </Card>
      </div>
    </div>
  );
}
