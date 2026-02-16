'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Layout,
    Plus,
    ChevronRight,
    Box,
    FileText,
    ArrowLeft,
    Check,
    Save,
    Loader2,
    Settings
} from 'lucide-react';
import Link from 'next/link';
import { SUPPORTED_PLUGINS, PluginDefinition } from '@/lib/modules/plugins/pluginRegistry';

interface Project {
    id: string;
    name: string;
    type: string;
    plugins: string[];
    pages: { id: string; name: string; template: string }[];
}

export default function ProjectDetails() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        fetch(`/api/projects`)
            .then(res => res.json())
            .then(data => {
                const p = data.find((item: any) => item.id === id);
                if (p) {
                    setProject(p);
                }
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    const togglePlugin = (pluginId: string) => {
        if (!project) return;
        const newPlugins = project.plugins.includes(pluginId)
            ? project.plugins.filter(p => p !== pluginId)
            : [...project.plugins, pluginId];
        setProject({ ...project, plugins: newPlugins });
    };

    const handleSave = async () => {
        if (!project) return;
        setSaving(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(project),
            });
            if (res.ok) {
                // Show success toast or feedback
            }
        } catch (err) {
            console.error('Failed to save project', err);
        } finally {
            setSaving(false);
        }
    };

    const handleExport = async () => {
        if (!project) return;
        setExporting(true);
        try {
            const res = await fetch(`/api/projects/${project.id}/export`, {
                method: 'POST'
            });

            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `press-stack-theme-${project.id}.zip`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                console.error('Export failed');
            }
        } catch (error) {
            console.error('Export error', error);
        } finally {
            setExporting(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 uppercase font-black text-xs tracking-widest text-primary animate-pulse">
            Loading Project Workspace...
        </div>
    );

    if (!project) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 space-y-4">
            <h1 className="text-2xl font-black uppercase text-gray-900">Project Not Found</h1>
            <Link href="/projects" className="btn-secondary">Back to Dashboard</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Context Header */}
            <div className="bg-white border-b border-border px-8 py-6 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/projects" className="p-2.5 rounded-xl border border-border hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={18} className="text-gray-400" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-heading font-black text-gray-900 uppercase tracking-tight">{project.name}</h1>
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-md italic">
                                    {project.type}
                                </span>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Project ID: {project.id}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-secondary !py-2.5 !px-5 !text-[10px]"
                        >
                            {saving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                            {saving ? 'Saving...' : 'Save Configuration'}
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={exporting}
                            className="btn-primary !py-2.5 !px-5 !text-[10px]"
                        >
                            {exporting ? <Loader2 className="animate-spin" size={14} /> : <Box size={14} />}
                            {exporting ? 'Building...' : 'Finalize & Preview Zip'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12">
                    {/* Left: Plugin Selection */}
                    <div className="lg:col-span-8 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Box className="text-primary" size={20} />
                                <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Select Core Plugins</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {SUPPORTED_PLUGINS.map((plugin) => {
                                    const isSelected = project.plugins.includes(plugin.id);
                                    return (
                                        <div
                                            key={plugin.id}
                                            onClick={() => togglePlugin(plugin.id)}
                                            className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col gap-4 ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/20 bg-white'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary text-white' : 'bg-gray-100 text-gray-400'
                                                    }`}>
                                                    <Check size={20} className={isSelected ? 'opacity-100' : 'opacity-0'} />
                                                </div>
                                                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400 italic">
                                                    {plugin.category}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-gray-900 uppercase text-sm tracking-tight">{plugin.name}</h4>
                                                <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">{plugin.description}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Theme Logic Builder (Wait for PH2) */}
                        <div className="section-card p-12 bg-[#0c111d] border-gray-800 text-center space-y-6">
                            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto">
                                <Settings className="text-primary animate-spin-slow" size={32} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-black uppercase text-xl tracking-widest leading-none">Shell Builder Module</h3>
                                <p className="text-gray-400 text-sm font-medium">Automatic Header/Footer logic extraction from templates.</p>
                            </div>
                            <div className="flex justify-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/10 px-3 py-1.5 rounded-full italic">Coming in Phase 3</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Pages / Structure */}
                    <div className="lg:col-span-4 space-y-12">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <FileText className="text-primary" size={20} />
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest">Project Pages</h2>
                                </div>
                                <Link href={`/compiler?projectId=${project.id}`} className="p-2 rounded-lg bg-primary text-white hover:shadow-lg transition-all">
                                    <Plus size={16} />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {project.pages.length === 0 ? (
                                    <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center space-y-4">
                                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">No pages defined yet</p>
                                        <Link href={`/compiler?projectId=${project.id}`} className="text-xs font-black uppercase tracking-widest text-primary hover:text-gray-900 transition-colors inline-block">
                                            + Add First Page
                                        </Link>
                                    </div>
                                ) : (
                                    project.pages.map((page) => (
                                        <div key={page.id} className="section-card p-4 flex items-center justify-between group">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-gray-50 rounded-lg">
                                                    <Layout size={16} className="text-gray-400" />
                                                </div>
                                                <div>
                                                    <h5 className="font-black text-xs uppercase text-gray-900">{page.name}</h5>
                                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{page.template}</p>
                                                </div>
                                            </div>
                                            <ChevronRight size={14} className="text-gray-300 group-hover:text-primary transition-colors" />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Help / Guidance */}
                        <div className="p-8 bg-white border-2 border-border rounded-[2rem] space-y-4">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Developer Tip</h4>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Curate your plugin stack first. The system will auto-inject the necessary activation logic into your theme's <code className="bg-gray-100 px-1 rounded">inc/plugins.php</code> file.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
