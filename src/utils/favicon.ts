export function getFaviconUrl(url: string) {
  const iconUrl = new URL('/_favicon/', browser.runtime.getURL('/'));
  iconUrl.searchParams.set('pageUrl', url);
  iconUrl.searchParams.set('size', '32');
  return iconUrl.toString();
}
