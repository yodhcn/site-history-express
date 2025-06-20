export const i18n = {
  lang: browser.i18n.getMessage('lang'),
  filterPlaceholder: (domain: string) => browser.i18n.getMessage('filter_placeholder', domain),
  filterGlobalPlaceholder: browser.i18n.getMessage('filter_global_placeholder'),
  noHistory: browser.i18n.getMessage('no_history'),
};
