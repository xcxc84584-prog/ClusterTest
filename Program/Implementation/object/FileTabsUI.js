// FileTabsUI: independent editor sessions in original #tabs/#explorerTree.
export function createFileTabsUI({
  hub, properties, files, loader, viewport, root = document
}) {
  const tabs = new Map();
  let activeId = null;
  let nextId = 1;
  const strip = root.getElementById('tabs');
  const tree = root.getElementById('explorerTree');
  const search = root.getElementById('explorerSearch');
  if (search) search.readOnly = false;

  function saveActive() {
    if (activeId && tabs.has(activeId)) {
      const active = tabs.get(activeId);
      active.session = files.snapshot();
      active.viewport = viewport.snapshot();
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
      const closeButton = root.createElement('button');
      closeButton.type = 'button';
      closeButton.className = 'tab-close';
      closeButton.textContent = '×';
      closeButton.setAttribute('aria-label', '關閉 ' + tab.name);
      closeButton.addEventListener('click', (event) => {
        event.stopPropagation();
        closeTab(id);
      });
      const wrapper = root.createElement('span');
      wrapper.className = 'tab-wrapper';
      wrapper.append(button, closeButton);
      strip?.append(wrapper);
      const item = root.createElement('button');
      item.type = 'button';
      item.textContent = tab.name;
      item.className = 'explorer-file';
      item.addEventListener('click', () => select(id));
      if (!search?.value || tab.name.toLowerCase()
        .includes(search.value.toLowerCase())) tree?.append(item);
    }
    properties.set('OpenFileTabs', {
      activeId, count: tabs.size
    });
  }

  function addCurrent(name, file = null) {
    const id = nextId++;
    tabs.set(id, {
      name, file, session: files.snapshot(),
      viewport: viewport.snapshot()
    });
    activeId = id;
    hub.dispatch('FileTabsUI', 'OpenFileTabs',
      'TAB_CREATED', { id, name });
    render();
    return id;
  }

  function beforeOpen() {
    saveActive();
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
    viewport.restore(tab.viewport);
    hub.dispatch('FileTabsUI', 'OpenFileTabs',
      'TAB_SELECTED', { id });
    render();
    return { status: 200, result: 'PASS' };
  }

  function closeTab(id) {
    if (!tabs.has(id)) return { status: 404, result: 'FAIL' };
    if (id !== activeId) {
      const tab = tabs.get(id);
      if (tab.session.dirty &&
          !confirm('此文件尚未儲存，確定關閉？')) {
        return { status: 409, result: 'FAIL' };
      }
      tabs.delete(id);
      hub.dispatch('FileTabsUI', 'OpenFileTabs',
        'TAB_CLOSED', { id });
      render();
      return { status: 200, result: 'PASS' };
    }
    return files.close();
  }

  function closed() {
    if (activeId) tabs.delete(activeId);
    activeId = null;
    const next = tabs.keys().next().value;
    if (next !== undefined) select(next);
    else {
      viewport.reset();
      render();
    }
  }

  function refresh() {
    saveActive();
    render();
  }

  search?.addEventListener('input', render);
  root.getElementById('editor')?.addEventListener('input', () => {
    if (activeId) queueMicrotask(refresh);
  });
  return {
    addCurrent, beforeOpen, opened, select, refresh, closed,
    closeTab,
    list: () => [...tabs].map(([id, tab]) => ({
      id, name: tab.name, active: id === activeId
    }))
  };
}
