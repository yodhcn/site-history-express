export enum MatchMode {
  Loose = 1,
  Strict = 2,
  All = 3,
}

export const DEFAULT_MATCH_MODE = MatchMode.Strict;

const LOOSE_MODE_DOMAINS_KEY = 'looseModeDomains';
const LOOSE_MODE_DOMAINS_LIMIT = 100;

const ALL_SITES_KEY = 'allSitesModeEnabled';

export async function updateMatchMode(mainDomain: string, mode: MatchMode) {
  await chrome.storage.sync.set({ [ALL_SITES_KEY]: mode === MatchMode.All });
  if (mode === MatchMode.All) {
    return;
  }
  const res = await chrome.storage.sync.get(LOOSE_MODE_DOMAINS_KEY);
  let domains = (res[LOOSE_MODE_DOMAINS_KEY] || []).filter((domain: string) => domain !== mainDomain);
  if (mode === MatchMode.Loose) {
    domains.push(mainDomain);
  }
  if (domains.length > LOOSE_MODE_DOMAINS_LIMIT) {
    domains = domains.slice(-LOOSE_MODE_DOMAINS_LIMIT);
  }
  await chrome.storage.sync.set({ [LOOSE_MODE_DOMAINS_KEY]: domains });
}

export async function getMatchMode(mainDomain: string): Promise<MatchMode> {
  const resAll = await chrome.storage.sync.get(ALL_SITES_KEY);
  if (resAll[ALL_SITES_KEY]) {
    return MatchMode.All;
  }
  const res = await chrome.storage.sync.get(LOOSE_MODE_DOMAINS_KEY);
  return (res[LOOSE_MODE_DOMAINS_KEY] || []).includes(mainDomain) ? MatchMode.Loose : DEFAULT_MATCH_MODE;
}
