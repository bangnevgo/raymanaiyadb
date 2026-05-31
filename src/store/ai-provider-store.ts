import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AiProvider = 'zai' | 'openrouter' | 'nvidia' | 'opencode' | 'cloudflare';

interface ApiKeys {
  openrouter: string;
  nvidia: string;
  opencode: string;
  cloudflareAccountId: string;
  cloudflareApiToken: string;
}

interface AiProviderState {
  provider: AiProvider;
  apiKeys: ApiKeys;
  opencodeBaseUrl: string;
  setProvider: (p: AiProvider) => void;
  setApiKey: (provider: keyof ApiKeys, key: string) => void;
  setOpencodeBaseUrl: (url: string) => void;
  getActiveApiKey: () => string;
}

export const useAiProviderStore = create<AiProviderState>()(
  persist(
    (set, get) => ({
      provider: 'openrouter',
      apiKeys: {
        openrouter: '',
        nvidia: '',
        opencode: '',
        cloudflareAccountId: '',
        cloudflareApiToken: '',
      },
      opencodeBaseUrl: 'http://localhost:4096/v1',

      setProvider: (p) => set({ provider: p }),
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      setOpencodeBaseUrl: (url) => set({ opencodeBaseUrl: url }),

      getActiveApiKey: () => {
        const { provider, apiKeys } = get();
        if (provider === 'zai') return '';
        return apiKeys[provider as keyof ApiKeys] || '';
      },
    }),
    {
      name: 'ai-provider-config',
    }
  )
);
