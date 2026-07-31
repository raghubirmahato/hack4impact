// Helper to resolve API URLs safely in both browser and test/SSR environments

export const resolveApiUrl = (path: string): string => {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const formattedPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null') {
    return `${window.location.origin}${formattedPath}`;
  }
  return `http://localhost:3001${formattedPath}`;
};

export default resolveApiUrl;
