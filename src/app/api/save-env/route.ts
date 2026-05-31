import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = body as {
      CLOUDFLARE_ACCOUNT_ID?: string;
      CLOUDFLARE_API_TOKEN?: string;
    };

    const envPath = join(process.cwd(), '.env');

    // Read existing .env
    let envContent = '';
    if (existsSync(envPath)) {
      envContent = readFileSync(envPath, 'utf-8');
    }

    // Update or append each key
    const updateEnv = (key: string, value: string) => {
      const regex = new RegExp(`^${key}=.*$`, 'm');
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `${key}=${value}`);
      } else {
        envContent += `\n${key}=${value}`;
      }
    };

    if (CLOUDFLARE_ACCOUNT_ID) {
      updateEnv('CLOUDFLARE_ACCOUNT_ID', CLOUDFLARE_ACCOUNT_ID);
    }
    if (CLOUDFLARE_API_TOKEN) {
      updateEnv('CLOUDFLARE_API_TOKEN', CLOUDFLARE_API_TOKEN);
    }

    // Clean up leading newlines
    envContent = envContent.trimStart() + '\n';

    writeFileSync(envPath, envContent, 'utf-8');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving .env:', error);
    return NextResponse.json(
      { error: 'Failed to save .env' },
      { status: 500 }
    );
  }
}
