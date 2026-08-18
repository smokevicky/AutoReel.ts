import React from 'react';
import {
  Video,
  Audio,
  useVideoConfig,
  useCurrentFrame,
  staticFile,
  spring,
  interpolate,
} from 'remotion';
import { loadFont } from '@remotion/google-fonts/Inter';

const { fontFamily } = loadFont();

export interface DynamicReelProps {
  videoUrl?: string;
  audioUrl?: string;
  topSetupText?: string;
  transitionText?: string;
  pillText?: string;
  hookText?: string;
  durationInFrames?: number;
}

export const DynamicReel: React.FC<DynamicReelProps> = ({
  videoUrl = 'clip2.mp4',
  audioUrl = 'sad.mp3',
  topSetupText = 'Her: "why is he taking so long to reply?"',
  transitionText = 'Meanwhile me:',
  pillText = 'me after accidentally skipping my soulmate on whispr 😭',
  hookText,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Timeline Markers (at 30fps)
  const TRANSITION_FRAME = 60; // 2.0s: Cut from setup to punchline
  const PILL_ENTER_FRAME = 65; // 2.16s: White pill badge pops onto video

  // Top progress bar (0% to 100%)
  const progressWidth = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  // Spring physics for setup text
  const setupSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 130 },
  });

  // Spring physics for transition text
  const transitionSpring = spring({
    frame: frame - TRANSITION_FRAME,
    fps,
    config: { damping: 12, stiffness: 150 },
  });

  // Spring physics for the white pill badge
  const pillSpring = spring({
    frame: frame - PILL_ENTER_FRAME,
    fps,
    config: { damping: 13, stiffness: 140 },
  });

  // Beat drop flash overlay
  const flashOpacity = interpolate(
    frame,
    [TRANSITION_FRAME - 2, TRANSITION_FRAME + 2, TRANSITION_FRAME + 8],
    [0, 0.4, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const resolvedVideoUrl = videoUrl && videoUrl.trim() !== ''
    ? videoUrl.startsWith('http') || videoUrl.startsWith('data:')
      ? videoUrl
      : staticFile(videoUrl)
    : null;

  const currentTopText = frame < TRANSITION_FRAME ? topSetupText : transitionText;
  const currentTextSpring = frame < TRANSITION_FRAME ? setupSpring : transitionSpring;
  const activePillText = pillText || hookText || 'The whispr effect 🐻';
  const resolvedAudio = audioUrl || 'sad.mp3';

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#000000',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
      }}
    >
      {/* Background Viral Audio Track */}
      <Audio src={staticFile(resolvedAudio)} volume={0.85} />

      {/* Top Retention Progress Bar */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: `${progressWidth}%`,
          height: '6px',
          backgroundColor: '#ffffff',
          zIndex: 40,
        }}
      />

      {/* Flash Effect on Transition */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 35,
          }}
        />
      )}

      {/* Top Text Header (Clean Instagram White Typography) */}
      <div
        style={{
          position: 'absolute',
          top: '12%',
          width: '88%',
          textAlign: 'center',
          transform: `scale(${currentTextSpring}) translateY(${(1 - currentTextSpring) * 15}px)`,
          opacity: Math.min(1, currentTextSpring),
          zIndex: 20,
        }}
      >
        <div
          style={{
            color: '#ffffff',
            fontSize: '52px',
            fontWeight: 800,
            lineHeight: 1.3,
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(0, 0, 0, 0.8)',
          }}
        >
          {currentTopText}
        </div>
      </div>

      {/* Center Meme Video Container */}
      <div
        style={{
          position: 'relative',
          width: '90%',
          height: '52%',
          borderRadius: '24px',
          overflow: 'hidden',
          backgroundColor: '#121218',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        {resolvedVideoUrl ? (
          <Video
            src={resolvedVideoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            muted
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1f1b3c 0%, #0d0a1a 100%)',
            }}
          />
        )}

        {/* Signature Whispr White Pill Overlay on Video */}
        {frame >= PILL_ENTER_FRAME && (
          <div
            style={{
              position: 'absolute',
              bottom: '24px',
              maxWidth: '85%',
              backgroundColor: '#ffffff',
              color: '#000000',
              padding: '16px 28px',
              borderRadius: '50px',
              fontSize: '32px',
              fontWeight: 800,
              textAlign: 'center',
              lineHeight: 1.25,
              transform: `scale(${pillSpring}) translateY(${(1 - pillSpring) * 20}px)`,
              opacity: Math.min(1, pillSpring),
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
              zIndex: 15,
            }}
          >
            {activePillText}
          </div>
        )}
      </div>

      {/* Bottom Whispr Branding Pill */}
      <div
        style={{
          position: 'absolute',
          bottom: '70px',
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          padding: '14px 28px',
          borderRadius: '50px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 20,
        }}
      >
        <span style={{ fontSize: '26px' }}>🤫</span>
        <span style={{ color: '#ffffff', fontSize: '24px', fontWeight: 700 }}>
          @whispr.bot on Telegram
        </span>
      </div>
    </div>
  );
};
