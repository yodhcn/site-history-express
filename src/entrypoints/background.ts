import { debounce } from '@/utils/stream';
import { HistoryItem, DomainHistoryItems, createDomainHistoryItems, getHistoryItems } from '@/utils/history';
import { MessageKey, handleMessage } from '@/utils/message';
import { getCleanDomain } from '@/utils/url';

export default defineBackground(() => {
  let historyItems: HistoryItem[] = [];
  let lastFullRefreshTime = 0;

  const updateItemsDebounced = debounce(updateItems, 1000);
  browser.history.onVisited.addListener(updateItemsDebounced);
  browser.history.onVisitRemoved.addListener(() => {
    lastFullRefreshTime = 0;
    updateItemsDebounced();
  });

  async function updateItems() {
    if (Date.now() - lastFullRefreshTime > 1000 * 60 * 60) {
      historyItems = [];
      lastFullRefreshTime = Date.now();
    }
    const startTime = historyItems[0]?.time || 0;
    const newItems = await getHistoryItems(startTime);
    historyItems.unshift(...newItems);
  }

  async function ensureItems(): Promise<HistoryItem[]> {
    if (!historyItems.length) {
      await updateItems();
    }
    return historyItems;
  }

  const prepareFlashItemsDebounced = debounce(prepareFlashItems, 300);
  browser.tabs.onActivated.addListener(prepareFlashItemsDebounced);
  browser.tabs.onUpdated.addListener(prepareFlashItemsDebounced);
  prepareFlashItemsDebounced();

  async function prepareFlashItems() {
    const [url, allItems] = await Promise.all([getCurrentUrl(), ensureItems()]);
    const items = filterDomainItems(allItems, url, 50);
    await browser.storage.session.set({ flashItems: items });
  }

  async function getFlashItems(): Promise<DomainHistoryItems> {
    const { flashItems } = (await browser.storage.session.get('flashItems')) as {
      flashItems: DomainHistoryItems | undefined;
    };
    return flashItems || createDomainHistoryItems();
  }

  async function getFullItems(): Promise<DomainHistoryItems> {
    const [url, allItems] = await Promise.all([getCurrentUrl(), ensureItems()]);
    return filterDomainItems(allItems, url);
  }

  async function getCurrentUrl(): Promise<string> {
    const tabs = await browser.tabs.query({
      highlighted: true,
      currentWindow: true,
    });
    return tabs[0]?.url || '';
  }

  function filterDomainItems(allItems: HistoryItem[], currentUrl: string, maxCount?: number): DomainHistoryItems {
    const items: DomainHistoryItems = createDomainHistoryItems();
    const keySet = new Set<number>();
    const urlSet = new Set<string>();

    if (!currentUrl.startsWith('http')) {
      for (const item of allItems) {
        if (maxCount && items.main.length >= maxCount) {
          break;
        }
        if (item.url === currentUrl) {
          continue;
        }
        if (keySet.has(item.key) || urlSet.has(item.url)) {
          continue;
        }
        keySet.add(item.key);
        urlSet.add(item.url);
        items.main.push(item);
      }
      return items;
    }

    items.domain = getCleanDomain(currentUrl);
    for (const item of allItems) {
      if (maxCount && items.sub.length >= maxCount) {
        break;
      }
      if (item.url === currentUrl) {
        continue;
      }
      if (item.domain.main !== items.domain.main || keySet.has(item.key) || urlSet.has(item.url)) {
        continue;
      }
      keySet.add(item.key);
      urlSet.add(item.url);
      if (!maxCount || items.main.length < maxCount) {
        items.main.push(item);
      }
      if (item.domain.sub === items.domain.sub) {
        items.sub.push(item);
      }
    }
    return items;
  }

  browser.runtime.onMessage.addListener((message, sender, send) => {
    switch (message.key) {
      case MessageKey.GetFlashItems:
        handleMessage(getFlashItems(), send);
        break;
      case MessageKey.GetFullItems:
        handleMessage(getFullItems(), send);
        break;
    }
    return true;
  });
});
