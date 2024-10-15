export function linkToYoutube(url: string): string {
  // Regular expression to detect YouTube URLs (youtube.com or youtu.be)
  const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?(youtube\.com|youtu\.be)/;

  // Check if the URL matches the YouTube pattern
  if (youtubeRegex.test(url)) {
    // Extract video ID for transformation
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('/').pop() || ''; // For youtu.be URLs
    } else if (url.includes('youtube.com/watch')) {
      const urlParams = new URL(url).searchParams;
      videoId = urlParams.get('v') || ''; // For youtube.com/watch URLs
    }

    // If video ID is found, create the embed link with hyperbeam protocol
    if (videoId) {
      return `hyperbeam://www.youtube.com/embed/${videoId}`;
    }
  }

  // If not a YouTube URL, return the original URL
  return url;
}
