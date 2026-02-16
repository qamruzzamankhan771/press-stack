'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Folder, Clock, Zap, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';

interface Project {
    id: string;
    name: string;
    type: string;
    createdAt: number;
    pages: any[];
}

export default function ProjectsDashboard() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/projects')
            .then(res => res.json())
            .then(data => {
                setProjects(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const fadeIn = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.4 }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-heading font-black tracking-tight text-gray-900 uppercase">My Projects</h1>
                        <p className="text-gray-500 font-medium mt-1">Manage your WordPress theme generation pipeline.</p>
                    </div>
                    <Link href="/projects/create">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="btn-primary !py-3 !px-6"
                        >
                            <Plus size={18} />
                            Create Project
                        </motion.button>
                    </Link>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="section-card h-64 animate-pulse bg-gray-100" />
                        ))}
                    </div>
                ) : projects.length === 0 ? (
                    <div className="section-card p-20 text-center space-y-6">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                            <Folder className="text-primary/20" size={40} />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-xl font-black text-gray-900 uppercase">No Projects Yet</h3>
                            <p className="text-gray-500 max-w-sm mx-auto font-medium">Build your first production-ready WordPress project in seconds.</p>
                        </div>
                        <Link href="/projects/create" className="inline-block">
                            <button className="btn-secondary">Get Started</button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {projects.map((project, i) => (
                            <motion.div
                                key={project.id}
                                variants={fadeIn}
                                initial="initial"
                                animate="animate"
                                transition={{ delay: i * 0.05 }}
                                className="section-card p-8 group cursor-pointer hover:border-primary/40 flex flex-col justify-between h-72"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="p-3 bg-primary/5 rounded-xl group-hover:bg-primary/10 transition-colors">
                                            <Folder className="text-primary" size={24} />
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md italic">
                                            {project.type}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-gray-900 group-hover:text-primary transition-colors uppercase truncate">
                                            {project.name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-gray-400 text-xs font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <Zap size={12} />
                                                {project.pages.length} Pages
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {new Date(project.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-6 border-t border-border">
                                    <Link href={`/projects/${project.id}`} className="flex-1">
                                        <button className="w-full btn-primary !py-2.5 !text-[10px] !rounded-xl">
                                            Manage Project
                                        </button>
                                    </Link>
                                    <button className="p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors">
                                        <Settings size={18} className="text-gray-400" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
