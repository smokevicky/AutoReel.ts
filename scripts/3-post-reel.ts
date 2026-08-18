/**
 * Module 4: The Master Controller & Publisher (scripts/3-post-reel.ts)
 * 
 * Autonomous Marketing Orchestrator:
 * 1. Trend Capture (Reddit Cultural Pulse)
 * 2. LLM Brain & Vault Mapping (Gemini + vault.json 2-part format)
 * 3. Video Synthesis (Dynamic 2-part contrast format with white pill badge & synced audio)
 * 4. Automated Multi-Platform Distribution (Instagram Reels Graph API)
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { fetchDailyTrends } from './1-fetch-trends';
import { generateHookAndMapVault, getFallbackMemePayload, loadMemeVault, GeneratedMemePayload } from './2-generate-hook';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface PublishOptions {
  videoPath: string;
  caption: string;
  s3PublicUrl?: string;
}

/**
 * Instagram Graph API Publisher (Reels 2-Step Container Flow)
 */
async function publishToInstagramReels(options: PublishOptions): Promise<string | null> {
  const igUserId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    console.log('\n[Publisher] INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN missing in .env.');
    console.log('            Skipping live Instagram upload. Video rendered locally to /out.');
    return null;
  }

  let publicVideoUrl = options.s3PublicUrl;

  if (!publicVideoUrl) {
    console.log('[Publisher] No direct S3 URL provided. Staging to tmpfiles.org for Instagram download...');
    const fileBuffer = fs.readFileSync(options.videoPath);
    const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });
    const formData = new FormData();
    formData.append('file', fileBlob, 'AutoReel.mp4');

    const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Public staging upload failed: ${await uploadRes.text()}`);
    }

    const uploadData = (await uploadRes.json()) as any;
    const tempUrl = uploadData.data.url;
    publicVideoUrl = tempUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  }

  console.log(`[Publisher] Public Video URL: ${publicVideoUrl}`);

  // Step 1: Create Media Container
  console.log('[Publisher] Step 1/2: Initializing Instagram Media Container...');
  const createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;
  const containerRes = await fetch(createContainerUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: publicVideoUrl,
      caption: options.caption,
      access_token: accessToken,
    }),
  });

  if (!containerRes.ok) {
    throw new Error(`Failed to create Instagram container: ${await containerRes.text()}`);
  }

  const containerData = (await containerRes.json()) as any;
  const containerId = containerData.id;
  console.log(`[Publisher] Container created with ID: ${containerId}`);

  // Step 2: Poll status until FINISHED
  console.log('[Publisher] Step 2/2: Polling Meta processing status...');
  let status = 'IN_PROGRESS';
  let errorMsg = '';

  for (let attempt = 1; attempt <= 30; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 10000));
    const statusUrl = `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,error_message&access_token=${accessToken}`;
    const statusRes = await fetch(statusUrl);

    if (!statusRes.ok) {
      console.warn(`[Publisher] Attempt ${attempt} failed to poll. Retrying...`);
      continue;
    }

    const statusData = (await statusRes.json()) as any;
    status = statusData.status_code;
    errorMsg = statusData.error_message || '';
    console.log(`[Publisher] Status: ${status} (Attempt ${attempt})`);

    if (status === 'FINISHED' || status === 'ERROR') {
      break;
    }
  }

  if (status !== 'FINISHED') {
    throw new Error(`Instagram server processing failed: ${status}. Error: ${errorMsg}`);
  }

  // Step 3: Publish Media Container
  console.log('[Publisher] Publishing container to Instagram Reels feed...');
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;
  const publishRes = await fetch(publishUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    throw new Error(`Failed to publish Reels container: ${await publishRes.text()}`);
  }

  const publishData = (await publishRes.json()) as any;
  console.log(`\n🎉 SUCCESS: Published to Instagram Reels! Media ID: ${publishData.id}`);
  return publishData.id;
}

/**
 * Main Autonomous Pipeline Function
 */
export async function runAutoReelPipeline() {
  console.log('====================================================');
  console.log('🚀 AUTOREEL.TS: AUTONOMOUS CULTURE-JACKING PIPELINE');
  console.log('====================================================\n');

  // 1. Fetch Daily Cultural Trends
  const pulse = await fetchDailyTrends();
  console.log(`\n[Summary] Captured ${pulse.trends.length} trending items from Reddit.\n`);

  // 2. Generate Hook & Select Vault Video via LLM Brain
  let payload: GeneratedMemePayload;
  try {
    payload = await generateHookAndMapVault(pulse.combinedPulseText);
  } catch (err: any) {
    console.warn(`[WARN] LLM Brain mapping failed (${err.message}). Using high-retention fallback payload.`);
    payload = getFallbackMemePayload();
  }

  console.log('\n[Summary] LLM Strategy & Payload:');
  console.log(`  - Detected Vibe : ${payload.detectedVibe || 'relatable 3am college life'}`);
  console.log(`  - Vault Clip ID : ${payload.videoId}`);
  console.log(`  - Top Setup     : "${payload.topSetupText}"`);
  console.log(`  - Transition    : "${payload.transitionText}"`);
  console.log(`  - Pill Text     : "${payload.pillText}"`);
  console.log(`  - Caption       : "${payload.caption.substring(0, 60)}..."\n`);

  // 3. Match with Vault metadata
  const vault = loadMemeVault();
  const selectedClip = vault.find((c) => c.id === payload.videoId) || vault[0];

  // Select appropriate audio track based on meme vibe
  let selectedAudio = 'sad.mp3';
  if (selectedClip.id === 'the-whispr-effect') {
    selectedAudio = 'happy.mp3';
  } else if (selectedClip.id === 'patia-demands-vs-whispr') {
    selectedAudio = 'music.mp3';
  }

  // 4. Programmatic Video Synthesis (Remotion V4)
  console.log('[Module 3] Bundling Remotion project for server-side render...');
  const entryPoint = path.resolve(__dirname, '../src/index.ts');
  const bundleLocation = await bundle(entryPoint);

  const inputProps = {
    videoUrl: selectedClip.videoUrl || 'clip2.mp4',
    audioUrl: selectedAudio,
    topSetupText: payload.topSetupText,
    transitionText: payload.transitionText,
    pillText: payload.pillText,
    durationInFrames: selectedClip.durationInFrames || 210, // 7.0s @ 30fps
  };

  console.log('[Module 3] Selecting composition "AutoReelComposition"...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'AutoReelComposition',
    inputProps,
  });

  const outDir = path.resolve(__dirname, '../out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outputLocation = path.join(outDir, 'AutoReel.mp4');

  console.log(`[Module 3] Rendering video to: ${outputLocation}...`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps,
  });
  console.log('[Module 3] Video rendering complete!\n');

  // 5. Automated Publication (Instagram Graph API)
  console.log('[Module 4] Triggering Publisher module...');
  await publishToInstagramReels({
    videoPath: outputLocation,
    caption: payload.caption,
  });

  console.log('\n====================================================');
  console.log('✅ AUTOREEL.TS CYCLE COMPLETE');
  console.log('====================================================');
}

// Execute standalone
if (require.main === module) {
  runAutoReelPipeline().catch((err) => {
    console.error('\n❌ PIPELINE FAILED:', err.message || err);
    process.exit(1);
  });
}
