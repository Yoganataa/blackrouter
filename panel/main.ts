import { connectHost } from '@openchamber/sdk';
import { applyHostReady, mountBanner, mountButton, mountTabs, type TabsHandle } from '@openchamber/sdk/ui';

import { createServiceClient } from './client.ts';
import { createStore } from './store.ts';
import { STYLES } from './ui/styles.ts';
import { createModelsView } from './views/models-view.ts';
import { createOpenCodeView } from './views/opencode-view.ts';
import { createProxyPoolsView } from './views/proxy-pools-view.ts';
import { createRouterView } from './views/router-view.ts';

const host = connectHost();
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing root');

const style = document.createElement('style');
style.textContent = STYLES;
document.head.append(style);

host.onReady((context) => applyHostReady(context, document.documentElement));

const client = createServiceClient(host);
const store = createStore(client);

// App Root
const app = document.createElement('div');
app.className = 'br-root';
root.replaceChildren(app);

// Top Header
const header = document.createElement('header');
header.className = 'br-header';

const headerLeft = document.createElement('div');
headerLeft.className = 'br-header-left';

const logoBox = document.createElement('div');
logoBox.className = 'br-logo-box';
logoBox.textContent = '⚡';

const headerTitles = document.createElement('div');
headerTitles.className = 'br-header-titles';

const titleRow = document.createElement('div');
titleRow.className = 'br-title-row';

const title = document.createElement('h1');
title.textContent = 'BlackRouter';

const statusBadge = document.createElement('span');
statusBadge.className = 'br-badge br-badge-neutral';
statusBadge.textContent = 'Connecting...';

titleRow.append(title, statusBadge);

const subtitle = document.createElement('p');
subtitle.className = 'br-header-sub';
subtitle.textContent = 'OpenCode Zen Local Endpoint & Proxy Pools';

headerTitles.append(titleRow, subtitle);
headerLeft.append(logoBox, headerTitles);

const headerRight = document.createElement('div');
headerRight.className = 'br-header-right';

const refreshButton = mountButton(headerRight, {
  label: 'Refresh',
  variant: 'outline',
  size: 'sm',
  onClick: () => {
    void store.load();
  },
});

header.append(headerLeft, headerRight);
app.append(header);

// Navigation Bar
const navBar = document.createElement('div');
navBar.className = 'br-nav-bar';
const tabsSlot = document.createElement('div');
navBar.append(tabsSlot);
app.append(navBar);

// Content Stack
const content = document.createElement('main');
content.className = 'br-stack';
app.append(content);

const failureSlot = document.createElement('div');
failureSlot.hidden = true;
const failureBanner = mountBanner(failureSlot, { tone: 'error', title: '' });
content.append(failureSlot);

let activeId = 'router';
let tabs: TabsHandle | null = null;
const show = (id: string): void => {
  activeId = id;
  tabs?.update({ activeId });
  for (const entry of views) {
    entry.element.hidden = entry.id !== id;
  }
  const state = store.state();
  if (id === 'models' && state && state.models.length === 0 && !store.busy()) {
    void store.run((service) => service.refreshModels());
  }
};

const routerView = createRouterView(store, client, host, (tab) => show(tab));
const proxyPoolsView = createProxyPoolsView(store, client, host);
const modelsView = createModelsView(store, client, host);
const openCodeView = createOpenCodeView(store, host);

const views = [
  { id: 'router', label: 'Router', element: routerView.element },
  { id: 'proxy-pools', label: 'Proxy Pools', element: proxyPoolsView.element },
  { id: 'models', label: 'Models', element: modelsView.element },
  { id: 'opencode', label: 'OpenCode', element: openCodeView.element },
];

for (const entry of views) {
  content.append(entry.element);
}

tabs = mountTabs(tabsSlot, {
  items: views.map((entry) => ({ id: entry.id, label: entry.label })),
  activeId,
  onChange: show,
});
show('router');

const paint = (): void => {
  const state = store.state();
  if (state) {
    statusBadge.className = `br-badge ${state.running ? 'br-badge-running' : 'br-badge-stopped'}`;
    statusBadge.innerHTML = `<span class="br-dot ${state.running ? 'on' : 'off'}"></span> ${state.running ? `127.0.0.1:${state.config.port}` : 'Stopped'}`;

    const poolCount = state.config.proxyPools.length;
    const modelCount = state.models.length;
    const isInstalled = state.registration.installed;

    tabs?.update({
      activeId,
      items: [
        { id: 'router', label: 'Router' },
        { id: 'proxy-pools', label: poolCount > 0 ? `Proxy Pools (${poolCount})` : 'Proxy Pools' },
        { id: 'models', label: modelCount > 0 ? `Models (${modelCount})` : 'Models' },
        { id: 'opencode', label: isInstalled ? 'OpenCode ✓' : 'OpenCode' },
      ],
    });
  }

  const failure = store.error();
  const showFailure = Boolean(failure) && state !== null;
  failureSlot.hidden = !showFailure;
  if (failure && showFailure) {
    failureBanner.update({ tone: 'error', title: 'Local service notice', body: failure });
  }

  refreshButton.update({ loading: store.busy() });
  routerView.render();
  proxyPoolsView.render();
  modelsView.render();
  openCodeView.render();
};

store.subscribe(paint);
void store.load();

// Background periodic sync every 30 seconds
setInterval(() => {
  void store.poll();
}, 30_000);
