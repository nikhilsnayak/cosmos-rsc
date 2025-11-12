export function getFullPath(url) {
  const { pathname, search, hash } = new URL(url, window.location.origin);
  return `${pathname}${search}${hash}`;
}

export function shouldNotInterceptNavigation(navigationEvent) {
  return (
    !navigationEvent.canIntercept ||
    // If this is just a hashChange,
    // just let the browser handle scrolling to the content.
    navigationEvent.hashChange ||
    // If this is a download,
    // let the browser perform the download.
    navigationEvent.downloadRequest ||
    // If this is a form submission,
    // let that go to the server.
    navigationEvent.formData
  );
}
