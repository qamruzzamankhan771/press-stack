'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Layout, Palette, Code2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const PROJECT_TYPES = [
    { id: 'custom', name: 'Custom Theme', desc: 'Fully bespoke theme structured from your HTML designs.', icon: Palette },
    { id: 'acf-driven', name: 'ACF Driven', desc: 'Optimized for custom content models and flexible layouts.', icon: Code2 },
    { id: 'landing', name: 'Landing Page', desc: 'Lightweight static-to-dynamic single page project.', icon: Layout },
];

export default function CreateProject() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [type, setType] = useState('custom');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type }),
            });

            const data = await res.json();

            if (res.ok) {
                router.push(`/projects/${data.id}`);
            } else {
                setError(data.error);
            }
        } catch (err) {
            setError('Failed to create project.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-2xl bg-white border border-border shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
                <div className="bg-primary/5 p-12 border-b border-border relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                    <Link href="/projects" className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-gray-900 transition-colors mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <Sparkles className="text-primary" size={20} />
                        <h1 className="text-4xl font-heading font-black text-gray-900 uppercase leading-none tracking-tight">Create New Project</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Define your WordPress project baseline.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-12 space-y-10">
                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary/60 italic block">Project Identity</label>
                        <input
                            type="text"
                            placeholder="e.g. Acme Studio Rebrand"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-field text-xl py-4 font-bold"
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-[11px] font-black uppercase tracking-widest text-primary/60 italic block">Selection Type</label>
                        <div className="grid grid-cols-1 gap-4">
                            {PROJECT_TYPES.map(pt => (
                                <div
                                    key={pt.id}
                                    onClick={() => setType(pt.id)}
                                    className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-6 ${type === pt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20 bg-white'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${type === pt.id ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                        }`}>
                                        <pt.icon size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-black text-gray-900 uppercase tracking-tight">{pt.name}</h4>
                                        <p className="text-sm text-gray-500 font-medium">{pt.desc}</p>
                                    </div>
                                    {type === pt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                </div>
                            ))}
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full py-6 text-sm shadow-primary/40"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                        ) : (
                            <>
                                Initialize Workspace
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
