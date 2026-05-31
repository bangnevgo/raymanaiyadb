'use client';

import { useState } from 'react';
import { useAiProviderStore, type AiProvider } from '@/store/ai-provider-store';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Key,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Globe,
  Server,
  Zap,
  Cloud,
  Hash,
} from 'lucide-react';

interface ProviderConfig {
  id: AiProvider;
  name: string;
  description: string;
  icon: React.ElementType;
  baseUrl: string;
  keyPrefix: string;
  defaultModel: string;
  getKeyUrl: string;
  needsApiKey: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: 'zai',
    name: 'Z.AI',
    description: 'Default provider — no API key required',
    icon: Zap,
    baseUrl: 'via z-ai-web-dev-sdk',
    keyPrefix: '',
    defaultModel: 'Auto',
    getKeyUrl: '',
    needsApiKey: false,
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    description: 'Default: openrouter/owl-alpha — API key disimpan di server (.env)',
    icon: Globe,
    baseUrl: 'https://openrouter.ai/api/v1',
    keyPrefix: 'sk-or-...',
    defaultModel: 'openrouter/owl-alpha',
    getKeyUrl: 'https://openrouter.ai/keys',
    needsApiKey: true,
  },
  {
    id: 'nvidia',
    name: 'Nvidia NIM',
    description: 'Powered by Nvidia GPU infrastructure',
    icon: Server,
    baseUrl: 'https://integrate.api.nvidia.com/v1',
    keyPrefix: 'nvapi-...',
    defaultModel: 'meta/llama-3.1-405b-instruct',
    getKeyUrl: 'https://build.nvidia.com',
    needsApiKey: true,
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    description: 'Local self-hosted AI coding assistant',
    icon: Settings,
    baseUrl: 'http://localhost:4096/v1',
    keyPrefix: '',
    defaultModel: 'Auto',
    getKeyUrl: '',
    needsApiKey: true,
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare AI',
    description: 'Serverless AI inference at the edge (Account ID + API Token)',
    icon: Cloud,
    baseUrl: 'https://api.cloudflare.com/client/v4/accounts/{accountId}/ai/run',
    keyPrefix: '',
    defaultModel: '@cf/moonshotai/kimi-k2.6',
    getKeyUrl: 'https://dash.cloudflare.com/profile/api-tokens',
    needsApiKey: true,
  },
];

export function SettingsModule() {
  const {
    provider,
    apiKeys,
    opencodeBaseUrl,
    setProvider,
    setApiKey,
    setOpencodeBaseUrl,
  } = useAiProviderStore();

  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [editingOpencodeUrl, setEditingOpencodeUrl] = useState(opencodeBaseUrl);

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpencodeUrlSave = () => {
    setOpencodeBaseUrl(editingOpencodeUrl);
  };

  const activeProvider = PROVIDERS.find((p) => p.id === provider)!;

  return (
    <div className="space-y-6">
      {/* Active Provider Banner */}
      <Alert className="border-primary/20 bg-primary/5">
        <activeProvider.icon className="size-4 text-primary" />
        <AlertDescription className="flex items-center gap-2">
          <span className="text-sm">
            Active provider: <strong>{activeProvider.name}</strong>
            {activeProvider.needsApiKey && (
              <span className="ml-2 text-muted-foreground">
                {provider === 'openrouter'
                  ? '— API key di .env (server-side) ✓'
                  : provider === 'cloudflare'
                    ? (apiKeys.cloudflareAccountId && apiKeys.cloudflareApiToken ? '— configured ✓' : '— ⚠️ credentials not set')
                    : apiKeys[provider as 'nvidia' | 'opencode']
                      ? '— API key configured ✓'
                      : '— ⚠️ API key not set'}
              </span>
            )}
          </span>
        </AlertDescription>
      </Alert>

      {/* Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="size-5" />
            AI Provider
          </CardTitle>
          <CardDescription>
            Pilih provider AI untuk AI Coach. Setiap provider mungkin memerlukan API key.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {PROVIDERS.map((p) => {
              const isActive = provider === p.id;
              let hasKey: boolean;
              if (!p.needsApiKey) {
                hasKey = true;
              } else if (p.id === 'openrouter') {
                hasKey = true; // server-side env
              } else if (p.id === 'cloudflare') {
                hasKey = !!apiKeys.cloudflareAccountId || !!apiKeys.cloudflareApiToken;
              } else {
                hasKey = !!apiKeys[p.id as 'nvidia' | 'opencode'];
              }
              const isReady = !p.needsApiKey || hasKey;

              return (
                <button
                  key={p.id}
                  onClick={() => setProvider(p.id)}
                  disabled={!isReady}
                  className={`relative flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all ${
                    isActive
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : isReady
                        ? 'border-border hover:border-primary/30 hover:bg-muted/50'
                        : 'border-border opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <div className={`flex size-8 items-center justify-center rounded-lg ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}>
                      <p.icon className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{p.name}</span>
                        {isActive && (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4">
                            Active
                          </Badge>
                        )}
                        {!p.needsApiKey && (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                            No Key Needed
                          </Badge>
                        )}
                        {p.needsApiKey && hasKey && (
                          <CheckCircle2 className="size-3.5 text-emerald-500" />
                        )}
                        {p.needsApiKey && !hasKey && (
                          <AlertCircle className="size-3.5 text-amber-500" />
                        )}
                      </div>
                      {isActive && p.defaultModel !== 'Auto' && (
                        <span className="text-[10px] text-muted-foreground">
                          Model: {p.defaultModel}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{p.description}</p>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* API Key Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Key className="size-5" />
            API Keys
          </CardTitle>
          <CardDescription>
            Masukkan API key untuk provider yang ingin digunakan. Key tersimpan lokal di browser.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Z.A.I - No key needed */}
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
            <div className="flex items-center gap-3">
              <Zap className="size-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Z.AI — No API Key Required</p>
                <p className="text-xs text-muted-foreground">
                  Provider ini langsung siap digunakan tanpa API key.
                </p>
              </div>
              <Badge variant="outline" className="ml-auto text-emerald-600 border-emerald-200 bg-emerald-50">
                Ready
              </Badge>
            </div>
          </div>

          <Separator />

          {/* OpenRouter */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Globe className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">OpenRouter</p>
                <p className="text-xs text-muted-foreground">
                  Default model: <code className="text-primary">openrouter/owl-alpha</code> — API key disimpan di server (.env)
                </p>
              </div>
              <a
                href="https://openrouter.ai/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Key <ExternalLink className="size-3" />
              </a>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                Server-side ✓
              </Badge>
            </div>
            <div className="pl-7">
              <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800 p-3">
                <div className="flex gap-2">
                  <CheckCircle2 className="size-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400">API Key: OPENROUTER_API_KEY</p>
                    <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                      Key disimpan di file <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code> sebagai <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">OPENROUTER_API_KEY</code>. Tidak perlu masukkan di browser — aman di server-side.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Nvidia */}
          <ProviderKeyInput
            config={PROVIDERS[2]}
            value={apiKeys.nvidia}
            onChange={(v) => setApiKey('nvidia', v)}
            showKey={showKeys['nvidia']}
            onToggleShow={() => toggleShowKey('nvidia')}
          />

          <Separator />

          {/* OpenCode */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Settings className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">OpenCode</p>
                <p className="text-xs text-muted-foreground">
                  Lokal server — sesuaikan URL dan API key jika diperlukan
                </p>
              </div>
              <Badge
                variant={apiKeys.opencode ? 'outline' : 'secondary'}
                className={apiKeys.opencode ? 'text-emerald-600 border-emerald-200' : ''}
              >
                {apiKeys.opencode ? 'Configured' : 'Not Configured'}
              </Badge>
            </div>

            {/* OpenCode Base URL */}
            <div className="pl-7 space-y-1.5">
              <Label className="text-xs text-muted-foreground">Base URL</Label>
              <div className="flex gap-2">
                <Input
                  value={editingOpencodeUrl}
                  onChange={(e) => setEditingOpencodeUrl(e.target.value)}
                  placeholder="http://localhost:4096/v1"
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleOpencodeUrlSave}
                  disabled={editingOpencodeUrl === opencodeBaseUrl}
                >
                  Save
                </Button>
              </div>
              {opencodeBaseUrl !== PROVIDERS[3].baseUrl && (
                <p className="text-[10px] text-muted-foreground">
                  Default: {PROVIDERS[3].baseUrl}
                </p>
              )}
            </div>

            {/* OpenCode API Key */}
            <div className="pl-7 space-y-1.5">
              <Label className="text-xs text-muted-foreground">API Key</Label>
              <div className="relative">
                <Input
                  type={showKeys['opencode'] ? 'text' : 'password'}
                  value={apiKeys.opencode}
                  onChange={(e) => setApiKey('opencode', e.target.value)}
                  placeholder="Optional — masukkan jika server memerlukan auth"
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('opencode')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys['opencode'] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Cloudflare AI */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Cloud className="size-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">Cloudflare AI</p>
                <p className="text-xs text-muted-foreground">
                  Serverless inference at the edge — pakai Account ID + API Token
                </p>
              </div>
              <a
                href="https://dash.cloudflare.com/profile/api-tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Get Token <ExternalLink className="size-3" />
              </a>
              <Badge
                variant={apiKeys.cloudflareAccountId && apiKeys.cloudflareApiToken ? 'outline' : 'secondary'}
                className={apiKeys.cloudflareAccountId && apiKeys.cloudflareApiToken ? 'text-emerald-600 border-emerald-200' : ''}
              >
                {apiKeys.cloudflareAccountId && apiKeys.cloudflareApiToken ? 'Configured' : 'Not Set'}
              </Badge>
            </div>

            {/* Cloudflare note about .env */}
            <div className="pl-7">
              <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3">
                <div className="flex gap-2">
                  <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">Credentials disimpan di server (.env)</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      Untuk keamanan, Account ID dan API Token disimpan di environment variable server, bukan di browser.
                      Masukkan credentials di halaman ini, lalu klik "Save to .env" untuk menulis ke file .env.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Cloudflare Account ID */}
            <div className="pl-7 space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="size-3" /> Account ID
              </Label>
              <Input
                value={apiKeys.cloudflareAccountId}
                onChange={(e) => setApiKey('cloudflareAccountId', e.target.value)}
                placeholder="Masukkan Cloudflare Account ID (32 karakter hex)"
                className="text-sm"
              />
            </div>

            {/* Cloudflare API Token */}
            <div className="pl-7 space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Key className="size-3" /> API Token
              </Label>
              <div className="relative">
                <Input
                  type={showKeys['cloudflare'] ? 'text' : 'password'}
                  value={apiKeys.cloudflareApiToken}
                  onChange={(e) => setApiKey('cloudflareApiToken', e.target.value)}
                  placeholder="Masukkan Cloudflare API Token"
                  className="pr-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => toggleShowKey('cloudflare')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKeys['cloudflare'] ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {/* Save to .env button */}
            <div className="pl-7">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={async () => {
                  const res = await fetch('/api/save-env', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      CLOUDFLARE_ACCOUNT_ID: apiKeys.cloudflareAccountId,
                      CLOUDFLARE_API_TOKEN: apiKeys.cloudflareApiToken,
                    }),
                  });
                  if (res.ok) {
                    alert('✅ Credentials tersimpan ke .env! Restart dev server untuk apply.');
                  } else {
                    alert('❌ Gagal menyimpan ke .env');
                  }
                }}
                disabled={!apiKeys.cloudflareAccountId || !apiKeys.cloudflareApiToken}
              >
                <Cloud className="size-4 mr-2" />
                Save Credentials to .env
              </Button>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Tombol ini menulis CLOUDFLARE_ACCOUNT_ID dan CLOUDFLARE_API_TOKEN ke file .env
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Info Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Provider Endpoints</CardTitle>
          <CardDescription>Detail koneksi untuk setiap provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-2 font-medium">Provider</th>
                  <th className="text-left px-4 py-2 font-medium">Endpoint</th>
                  <th className="text-left px-4 py-2 font-medium hidden sm:table-cell">Model</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {PROVIDERS.map((p) => {
                  const isActive = provider === p.id;
                  let hasKey: boolean;
                  if (!p.needsApiKey) {
                    hasKey = true;
                  } else if (p.id === 'openrouter') {
                    hasKey = true; // server-side env
                  } else if (p.id === 'cloudflare') {
                    hasKey = !!apiKeys.cloudflareAccountId || !!apiKeys.cloudflareApiToken;
                  } else {
                    hasKey = !!apiKeys[p.id as 'nvidia' | 'opencode'];
                  }
                  return (
                    <tr key={p.id} className={`border-b last:border-0 ${isActive ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <p.icon className="size-3.5 text-muted-foreground" />
                          <span className="font-medium">{p.name}</span>
                          {isActive && <Badge className="text-[9px] px-1 py-0 h-3">Active</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground font-mono">
                        {p.id === 'opencode' ? opencodeBaseUrl : p.id === 'cloudflare' ? `https://api.cloudflare.com/.../ai/run` : p.baseUrl}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-muted-foreground hidden sm:table-cell">
                        {p.defaultModel}
                      </td>
                      <td className="px-4 py-2.5">
                        {hasKey ? (
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 text-[10px]">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px]">
                            No Key
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ProviderKeyInput({
  config,
  value,
  onChange,
  showKey,
  onToggleShow,
}: {
  config: ProviderConfig;
  value: string;
  onChange: (v: string) => void;
  showKey: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <config.icon className="size-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{config.name}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </div>
        {config.getKeyUrl && (
          <a
            href={config.getKeyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            Get Key <ExternalLink className="size-3" />
          </a>
        )}
        <Badge
          variant={value ? 'outline' : 'secondary'}
          className={value ? 'text-emerald-600 border-emerald-200' : ''}
        >
          {value ? 'Configured' : 'Not Set'}
        </Badge>
      </div>
      <div className="pl-7 space-y-1.5">
        <Label className="text-xs text-muted-foreground">API Key</Label>
        <div className="relative">
          <Input
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={config.keyPrefix ? `Masukkan key (format: ${config.keyPrefix})` : 'Masukkan API key'}
            className="pr-10 text-sm"
          />
          <button
            type="button"
            onClick={onToggleShow}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
