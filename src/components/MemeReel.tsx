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

export interface ChatMessageItem {
  sender: 'stranger' | 'me';
  text: string;
}

export interface MemeReelProps {
  videoUrl?: string;
  hookText: string;
  chatMessages?: ChatMessageItem[];
  ctaText?: string;
  dropTimeInSeconds?: number;
  durationInFrames?: number;
}

export const MemeReel: React.FC<MemeReelProps> = ({
  videoUrl,
  hookText,
  chatMessages = [
    { sender: 'stranger', text: 'bro did you just hear that dog barking outside your window' },
    { sender: 'me', text: 'yeah omg it is so annoying are you in campus 6 too?' },
    { sender: 'stranger', text: 'lmao yeah and your fan is rattling SO LOUDLY it is driving me nuts 😭' },
    { sender: 'me', text: 'WAIT NO WAY I can literally hear your keyboard clacking rn 💀' },
  ],
  ctaText = 'Find your anonymous match on @whispr.bot 🤫',
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  // Timeline Markers (in frames @ 30fps)
  const BEAT_DROP_FRAME = 80; // 2.66s: transition triggers
  const CHAT_START_FRAME = 85; // 2.83s: Telegram UI opens
  const CTA_START_FRAME = 205; // 6.83s: CTA badge pops in

  // 1. Camera Push Animation
  const cameraScale = interpolate(frame, [0, 270], [1.0, 1.06], {
    extrapolateRight: 'clamp',
  });

  // 2. Phase 1: Hook Card Spring & Transition Animation
  const hookSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Exit animation for hook card at beat drop
  const hookExitProgress = interpolate(frame, [BEAT_DROP_FRAME - 6, BEAT_DROP_FRAME + 4], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hookY = interpolate(hookExitProgress, [0, 1], [0, -380]);
  const hookScale = interpolate(hookExitProgress, [0, 1], [1, 0.65]) * hookSpring;
  const hookOpacity = interpolate(hookExitProgress, [0, 0.9], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // 3. Phase 2: Beat Drop Flash & Screen Punch
  const flashOpacity = interpolate(
    frame,
    [BEAT_DROP_FRAME - 2, BEAT_DROP_FRAME + 2, BEAT_DROP_FRAME + 12],
    [0, 0.45, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const punchScale = interpolate(
    frame,
    [BEAT_DROP_FRAME, BEAT_DROP_FRAME + 3, BEAT_DROP_FRAME + 10],
    [1.0, 1.04, 1.0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 4. Phase 3: Telegram Chat Container Animation
  const chatContainerSpring = spring({
    frame: frame - CHAT_START_FRAME,
    fps,
    config: { damping: 15, stiffness: 130 },
  });

  // 5. Phase 4: CTA Badge Spring Animation
  const ctaSpring = spring({
    frame: frame - CTA_START_FRAME,
    fps,
    config: { damping: 12, stiffness: 140 },
  });

  // Handle external video vs animated gradient background
  const hasVideo = videoUrl && videoUrl.trim() !== '' && videoUrl !== 'background.mp4';
  const resolvedVideoUrl = hasVideo
    ? videoUrl.startsWith('http') || videoUrl.startsWith('data:')
      ? videoUrl
      : staticFile(videoUrl)
    : null;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        backgroundColor: '#07050d',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily,
        transform: `scale(${cameraScale * punchScale})`,
      }}
    >
      {/* Background Audio Track */}
      <Audio src={staticFile('music.mp3')} volume={0.85} />

      {/* Background Layer: Video or Ambient Dark Vaporwave Aurora */}
      {resolvedVideoUrl ? (
        <Video
          src={resolvedVideoUrl}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          muted
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(180deg, #090714 0%, #120d26 50%, #06040d 100%)',
          }}
        >
          {/* Animated Glow Blobs */}
          <div
            style={{
              position: 'absolute',
              width: '900px',
              height: '900px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(139, 92, 246, 0) 70%)',
              top: '-15%',
              left: '-20%',
              transform: `translate(${Math.sin(frame / 30) * 40}px, ${Math.cos(frame / 30) * 30}px)`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '850px',
              height: '850px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.3) 0%, rgba(236, 72, 153, 0) 70%)',
              bottom: '-15%',
              right: '-20%',
              transform: `translate(${Math.cos(frame / 35) * 50}px, ${Math.sin(frame / 35) * 40}px)`,
            }}
          />

          {/* Clean Tech Grid Lines */}
          <div
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
              `,
              backgroundSize: '90px 90px',
            }}
          />
        </div>
      )}

      {/* PHASE 1: Viral Hook Card (Centered initially, then flies away on beat drop) */}
      {frame < BEAT_DROP_FRAME + 8 && (
        <div
          style={{
            position: 'absolute',
            top: '46%',
            left: '50%',
            transform: `translate(-50%, calc(-50% + ${hookY}px)) scale(${hookScale})`,
            opacity: hookOpacity,
            backgroundColor: 'rgba(0, 0, 0, 0.88)',
            padding: '24px 36px',
            borderRadius: '24px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '56px',
            textAlign: 'center',
            maxWidth: '85%',
            lineHeight: 1.25,
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 0 40px rgba(139, 92, 246, 0.25)',
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: '24px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              color: '#a78bfa',
              marginBottom: '12px',
              fontWeight: 700,
            }}
          >
            🔥 3 AM WHISPR CONFESSION
          </div>
          {hookText}
        </div>
      )}

      {/* PHASE 2: Screen Flash Overlay on Beat Drop */}
      {flashOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundColor: '#ffffff',
            opacity: flashOpacity,
            pointerEvents: 'none',
            zIndex: 30,
          }}
        />
      )}

      {/* PHASE 3: Authentic Telegram Blind Chat UI (Enters at frame 85) */}
      {frame >= CHAT_START_FRAME && (
        <div
          style={{
            position: 'absolute',
            width: '92%',
            maxWidth: '960px',
            maxHeight: '1380px',
            backgroundColor: '#17212b',
            borderRadius: '32px',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.75), 0 0 50px rgba(139, 92, 246, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transform: `scale(${chatContainerSpring})`,
            opacity: Math.min(1, chatContainerSpring),
            zIndex: 10,
          }}
        >
          {/* Telegram Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '24px 28px',
              backgroundColor: '#1f2c38',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {/* Whispr Avatar */}
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '34px',
                color: '#ffffff',
                fontWeight: 900,
                marginRight: '20px',
                boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
              }}
            >
              🤫
            </div>
            {/* Chat Title Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '32px', fontWeight: 800, color: '#ffffff' }}>
                  @whispr.bot
                </span>
                <span
                  style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    fontSize: '18px',
                    fontWeight: 700,
                    padding: '2px 10px',
                    borderRadius: '8px',
                  }}
                >
                  BOT
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: '#10b981',
                    boxShadow: '0 0 10px #10b981',
                  }}
                />
                <span style={{ fontSize: '22px', color: '#9bb2c9', fontWeight: 500 }}>
                  Anonymous Blind Match • 412 online
                </span>
              </div>
            </div>
          </div>

          {/* Telegram Chat Message History */}
          <div
            style={{
              padding: '32px 28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              minHeight: '720px',
              justifyContent: 'flex-start',
            }}
          >
            {chatMessages.map((msg, index) => {
              // Stagger each chat bubble by 36 frames (~1.2s per message)
              const msgStartFrame = CHAT_START_FRAME + 10 + index * 36;
              const msgSpring = spring({
                frame: frame - msgStartFrame,
                fps,
                config: { damping: 13, stiffness: 140 },
              });

              if (frame < msgStartFrame) return null;

              const isMe = msg.sender === 'me';

              return (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    transform: `scale(${msgSpring}) translateY(${(1 - msgSpring) * 30}px)`,
                    opacity: Math.min(1, msgSpring),
                  }}
                >
                  <div
                    style={{
                      maxWidth: '82%',
                      padding: '20px 24px',
                      borderRadius: isMe ? '24px 24px 6px 24px' : '24px 24px 24px 6px',
                      backgroundColor: isMe ? '#2b5278' : '#212d3b',
                      color: '#ffffff',
                      fontSize: '32px',
                      fontWeight: 600,
                      lineHeight: 1.35,
                      boxShadow: '0 6px 20px rgba(0, 0, 0, 0.25)',
                      border: isMe
                        ? '1px solid rgba(100, 181, 246, 0.2)'
                        : '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {!isMe && (
                      <div
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: '#e076ff',
                          marginBottom: '6px',
                        }}
                      >
                        Anonymous Student
                      </div>
                    )}
                    <div>{msg.text}</div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                        gap: '6px',
                        marginTop: '8px',
                        fontSize: '18px',
                        color: isMe ? '#90caf9' : '#6c7883',
                      }}
                    >
                      <span>03:1{4 + index} AM</span>
                      {isMe && <span>✓✓</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 4: Bottom Call-to-Action Pill Badge (Enters at frame 205) */}
      {frame >= CTA_START_FRAME && (
        <div
          style={{
            position: 'absolute',
            bottom: '70px',
            transform: `scale(${ctaSpring}) translateY(${(1 - ctaSpring) * 40}px)`,
            opacity: Math.min(1, ctaSpring),
            backgroundColor: 'rgba(15, 10, 30, 0.92)',
            padding: '20px 36px',
            borderRadius: '100px',
            border: '2px solid #8b5cf6',
            boxShadow: '0 0 35px rgba(139, 92, 246, 0.6), 0 10px 40px rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            zIndex: 25,
          }}
        >
          <span style={{ fontSize: '36px' }}>🚀</span>
          <span
            style={{
              fontSize: '30px',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '0.5px',
            }}
          >
            {ctaText}
          </span>
        </div>
      )}
    </div>
  );
};
