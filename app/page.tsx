'use client';

import { motion } from 'framer-motion';
import {
  Orbit,
  ArrowRight,
  Zap,
  Shield,
  Layout,
  CheckCircle2,
  Smartphone,
  Cpu,
  Palette,
  Code2,
  Download,
  Users,
  Layers,
  Sparkles,
  Settings,
  Github
} from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true },
    transition: { staggerChildren: 0.1 }
  };

  return (
    <div className="min-h-screen bg-bg text-text selection:bg-primary/20 overflow-x-hidden">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4 ${isScrolled ? 'bg-white/80 backdrop-blur-xl border-b border-border py-3' : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Orbit className="text-white" size={16} />
            </div>
            <span className="text-lg font-heading font-black tracking-tight leading-none">PRESS STACK</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Waitlist'].map(item => (
              <motion.a
                key={item}
                href={item === 'Features' ? '#features' : '#early-access'}
                whileHover={{ y: -1 }}
                whileTap={{ y: 0 }}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 hover:text-primary transition-colors cursor-pointer"
              >
                {item}
              </motion.a>
            ))}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/compiler" className="btn-primary !py-2.5 !px-6 !text-[10px] !rounded-xl shadow-lg shadow-primary/20">
                Launch Studio
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/5 rounded-full border border-primary/10">
              <Sparkles size={12} className="text-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest text-primary">Limited: First 50 Developers</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-black tracking-tight leading-[1.1]">
              Stop Rebuilding <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">WordPress</span> from Scratch
            </h1>
            <p className="text-lg text-gray-500 max-w-xl font-medium leading-relaxed">
              Build fully custom WordPress themes with structured content models, plugin stacks, and export-ready starter packages — in minutes, not hours.
            </p>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="#early-access"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary btn-shine btn-glow !text-sm group !px-12 !py-5 shadow-2xl shadow-primary/40"
                >
                  Join Early Access
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </motion.a>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 italic px-2">
                Join 1,200+ developers waiting for launch.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative lg:block"
          >
            <div className="section-card aspect-square bg-[#0c111d] border-gray-800 p-8 shadow-2xl overflow-hidden group">
              <div className="flex items-center gap-2 mb-6 opacity-30">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
              </div>
              <div className="font-mono text-sm text-primary/70 mb-4 tracking-tight">
                <span className="text-white">export const</span> <span className="text-secondary">pressStack</span> = () =&gt; &#123;
              </div>
              <div className="pl-6 font-mono text-sm text-gray-400 space-y-2">
                <div>type: <span className="text-accent">'WordPress_Theme'</span>,</div>
                <div>logic: <span className="text-accent">'ACF_Pro'</span>,</div>
                <div>optimized: <span className="text-secondary">true</span>,</div>
                <div>accessibility: <span className="text-primary">'WCAG_2.1'</span></div>
              </div>
              <div className="font-mono text-sm text-primary/70 mt-4 tracking-tight">
                &#125;;
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0c111d] via-transparent to-transparent pointer-events-none" />

              {/* Floating Element */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 right-10 bg-white shadow-xl rounded-2xl p-4 border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest">Compiler Stable</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-24 bg-gray-50 border-y border-border px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeIn}>
            <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-8">
              Developers Waste Hours on Repetitive WordPress Setup
            </h2>
            <ul className="space-y-6">
              {[
                { title: 'Configuring plugins & ACF', desc: 'Setting up fields manually for every new project is slow and error-prone.' },
                { title: 'Rebuilding Theme Scaffolds', desc: 'Redoing the functions.php, folder structure, and templates from scratch.' },
                { title: 'SEO & Accessibility Basics', desc: 'Repeating mandatory setup tasks instead of focusing on unique features.' },
                { title: 'Repetitive Workflows', desc: 'Losing valuable hours to the exact same tasks across different clients.' }
              ].map((item, i) => (
                <li key={i} className="flex gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex-shrink-0 flex items-center justify-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="section-card p-1 bg-white shadow-2xl rotate-1"
          >
            <div className="bg-[#0c111d] p-10 rounded-[22px] flex flex-col items-center justify-center gap-6 min-h-[350px]">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Settings size={64} className="text-primary animate-spin-slow relative z-10" />
              </div>
              <p className="text-gray-400 font-mono text-xs text-center uppercase tracking-widest italic animate-pulse">
                automating repetitive setup...
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Solution Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20 text-center">
          <motion.div {...fadeIn} className="max-w-3xl mx-auto space-y-4">
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight">
              PressStack Automates Your WordPress Foundation
            </h2>
            <p className="text-gray-500 font-medium">
              A developer-first tool to generate structured WordPress stacks ready to deploy.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {[
              { icon: Layers, title: 'Clean PHP Scaffolds', desc: 'Generate high-quality theme structures for fully custom WordPress themes.' },
              { icon: Code2, title: 'ACF Field Builder', desc: 'Automatic creation of custom post types and complex ACF field groups.' },
              { icon: Shield, title: 'Plugin Stacks', desc: 'Preconfigure essential plugin stacks for SEO, Performance, and Commerce.' },
              { icon: Zap, title: 'Starter Packages', desc: 'Export deployable WordPress starter packages ready for instant use.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeIn}
                className="section-card p-8 group hover:border-primary/40 text-left cursor-default"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-black tracking-tight mb-2 uppercase tracking-widest text-[13px]">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div {...fadeIn}>
            <motion.a
              href="#early-access"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary btn-glow !text-sm group !px-12"
            >
              Get Early Access
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section id="how-it-works" className="py-32 bg-gray-900 text-white overflow-hidden relative px-6">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,#4f46e5,transparent)]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 space-y-20">
          <motion.div {...fadeIn} className="text-center space-y-4">
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight">
              Get Started in <span className="text-primary italic">3 Steps</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {[
              { num: '01', title: 'Sign up for access', desc: 'Join the waitlist — limited spots available for the MVP phase' },
              { num: '02', title: 'Select your stack', desc: 'Choose presets for Core, Content, or Commerce (basic) logic' },
              { num: '03', title: 'Export & Deploy', desc: 'Download and install your ready-to-use WordPress starter package' }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl"
              >
                <div className="text-4xl font-heading font-black text-primary/30 mb-4">{step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-gray-400">{step.desc}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeIn} className="text-center">
            <motion.a
              href="#early-access"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-primary !text-sm group !px-12 bg-white !text-primary hover:bg-white/90"
            >
              Reserve Your Spot
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </motion.a>
          </motion.div>
        </div>
      </section>

      {/* 5. Benefits Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <motion.div {...fadeIn} className="lg:w-1/2 space-y-10">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-4xl md:text-5xl font-heading font-black tracking-tight">
                Why Developers & Agencies Love PressStack
              </h2>
              <p className="text-gray-500 font-medium max-w-xl mx-auto lg:mx-0">
                Performance isn't just about code; it's about the speed of your delivery pipeline.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8">
              {[
                { title: 'Save 2–5 Hours', desc: 'Per project, reclaim your focus for unique features.' },
                { title: 'Standardize Workflow', desc: 'Maintain codebase consistency across teams and clients.' },
                { title: 'Professional PHP', desc: 'Clean, professional logic that senior devs actually like.' },
                { title: 'Scale Efficiently', desc: 'Reduce technical debt and scale multiple projects faster.' }
              ].map((benefit, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    <h3 className="font-black text-[11px] uppercase tracking-widest text-gray-900">{benefit.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed pl-6">{benefit.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="absolute -inset-10 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative section-card bg-white p-12 text-center space-y-6">
              <div className="text-7xl font-heading font-black text-primary leading-none">95%</div>
              <div className="text-xs font-black uppercase tracking-[0.3em] text-gray-400">Setup Automation Score</div>
              <div className="pt-8 border-t border-border mt-4 flex justify-between gap-4">
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Traditional</div>
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-300 w-full" />
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 italic">PressStack</div>
                  <div className="h-1 bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-[5%]" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 6. Early Access / Waitlist Section */}
      <section id="early-access" className="py-32 bg-gray-50 border-y border-border px-6 overflow-hidden relative">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div {...fadeIn} className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tight uppercase">
              Join the Developer Early Access List
            </h2>
            <p className="text-gray-500 font-medium max-w-2xl mx-auto leading-relaxed">
              Be the first to try PressStack. Get lifetime early access and exclusive perks.
              Limited spots available for our initial beta cohort.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto"
          >
            <div className="bg-white p-3 rounded-[2rem] shadow-2xl border border-border flex flex-col sm:flex-row gap-3 transition-all hover:shadow-primary/5">
              <input
                type="email"
                placeholder="developer@agency.com"
                className="flex-1 px-8 py-4 rounded-[1.5rem] focus:outline-none focus:ring-4 ring-primary/5 font-medium text-sm bg-gray-50/50 border border-transparent focus:border-primary/10 transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary btn-glow !rounded-[1.5rem] !py-4 !px-10 !text-[11px] whitespace-nowrap shadow-primary/20"
              >
                Join Now
              </motion.button>
            </div>
            <p className="mt-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              We respect your privacy. No spam. Guaranteed.
            </p>
          </motion.div>
        </div>
      </section>


      {/* 7. Social Proof */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto space-y-20">
          <motion.div {...fadeIn} className="text-center space-y-4">
            <h2 className="text-3xl font-heading font-black tracking-tight text-gray-400 uppercase tracking-[0.3em]">
              Trusted by Developers Who Deliver WordPress Faster
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { author: 'Jordan Miller', role: 'Full-stack WP Dev', quote: "PressStack turned my 4-hour setup into a 10-minute task. The ACF mapping is genuinely frightening how accurate it is." },
              { author: 'Sarah Chen', role: 'Agency Principal', quote: "Standardizing our theme foundations with PressStack has eliminated cross-team bugs. Every dev is finally on the same page." },
              { author: 'Alex Rivera', role: 'Freelance Architect', quote: "The exported code is PSR-compliant and clean. No bloat, just pure WordPress logic. It's my secret weapon for high-margin projects." }
            ].map((testi, i) => (
              <motion.div key={i} {...fadeIn} className="space-y-6">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Sparkles key={j} size={10} className="text-primary fill-primary" />)}
                </div>
                <p className="text-lg text-gray-900 font-medium leading-relaxed italic">"{testi.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200" />
                  <div>
                    <h4 className="font-black text-xs uppercase tracking-widest">{testi.author}</h4>
                    <p className="text-[10px] text-gray-500 font-bold">{testi.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-border py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Orbit className="text-primary" size={16} />
              </div>
              <span className="text-lg font-heading font-black tracking-tight leading-none uppercase">PRESS STACK</span>
            </div>
            <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
              The developer-first WordPress stack builder. Minimal UI, maximum control. Built for agencies and individual contributors who value their time.
            </p>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Links</h4>
            <ul className="space-y-4">
              {['Docs', 'FAQ', 'Contact Support', 'Privacy Policy'].map(item => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">{item}</a></li>
              ))}
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-[11px] font-black uppercase tracking-widest text-primary">Social</h4>
            <ul className="space-y-4">
              {['Twitter', 'LinkedIn', 'Github'].map(item => (
                <li key={item}><a href="#" className="text-sm text-gray-500 hover:text-primary transition-colors font-medium">{item}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <motion.a
              href="https://github.com/qamruzzamankhan771/press-stack"
              target="_blank"
              whileHover={{ scale: 1.2, rotate: 5 }}
              whileTap={{ scale: 0.9 }}
            >
              <Github size={18} className="text-gray-400 hover:text-primary cursor-pointer transition-colors" />
            </motion.a>
          </div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] italic">
            © 2026 PRESS STACK | v3.3.2 PRODUCTION STABLE
          </p>
        </div>
      </footer>
    </div>
  );
}
