'use client';

import { useState, useEffect } from 'react';

interface WelcomeScreenProps {
  onStart: () => void;
}

export function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{ background: 'oklch(0.08 0.01 160)' }}
    >
      {/* Subtle background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 50% at 50% 40%, oklch(0.45 0.2 160 / 0.08) 0%, transparent 70%)',
        }}
      />

      {/* Grain texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px',
        }}
      />

      {/* Content */}
      <div
        className="relative w-full max-w-xl mx-auto px-8 py-12 flex flex-col items-center text-center"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        {/* Logo / Year badge */}
        <div
          className="mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium tracking-widest uppercase"
          style={{
            borderColor: 'oklch(0.45 0.2 160 / 0.4)',
            color: 'oklch(0.65 0.15 160)',
            background: 'oklch(0.45 0.2 160 / 0.08)',
          }}
        >
          <span
            className="size-1.5 rounded-full animate-pulse"
            style={{ background: 'oklch(0.55 0.2 160)' }}
          />
          RAYMANAIYA · Mission Control
        </div>

        {/* Title */}
        <h1
          className="mb-8 text-3xl font-semibold leading-snug tracking-tight"
          style={{ color: 'oklch(0.93 0.01 160)' }}
        >
          Sebuah Tahun yang Berbeda
        </h1>

        {/* Body text */}
        <div
          className="space-y-4 text-sm leading-relaxed text-left"
          style={{ color: 'oklch(0.65 0.01 160)' }}
        >
          <p>
            Tidak semua orang memulai perjalanan dengan cara yang sama. Tahun ini mungkin tidak
            berjalan seperti yang direncanakan. Beberapa teman mulai kuliah, sementara kamu sedang
            berada di persimpangan yang berbeda.
          </p>
          <p style={{ color: 'oklch(0.75 0.02 160)' }}>
            Tapi berbeda tidak berarti tertinggal.
          </p>
          <p>
            Justru tahun ini bisa menjadi kesempatan untuk membangun sesuatu yang jarang dimiliki
            banyak orang seusiamu:
          </p>

          <ul className="space-y-1.5 pl-4" style={{ color: 'oklch(0.72 0.06 160)' }}>
            {[
              'kemampuan berpikir yang kuat,',
              'kemampuan menggunakan AI,',
              'kemampuan bekerja secara profesional,',
              'kemampuan membangun karya dan portofolio,',
              'kemampuan menghasilkan nilai bagi orang lain.',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span
                  className="mt-1.5 size-1 shrink-0 rounded-full"
                  style={{ background: 'oklch(0.55 0.18 160)' }}
                />
                {item}
              </li>
            ))}
          </ul>

          <p>
            Program ini bukan tentang belajar lebih keras.{' '}
            <span style={{ color: 'oklch(0.78 0.08 160)' }}>
              Program ini tentang belajar lebih cerdas.
            </span>
          </p>
          <p>
            Bukan perlombaan dengan orang lain. Ini adalah investasi untuk dirimu sendiri.
          </p>
          <p>
            Selama satu tahun ke depan kita akan belajar, bereksperimen, membuat proyek, membangun
            keterampilan, bertemu orang-orang baru, dan melihat sejauh mana kemampuanmu bisa
            berkembang.
          </p>

          <div
            className="rounded-lg border-l-2 pl-4 py-1"
            style={{
              borderColor: 'oklch(0.45 0.2 160 / 0.5)',
              color: 'oklch(0.60 0.01 160)',
            }}
          >
            <p>Tidak ada tuntutan untuk sempurna.</p>
            <p>Tidak ada target untuk menjadi orang lain.</p>
            <p>
              Yang ada hanyalah satu tujuan sederhana:{' '}
              <span style={{ color: 'oklch(0.78 0.08 160)' }}>
                Menjadi versi dirimu yang lebih kuat, lebih percaya diri, dan lebih siap menghadapi
                masa depan.
              </span>
            </p>
          </div>

          <p>
            Mungkin di akhir tahun kamu akan kuliah. Mungkin kamu sudah memiliki penghasilan.
            Mungkin kamu menemukan minat baru yang sebelumnya tidak pernah terpikirkan. Kita belum
            tahu.
          </p>
          <p>
            Yang kita tahu adalah masa depan akan lebih cerah bagi mereka yang terus belajar, terus
            bertumbuh, dan berani mencoba. Dan tahun ini adalah kesempatanmu untuk memulai.
          </p>

          {/* Quote */}
          <p
            className="pt-2 text-center text-sm italic"
            style={{ color: 'oklch(0.55 0.1 160)' }}
          >
            "Kita tidak sedang mengisi waktu sebelum kuliah. Kita sedang membangun dirimu sebelum
            memasuki babak berikutnya dalam hidup."
          </p>
        </div>

        {/* Divider */}
        <div
          className="my-8 w-16 h-px"
          style={{ background: 'oklch(0.45 0.2 160 / 0.3)' }}
        />

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 rounded-full px-8 py-3.5 text-sm font-medium tracking-wide transition-all duration-300"
          style={{
            background: 'oklch(0.45 0.2 160)',
            color: 'oklch(0.98 0 0)',
            boxShadow: '0 0 24px oklch(0.45 0.2 160 / 0.35)',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.52 0.2 160)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 36px oklch(0.45 0.2 160 / 0.5)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'oklch(0.45 0.2 160)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow =
              '0 0 24px oklch(0.45 0.2 160 / 0.35)';
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
          }}
        >
          Mulai
          <svg
            className="size-4 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
}
