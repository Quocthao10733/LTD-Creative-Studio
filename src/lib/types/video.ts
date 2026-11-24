export interface RawClip {
  id: string;
  name: string;
  path: string; // Server file path
  url: string; // Public URL
  thumbnailUrl?: string;
  duration: number; // in seconds
  width: number;
  height: number;
  fps: number;
  sizeBytes: number;
}

export interface EDLShot {
  id: string;
  clipId: string;
  clipName: string;
  startSec: number;
  endSec: number;
  durationSec: number;
  subtitleText?: string;
  speed?: number;
  transition?: "cut" | "fade";
}

export interface EditDecisionList {
  id: string;
  title: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  targetDuration: number;
  shots: EDLShot[];
  backgroundMusic?: string;
  outroLogo?: string;
  createdAt: string;
}

export interface RenderJobStatus {
  id: string;
  status: "idle" | "processing" | "completed" | "failed";
  progress: number;
  outputVideoUrl?: string;
  outputFileName?: string;
  fileSizeBytes?: number;
  error?: string;
}
