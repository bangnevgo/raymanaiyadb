'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store/app-store';
import { useAiProviderStore } from '@/store/ai-provider-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  Send,
  User,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Target,
  Briefcase,
  Brain,
  HeartPulse,
  Database,
  CheckCircle2,
  X,
  Trash2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  {
    label: 'Analyze My Progress',
    icon: TrendingUp,
    message: 'Analyze my overall progress across ALL areas — goals, learning, certifications, projects, job applications, networking, income, and wellbeing. Give me a comprehensive progress report with specific numbers and tell me what patterns you see across different modules.',
  },
  {
    label: 'Weekly Strategy',
    icon: ClipboardList,
    message: 'Look at my daily plans, weekly reviews, journal entries, and current goals. What should be my top priorities this week? Consider my deadlines, stalled learning items, job pipeline, and mood/energy patterns.',
  },
  {
    label: 'Career Analysis',
    icon: Briefcase,
    message: 'Analyze my entire career pipeline: job applications, certifications, portfolio projects, skills, networking connections, and income. Am I ready for remote work? What gaps do I need to fill? Give me specific steps to get closer to landing a remote job.',
  },
  {
    label: 'Wellbeing Check',
    icon: HeartPulse,
    message: 'Analyze my journal mood entries, energy levels, daily task completion rates, learning streaks, and weekly review challenges. How is my mental health and consistency? Am I at risk of burnout? Give me honest feedback.',
  },
  {
    label: 'Income Strategy',
    icon: Target,
    message: 'Look at my income entries, freelance projects, job applications pipeline, and skills. Help me build a strategy to increase my income. What should I focus on — more freelancing? More job applications? What skills should I monetize?',
  },
  {
    label: 'Deep Insights',
    icon: Brain,
    message: 'Do a deep cross-module analysis. Look for patterns I might not see: correlation between my mood and productivity, whether my learning translates to portfolio projects, whether my networking leads to job opportunities, and any other hidden patterns in my data.',
  },
];

const DATA_AWARENESS = [
  { label: 'Goals', icon: Target },
  { label: 'Learning', icon: Brain },
  { label: 'Certifications', icon: CheckCircle2 },
  { label: 'Portfolio', icon: Sparkles },
  { label: 'Job Apps', icon: Briefcase },
  { label: 'Network', icon: User },
  { label: 'Income', icon: TrendingUp },
  { label: 'Journal', icon: HeartPulse },
  { label: 'Reviews', icon: ClipboardList },
  { label: 'Daily Plans', icon: Target },
];

const PROVIDER_LABELS: Record<string, string> = {
  zai: 'Z.AI',
  openrouter: 'OpenRouter',
  nvidia: 'Nvidia',
  opencode: 'OpenCode',
  cloudflare: 'Cloudflare AI',
};

export function AiCoachModule() {
  const { toast } = useToast();
  const { currency, exchangeRate } = useAppStore();
  const { provider, apiKeys, opencodeBaseUrl } = useAiProviderStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hai! Saya AI Coach kamu di Nevgo Mission Control. 🚀\n\nSaya punya akses ke **SEMUA data** di dashboard kamu:\n\n• 🎯 **6 North Star Goals** — target tahunan dan progress\n• 📚 **Learning Tracker** — jam belajar, streak, progress per skill\n• 🏅 **Certifications** — status sertifikasi profesional\n• 💻 **Portfolio Projects** — pipeline dari Idea sampai Published\n• 💼 **Job Applications** — CRM pipeline 7 tahap\n• 🤝 **Networking** — 100+ koneksi profesional\n• 💰 **Income** — semua sumber pendapatan\n• 📝 **Weekly Reviews** — wins, learnings, challenges\n• 📓 **Journal** — mood, energy, reflections\n• 📅 **Daily Plans** — priorities, tasks, time blocks\n\nSaya menganalisis **pola lintas modul** — misalnya bagaimana mood mempengaruhi produktivitas, atau apakah learning kamu diterjemahkan ke portfolio.\n\nMau mulai dari mana? Pilih quick action di bawah, atau tanyakan apa saja!`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    setTimeout(() => {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages, loading]);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim() || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: messageText.trim(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Send conversation history (last 10 messages) for context continuity
      const history = updatedMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // API keys for OpenRouter & Cloudflare are server-side (.env) — not sent from client
      const needsClientKey = provider === 'nvidia' || provider === 'opencode';
      const apiKey = needsClientKey ? apiKeys[provider as 'nvidia' | 'opencode'] : undefined;

      const res = await fetch('/api/ai-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText.trim(),
          conversationHistory: history,
          currency,
          exchangeRate,
          provider,
          apiKey,
          opencodeBaseUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.advice || 'Maaf, saya tidak bisa menghasilkan respons saat ini. Silakan coba lagi.',
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        const errorData = await res.json().catch(() => null);
        const aiMessage: ChatMessage = {
          id: `ai-error-${Date.now()}`,
          role: 'assistant',
          content: `Maaf, terjadi error${errorData?.error ? `: ${errorData.error}` : ''}. Silakan coba lagi.`,
        };
        setMessages((prev) => [...prev, aiMessage]);
        toast({ title: 'AI Coach Error', description: 'Gagal menghasilkan respons', variant: 'destructive' });
      }
    } catch {
      const aiMessage: ChatMessage = {
        id: `ai-error-${Date.now()}`,
        role: 'assistant',
        content: 'Maaf, tidak bisa terhubung ke server. Silakan cek koneksi dan coba lagi.',
      };
      setMessages((prev) => [...prev, aiMessage]);
      toast({ title: 'Koneksi Error', description: 'Tidak dapat terhubung ke AI Coach', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [loading, messages, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const dismissMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hai! Saya AI Coach kamu di Nevgo Mission Control. 🚀\n\nSaya punya akses ke **SEMUA data** di dashboard kamu:\n\n• 🎯 **6 North Star Goals** — target tahunan dan progress\n• 📚 **Learning Tracker** — jam belajar, streak, progress per skill\n• 🏅 **Certifications** — status sertifikasi profesional\n• 💻 **Portfolio Projects** — pipeline dari Idea sampai Published\n• 💼 **Job Applications** — CRM pipeline 7 tahap\n• 🤝 **Networking** — 100+ koneksi profesional\n• 💰 **Income** — semua sumber pendapatan\n• 📝 **Weekly Reviews** — wins, learnings, challenges\n• 📓 **Journal** — mood, energy, reflections\n• 📅 **Daily Plans** — priorities, tasks, time blocks\n\nSaya menganalisis **pola lintas modul** — misalnya bagaimana mood mempengaruhi produktivitas, atau apakah learning kamu diterjemahkan ke portfolio.\n\nMau mulai dari mana? Pilih quick action di bawah, atau tanyakan apa saja!`,
      },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Data Awareness Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Database className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Full Dashboard Access</p>
              <p className="text-xs text-muted-foreground mb-2">
                AI Coach menganalisis data real-time dari seluruh dashboard kamu, mencari pola lintas modul, dan memberikan rekomendasi yang dipersonalisasi.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {DATA_AWARENESS.map((item) => (
                  <Badge key={item.label} variant="secondary" className="text-[10px] gap-1 px-2 py-0.5">
                    <item.icon className="size-3" />
                    {item.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Quick Analysis
          </CardTitle>
          <CardDescription>Klik untuk analisis instan berdasarkan data kamu.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map((action) => (
              <Button
                key={action.label}
                variant="outline"
                className="h-auto py-2.5 px-3 flex flex-col items-center gap-1.5 text-center hover:border-primary/50 hover:bg-primary/5 transition-all group"
                onClick={() => sendMessage(action.message)}
                disabled={loading}
              >
                <action.icon className="size-4 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium leading-tight">{action.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bot className="size-4" />
                AI Coach
                <Badge variant="outline" className="text-[10px] text-muted-foreground border-muted-foreground/30">
                  Via: {PROVIDER_LABELS[provider] || provider}
                </Badge>
                {provider !== 'zai' && provider !== 'cloudflare' && provider !== 'openrouter' && !apiKeys[provider as 'nvidia' | 'opencode'] && (
                  <Badge variant="destructive" className="text-[10px]">
                    No API Key
                  </Badge>
                )}
                {loading && (
                  <Badge variant="secondary" className="text-[10px] animate-pulse">
                    Analyzing...
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Tanyakan apa saja tentang data, progress, goals, atau minta strategi.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 text-[10px] text-muted-foreground hover:text-destructive"
                  onClick={clearChat}
                  title="Hapus semua chat"
                >
                  <Trash2 className="size-3" />
                  Hapus Chat
                </Button>
              )}
              <Badge variant="outline" className="text-[10px] shrink-0">
                {messages.length - 1} messages
              </Badge>
            </div>
          </div>
        </CardHeader>
        <Separator className="mx-6" />
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          {/* Messages */}
          <ScrollArea className="h-[560px] px-6 py-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-primary/10 text-primary'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </div>
                  {/* Bubble */}
                  <div className="relative max-w-[85%]">
                    {/* Close button for assistant messages (not welcome) */}
                    {msg.role === 'assistant' && msg.id !== 'welcome' && (
                      <button
                        onClick={() => dismissMessage(msg.id)}
                        className="absolute -top-1.5 -right-1.5 z-10 flex size-5 items-center justify-center rounded-full bg-border text-muted-foreground shadow-sm hover:bg-destructive hover:text-destructive-foreground transition-colors"
                        title="Tutup pesan"
                      >
                        <X className="size-3" />
                      </button>
                    )}
                    <div
                      className={`rounded-2xl px-4 py-3 ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted/80 border border-border/50 rounded-bl-md'
                      }`}
                    >
                      <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none [&_strong]:font-semibold [&_strong]:text-primary [&_li]:marker:text-primary/50">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {loading && (
                <div className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Bot className="size-4" />
                  </div>
                  <div className="bg-muted/80 border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <span className="size-2 rounded-full bg-primary/40 animate-bounce [animation-delay:0ms]" />
                        <span className="size-2 rounded-full bg-primary/40 animate-bounce [animation-delay:150ms]" />
                        <span className="size-2 rounded-full bg-primary/40 animate-bounce [animation-delay:300ms]" />
                      </div>
                      <span className="text-xs text-muted-foreground">Menganalisis data dashboard...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={scrollEndRef} />
            </div>
          </ScrollArea>

          <Separator />
          {/* Input */}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya tentang data kamu, minta analisis, atau strategi..."
              className="flex-1"
              disabled={loading}
            />
            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
              <Send className="size-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
