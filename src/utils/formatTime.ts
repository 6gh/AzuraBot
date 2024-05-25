export function formatTime(seconds: number | undefined | null) {
  if (!seconds) {
    return "[N/A]";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatProgress(
  elapsed: number | undefined | null,
  duration: number | undefined | null
) {
  if (!elapsed || !duration) {
    return "▬▬▬▬▬▬▬▬▬▬▬▬";
  }

  const percentage = (elapsed / duration) * 100;
  const progressBar = new Array(11).fill("▬");
  const progress = Math.floor(percentage / progressBar.length);

  progressBar[progress] = "🔘";

  return progressBar.join("");
}
