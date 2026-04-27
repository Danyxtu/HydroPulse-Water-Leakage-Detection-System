/**
 * --- Formatters ---
 * Pure functions to transform data into human-readable strings.
 * Use these throughout the app to ensure consistency (e.g., L instead of Liters).
 */

export const formatVolume = (volume: number | string): string => {
  if (typeof volume === 'string') return volume.includes('L') ? volume : `${volume}L`;
  return `${volume.toFixed(1)}L`;
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatPercentage = (val: number): string => {
  return `${val.toFixed(1)}%`;
};
