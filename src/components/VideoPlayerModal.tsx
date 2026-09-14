import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  RotateCw,
  Download,
  Settings,
  ShieldCheck,
  Film,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { WeddingVideoItem } from '../types';

interface VideoPlayerModalProps {
  video: WeddingVideoItem | null;
  isOpen: boolean;
  onClose: () => void;
  allowDownload?: boolean;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  isOpen,
  onClose,
  allowDownload = true,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState('4K Ultra HD');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [signedUrl, setSignedUrl] = useState<string>('');

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || !video) {
      setIsPlaying(false);
      setCurrentTime(0);
      return;
    }

    // Use video stream URL or generate temporary signed token
    const token = `sig_${Math.random().toString(36).substring(2, 9)}`;
    const url = video.streamUrl.includes('?')
      ? `${video.streamUrl}&token=${token}&expires=20261231`
      : `${video.streamUrl}?token=${token}&expires=20261231`;
    setSignedUrl(url);
    setIsLoading(true);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {});
        } else {
          onClose();
        }
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        seekForward(10);
      } else if (e.key === 'ArrowLeft') {
        seekBackward(10);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleMute();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, video]);

  if (!isOpen || !video) return null;

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
      videoRef.current.volume = volume;
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const target = Number(e.target.value);
    setCurrentTime(target);
    if (videoRef.current) {
      videoRef.current.currentTime = target;
    }
  };

  const seekForward = (secs: number = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + secs);
    }
  };

  const seekBackward = (secs: number = 10) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - secs);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      setIsMuted(val === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      videoRef.current.volume = volume > 0 ? volume : 0.5;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSettings(false);
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '00:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3500);
  };

  return (
    <div
      id="video-player-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 sm:p-4 md:p-6 select-none"
      onClick={onClose}
    >
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col group"
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {/* Top Header Bar */}
        <div
          className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 sm:p-6 bg-gradient-to-b from-black/85 via-black/40 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37]">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-white font-cinzel font-bold text-sm sm:text-base line-clamp-1">
                  {video.title}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40">
                  {video.resolution || quality}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                  {video.format}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                {video.customerName && (
                  <span>Patron: {video.customerName}</span>
                )}
                {video.weddingDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-zinc-400" />
                    {video.weddingDate}
                  </span>
                )}
                <span className="flex items-center gap-1 text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Encrypted 5 TB Cloud Stream
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {allowDownload && (
              <a
                href={video.downloadUrl || signedUrl}
                download
                target="_blank"
                rel="noreferrer"
                id="btn-download-video-modal"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 border border-zinc-700 text-xs text-white transition-all shadow-md"
                title="Download High-Res Original"
              >
                <Download className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>Save ({video.sizeFormatted})</span>
              </a>
            )}
            <button
              onClick={onClose}
              id="btn-close-video-modal"
              className="w-9 h-9 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-white flex items-center justify-center transition-colors border border-zinc-700/60"
              title="Close Player (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Element */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            src={signedUrl || video.streamUrl}
            poster={video.thumbnailUrl}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onWaiting={() => setIsLoading(true)}
            onPlaying={() => setIsLoading(false)}
            onEnded={() => setIsPlaying(false)}
            playsInline
          />

          {/* Loading Spinner */}
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm pointer-events-none">
              <div className="w-12 h-12 border-4 border-[#d4af37]/30 border-t-[#d4af37] rounded-full animate-spin mb-2" />
              <p className="text-xs text-zinc-300 font-medium">Buffering 4K Master Stream...</p>
            </div>
          )}

          {/* Large Center Play/Pause Overlay Pulse */}
          {!isPlaying && !isLoading && (
            <button
              onClick={togglePlay}
              className="absolute w-20 h-20 rounded-full bg-[#d4af37]/90 text-black flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-[#e6c86e] transition-all"
            >
              <Play className="w-8 h-8 fill-black ml-1" />
            </button>
          )}
        </div>

        {/* Bottom Custom Video Controls */}
        <div
          className={`absolute bottom-0 inset-x-0 z-20 p-4 sm:p-5 bg-gradient-to-t from-black/95 via-black/80 to-transparent transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* Progress Timeline Scrubber */}
          <div className="relative flex items-center mb-3">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              id="video-timeline-seeker"
              className="w-full h-1.5 bg-zinc-700/80 rounded-lg appearance-none cursor-pointer accent-[#d4af37] hover:h-2.5 transition-all"
            />
          </div>

          {/* Control Bar Actions */}
          <div className="flex items-center justify-between text-white text-xs">
            {/* Left: Play/Pause, Rewind, Fast Forward, Time */}
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                id="btn-play-pause-toggle"
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-[#d4af37] hover:text-black flex items-center justify-center transition-all"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => seekBackward(10)}
                className="p-1.5 hover:text-[#d4af37] transition-colors"
                title="Rewind 10 seconds"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => seekForward(10)}
                className="p-1.5 hover:text-[#d4af37] transition-colors"
                title="Forward 10 seconds"
              >
                <RotateCw className="w-4 h-4" />
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 group/vol ml-1">
                <button onClick={toggleMute} className="p-1 hover:text-[#d4af37]">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-20 h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-[#d4af37]"
                />
              </div>

              {/* Time Display */}
              <span className="font-mono text-zinc-300 text-[11px] ml-2">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right: Quality, Speed, Fullscreen */}
            <div className="relative flex items-center gap-3">
              {/* Quality Selector */}
              <div className="hidden sm:flex items-center gap-1 bg-zinc-800/80 px-2.5 py-1 rounded-md border border-zinc-700 text-[11px]">
                <Sparkles className="w-3 h-3 text-[#d4af37]" />
                <span className="text-zinc-200 font-semibold">{quality}</span>
              </div>

              {/* Speed / Settings Button */}
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-2.5 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-[11px] font-medium flex items-center gap-1 transition-colors border border-zinc-700"
                >
                  <Settings className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{playbackSpeed}x</span>
                </button>

                {/* Settings Dropdown */}
                {showSettings && (
                  <div className="absolute right-0 bottom-full mb-2 w-44 bg-[#181820] border border-zinc-700 rounded-xl shadow-2xl p-2 z-30">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                      Playback Speed
                    </div>
                    {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                      <button
                        key={s}
                        onClick={() => changeSpeed(s)}
                        className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors flex items-center justify-between ${
                          playbackSpeed === s
                            ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                        }`}
                      >
                        <span>{s === 1 ? 'Normal (1x)' : `${s}x`}</span>
                        {playbackSpeed === s && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                      </button>
                    ))}

                    <div className="border-t border-zinc-800 my-1 pt-1">
                      <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-1">
                        Stream Quality
                      </div>
                      {['4K Ultra HD', '1080p Full HD', '720p HD'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q);
                            setShowSettings(false);
                          }}
                          className={`w-full text-left px-2.5 py-1 text-xs rounded-md transition-colors flex items-center justify-between ${
                            quality === q
                              ? 'bg-[#d4af37]/20 text-[#d4af37] font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          <span>{q}</span>
                          {quality === q && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                onClick={toggleFullscreen}
                id="btn-toggle-fullscreen"
                className="p-1.5 hover:text-[#d4af37] transition-colors"
                title="Toggle Fullscreen (F)"
              >
                {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
