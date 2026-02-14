'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCode,
  Settings,
  Code,
  Copy,
  Download,
  Trash2,
  Zap,
  Check,
  AlertCircle,
  Layout,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Eye,
  Github,
  Orbit
} from 'lucide-react';
import { formatHTML, formatPHP } from '@/lib/formatters';
import Prism from 'prismjs';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-json';

interface OutputState {
  php: string;
  acf: any;
  model: any[];
  optimizedHtml: string;
}

export default function Home() {
  const [htmlInput, setHtmlInput] = useState('');
  const [templateName, setTemplateName] = useState('custom-section');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [output, setOutput] = useState<OutputState | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'php' | 'acf' | 'preview'>('php');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const phpRef = useRef<HTMLElement>(null);
  const htmlRef = useRef<HTMLElement>(null);
  const acfRef = useRef<HTMLElement>(null);

  // Handle Scroll for Header
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollPos > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Syntax Highlighting Effect
  useEffect(() => {
    if (output) {
      try {
        // Ensure languages are available
        if (Prism.languages.php && Prism.languages.markup && Prism.languages.json) {
          Prism.highlightAll();
        } else {
          // Fallback or re-initialize
          setTimeout(() => Prism.highlightAll(), 100);
        }
      } catch (e) {
        console.warn('Prism highlighting deferred:', e);
      }
    }
  }, [output, activeTab]);

  // Live Conversion
  useEffect(() => {
    const timer = setTimeout(() => {
      if (htmlInput.trim()) {
        handleConvert(false);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [htmlInput, templateName, includeHeader]);

  const handleConvert = async (isManual = true) => {
    if (!htmlInput.trim()) return;

    if (isManual) setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          html: htmlInput,
          templateName: templateName,
          includeHeader: includeHeader
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setOutput({
          php: formatPHP(data.php),
          acf: data.acf,
          model: data.model,
          optimizedHtml: data.optimizedHtml
        });
      } else {
        setError(data.error || 'Conversion failed');
      }
    } catch (err) {
      if (isManual) setError('Connection failure. Check if the server is running.');
    } finally {
      if (isManual) setLoading(false);
    }
  };

  const handleClear = () => {
    setHtmlInput('');
    setOutput(null);
    setError(null);
  };

  const copyToClipboard = () => {
    const text = activeTab === 'php' ? output?.php :
      activeTab === 'acf' ? JSON.stringify(output?.acf, null, 2) :
        output?.optimizedHtml;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualFormat = () => {
    if (!output) return;
    setOutput(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        php: formatPHP(prev.php),
        optimizedHtml: formatHTML(prev.optimizedHtml)
      };
    });
  };

  const handleManualFormatInput = () => {
    if (htmlInput) setHtmlInput(formatHTML(htmlInput));
    if (output) {
      setOutput({
        ...output,
        php: formatPHP(output.php),
        optimizedHtml: formatHTML(output.optimizedHtml)
      });
    }
  };

  const loadSampleHTML = () => {
    const sample = `<section class="feature-block">
  <div class="wrap">
    <h2>Our Core Features</h2>
    <div class="grid">
      <div class="item">
        <img src="icon1.svg" alt="Quick Launch">
        <h3>Lightning Fast</h3>
        <p>Optimized compiled code for maximum speed.</p>
      </div>
      <div class="item">
        <img src="icon2.svg" alt="Secure">
        <h3>Secure by Design</h3>
        <p>Enterprise grade security for your templates.</p>
        <a href="/security">Learn More</a>
      </div>
    </div>
  </div>
</section>`;
    setHtmlInput(sample.trim());
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20">

      {/* Tooltip Overlay */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 10, x: "-50%" }}
            className="tooltip tooltip-visible left-1/2 flex items-center gap-2"
          >
            <CheckCircle2 size={12} className="text-secondary" />
            Code Copied to Clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 px-6 py-4 flex items-center justify-between ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-border py-3 shadow-md' : 'bg-bg/50'
          }`}
      >
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 15 }}
            className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20"
          >
            <Orbit className="text-white" size={20} />
          </motion.div>
          <div className="flex flex-col">
            <span className="text-lg font-heading font-black tracking-tight leading-none">PRESS STACK</span>
            <span className="text-[9px] font-black tracking-[0.3em] text-primary/60 uppercase">Studio Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleClear}
            className="hidden sm:flex btn-secondary !py-2 !px-4 !text-xs"
            aria-label="Clear all inputs"
          >
            <Trash2 size={14} />
            Reset
          </button>
          <button
            disabled={!output}
            onClick={() => {/* Mock download */ }}
            className="btn-primary !py-2 !px-5 !text-xs shadow-none hover:shadow-lg"
            aria-label="Export generated files"
          >
            <Download size={14} />
            Export Bundle
          </button>
        </div>
      </header>

      {/* Content Scrolled */}
      <main className="pt-28 pb-20 px-6 max-w-7xl mx-auto space-y-10">

        {/* Headline */}
        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center space-y-3"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10 mb-2">
            <Sparkles size={12} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Compiler v3.3.0 Stable</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-heading font-black tracking-tight">
            Static to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Dynamic WordPress</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-xl mx-auto font-medium">
            The mandatory architectural gatekeeper. Automatically handles landmarks, heading hierarchy, and WCAG accessibility standards.
          </p>
        </motion.section>

        {/* Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Input Panel */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="section-card p-6 space-y-6">

              {/* Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Project Configuration</h2>
                  <button
                    onClick={loadSampleHTML}
                    className="text-primary font-bold text-[10px] uppercase tracking-widest hover:underline"
                    aria-label="Load sample HTML"
                  >
                    Load Sample
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest px-1">Template Identifier</label>
                    <input
                      type="text"
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value.replace(/[^a-zA-Z0-9_\- ]/g, ''))}
                      className="input-field !text-sm"
                      placeholder="e.g. Services Landing"
                      aria-label="WordPress Template Name or Slug"
                    />
                  </div>

                  {/* Accessible Checkbox */}
                  <div className="flex flex-col gap-2">
                    <label
                      className="custom-checkbox group h-14 bg-bg rounded-2xl border border-border px-5 hover:border-primary/20 transition-all flex items-center"
                      htmlFor="header-toggle"
                    >
                      <input
                        id="header-toggle"
                        type="checkbox"
                        className="sr-only"
                        checked={includeHeader}
                        onChange={() => setIncludeHeader(!includeHeader)}
                      />
                      <div className="checkbox-box group-hover:border-primary/60">
                        <Check className="checkbox-tick" size={14} strokeWidth={4} aria-hidden="true" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-text mb-0.5">Add Template Name</span>
                        <span className="text-[10px] text-gray-400 font-medium">Include WordPress metadata header</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Source Code */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Static HTML Source</h2>
                  <button
                    onClick={handleManualFormat}
                    className="btn-secondary !py-1 !px-3 !text-[10px] !rounded-lg border-none hover:bg-primary/5 text-primary"
                    aria-label="Format source code"
                  >
                    <RefreshCw size={10} />
                    Format
                  </button>
                </div>
                <div className="relative group overflow-hidden rounded-2xl border-2 border-border focus-within:border-primary/30 transition-all">
                  <textarea
                    value={htmlInput}
                    onChange={(e) => setHtmlInput(e.target.value)}
                    className="w-full h-[400px] p-5 font-mono text-xs resize-none focus:outline-none bg-white text-gray-600 custom-scrollbar leading-relaxed"
                    placeholder="<!-- Paste your raw HTML here -->"
                    aria-label="Paste HTML for conversion"
                  />
                  {loading && (
                    <div className="absolute top-4 right-4 animate-spin text-primary">
                      <RefreshCw size={14} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.section>

          {/* Output Panel */}
          <motion.section
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="lg:col-span-7 flex flex-col min-h-[700px]"
          >
            <div className="section-card p-6 flex flex-col h-full bg-white">

              {/* Tab Navigation */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div className="flex p-1 bg-bg rounded-xl w-full sm:w-auto border border-border">
                  {[
                    { id: 'php', icon: FileCode, label: 'PHP Template' },
                    { id: 'acf', icon: Settings, label: 'ACF Metadata' },
                    { id: 'preview', icon: Eye, label: 'Optimized DOM' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg transition-all font-bold text-[10px] uppercase tracking-wider ${activeTab === tab.id
                        ? 'bg-white text-primary shadow-sm ring-1 ring-border'
                        : 'text-gray-400 hover:text-gray-600'
                        }`}
                      aria-label={`Show ${tab.label}`}
                    >
                      <tab.icon size={12} />
                      {tab.label.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {output && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleManualFormat}
                      className="btn-secondary !py-2 !px-4 !text-[10px] !rounded-xl transition-all"
                      aria-label="Format output code"
                    >
                      <RefreshCw size={12} />
                      Format
                    </button>
                    <button
                      onClick={copyToClipboard}
                      className="btn-secondary !py-2 !px-4 !text-[10px] !rounded-xl group relative overflow-hidden"
                      aria-label="Copy output to clipboard"
                    >
                      <Copy size={12} className="group-active:scale-95 transition-transform" />
                      Copy Code
                    </button>
                  </div>
                )}
              </div>

              {/* Code Surface */}
              <div className="flex-1 bg-gray-50 rounded-2xl overflow-hidden relative border border-border">
                <div className="h-full overflow-auto p-6 custom-scrollbar">
                  {output ? (
                    <pre className={`line-numbers language-${activeTab === 'php' ? 'php' : activeTab === 'acf' ? 'json' : 'markup'}`}>
                      <code className={`language-${activeTab === 'php' ? 'php' : activeTab === 'acf' ? 'json' : 'markup'}`}>
                        {activeTab === 'php' ? output.php :
                          activeTab === 'acf' ? JSON.stringify(output.acf, null, 2) :
                            output.optimizedHtml}
                      </code>
                    </pre>
                  ) : (
                    <div className="h-[500px] flex flex-col items-center justify-center text-center space-y-4 opacity-30 select-none">
                      <div className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-3xl flex items-center justify-center">
                        <Layout size={24} className="text-gray-400" />
                      </div>
                      <div className="space-y-1">
                        <p className="font-heading font-black uppercase tracking-[0.2em] text-sm italic">Waiting for input</p>
                        <p className="text-[10px] font-bold">The compiler will process code live.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Float Badge */}
                {output && (
                  <div className="absolute bottom-4 right-6 pointer-events-none">
                    <div className="bg-white/80 backdrop-blur border border-border px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">
                        {activeTab.toUpperCase()} Mode
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats / Status Bar */}
              {output && (
                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-5">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-primary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Semantic Tree Verified</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 size={12} className="text-secondary" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Accessibility Normalized</span>
                    </div>
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1 text-gray-300">
                    Industrial Architecture v3.2
                  </div>
                </div>
              )}
            </div>
          </motion.section>

        </div>
      </main>

      {/* Modern Footer */}
      <footer className="border-t border-border mt-20 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Orbit size={14} className="text-gray-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-300">Press Stack Intelligence</span>
          </div>
          <div className="flex items-center gap-6">
            {['Architecture', 'Security', 'Compliance'].map(item => (
              <a
                key={item}
                href="#"
                className="text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-primary transition-colors py-1 relative group"
              >
                {item}
                <span className="absolute bottom-0 left-0 w-0 h-px bg-primary transition-all group-hover:w-full" />
              </a>
            ))}
          </div>
          <p className="text-[9px] font-bold text-gray-300">© 2026 DEEPMIND ADVANCED ARCHITECTURE PROJECT</p>
        </div>
      </footer>
    </div>
  );
}
