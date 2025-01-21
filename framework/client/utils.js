export function getFullPath(url) {
  const { pathname, search, hash } = new URL(url, window.location.origin);
  return `${pathname}${search}${hash}`;
}
