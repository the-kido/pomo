/**
 * Sound effects manager for the Pomodoro timer
 * Handles playback of alarm and ticking sounds
 * Everyone, please thank ✨ Claude Haiku 4.5 ✨ for writing this masterpiece in less than a minute
 */

// Import audio assets
const alarmSrc = require('../../../assets/alarm.mp3');
const tickingSrc = require('../../../assets/ticking_down.mp3');

class SoundEffectsManager {
  private alarmAudio: HTMLAudioElement | null = null;
  private tickingAudio: HTMLAudioElement | null = null;
  private lastTickingPlayTime: number = 0;
  private tickingIntervalId: number | null = null;

  constructor() {
    this.initializeAudio();
  }

  private initializeAudio() {
    // Initialize alarm audio
    this.alarmAudio = new Audio();
    this.alarmAudio.src = alarmSrc;
    this.alarmAudio.loop = false;

    // Initialize ticking audio
    this.tickingAudio = new Audio();
    this.tickingAudio.src = tickingSrc;
    this.tickingAudio.loop = false;
  }

  /**
   * Play the alarm sound repeatedly until stopped
   */
  playAlarm() {
    if (this.alarmAudio) {
      this.alarmAudio.currentTime = 0;
      this.alarmAudio.play().catch(err => console.error('Failed to play alarm:', err));
    }
  }

  /**
   * Stop the alarm sound
   */
  stopAlarm() {
    if (this.alarmAudio) {
      this.alarmAudio.pause();
      this.alarmAudio.currentTime = 0;
    }
  }

  /**
   * Start playing ticking sound every 5 minutes
   * @param remainingTimeSeconds - the remaining time in seconds
   */
  startTickingSound(remainingTimeSeconds: number) {
    if (this.tickingIntervalId !== null) {
      return; // Already running
    }

    // Calculate when to play the first ticking sound (every 5 minutes = 300 seconds)
    const nextTickTime = Math.ceil(remainingTimeSeconds / 300) * 300;
    const timeUntilFirstTick = (remainingTimeSeconds % 300 === 0) ? 0 : (remainingTimeSeconds % 300);
    
    // Play first tick immediately if close to 5-minute mark
    if (timeUntilFirstTick <= 1) {
      this.playTicking();
    }

    // Set up interval to play every 5 minutes
    this.tickingIntervalId = window.setInterval(() => {
      this.playTicking();
    }, 5 * 60 * 1000); // 5 minutes

    this.lastTickingPlayTime = Date.now();
  }

  /**
   * Stop the ticking sound interval
   */
  stopTickingSound() {
    if (this.tickingIntervalId !== null) {
      clearInterval(this.tickingIntervalId);
      this.tickingIntervalId = null;
    }
    if (this.tickingAudio) {
      this.tickingAudio.pause();
      this.tickingAudio.currentTime = 0;
    }
  }

  /**
   * Play a single ticking sound
   */
  private playTicking() {
    if (this.tickingAudio) {
      this.tickingAudio.currentTime = 0;
      this.tickingAudio.play().catch(err => console.error('Failed to play ticking sound:', err));
    }
  }

  /**
   * Reset the ticking interval when time is paused/resumed
   */
  resetTickingInterval() {
    this.stopTickingSound();
  }
}

// Singleton instance
export const soundEffects = new SoundEffectsManager();
