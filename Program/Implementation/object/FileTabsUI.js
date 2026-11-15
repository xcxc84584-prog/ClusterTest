// FileTabsUI: independent editor sessions in original #tabs/#explorerTree.
export function createFileTabsUI({
  hub, properties, files, loader, root = document
}) {
  const tabs = new Map();
  let activeId = null;
  let nextId = 1;
  const strip = root.getElementById('tabs');
  const tree = root.getElementById('explorerTree');

  function saveActive() {
    if (activeId && tabs.has(activeId)) {
      tabs.get(activeId).session = files.snapshot();
    }
  }

  function render() {
    if (strip) strip.replaceChildren();
    if (tree) tree.replaceChildren();
    for (const [id, tab] of tabs) {
      const button = root.createElement('button');
      button.type = 'button';
      button.className = 'tab';
      button.textContent = tab.name +
        (tab.session?.dirty ? ' ●' : '');
      button.dataset.active = String(id === activeId);
      button.setAttribute('aria-selected', String(id === activeId));
      button.addEventListener('click', () => select(id));
      strip?.append(button);
      const item = root.createElement('button');
      item.type = 'button';
      item.textContent = tab.name;
      item.className = 'explorer-file';
      item.addEventListener('click', () => select(id));
      tree?.append(item);
    }
    properties.set('OpenFileTabs', {
      activeId, count: tabs.size
    });
  }

  function addCurrent(name, file = null) {
    saveActive();
    const id = nextId++;
    tabs.set(id, {
      name, file, session: files.snapshot()
    });
    activeId = id;
    hub.dispatch('FileTabsUI', 'OpenFileTabs',
      'TAB_CREATED', { id, name });
    render();
    return id;
  }

  function opened(data) {
    const existing = [...tabs].find(([, tab]) =>
      tab.file === data.file && data.file);
    if (existing) {
      activeId = existing[0];
      tabs.get(activeId).session = files.snapshot();
    } else {
      addCurrent(data.name, data.file);
    }
    render();
  }

  function select(id) {
    if (!tabs.has(id)) return { status: 404, result: 'FAIL' };
    if (id === activeId) return { status: 200, result: 'PASS' };
    saveActive();
    const tab = tabs.get(id);
    activeId = id;
    loader.attach(tab.file);
    files.restore(tab.session);
    hub.dispatch('FileTabsUI', 'OpenFileTabs',
      'TAB_SELECTED', { id });
    render();
    return { status: 200, result: 'PASS' };
  }

  function refresh() {
    saveActive();
    render();
  }

  root.getElementById('editor')?.addEventListener('input', () => {
    if (activeId) queueMicrotask(refresh);
  });
  return {
    addCurrent, opened, select, refresh,
    list: () => [...tabs].map(([id, tab]) => ({
      id, name: tab.name, active: id === activeId
    }))
  };
}
