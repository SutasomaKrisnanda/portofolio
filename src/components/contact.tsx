'use client';

import React, { useState, useEffect } from 'react';
import {
  PortfolioModeConfig,
  ModeId,
  GLOBAL_PROFILE
} from '@/data/portfolio-data';
import { Mail, Phone, MapPin, Send, Loader2, Check, Github, Linkedin, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Footer from './footer';

interface ContactProps {
  modeConfig: PortfolioModeConfig;
  activeMode: ModeId;
  prefilledCategory?: string;
  prefilledMessage?: string;
  onSwitchMode?: (mode: ModeId) => void;
  onScrollToTop?: () => void;
  scrollMode?: 'normal' | 'snap';
}

export default function Contact({
  modeConfig,
  activeMode,
  prefilledCategory,
  prefilledMessage,
  onSwitchMode,
  onScrollToTop,
  scrollMode = 'normal'
}: ContactProps) {
  const { toast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState(
    prefilledCategory || modeConfig.contact.inquiryCategories[0]
  );
  const [message, setMessage] = useState(prefilledMessage || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledCategory) {
      setCategory(prefilledCategory);
    } else {
      setCategory(modeConfig.contact.inquiryCategories[0]);
    }
  }, [activeMode, prefilledCategory, modeConfig]);

  useEffect(() => {
    if (prefilledMessage) {
      setMessage(prefilledMessage);
    }
  }, [prefilledMessage]);

  const handleCopyText = (text: string, label: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2400);
      toast({
        title: 'Tersalin ke Clipboard',
        description: `${label} berhasil disalin.`
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast({
        title: 'Mohon Lengkapi Formulir',
        description: 'Nama, email, dan pesan wajib diisi.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: '56649e71-bb1f-4f58-965d-b069203df15d',
          subject: `${modeConfig.contact.defaultSubjectPrefix} ${category} — dari ${name}`,
          name: name,
          email: email,
          category: category,
          mode: modeConfig.fullLabel,
          message: message
        })
      });

      const result = await response.json();
      if (result.success) {
        setSubmitStatus('success');
        toast({
          title: 'Pesan Berhasil Terkirim!',
          description: 'Terima kasih telah menghubungi saya. Saya akan segera membalasnya.'
        });
        setName('');
        setEmail('');
        setMessage('');
      } else {
        throw new Error(result.message || 'Gagal mengirim pesan');
      }
    } catch {
      setSubmitStatus('error');
      toast({
        title: 'Pengiriman Gagal',
        description: 'Terjadi kendala saat mengirim. Silakan gunakan tautan Mailto di bawah.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const mailtoHref = `mailto:${GLOBAL_PROFILE.email}?subject=${encodeURIComponent(
    `${modeConfig.contact.defaultSubjectPrefix} ${category} — dari ${name || 'Pengunjung'}`
  )}&body=${encodeURIComponent(
    `Mode: ${modeConfig.fullLabel}\nKategori: ${category}\nNama: ${name}\nEmail: ${email}\n\nPesan:\n${message}`
  )}`;

  return (
    <section
      id="contact"
      className={`relative w-full ${
        scrollMode === 'snap'
          ? 'h-[100dvh] min-h-[100dvh] max-h-[100dvh] snap-start snap-always overflow-hidden pt-20 sm:pt-24 pb-4 px-4 sm:px-8 lg:px-12 flex flex-col justify-between'
          : 'py-20 sm:py-24 lg:py-28 px-4 sm:px-8 lg:px-12'
      } text-slate-900 dark:text-white scroll-mt-0`}
    >
      <div
        data-section-scroll
        className={`relative z-10 max-w-7xl w-full mx-auto flex flex-col ${
          scrollMode === 'snap'
            ? 'flex-1 h-full min-h-0 overflow-y-auto overscroll-contain pr-1.5 custom-scrollbar space-y-6 pb-2'
            : 'space-y-8'
        }`}
      >
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-900/5 dark:border-white/10 pb-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-slate-500 dark:text-slate-400 font-semibold">
              <span>06</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/30" />
              <span>Koneksi & Diskusi Kolaborasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-normal tracking-wide uppercase text-slate-950 dark:text-white">
              Hubungi & Diskusikan Ide
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal hidden sm:block max-w-md leading-relaxed">
            Punya pertanyaan atau ingin berkolaborasi? Kirim pesan langsung melalui formulir atau saluran kontak di bawah.
          </p>
        </div>

        {/* Natural Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left 5 Columns: Direct Coordinates & Socials */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 space-y-4 text-xs shadow-sm">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-950 dark:text-white border-b border-slate-100 dark:border-white/[0.06] pb-3">
                Saluran Kontak Langsung
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <Mail className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-950 dark:text-white">{GLOBAL_PROFILE.email}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(GLOBAL_PROFILE.email, 'Email')}
                  className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-[10px] uppercase tracking-wider font-semibold transition-colors cursor-pointer shrink-0"
                >
                  {copiedField === 'Email' ? 'Tersalin' : 'Salin'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 truncate">
                  <Phone className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span className="truncate font-medium text-slate-950 dark:text-white">{GLOBAL_PROFILE.phone}</span>
                </div>
                <a
                  href={GLOBAL_PROFILE.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold uppercase tracking-wider transition-transform hover:scale-105 shrink-0 shadow-sm"
                >
                  <ExternalLink className="w-2.5 h-2.5 text-white shrink-0" />
                  <span className="hidden md:block">WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-400 shrink-0" />
                <span>{GLOBAL_PROFILE.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={GLOBAL_PROFILE.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-white/85 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 ring-1 ring-slate-900/5 dark:ring-white/10 text-xs font-semibold text-slate-800 dark:text-white inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <a
                href={GLOBAL_PROFILE.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 rounded-xl bg-white/85 hover:bg-white dark:bg-slate-900/60 dark:hover:bg-slate-900/80 ring-1 ring-slate-900/5 dark:ring-white/10 text-xs font-semibold text-slate-800 dark:text-white inline-flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <Linkedin className="w-4 h-4" />
                <span>LinkedIn</span>
              </a>
            </div>
          </div>

          {/* Right 7 Columns: Web3Forms Form */}
          <div className="lg:col-span-7">
            <form onSubmit={handleSubmit} className="rounded-2xl bg-white/85 dark:bg-slate-900/60 backdrop-blur-xl ring-1 ring-slate-900/5 dark:ring-white/10 p-6 sm:p-7 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
                    Nama Lengkap Anda *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nama Lengkap"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
                    Alamat Email *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-category" className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
                  Kategori Keperluan
                </label>
                <select
                  id="contact-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-white dark:bg-slate-900 ring-1 ring-slate-900/10 dark:ring-white/10 text-slate-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white cursor-pointer"
                >
                  {modeConfig.contact.inquiryCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-400 font-semibold mb-1.5">
                  Isi Pesan / Rincian Projek *
                </label>
                <textarea
                  id="contact-message"
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tuliskan pesan atau ide kolaborasi Anda di sini..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-white/[0.05] ring-1 ring-slate-900/10 dark:ring-white/10 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 dark:focus:ring-white transition-all"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-semibold text-xs tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Mengirim...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Kirim Pesan</span>
                    </>
                  )}
                </button>

                <a
                  href={mailtoHref}
                  className="px-4 py-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white inline-flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Luncurkan Mailto</span>
                </a>
              </div>

              {submitStatus === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 ring-1 ring-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Pesan berhasil terkirim melalui Web3Forms! Terima kasih.</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Integrated Docked Footer with Generous Breathing Room */}
        <div className="pt-12">
          <Footer
            activeMode={activeMode}
            onSwitchMode={onSwitchMode || (() => { })}
            onScrollToTop={onScrollToTop || (() => { })}
          />
        </div>
      </div>
    </section>
  );
}
