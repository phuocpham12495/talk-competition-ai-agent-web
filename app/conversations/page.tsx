"use client";

import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Trash2, Calendar, MessageSquare, ChevronRight, Loader2, Brain } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function ConversationsHistoryPage() {
    const [conversations, setConversations] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortOrder, setSortOrder] = useState<'Date DESC' | 'Date ASC' | 'Topic ASC' | 'Topic DESC'>('Date DESC');
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        if (user) fetchConversations();
    }, [user]);

    const fetchConversations = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, 'conversations'),
                where('userId', '==', user.uid)
            );
            const querySnapshot = await getDocs(q);
            const data = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAtDate: (doc.data() as any).createdAt?.toDate() || new Date()
            }));
            setConversations(data);
        } catch (error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this conversation?')) return;

        try {
            await deleteDoc(doc(db, 'conversations', id));
            setConversations(prev => prev.filter(c => c.id !== id));
        } catch (e) {
            console.error('Delete error', e);
        }
    };

    const getFilteredAndSorted = () => {
        let result = [...conversations];

        if (searchQuery) {
            const lowerQ = searchQuery.toLowerCase();
            result = result.filter(c => c.topic.toLowerCase().includes(lowerQ));
        }

        result.sort((a, b) => {
            if (sortOrder === 'Topic ASC') return a.topic.localeCompare(b.topic);
            if (sortOrder === 'Topic DESC') return b.topic.localeCompare(a.topic);

            const timeA = a.createdAtDate.getTime();
            const timeB = b.createdAtDate.getTime();

            if (sortOrder === 'Date ASC') return timeA - timeB;
            return timeB - timeA;
        });

        return result;
    };

    if (authLoading || loading || !user) {
        return (
            <div className="flex min-h-[calc(100vh-64px)] items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            </div>
        );
    }

    const filtered = getFilteredAndSorted();

    return (
        <div className="container mx-auto max-w-5xl px-4 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">Debate History</h1>
                    <p className="text-slate-500 font-medium">Your past AI talk show sessions</p>
                </div>

                <Link href="/">
                    <Button className="rounded-full">
                        <MessageSquare className="mr-2" size={18} />
                        New Debate
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Input
                        className="pl-10"
                        placeholder="Search topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {(['Date DESC', 'Date ASC', 'Topic ASC', 'Topic DESC'] as const).map((order) => (
                        <Button
                            key={order}
                            variant={sortOrder === order ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setSortOrder(order)}
                            className="whitespace-nowrap rounded-full px-4"
                        >
                            {order === 'Date DESC' ? 'Newest' :
                                order === 'Date ASC' ? 'Oldest' :
                                    order === 'Topic ASC' ? 'A-Z' : 'Z-A'}
                        </Button>
                    ))}
                </div>
            </div>

            {filtered.length === 0 ? (
                <Card className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 border-dashed">
                    <div className="flex flex-col items-center">
                        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                            <MessageSquare size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No debates found</h3>
                        <p className="text-slate-500 mt-1 mb-6">Start a new conversation to see it here!</p>
                        <Link href="/">
                            <Button variant="outline">Start Your First Show</Button>
                        </Link>
                    </div>
                </Card>
            ) : (
                <div className="grid gap-4">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((item) => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Link href={`/conversations/${item.id}`}>
                                    <Card hoverable className="p-4 flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <div className="h-12 w-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                                                <Brain size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                                                    {item.topic}
                                                </h3>
                                                <div className="flex items-center text-xs text-slate-500 font-medium space-x-3 mt-1">
                                                    <span className="flex items-center">
                                                        <Calendar size={12} className="mr-1" />
                                                        {item.createdAtDate.toLocaleDateString()}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <MessageSquare size={12} className="mr-1" />
                                                        {item.messages?.length || 0} turns
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 h-10 w-10 p-0"
                                                onClick={(e) => handleDelete(item.id, e)}
                                            >
                                                <Trash2 size={18} />
                                            </Button>
                                            <ChevronRight className="text-slate-300 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" size={20} />
                                        </div>
                                    </Card>
                                </Link>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
