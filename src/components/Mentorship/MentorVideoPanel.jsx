import React from 'react';
import DigitalRobotAvatar from './DigitalRobotAvatar';

/**
 * MentorVideoPanel
 *
 * Fullscreen Interactive Digital AI Robot Companion:
 * - 100% Pure Black Backdrop (#000000)
 * - Direct face-to-face empathetic presence
 * - Expresses real-time emotions (listening, speaking, thinking, empathetic)
 * - Zero judgement & warm student comfort
 */
export default function MentorVideoPanel({
  avatarState = 'listening', // 'speaking' | 'listening' | 'thinking' | 'empathetic'
  speakingText = '',
  mentorName = 'Aura',
  mentorRole = 'AI Companion & Guide',
  isSpeaking = false,
  isListening = true,
  isThinking = false,
  emotionalTone = 'warm_encouraging',
}) {
  return (
    <div className="relative w-full h-full bg-[#000000] overflow-hidden flex flex-col justify-between select-none">
      <DigitalRobotAvatar
        avatarState={avatarState}
        speakingText={speakingText}
        mentorName={mentorName}
        isSpeaking={isSpeaking}
        isListening={isListening}
        isThinking={isThinking}
        emotionalTone={emotionalTone}
      />
    </div>
  );
}
