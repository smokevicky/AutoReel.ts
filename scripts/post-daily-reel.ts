import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { generateHook, getFallbackStoryScript, GeneratedStoryScript } from './generate-hook';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface VideoTemplate {
  id: string;
  videoUrl: string;
  dropTimeInSeconds: number;
  durationInFrames: number;
}

async function runPipeline() {
  console.log('=== STARTING WHISPR VIRAL REEL AUTOMATION ===\n');

  // 1. Load background templates
  const templatesPath = path.resolve(__dirname, '../templates.json');
  if (!fs.existsSync(templatesPath)) {
    throw new Error('templates.json not found in the project root.');
  }
  const templates: VideoTemplate[] = JSON.parse(fs.readFileSync(templatesPath, 'utf8'));

  if (templates.length === 0) {
    throw new Error('No templates found in templates.json');
  }

  // Randomly select a template
  const template = templates[Math.floor(Math.random() * templates.length)];
  console.log(`[1/6] Selected template: "${template.id}"`);
  console.log(`      Video URL: "${template.videoUrl || '(CSS Animated Vaporwave Aurora Mesh)'}"`);
  console.log(`      Duration: ${template.durationInFrames || 270} frames (9s @ 30fps)\n`);

  // 2. Generate Viral Story Script via Gemini API
  console.log('[2/6] Generating viral story script using Gemini LLM...');
  let script: GeneratedStoryScript;
  try {
    script = await generateHook();
    console.log(`      Generated Hook: "${script.hookText}"`);
    console.log(`      Generated Messages: ${script.chatMessages.length} Telegram chat bubbles`);
    console.log(`      Generated CTA: "${script.ctaText}"`);
    console.log(`      Generated Caption: "${script.caption.substring(0, 70)}..."`);
  } catch (err: any) {
    console.warn(`\n[WARN] LLM Generation failed or api key not set: ${err.message}`);
    console.warn('       Using fallback Gen-Z shitpost story script for testing.\n');
    script = getFallbackStoryScript();
    console.log(`      Fallback Hook: "${script.hookText}"`);
  }
  console.log('');

  // 3. Render Video via Remotion
  console.log('[3/6] Bundling Remotion project...');
  const entryPoint = path.resolve(__dirname, '../src/index.ts');
  const bundleLocation = await bundle(entryPoint);

  const inputProps = {
    videoUrl: template.videoUrl,
    hookText: script.hookText,
    chatMessages: script.chatMessages,
    ctaText: script.ctaText,
    durationInFrames: template.durationInFrames || 270,
  };

  console.log('      Selecting composition "WhisprMemeReel"...');
  const composition = await selectComposition({
    serveUrl: bundleLocation,
    id: 'WhisprMemeReel',
    inputProps,
  });

  const outDir = path.resolve(__dirname, '../out');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outputLocation = path.join(outDir, 'WhisprMemeReel.mp4');

  console.log(`      Rendering media to: ${outputLocation}...`);
  await renderMedia({
    composition,
    serveUrl: bundleLocation,
    codec: 'h264',
    outputLocation,
    inputProps,
  });
  console.log('      Rendering complete!\n');

  // 4. Check Instagram API credentials
  const igUserId = process.env.INSTAGRAM_USER_ID;
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!igUserId || !accessToken) {
    console.log('[WARN] INSTAGRAM_USER_ID or INSTAGRAM_ACCESS_TOKEN is missing in .env.');
    console.log('       Skipping Instagram upload step. Video rendered successfully to /out.');
    console.log('\n=== PIPELINE FINISHED (RENDER ONLY) ===');
    return;
  }

  // 5. Upload rendered video to a temporary public hosting service (tmpfiles.org)
  console.log('[4/6] Uploading video to tmpfiles.org for Instagram download...');
  const fileBuffer = fs.readFileSync(outputLocation);
  const fileBlob = new Blob([fileBuffer], { type: 'video/mp4' });
  const formData = new FormData();
  formData.append('file', fileBlob, 'WhisprMemeReel.mp4');

  const uploadRes = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: formData,
  });

  if (!uploadRes.ok) {
    throw new Error(`tmpfiles.org upload failed with status ${uploadRes.status}: ${await uploadRes.text()}`);
  }

  const uploadData = (await uploadRes.json()) as any;
  const tempUrl = uploadData.data.url;

  // Transform tmpfiles.org/1234/name.mp4 -> tmpfiles.org/dl/1234/name.mp4 to get direct download url
  const publicVideoUrl = tempUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  console.log(`      Public download URL: ${publicVideoUrl}\n`);

  // 6. Post to Instagram Graph API
  console.log('[5/6] Creating Instagram Media Container for Reels...');
  const createContainerUrl = `https://graph.facebook.com/v19.0/${igUserId}/media`;

  const containerRes = await fetch(createContainerUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      media_type: 'REELS',
      video_url: publicVideoUrl,
      caption: script.caption,
      access_token: accessToken,
    }),
  });

  if (!containerRes.ok) {
    const errorText = await containerRes.text();
    throw new Error(`Failed to create Instagram container: ${errorText}`);
  }

  const containerData = (await containerRes.json()) as any;
  const containerId = containerData.id;
  console.log(`      Container created successfully! ID: ${containerId}`);

  // Polling for container readiness status
  console.log('      Polling status until container is FINISHED (this can take up to 60 seconds)...');
  let status = 'IN_PROGRESS';
  let errorMessage = '';

  for (let attempt = 1; attempt <= 30; attempt++) {
    // Wait 10 seconds between checks
    await new Promise((resolve) => setTimeout(resolve, 10000));

    const statusUrl = `https://graph.facebook.com/v19.0/${containerId}?fields=status_code,error_message&access_token=${accessToken}`;
    const statusRes = await fetch(statusUrl);

    if (!statusRes.ok) {
      console.warn(`      [WARN] Polling attempt ${attempt} failed to fetch status. Retrying...`);
      continue;
    }

    const statusData = (await statusRes.json()) as any;
    status = statusData.status_code;
    errorMessage = statusData.error_message || '';

    console.log(`      Attempt ${attempt}: Status = ${status}`);

    if (status === 'FINISHED' || status === 'ERROR') {
      break;
    }
  }

  if (status !== 'FINISHED') {
    throw new Error(`Meta server failed to process the video. Status: ${status}. Error: ${errorMessage}`);
  }
  console.log('      Video processed successfully on Meta servers!\n');

  // 7. Publish Media Container
  console.log('[6/6] Publishing Reel...');
  const publishUrl = `https://graph.facebook.com/v19.0/${igUserId}/media_publish`;

  const publishRes = await fetch(publishUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });

  if (!publishRes.ok) {
    const errorText = await publishRes.text();
    throw new Error(`Failed to publish Reels container: ${errorText}`);
  }

  const publishData = (await publishRes.json()) as any;
  console.log(`\n=== SUCCESS: Reel published! IG Media ID: ${publishData.id} ===`);
}

runPipeline().catch((error) => {
  console.error('\n=== PIPELINE FAILED ===');
  console.error(error.message || error);
  process.exit(1);
});
