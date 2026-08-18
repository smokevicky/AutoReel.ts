# Meme & Viral Video Resources Cheatsheet

If you want to create viral marketing reels for `@whispr.bot` (anonymous Gen-Z blind chat), you need clean, high-retention backgrounds, transitional hooks, and trending green-screen reactions. Here is a curated guide of where to get them and how to hook them up.

---

## 1. Background Video Footages (High Retention)

Gen-Z retention is heavily driven by secondary "sensory/satisfying" background videos.

### A. Minecraft Parkour & CS:GO Surf (No Copyright)
*   **YouTube Search Queries:**
    *   `Minecraft Parkour Gameplay No Copyright Vertical`
    *   `CS:GO Surf Gameplay No Copyright 9:16`
    *   `Subway Surfers Loop Background No Copyright`
*   **Top Channels Providing Direct Downloads (see description box links):**
    *   **NoCopyrightGameplay:** Regularly uploads vertical loops of GTA 5 ramps, Minecraft parkour, and ASMR.
    *   **BB-Gaming:** Focuses on clean CS:GO surf and drift runs.
*   **Ko-fi / Google Drive Packs:** Most of these YouTubers place direct high-quality Drive links in their descriptions (using tools like Linkvertise or direct Ko-fi downloads).

### B. Aesthetic Lo-Fi Driving & Night City Loops
*   **Pexels / Pixabay:**
    *   Search terms: `lofi driving`, `night drive vertical`, `tokyo street vertical`, `anime room loop`.
    *   *Pro-Tip:* To download these programmatically via `curl`, you must mimic browser headers:
        ```bash
        curl -H "User-Agent: Mozilla/5.0" -L -o public/background.mp4 "PEXELS_VIDEO_URL"
        ```

---

## 2. Meme Reactions & Green Screen Overlays

These are critical transitional components (e.g., a vine-boom reaction or a clipping meme that pops up).

*   **YouTube Green Screens:**
    *   Search queries: `green screen memes vertical`, `meme reaction overlays green screen`.
    *   Popular templates: *Pedro Raccoon, Vine Boom, Shocked Black Guy, Drake No/Yes, Pedro Pascal Laughing/Crying*.
*   **CapCut Template Store:** 
    *   Search for "Meme" or "Blind chat" in CapCut. You can export these templates and extract the assets to put into your Remotion rendering code.
*   **GIPHY / Tenor (MP4/GIF):**
    *   Use direct GIF or MP4 endpoints from GIPHY to overlay transparent reaction stickers.

---

## 3. Sound Effects (SFX) & Transitional Audio

A vertical video is only as viral as its sound. Adding auditory hooks on transitions (e.g., exactly at the `dropTimeInSeconds`) makes a huge difference.

*   **myinstants.com (Meme soundboard):**
    *   The largest library of short meme sound effects (Vine Boom, Bruh, Anime Wow, Metal Pipe Drop, Riser Sweeps).
    *   You can download the raw `.mp3` directly by clicking into any sound button and downloading the source link.
*   **freesound.org:**
    *   Best for cinematic sweeps, camera shutters, swooshes, and transitional rises.
*   **Remotion Integration:**
    *   Place a `<Audio src={staticFile("transition-sfx.mp3")} />` inside your `MemeReel.tsx` and start it exactly at `dropTimeInSeconds * fps`!

---

## 4. How to Apply Transitions in Remotion

To add a zoom-in, shake, or flash transition at the beat drop:

```tsx
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

// Inside your MemeReel component:
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const dropFrame = dropTimeInSeconds * fps;

// Create a spring animation starting at the dropFrame
const springValue = spring({
  frame: frame - dropFrame,
  fps,
  config: { damping: 12 },
});

// Interpolate scale from 1.0 to 1.15 for a "zoom punch" on transition
const scale = interpolate(springValue, [0, 1], [1.0, 1.15], {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
});
```
