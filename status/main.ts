import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

import type { RouterState } from '../contract.ts';
import { createServiceClient, type ServiceClient } from '../panel/client.ts';
import { STYLES } from './styles.ts';

type ExtendedHostClient = ReturnType<typeof connectHost> & {
  setStatusControls?: (controls: Array<{ kind: 'button'; id: string; label: string }>) => Promise<void>;
  onStatusControl?: (listener: (event: { id: string }) => void) => () => void;
};

const host = connectHost() as ExtendedHostClient;
const root = document.querySelector<HTMLElement>('#root');
if (!root) throw new Error('Missing root');

const style = document.createElement('style');
style.textContent = STYLES;
document.head.append(style);

let started = false;
let client: ServiceClient | null = null;
let currentState: RouterState | null = null;

host.onReady((context) => {
  applyHostReady(context, document.documentElement);
  if (started) return;
  started = true;
  client = createServiceClient(host);
  void init();
});

void host.setStatusControls?.([
  { kind: 'button', id: 'refresh', label: 'Refresh' },
]);

host.onStatusControl?.((event: { id: string }) => {
  if (event.id === 'refresh') {
    void refresh();
  }
});

const renderLoading = (): void => {
  root.replaceChildren();
  const row = document.createElement('div');
  row.className = 'br-s-row';
  row.textContent = 'Connecting to BlackRouter...';
  root.append(row);
};

const renderError = (message: string): void => {
  root.replaceChildren();
  const row = document.createElement('div');
  row.className = 'br-s-row br-s-error';
  row.textContent = message;
  const retryBtn = document.createElement('button');
  retryBtn.className = 'br-s-btn';
  retryBtn.textContent = 'Retry';
  retryBtn.onclick = () => void refresh();
  root.append(row, retryBtn);
};

const refresh = async (): Promise<void> => {
  if (!client) return;
  try {
    currentState = await client.state();
    render();
  } catch (error) {
    renderError(error instanceof Error ? error.message : 'Service unreachable');
  }
};

const init = async (): Promise<void> => {
  renderLoading();
  await refresh();
  setInterval(() => {
    void refresh();
  }, 10_000);
};

const render = (): void => {
  if (!currentState) return;
  root.replaceChildren();

  // 1. Status row: dot + 127.0.0.1:port + copy button
  const statusRow = document.createElement('div');
  statusRow.className = 'br-s-row';
  const statusLeft = document.createElement('div');
  statusLeft.className = 'br-s-left';
  const dot = document.createElement('span');
  dot.className = 'br-s-dot';
  dot.dataset.state = currentState.running ? 'on' : 'off';
  const statusText = document.createElement('span');
  statusText.className = 'br-s-value br-s-mono';
  statusText.textContent = currentState.running
    ? `127.0.0.1:${currentState.config.port}`
    : 'Stopped';
  statusLeft.append(dot, statusText);

  const statusRight = document.createElement('div');
  statusRight.className = 'br-s-right';
  const copyBtn = document.createElement('button');
  copyBtn.className = 'br-s-btn';
  copyBtn.textContent = 'Copy';
  copyBtn.title = 'Copy OpenAI API base URL';
  copyBtn.onclick = async () => {
    try {
      await host.writeClipboard(currentState!.endpoint);
      await host.toast({ kind: 'success', message: 'BlackRouter endpoint copied.' });
    } catch {
      await host.toast({ kind: 'error', message: 'Failed to copy endpoint.' });
    }
  };
  statusRight.append(copyBtn);
  statusRow.append(statusLeft, statusRight);
  root.append(statusRow);

  // 2. Upstream Routing row: Route -> Direct or Pool Name
  const routeRow = document.createElement('div');
  routeRow.className = 'br-s-row';
  const routeLeft = document.createElement('div');
  routeLeft.className = 'br-s-left';
  const routeLabel = document.createElement('span');
  routeLabel.className = 'br-s-label';
  routeLabel.textContent = 'Route';
  routeLeft.append(routeLabel);

  const routeRight = document.createElement('div');
  routeRight.className = 'br-s-right';
  const activePool = currentState.config.proxyPools.find((p) => p.isActive);
  const routePill = document.createElement('span');
  routePill.className = 'br-s-pill';
  routePill.textContent = activePool
    ? `${activePool.name} (${activePool.type})`
    : 'Direct (opencode.ai)';
  routeRight.append(routePill);
  routeRow.append(routeLeft, routeRight);
  root.append(routeRow);

  // 3. RTK Token Saver row: clickable toggle
  const rtkRow = document.createElement('div');
  rtkRow.className = 'br-s-row';
  const rtkLeft = document.createElement('div');
  rtkLeft.className = 'br-s-left';
  const rtkLabel = document.createElement('span');
  rtkLabel.className = 'br-s-label';
  rtkLabel.textContent = 'RTK Saver';
  rtkLeft.append(rtkLabel);

  const rtkRight = document.createElement('div');
  rtkRight.className = 'br-s-right';
  const rtkPill = document.createElement('button');
  rtkPill.className = 'br-s-btn br-s-toggle';
  const rtkOn = currentState.config.rtkEnabled !== false;
  rtkPill.textContent = rtkOn ? 'On (~30% saved)' : 'Off';
  if (rtkOn) rtkPill.classList.add('br-s-success');
  rtkPill.title = 'Click to toggle RTK token compression';
  rtkPill.onclick = async () => {
    if (!client || !currentState) return;
    try {
      currentState = await client.patchConfig({ rtkEnabled: !rtkOn });
      render();
    } catch {
      await host.toast({ kind: 'error', message: 'Failed to update RTK setting.' });
    }
  };
  rtkRight.append(rtkPill);
  rtkRow.append(rtkLeft, rtkRight);
  root.append(rtkRow);

  // 4. Response/code-economy profiles
  const styleRow = document.createElement('div');
  styleRow.className = 'br-s-row';
  const styleLeft = document.createElement('div');
  styleLeft.className = 'br-s-left';
  const styleLabel = document.createElement('span');
  styleLabel.className = 'br-s-label';
  styleLabel.textContent = 'Style Profiles';
  styleLeft.append(styleLabel);
  const styleRight = document.createElement('div');
  styleRight.className = 'br-s-right';
  const styleValue = document.createElement('span');
  styleValue.className = 'br-s-value';
  styleValue.textContent = 'Caveman ' + currentState.config.cavemanLevel + ' · Ponytail ' + currentState.config.ponytailLevel;
  styleRight.append(styleValue);
  styleRow.append(styleLeft, styleRight);
  root.append(styleRow);

  // 5. Free Models row
  const modelsRow = document.createElement('div');
  modelsRow.className = 'br-s-row';
  const modelsLeft = document.createElement('div');
  modelsLeft.className = 'br-s-left';
  const modelsLabel = document.createElement('span');
  modelsLabel.className = 'br-s-label';
  modelsLabel.textContent = 'Free Models';
  modelsLeft.append(modelsLabel);

  const modelsRight = document.createElement('div');
  modelsRight.className = 'br-s-right';
  const modelsValue = document.createElement('span');
  modelsValue.className = 'br-s-value';
  modelsValue.textContent = `${currentState.models.length} active`;
  modelsRight.append(modelsValue);
  modelsRow.append(modelsLeft, modelsRight);
  root.append(modelsRow);

  // 6. Last Call (if available)
  if (currentState.requests.length > 0) {
    const last = currentState.requests[0]!;
    const lastRow = document.createElement('div');
    lastRow.className = 'br-s-row';
    const lastLeft = document.createElement('div');
    lastLeft.className = 'br-s-left';
    const lastLabel = document.createElement('span');
    lastLabel.className = 'br-s-label';
    lastLabel.textContent = 'Last Call';
    const lastModel = document.createElement('span');
    lastModel.className = 'br-s-value br-s-mono';
    lastModel.textContent = last.model || last.path;
    lastLeft.append(lastLabel, lastModel);

    const lastRight = document.createElement('div');
    lastRight.className = 'br-s-right';
    const lastBadge = document.createElement('span');
    lastBadge.className = `br-s-pill ${last.status >= 200 && last.status < 300 ? 'br-s-success' : 'br-s-error'}`;
    lastBadge.textContent = `${last.status} · ${last.ms}ms`;
    lastRight.append(lastBadge);
    lastRow.append(lastLeft, lastRight);
    root.append(lastRow);
  }

  // 7. Action buttons: Open Panel + Test Relay (if active pool)
  const actionsRow = document.createElement('div');
  actionsRow.className = 'br-s-actions';

  const openPanelBtn = document.createElement('button');
  openPanelBtn.className = 'br-s-btn';
  openPanelBtn.textContent = 'Open Panel';
  openPanelBtn.onclick = async () => {
    try {
      await host.openSurface('blackrouter');
    } catch {
      await host.toast({ kind: 'info', message: 'Open BlackRouter from Settings -> Extensions or the context rail.' });
    }
  };
  actionsRow.append(openPanelBtn);

  if (activePool) {
    const testRelayBtn = document.createElement('button');
    testRelayBtn.className = 'br-s-btn';
    testRelayBtn.textContent = 'Test Relay';
    testRelayBtn.onclick = async () => {
      if (!client) return;
      testRelayBtn.disabled = true;
      testRelayBtn.textContent = 'Testing...';
      try {
        const res = await client.testProxyPool(activePool.id);
        if (res.ok) {
          await host.toast({
            kind: 'success',
            message: `${activePool.name} is reachable (${res.elapsedMs ?? 0}ms).`,
          });
        } else {
          await host.toast({
            kind: 'error',
            message: `${activePool.name} test failed: ${res.error || res.statusText || 'Error'}`,
          });
        }
      } catch (err) {
        await host.toast({ kind: 'error', message: err instanceof Error ? err.message : 'Relay test failed.' });
      } finally {
        testRelayBtn.disabled = false;
        testRelayBtn.textContent = 'Test Relay';
      }
    };
    actionsRow.append(testRelayBtn);
  }

  root.append(actionsRow);
};
