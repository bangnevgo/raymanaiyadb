'use client';

import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(6px)', background: 'rgba(0,0,0,0.25)' }}
    >
      {/* Popup card */}
      <div
        className="relative w-full max-w-md flex flex-col rounded-2xl overflow-hidden"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.98)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          background: 'oklch(0.10 0.01 160 / 0.92)',
          border: '1px solid oklch(0.45 0.2 160 / 0.2)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px oklch(0.45 0.2 160 / 0.1)',
          maxHeight: '85vh',
        }}
      >
        {/* Top glow accent */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg, transparent, oklch(0.55 0.2 160 / 0.6), transparent)' }}
        />

        {/* Scrollable content */}
        <div className="overflow-y-auto p-7 flex flex-col gap-5" style={{ scrollbarWidth: 'none' }}>

          {/* Badge */}
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full animate-pulse shrink-0"
              style={{ background: 'oklch(0.55 0.2 160)' }}
            />
            <span
              className="text-[10px] font-medium tracking-widest uppercase"
              style={{ color: 'oklch(0.55 0.15 160)' }}
            >
              RAYMANAIYA · Mission Control
            </span>
          </div>

          {/* Title */}
          <h1
            className="text-xl font-semibold leading-snug"
            style={{ color: 'oklch(0.93 0.01 160)' }}
          >
            Sebuah Tahun yang Berbeda
          </h1>

          {/* Body text */}
          <div
            className="space-y-3 text-[13px] leading-relaxed"
            style={{ color: 'oklch(0.62 0.01 160)' }}
          >
            <p>
              Tidak semua orang memulai perjalanan dengan cara yang sama. Tahun ini mungkin tidak
              berjalan seperti yang direncanakan. Beberapa teman mulai kuliah, sementara kamu sedang
              berada di persimpangan yang berbeda.
            </p>
            <p style={{ color: 'oklch(0.75 0.04 160)' }}>
              Tapi berbeda tidak berarti tertinggal.
            </p>
            <p>
              Justru tahun ini bisa menjadi kesempatan untuk membangun sesuatu yang jarang dimiliki
              banyak orang seusiamu:
            </p>

            <ul className="space-y-1 pl-3" style={{ color: 'oklch(0.70 0.06 160)' }}>
              {[
                'kemampuan berpikir yang kuat,',
                'kemampuan menggunakan AI,',
                'kemampuan bekerja secara profesional,',
                'kemampuan membangun karya dan portofolio,',
                'kemampuan menghasilkan nilai bagi orang lain.',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span
                    className="mt-[7px] size-1 shrink-0 rounded-full"
                    style={{ background: 'oklch(0.50 0.18 160)' }}
                  />
                  {item}
                </li>
              ))}
            </ul>

            <p>
              Program ini bukan tentang belajar lebih keras.{' '}
              <span style={{ color: 'oklch(0.76 0.08 160)' }}>
                Program ini tentang belajar lebih cerdas.
              </span>{' '}
              Bukan perlombaan dengan orang lain. Ini adalah investasi untuk dirimu sendiri.
            </p>

            <div
              className="rounded-lg border-l-2 pl-3 py-1 space-y-0.5"
              style={{ borderColor: 'oklch(0.45 0.2 160 / 0.5)', color: 'oklch(0.58 0.01 160)' }}
            >
              <p>Tidak ada tuntutan untuk sempurna.</p>
              <p>Tidak ada target untuk menjadi orang lain.</p>
              <p>
                Yang ada hanyalah satu tujuan:{' '}
                <span style={{ color: 'oklch(0.76 0.08 160)' }}>
                  menjadi versi dirimu yang lebih kuat, lebih percaya diri, dan lebih siap.
                </span>
              </p>
            </div>

            <p>
              Mungkin di akhir tahun kamu akan kuliah. Mungkin kamu sudah memiliki penghasilan.
              Mungkin kamu menemukan minat baru. Kita belum tahu — dan itu tidak masalah.
            </p>

            {/* Quote */}
            <p
              className="text-center text-xs italic pt-1"
              style={{ color: 'oklch(0.50 0.1 160)' }}
            >
              "Kita tidak sedang mengisi waktu sebelum kuliah. Kita sedang membangun dirimu
              sebelum memasuki babak berikutnya dalam hidup."
            </p>
          </div>
        </div>

        {/* Fixed bottom CTA */}
        <div
          className="px-7 pb-6 pt-3 flex justify-center"
          style={{ borderTop: '1px solid oklch(0.45 0.2 160 / 0.12)' }}
        >
          <button
            onClick={onStart}
            className="group inline-flex items-center gap-2.5 rounded-full px-7 py-2.5 text-sm font-medium tracking-wide transition-all duration-200"
            style={{
              background: 'oklch(0.45 0.2 160)',
              color: 'oklch(0.98 0 0)',
              boxShadow: '0 0 20px oklch(0.45 0.2 160 / 0.35)',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'oklch(0.52 0.2 160)';
              el.style.boxShadow = '0 0 28px oklch(0.45 0.2 160 / 0.5)';
              el.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = 'oklch(0.45 0.2 160)';
              el.style.boxShadow = '0 0 20px oklch(0.45 0.2 160 / 0.35)';
              el.style.transform = 'translateY(0)';
            }}
          >
            Mulai
            <svg
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
