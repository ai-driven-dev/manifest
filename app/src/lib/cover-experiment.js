// Classic blocking script: choose the cohort before the cover is parsed or painted.
(() => {
  const script = document.currentScript;
  if (!(script instanceof HTMLScriptElement)) return;
  const { experiment, storageKey, path, domains } = script.dataset;
  const root = document.documentElement;
  const browser = navigator;
  const optOut = [window.doNotTrack, browser.doNotTrack, browser.msDoNotTrack]
    .some((signal) => signal === '1' || signal === 'yes');
  if (!experiment || !storageKey || location.pathname !== path ||
      !domains?.split(',').includes(location.hostname) ||
      browser.globalPrivacyControl || optOut || root.hasAttribute('data-analytics-disabled')) return;
  try {
    if (localStorage.getItem('umami.disabled')) return;
    let variant = localStorage.getItem(storageKey);
    if (variant !== 'a' && variant !== 'b') {
      variant = Math.random() < 0.5 ? 'a' : 'b';
      localStorage.setItem(storageKey, variant);
      if (localStorage.getItem(storageKey) !== variant) return;
    }
    root.dataset.manifestExperiment = experiment;
    root.dataset.manifestVariant = variant;
  } catch {
    // A remains usable without assigning a cohort when persistence is unavailable.
  }
})();
