export function getFileUrl(filename) {
    if (!filename) return null;
    if (filename.startsWith("http://") || filename.startsWith("https://")) {
      return filename;
    }
    return `/api/file/${filename}`;
  }