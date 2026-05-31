'use client';

import { useState } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { WelcomeScreen } from '@/components/welcome-screen';

export default function Home() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <WelcomeScreen onStart={() => setStarted(true)} />;
  }

  return <AppShell />;
}
