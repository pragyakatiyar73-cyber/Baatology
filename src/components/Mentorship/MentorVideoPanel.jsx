import React from 'react';
import FemaleMentor3DAvatar from './FemaleMentor3DAvatar';

/**
 * MentorVideoPanel
 *
 * Standalone 3D Photorealistic Female Mentor Panel:
 * - Powered by Three.js, @react-three/fiber, and @react-three/drei
 * - Ready Player Me female 3D model with 15 Oculus facial visemes & morph targets
 * - Realistic executive office background, walnut wood desk, laptop, and ceramic coffee mug
 */
export default function MentorVideoPanel({
  avatarState = 'listening',
  speakingText = '',
  mentorName = 'Dr. Ann Vance',
  mentorRole = 'Staff Software Engineer & Evaluator',
  isSpeaking = false,
  isListening = true,
  isThinking = false,
}) {
  const speaking = avatarState === 'speaking' || isSpeaking;
  const listening = avatarState === 'listening' || isListening;
  const thinking = avatarState === 'thinking' || isThinking;

  return (
    <div className="relative w-full h-full bg-[#080d18] overflow-hidden flex flex-col justify-between select-none">
      <FemaleMentor3DAvatar
        isSpeaking={speaking}
        isListening={listening}
        isThinking={thinking}
        mentorName={mentorName}
      />
    </div>
  );
}
