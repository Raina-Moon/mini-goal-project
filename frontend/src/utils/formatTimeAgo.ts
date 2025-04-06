export function formatTimeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (60 * 1000));
    if (diffMins < 60) {
      return `${diffMins} mins ago`;
    }
    const diffHrs = Math.floor(diffMs / (60 * 60 * 1000));
    if (diffHrs < 24) {
      return `${diffHrs} hrs ago`;
    }
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    if (diffDays < 10) {
      return `${diffDays} days ago`;
    }
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) {
      return `${diffWeeks} weeks ago`;
    }
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }