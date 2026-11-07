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
}

export default function Contact({
  modeConfig,
  activeMode,
  prefilledCategory,
  prefilledMessage,
  onSwitchMode,
  onScrollToTop
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
      className="relative w-full h-screen min-h-[640px] flex flex-col justify-center px-4 sm:px-8 lg:px-12 py-20 text-slate-900 dark:text-white scroll-snap-align-start overflow-hidden"
    >
      <div className="relative z-10 max-w-7xl w-full mx-auto flex flex-col h-full max-h-[88vh] justify-between space-y-4">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-900/10 dark:border-white/15 pb-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/70">
              <span>06</span>
              <span className="w-6 h-[1px] bg-slate-900/20 dark:bg-white/40" />
              <span>Koneksi & Diskusi Kolaborasi</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-light tracking-wide uppercase text-slate-950 dark:text-white">
              Hubungi & Diskusikan Ide
            </h2>
          </div>

          <p className="text-xs text-slate-600 dark:text-white/70 font-light hidden sm:block max-w-md">
            Punya pertanyaan atau ingin berkolaborasi? Kirim pesan langsung melalui formulir atau saluran kontak di bawah.
          </p>
        </div>

        {/* Scrollable Interior */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 5 Columns: Direct Coordinates & Socials */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3.5 text-xs shadow-md dark:shadow-xl">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70 border-b border-slate-900/10 dark:border-white/15 pb-2">
                  Saluran Kontak Langsung
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <Mail className="w-4 h-4 text-slate-600 dark:text-white/70 shrink-0" />
                    <span className="truncate font-medium text-slate-950 dark:text-white">{GLOBAL_PROFILE.email}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(GLOBAL_PROFILE.email, 'Email')}
                    className="px-2.5 py-1 rounded-full bg-slate-900/5 hover:bg-slate-900/10 text-slate-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white text-[10px] uppercase tracking-wider transition-colors cursor-pointer shrink-0 shadow-sm"
                  >
                    {copiedField === 'Email' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 truncate">
                    <Phone className="w-4 h-4 text-slate-600 dark:text-white/70 shrink-0" />
                    <span className="truncate font-medium text-slate-950 dark:text-white">{GLOBAL_PROFILE.phone}</span>
                  </div>
                  <a
                    href={GLOBAL_PROFILE.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white text-[10px] font-bold uppercase tracking-wider transition-transform hover:scale-105 shrink-0 shadow-sm"
                  >
                    <ExternalLink className="w-2 h-2 text-white shrink-0" />
                    <span className="hidden md:block">WhatsApp</span>
                  </a>
                </div>

                <div className="flex items-center gap-2.5 text-slate-700 dark:text-white/80 pt-1 border-t border-slate-900/10 dark:border-white/15">
                  <MapPin className="w-4 h-4 text-slate-600 dark:text-white/70 shrink-0" />
                  <span>{GLOBAL_PROFILE.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={GLOBAL_PROFILE.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-white/80 hover:bg-white dark:bg-black/35 dark:hover:bg-black/50 border border-slate-900/10 dark:border-white/20 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center justify-center gap-2 transition-all shadow-sm dark:shadow-md"
                >
                  <Github className="w-4 h-4" />
                  <span>GitHub</span>
                </a>
                <a
                  href={GLOBAL_PROFILE.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-xl bg-white/80 hover:bg-white dark:bg-black/35 dark:hover:bg-black/50 border border-slate-900/10 dark:border-white/20 text-xs font-medium text-slate-800 dark:text-white inline-flex items-center justify-center gap-2 transition-all shadow-sm dark:shadow-md"
                >
                  <Linkedin className="w-4 h-4" />
                  <span>LinkedIn</span>
                </a>
              </div>
            </div>

            {/* Right 7 Columns: Web3Forms Form */}
            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="rounded-2xl bg-white/75 dark:bg-black/40 backdrop-blur-xl border border-slate-900/10 dark:border-white/20 p-5 space-y-3.5 shadow-md dark:shadow-xl">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="contact-name" className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-white/75 mb-1">
                      Nama Lengkap Anda *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900/5 dark:bg-white/10 border border-slate-900/15 dark:border-white/20 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/45 focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-white/75 mb-1">
                      Alamat Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900/5 dark:bg-white/10 border border-slate-900/15 dark:border-white/20 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/45 focus:outline-none focus:border-slate-900 dark:focus:border-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-category" className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-white/75 mb-1">
                    Kategori Keperluan
                  </label>
                  <select
                    id="contact-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-white dark:bg-black/80 border border-slate-900/15 dark:border-white/20 text-slate-950 dark:text-white focus:outline-none cursor-pointer"
                  >
                    {modeConfig.contact.inquiryCategories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-[10px] uppercase tracking-wider text-slate-600 dark:text-white/75 mb-1">
                    Isi Pesan / Rincian Projek *
                  </label>
                  <textarea
                    id="contact-message"
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan pesan atau ide kolaborasi Anda di sini..."
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-900/5 dark:bg-white/10 border border-slate-900/15 dark:border-white/20 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/45 focus:outline-none focus:border-slate-900 dark:focus:border-white"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                    className="px-4 py-2.5 rounded-full bg-slate-900/5 hover:bg-slate-900/10 border border-slate-900/15 text-xs font-semibold text-slate-800 dark:bg-white/15 dark:hover:bg-white/25 dark:border-white/25 dark:text-white inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Luncurkan Mailto</span>
                  </a>
                </div>

                {submitStatus === 'success' && (
                  <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-400 text-emerald-200 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Pesan berhasil terkirim melalui Web3Forms! Terima kasih.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Integrated Docked Footer */}
        <Footer
          activeMode={activeMode}
          onSwitchMode={onSwitchMode || (() => { })}
          onScrollToTop={onScrollToTop || (() => { })}
        />
      </div>
    </section>
  );
}
