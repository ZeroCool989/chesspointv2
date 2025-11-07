import React, { useState, useRef, useEffect, useCallback } from 'react';
import { getMusicTracks } from '@/lib/music';

/**
 * Playlist tracks - loaded from Google Drive
 * Simple direct download links, no authentication needed
 */

type RepeatMode = 'off' | 'one' | 'all';

/**
 * MusicPlayer Component - Chesspoint Edition
 * Features: playlist sequencing, repeat modes (off/one/all), audio-reactive visualization, resume playback
 */
const MusicPlayer: React.FC = () => {
  // State
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [volume, setVolume] = useState(0.5);
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [actualPlayingState, setActualPlayingState] = useState(false);
  const [hiddenTracks, setHiddenTracks] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Array<{ label: string; src: string }>>([]);
  const [tracksLoading, setTracksLoading] = useState(true);

  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTrackIndexRef = useRef(currentTrackIndex);
  const frequencyDataRef = useRef<Uint8Array | null>(null);
  const smoothedBarsRef = useRef<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load tracks and saved state from localStorage after mount
  useEffect(() => {
    setIsMounted(true);

    // Load tracks synchronously (no async needed with Google Drive)
    try {
      setTracksLoading(true);
      const loadedTracks = getMusicTracks();
      setTracks(loadedTracks);
      
      // Load saved state after tracks are loaded
      if (typeof window !== 'undefined') {
        const savedIndex = localStorage.getItem('chesspoint:music-selected-index');
        if (savedIndex) {
          const index = parseInt(savedIndex, 10);
          if (index >= 0 && index < loadedTracks.length) {
            setCurrentTrackIndex(index);
            lastTrackIndexRef.current = index;
          }
        }

        const savedUi = localStorage.getItem('chesspoint:music-ui');
        if (savedUi) {
          setIsOpen(JSON.parse(savedUi));
        }

        const savedRepeat = localStorage.getItem('chesspoint:repeatMode');
        if (savedRepeat && ['off', 'one', 'all'].includes(savedRepeat)) {
          setRepeatMode(savedRepeat as RepeatMode);
        }

        const savedHidden = localStorage.getItem('chesspoint:hiddenTracks');
        if (savedHidden) {
          setHiddenTracks(JSON.parse(savedHidden));
        }
      }
    } catch (error) {
      console.error('Error loading music tracks:', error);
    } finally {
      setTracksLoading(false);
    }
  }, []);

  /**
   * Get filtered tracks (excluding hidden ones)
   */
  const getVisibleTracks = useCallback(() => {
    return tracks.filter(track => !hiddenTracks.includes(track.src));
  }, [tracks, hiddenTracks]);

  /**
   * Save current playback position to localStorage
   */
  const savePlaybackPosition = useCallback(() => {
    if (audioRef.current && typeof window !== 'undefined') {
      localStorage.setItem('chesspoint:music-current-time', audioRef.current.currentTime.toString());
      localStorage.setItem('chesspoint:music-selected-index', currentTrackIndex.toString());
    }
  }, [currentTrackIndex]);

  /**
   * Setup Web Audio API for visualizer
   */
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.75;

      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }, []);

  /**
   * Audio-reactive equalizer bars animation
   * Renders 7 vertical bars inside the circle that respond to frequency data with gradient colors
   */
  const animateVisualizer = useCallback(() => {
    if (!analyserRef.current || !isPlaying || !canvasRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = frequencyDataRef.current!;
    const smoothedBars = smoothedBarsRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      if (!isPlaying) return;

      analyser.getByteFrequencyData(dataArray as any);

      // Sample 7 bars from different frequency ranges for better visualization
      for (let i = 0; i < 7; i++) {
        const dataIndex = Math.floor((i / 7) * dataArray.length * 0.6);
        const rawValue = dataArray[dataIndex] / 255;
        smoothedBars[i] += (rawValue - smoothedBars[i]) * 0.3; // Faster response
      }

      // Clear canvas
      ctx.clearRect(0, 0, 48, 48);

      // Draw circle clipping mask
      ctx.save();
      ctx.beginPath();
      ctx.arc(24, 24, 24, 0, Math.PI * 2);
      ctx.clip();

      // Draw 7 bars centered with gradient colors
      const barWidth = 3;
      const barGap = 1.5;
      const totalWidth = 7 * barWidth + 6 * barGap;
      const startX = (48 - totalWidth) / 2;

      for (let i = 0; i < 7; i++) {
        const barHeight = smoothedBars[i] * 32 + 3;
        const x = startX + i * (barWidth + barGap);
        const y = 24 + 16 - barHeight;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
        
        // Color based on bar position and height
        const intensity = smoothedBars[i];
        if (intensity > 0.7) {
          gradient.addColorStop(0, '#FF6B9D'); // Hot pink top
          gradient.addColorStop(0.5, '#B48EFA'); // Purple middle
          gradient.addColorStop(1, '#7C4DFF'); // Deep purple bottom
        } else if (intensity > 0.4) {
          gradient.addColorStop(0, '#B48EFA'); // Purple top
          gradient.addColorStop(0.5, '#7C4DFF'); // Deep purple middle
          gradient.addColorStop(1, '#4A2C8A'); // Dark purple bottom
        } else {
          gradient.addColorStop(0, '#7C4DFF'); // Deep purple top
          gradient.addColorStop(1, '#4A2C8A'); // Dark purple bottom
        }

        ctx.fillStyle = gradient;
        
        // Add subtle glow effect
        ctx.shadowColor = '#B48EFA';
        ctx.shadowBlur = 4;
        
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 1.5);
        ctx.fill();
        
        // Reset shadow
        ctx.shadowBlur = 0;
      }

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  }, [isPlaying]);

  /**
   * Handle Play button click
   */
  const handlePlay = useCallback(() => {
    if (!audioRef.current) return;

    // Setup audio context on first play
    if (!audioContextRef.current) {
      setupAudioContext();
    }

    // Resume audio context if suspended
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // If track changed, start from 00:00
    if (lastTrackIndexRef.current !== currentTrackIndex) {
      audioRef.current.currentTime = 0;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chesspoint:music-current-time');
      }
      lastTrackIndexRef.current = currentTrackIndex;
    } else {
      // Resume from saved position
      if (typeof window !== 'undefined') {
        const savedTime = localStorage.getItem('chesspoint:music-current-time');
        if (savedTime) {
          audioRef.current.currentTime = parseFloat(savedTime);
        }
      }
    }

    // Check if URL is valid (not a placeholder)
    const audioSrc = tracks[currentTrackIndex]?.src;
    if (!audioSrc || audioSrc.includes('YOUR_FILE_ID')) {
      console.warn('🎵 Invalid audio URL (placeholder):', audioSrc);
      return; // Don't try to play invalid URLs
    }

    console.log('🎵 Attempting to play:', audioSrc);
    console.log('🎵 Audio element src:', audioRef.current.src);

    audioRef.current.play().then(() => {
      console.log('🎵 Audio started successfully');
      setIsPlaying(true);
      setActualPlayingState(true); // Explicitly update actual playing state
      // Dispatch event to trigger Elo breakdance animation
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('elo-music-playing', { detail: { playing: true } }));
      }
    }).catch((error) => {
      console.error('🎵 Audio play failed:', error);
      console.error('🎵 Audio element:', audioRef.current);
      // Don't crash on audio errors
    });
  }, [currentTrackIndex, tracks, setupAudioContext]);

  /**
   * Handle Stop button click
   */
  const handleStop = useCallback(() => {
    if (!audioRef.current) return;

    audioRef.current.pause();
    savePlaybackPosition();
    setIsPlaying(false);
    setActualPlayingState(false); // Explicitly update actual playing state
    
    // Dispatch event to stop Elo breakdance animation
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('elo-music-playing', { detail: { playing: false } }));
    }

    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [savePlaybackPosition]);

  /**
   * Handle track selection from playlist
   */
  const handleTrackSelect = useCallback((index: number) => {
    if (index === currentTrackIndex) return;

    setCurrentTrackIndex(index);
    lastTrackIndexRef.current = index;

    if (typeof window !== 'undefined') {
      localStorage.setItem('chesspoint:music-selected-index', index.toString());
      localStorage.removeItem('chesspoint:music-current-time');
    }

    if (audioRef.current && tracks[index]) {
      audioRef.current.src = tracks[index].src;
      audioRef.current.currentTime = 0;
      if (isPlaying) {
        audioRef.current.play().then(() => {
          setActualPlayingState(true); // Update state when track changes while playing
        });
      }
    }
  }, [currentTrackIndex, isPlaying]);

  /**
   * Handle track end event
   * Behavior depends on repeat mode:
   * - off: stop playback
   * - one: loop current track (handled by audio.loop)
   * - all: advance to next track and wrap
   */
  const handleTrackEnded = useCallback(() => {
    // Repeat One mode is handled by audio.loop attribute
    if (repeatMode === 'one') {
      return;
    }

    // Repeat All: advance to next visible track and wrap
    if (repeatMode === 'all') {
      const visibleTracks = getVisibleTracks();
      const currentVisibleIndex = visibleTracks.findIndex(t => t.src === tracks[currentTrackIndex]?.src);
      const nextVisibleIndex = (currentVisibleIndex + 1) % visibleTracks.length;
      const nextTrack = visibleTracks[nextVisibleIndex];
      const nextIndex = tracks.findIndex(t => t.src === nextTrack.src);

      setCurrentTrackIndex(nextIndex);
      lastTrackIndexRef.current = nextIndex;

      if (typeof window !== 'undefined') {
        localStorage.setItem('chesspoint:music-selected-index', nextIndex.toString());
        localStorage.removeItem('chesspoint:music-current-time');
      }

    if (audioRef.current && tracks[nextIndex]) {
        audioRef.current.src = tracks[nextIndex].src;
      audioRef.current.currentTime = 0;
        audioRef.current.play().then(() => {
          setActualPlayingState(true); // Update state when auto-advancing
        });
      }
      return;
    }

    // Off mode: stop playback
      setIsPlaying(false);
      setActualPlayingState(false); // Explicitly update actual playing state
      // Dispatch event to stop Elo breakdance animation when track ends
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('elo-music-playing', { detail: { playing: false } }));
      }
  }, [repeatMode, currentTrackIndex, getVisibleTracks]);

  /**
   * Handle volume slider changes
   */
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  /**
   * Cycle repeat mode: off → one → all → off
   */
  const cycleRepeatMode = () => {
    const modes: RepeatMode[] = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(repeatMode);
    const nextMode = modes[(currentIndex + 1) % modes.length];
    setRepeatMode(nextMode);

    if (typeof window !== 'undefined') {
      localStorage.setItem('chesspoint:repeatMode', nextMode);
    }

    // Announce to screen readers
    const modeNames = { off: 'Repeat off', one: 'Repeat one enabled', all: 'Repeat all enabled' };
    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', 'polite');
    announcement.className = 'sr-only';
    announcement.textContent = modeNames[nextMode];
    document.body.appendChild(announcement);
    setTimeout(() => document.body.removeChild(announcement), 1000);
  };


  /**
   * Toggle open/closed state
   */
  const toggleOpen = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('chesspoint:music-ui', JSON.stringify(newState));
    }
    // Music continues playing regardless of open/closed state
  };

  /**
   * Initialize audio and set up event listeners
   */
  useEffect(() => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    if (!audio || !tracks[currentTrackIndex]) return;
    
    audio.volume = volume;

    // Set audio source directly (already a full URL from backend)
    const audioSrc = tracks[currentTrackIndex].src;
    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
      // Load the new source
      audio.load();
    }

    let lastSaveTime = 0;
    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSaveTime > 1000) {
        savePlaybackPosition();
        lastSaveTime = now;
      }
      // Sync actual playing state
      setActualPlayingState(!audio.paused);
    };

    const handlePlay = () => {
      setActualPlayingState(true);
    };

    const handlePause = () => {
      setActualPlayingState(false);
    };

    const handleError = () => {
      console.warn('Audio playback error:', tracks[currentTrackIndex]?.src);
      setActualPlayingState(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleTrackEnded);
    audio.addEventListener('error', handleError);

    // Initial sync
    setActualPlayingState(!audio.paused);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleTrackEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [volume, currentTrackIndex, tracks, savePlaybackPosition, handleTrackEnded]);

  /**
   * Update audio.loop based on repeat mode
   */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeatMode === 'one';
    }
  }, [repeatMode]);

  /**
   * Start/stop visualizer animation
   */
  useEffect(() => {
    if (isPlaying) {
      // Small delay to ensure canvas is mounted when player is reopened
      const timeoutId = setTimeout(() => {
        animateVisualizer();
      }, 50);
      return () => clearTimeout(timeoutId);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Reset smoothed bars
      smoothedBarsRef.current = [0, 0, 0, 0, 0, 0, 0];
    }
  }, [isPlaying, animateVisualizer]);

  /**
   * Restart animation when player is reopened (canvas gets remounted)
   */
  useEffect(() => {
    if (isOpen && isPlaying && canvasRef.current) {
      // Restart animation when player is reopened and music is playing
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      // Small delay to ensure canvas is fully mounted
      const timeoutId = setTimeout(() => {
        animateVisualizer();
      }, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen, isPlaying, animateVisualizer]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  if (!isMounted || tracksLoading) {
    return null; // Don't render until tracks are loaded
  }

  if (tracks.length === 0) {
    return null; // Don't render if no tracks available
  }

  const visibleTracks = getVisibleTracks();
  const repeatModeLabels = { off: 'Repeat mode: Off', one: 'Repeat mode: One', all: 'Repeat mode: All' };

  return (
    <>
      <div className={`cp-player ${isOpen ? 'cp-player--open' : ''}`}>
        <audio ref={audioRef} preload="auto" crossOrigin="anonymous" />

        {/* Minimized button - shows equalizer when playing, music note when stopped */}
        {!isOpen && (
          <button
            key={isPlaying ? 'playing' : 'stopped'}
            className={`cp-mini ${isPlaying ? 'cp-mini--equalizer' : 'cp-mini--note'}`}
            onClick={toggleOpen}
            aria-label={isPlaying ? 'Playing…' : 'Open Music Player'}
            title={isPlaying ? 'Playing…' : 'Music Player'}
          >
            {isPlaying && (
              <svg className="cp-mini__equalizer" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect className="cp-mini__bar cp-mini__bar--1" x="6" y="8" width="3" height="8" rx="1.5" fill="currentColor" />
                <rect className="cp-mini__bar cp-mini__bar--2" x="10.5" y="5" width="3" height="14" rx="1.5" fill="currentColor" />
                <rect className="cp-mini__bar cp-mini__bar--3" x="15" y="10" width="3" height="4" rx="1.5" fill="currentColor" />
              </svg>
            )}
            {!isPlaying && (
              <svg className="cp-mini__note" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        )}

        {/* Expanded card */}
        {isOpen && (
          <div className="cp-card">
            {/* Header with minimize button */}
            <div className="cp-card__header">
              <div className="cp-status" role="status">
                {isPlaying ? (
                  <>
                    <span className="cp-status__dot cp-status__dot--playing"></span>
                    Playing
                  </>
                ) : (
                  <>
                    <span className="cp-status__dot"></span>
                    Stopped
                  </>
                )}
              </div>
              <button className="cp-btn cp-btn--minimize" onClick={toggleOpen} aria-label="Minimize player" title="Minimize">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Playlist dropdown */}
            <div className="cp-playlist">
              <label htmlFor="cp-playlist-select" className="cp-playlist__label">Track</label>
              <select
                id="cp-playlist-select"
                className="cp-playlist__select"
                value={currentTrackIndex}
                onChange={(e) => handleTrackSelect(parseInt(e.target.value, 10))}
                aria-label="Select track"
              >
                {visibleTracks.map((track) => {
                  const index = tracks.findIndex(t => t.src === track.src);
                  return (
                    <option key={index} value={index}>
                      {track.label}
                    </option>
                  );
                })}
              </select>
        </div>

            {/* Circle with centralized equalizer */}
            <div className="cp-disc-container">
              <div className={`cp-disc ${isPlaying ? 'cp-disc--playing' : ''}`}>
                {/* Canvas equalizer when playing */}
                {isPlaying && <canvas ref={canvasRef} className="cp-disc__canvas" width="48" height="48" />}

                {/* Music note icon when stopped */}
                {!isPlaying && (
                  <svg className="cp-disc__icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}

                {/* Repeat mode badge overlay */}
                {repeatMode !== 'off' && (
                  <div className="cp-disc__badge">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                      <path d="M11 4H3.5A1.5 1.5 0 002 5.5v2M5 12h7.5a1.5 1.5 0 001.5-1.5v-2M2 7.5L.5 6 2 4.5M14 8.5l1.5 1.5L14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    {repeatMode === 'one' && <span className="cp-disc__badge-num">1</span>}
                  </div>
                )}
              </div>
        </div>

            {/* Controls */}
            <div className="cp-controls">
              <button className="cp-btn cp-btn--play" onClick={handlePlay} disabled={isPlaying} aria-label="Play">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 2l9 5-9 5V2z" fill="currentColor"/>
                </svg>
                Play
              </button>
              <button className="cp-btn cp-btn--stop" onClick={handleStop} disabled={!isPlaying} aria-label="Stop">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <rect width="12" height="12" rx="2" fill="currentColor"/>
                </svg>
                Stop
          </button>
          <button
                className={`cp-btn cp-btn--repeat cp-btn--repeat-${repeatMode}`}
                onClick={cycleRepeatMode}
                aria-label="Cycle repeat mode"
                title={repeatModeLabels[repeatMode]}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11 4H3.5A1.5 1.5 0 002 5.5v2M5 12h7.5a1.5 1.5 0 001.5-1.5v-2M2 7.5L.5 6 2 4.5M14 8.5l1.5 1.5L14 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {repeatMode === 'one' && <span className="cp-btn__badge">1</span>}
          </button>
        </div>

            {/* Volume */}
            <div className="cp-volume">
              <svg className="cp-volume__icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.5L5 6H2v4h3l3 2.5V3.5zM11.5 5.5a3 3 0 010 5M13 3.5a5.5 5.5 0 010 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
          <input
            type="range"
                className="cp-slider"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
                aria-label="Volume"
                style={{ '--slider-value': volume } as React.CSSProperties}
          />
              <span className="cp-volume__text">{Math.round(volume * 100)}%</span>
        </div>
          </div>
        )}
      </div>

      <style>{`
        :root {
          --cp-bg: #0F0F14;
          --cp-surface: #181A21;
          --cp-border: rgba(180, 142, 250, 0.25);
          --cp-accent: #B48EFA;
          --cp-accent-deep: #7C4DFF;
          --cp-text: #E6E6F0;
          --cp-muted: #A3A7B7;
          --cp-danger: #D25562;
        }

        /* Light mode variables - matching settings button */
        .light-mode {
          --cp-bg: #FFFFFF;
          --cp-surface: #181A21;
          --cp-border: rgba(180, 142, 250, 0.25);
          --cp-accent: #B48EFA;
          --cp-accent-deep: #7C4DFF;
          --cp-text: #E6E6F0;
          --cp-muted: #A3A7B7;
          --cp-danger: #D25562;
        }

        /* Dark mode variables (explicit) */
        .dark-mode {
          --cp-bg: #0F0F14;
          --cp-surface: #181A21;
          --cp-border: rgba(180, 142, 250, 0.25);
          --cp-accent: #B48EFA;
          --cp-accent-deep: #7C4DFF;
          --cp-text: #E6E6F0;
          --cp-muted: #A3A7B7;
          --cp-danger: #D25562;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0,0,0,0);
          white-space: nowrap;
          border: 0;
        }

        .cp-player {
          position: fixed;
          bottom: 16px;
          right: 80px;
          z-index: 9999;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        /* Minimized button */
        .cp-mini {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--cp-surface) 0%, rgba(180, 142, 250, 0.1) 100%);
          border: 1px solid var(--cp-border);
          color: var(--cp-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(180, 142, 250, 0.1);
          position: relative;
          overflow: hidden;
        }

        .cp-mini::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(180, 142, 250, 0.1) 0%, rgba(255, 107, 157, 0.05) 100%);
          border-radius: 50%;
          opacity: 0;
          transition: opacity 300ms ease;
        }

        .cp-mini:hover {
          border-color: var(--cp-accent);
          box-shadow: 0 0 0 2px var(--cp-accent), 0 0 30px rgba(180, 142, 250, 0.4), 0 8px 35px rgba(0, 0, 0, 0.5);
          transform: scale(1.08) translateY(-2px);
        }

        .cp-mini:hover::before {
          opacity: 1;
        }

        .cp-mini:focus {
          outline: none;
          border-color: var(--cp-accent);
          box-shadow: 0 0 0 3px rgba(180, 142, 250, 0.3), 0 0 30px rgba(180, 142, 250, 0.4);
        }

        .cp-mini:active {
          transform: scale(1.02) translateY(-1px);
        }

        .cp-mini__note, .cp-mini__equalizer {
          width: 24px;
          height: 24px;
        }
        
        /* Force hide music note when equalizer should show */
        .cp-mini--equalizer .cp-mini__note {
          display: none !important;
        }
        
        /* Force hide equalizer when note should show */
        .cp-mini--note .cp-mini__equalizer {
          display: none !important;
        }

        .cp-mini__bar {
          transform-origin: center bottom;
          filter: drop-shadow(0 0 3px var(--cp-accent));
        }

        .cp-mini__bar--1 { 
          animation: cp-eq-bounce-1 600ms ease-in-out infinite;
          fill: #FF6B9D;
        }
        .cp-mini__bar--2 { 
          animation: cp-eq-bounce-2 700ms ease-in-out infinite 100ms;
          fill: #B48EFA;
        }
        .cp-mini__bar--3 { 
          animation: cp-eq-bounce-3 800ms ease-in-out infinite 200ms;
          fill: #7C4DFF;
        }

        @keyframes cp-eq-bounce-1 {
          0%, 100% { transform: scaleY(0.3); opacity: 0.8; }
          50% { transform: scaleY(1.2); opacity: 1; }
        }

        @keyframes cp-eq-bounce-2 {
          0%, 100% { transform: scaleY(0.4); opacity: 0.7; }
          50% { transform: scaleY(1); opacity: 1; }
        }

        @keyframes cp-eq-bounce-3 {
          0%, 100% { transform: scaleY(0.5); opacity: 0.6; }
          50% { transform: scaleY(0.8); opacity: 1; }
        }

        /* Card */
        .cp-card {
          width: 280px;
          background: var(--cp-surface);
          border: 1px solid var(--cp-border);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
          animation: cp-card-open 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes cp-card-open {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .cp-card__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .cp-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: var(--cp-text);
        }

        .cp-status__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--cp-muted);
        }

        .cp-status__dot--playing {
          background: var(--cp-accent);
          animation: cp-dot-pulse 2s ease-in-out infinite;
        }

        @keyframes cp-dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        /* Playlist */
        .cp-playlist {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--cp-border);
        }

        .cp-playlist__label {
          font-size: 12px;
          font-weight: 600;
          color: var(--cp-muted);
          min-width: 45px;
        }

        .cp-playlist__select {
          flex: 1;
          background: rgba(163, 167, 183, 0.1);
          border: 1px solid var(--cp-border);
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 13px;
          color: var(--cp-text);
          cursor: pointer;
          outline: none;
        }

        .cp-playlist__select:hover {
          border-color: var(--cp-accent);
          background: rgba(180, 142, 250, 0.1);
        }

        .cp-playlist__select:focus {
          border-color: var(--cp-accent);
          box-shadow: 0 0 0 2px rgba(180, 142, 250, 0.3);
        }

        .cp-playlist__select option {
          background: var(--cp-surface);
          color: var(--cp-text);
          padding: 8px;
        }

        .cp-playlist__select option:hover {
          background: #202332;
        }

        .cp-playlist__select option:checked {
          background: #262A3A;
          font-weight: 600;
        }

        .cp-playlist__remove {
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(163, 167, 183, 0.1);
          border-radius: 6px;
          color: var(--cp-muted);
          font-size: 18px;
          cursor: pointer;
          transition: all 150ms ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cp-playlist__remove:hover {
          background: rgba(210, 85, 98, 0.2);
          color: var(--cp-danger);
        }

        .cp-playlist__remove:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--cp-accent);
        }

        /* Circle with centralized equalizer */
        .cp-disc-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 80px;
          margin-bottom: 16px;
        }

        .cp-disc {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f1419 100%);
          opacity: 0.4;
          transition: all 300ms ease;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(180, 142, 250, 0.2);
        }

        .cp-disc--playing {
          opacity: 1;
          background: linear-gradient(135deg, #2a2a3e 0%, #1e2a3e 50%, #1a1f2e 100%);
          animation: cp-disc-pulse 2s ease-in-out infinite;
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(180, 142, 250, 0.4), 0 0 20px rgba(180, 142, 250, 0.3);
        }

        @keyframes cp-disc-pulse {
          0%, 100% { 
            transform: scale(1); 
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(180, 142, 250, 0.4), 0 0 20px rgba(180, 142, 250, 0.3);
          }
          50% { 
            transform: scale(1.05); 
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(180, 142, 250, 0.6), 0 0 30px rgba(180, 142, 250, 0.5);
          }
        }

        .cp-disc__equalizer {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .cp-disc__icon {
          color: rgba(230, 230, 240, 0.8);
        }

        .cp-disc__badge {
          position: absolute;
          bottom: -2px;
          right: -2px;
          background: rgba(15, 15, 20, 0.9);
          border: 1px solid var(--cp-accent);
          border-radius: 8px;
          padding: 2px 3px;
          display: flex;
          align-items: center;
          gap: 1px;
          color: var(--cp-accent);
        }

        .cp-disc__badge-num {
          font-size: 8px;
          font-weight: 700;
          line-height: 1;
        }

        /* Controls */
        .cp-controls {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }

        .cp-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          height: 34px;
          padding: 0 16px;
          border: none;
          border-radius: 17px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 180ms ease;
          flex: 1;
          position: relative;
        }

        .cp-btn:focus {
          outline: none;
          box-shadow: 0 0 0 2px var(--cp-accent), 0 0 12px rgba(180, 142, 250, 0.4);
        }

        .cp-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .cp-btn--play {
          background: var(--cp-accent);
          color: white;
        }

        .cp-btn--play:hover:not(:disabled) {
          background: var(--cp-accent-deep);
          transform: translateY(-1px);
        }

        .cp-btn--stop {
          background: var(--cp-danger);
          color: white;
        }

        .cp-btn--stop:hover:not(:disabled) {
          background: #B84654;
          transform: translateY(-1px);
        }

        .cp-btn--repeat {
          padding: 0;
          width: 34px;
          flex: none;
        }

        .cp-btn--repeat-off {
          background: rgba(163, 167, 183, 0.15);
          color: var(--cp-muted);
        }

        .cp-btn--repeat-off:hover {
          background: rgba(180, 142, 250, 0.2);
          color: var(--cp-accent);
        }

        .cp-btn--repeat-one {
          background: var(--cp-accent);
          color: white;
        }

        .cp-btn--repeat-one:hover {
          background: var(--cp-accent-deep);
        }

        .cp-btn--repeat-all {
          background: var(--cp-accent-deep);
          color: white;
        }

        .cp-btn--repeat-all:hover {
          background: #6B3DFF;
        }

        .cp-btn--minimize {
          width: 28px;
          height: 28px;
          padding: 0;
          background: transparent;
          color: var(--cp-muted);
          border-radius: 6px;
          flex: none;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 180ms ease;
        }

        .cp-btn--minimize:hover {
          background: rgba(180, 142, 250, 0.1);
          color: var(--cp-accent);
        }


        .cp-btn__badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: white;
          color: var(--cp-accent);
          font-size: 9px;
          font-weight: 700;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }

        .cp-btn--repeat-one .cp-btn__badge {
          background: var(--cp-accent-deep);
          color: white;
        }

        /* Volume */
        .cp-volume {
          display: flex;
          align-items: center;
          gap: 12px;
          padding-top: 12px;
          border-top: 1px solid var(--cp-border);
        }

        .cp-volume__icon {
          color: var(--cp-muted);
          flex-shrink: 0;
        }

        .cp-volume__text {
          font-size: 12px;
          font-weight: 600;
          color: var(--cp-muted);
          min-width: 38px;
          text-align: right;
        }

        .cp-slider {
          flex: 1;
          height: 8px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          border-radius: 4px;
          outline: none;
          cursor: pointer;
        }

        .cp-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 8px;
          background: linear-gradient(
            to right,
            var(--cp-accent) 0%,
            var(--cp-accent) calc(var(--slider-value, 0.5) * 100%),
            rgba(163, 167, 183, 0.2) calc(var(--slider-value, 0.5) * 100%),
            rgba(163, 167, 183, 0.2) 100%
          );
          border-radius: 4px;
        }

        .cp-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 150ms ease;
          margin-top: -4px;
        }

        .cp-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 4px rgba(180, 142, 250, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        .cp-slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 4px rgba(180, 142, 250, 0.4), 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        .cp-slider::-moz-range-track {
          width: 100%;
          height: 8px;
          background: rgba(163, 167, 183, 0.2);
          border-radius: 4px;
        }

        .cp-slider::-moz-range-progress {
          height: 8px;
          background: var(--cp-accent);
          border-radius: 4px;
        }

        /* Light mode specific adjustments - matching settings button */
        .light-mode .cp-player {
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .light-mode .cp-mini {
          background-color: #181A21;
          color: #B48EFA;
          border: 1px solid rgba(180, 142, 250, 0.25);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .light-mode .cp-mini:hover {
          border-color: #B48EFA;
          box-shadow: 0 0 0 2px #B48EFA, 0 0 20px rgba(180, 142, 250, 0.3);
          transform: scale(1.05);
        }

        .light-mode .cp-card {
          background: #181A21;
          border: 1px solid rgba(180, 142, 250, 0.25);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35);
        }

        .light-mode .cp-playlist__select {
          background: rgba(180, 142, 250, 0.1);
          border: 1px solid rgba(180, 142, 250, 0.25);
          color: #E6E6F0;
        }

        .light-mode .cp-playlist__select:hover {
          background: rgba(180, 142, 250, 0.2);
          border-color: #B48EFA;
        }

        .light-mode .cp-btn--repeat-off {
          background: rgba(180, 142, 250, 0.1);
          color: #A3A7B7;
        }

        .light-mode .cp-btn--repeat-off:hover {
          background: rgba(180, 142, 250, 0.2);
          color: #B48EFA;
        }

        .light-mode .cp-btn--minimize:hover {
          background: rgba(180, 142, 250, 0.2);
          color: #B48EFA;
        }

        .cp-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border: none;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          transition: all 150ms ease;
        }

        .cp-slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 4px rgba(180, 142, 250, 0.2), 0 2px 8px rgba(0, 0, 0, 0.4);
          transform: scale(1.1);
        }

        .cp-slider:focus::-moz-range-thumb {
          box-shadow: 0 0 0 4px rgba(180, 142, 250, 0.4), 0 2px 8px rgba(0, 0, 0, 0.4);
        }

        @media (max-width: 640px) {
          .cp-mini {
            width: 52px;
            height: 52px;
          }
          
          .cp-player {
            right: 20px;
          }
        }
      `}</style>
    </>
  );
};

export default MusicPlayer;
