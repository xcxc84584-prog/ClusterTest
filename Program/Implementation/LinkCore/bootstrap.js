// Stable entrypoint: retrieve the release manifest without HTTP cache.
(async () => {
  const base = new URL('./', document.currentScript.src);
  const status = (message) => {
    console.error('[OCDA Bootstrap]', message);
    document.documentElement.dataset.ocdaError = message;
  };
  try {
    const response = await fetch(new URL('release.json', base), {
      cache: 'no-store'
    });
    if (!response.ok) throw new Error('MANIFEST_HTTP_' + response.status);
    const release = await response.json();
    if (!release.version || !release.build || !release.modules) {
      throw new Error('INVALID_RELEASE_MANIFEST');
    }
    const imports = {};
    for (const [name, relativePath] of Object.entries(release.modules)) {
      const target = new URL(relativePath, base);
      target.searchParams.set('build', release.build);
      imports[name] = target.href;
    }
    globalThis.__OCDA_RELEASE__ = Object.freeze({
      version: release.version,
      build: release.build
    });
    const map = document.createElement('script');
    map.type = 'importmap';
    map.textContent = JSON.stringify({ imports });
    document.head.append(map);
    await import('ocda/app');
    const label = document.querySelector('.brand small');
    if (label) label.textContent = release.version;
  } catch (error) {
    status(String(error));
  }
})();
