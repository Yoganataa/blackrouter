import type { HostClient } from '@openchamber/sdk';
import {
  mountBanner,
  mountEmpty,
  mountSpinner,
  mountSwitch,
} from '@openchamber/sdk/ui';

import type { RouterState } from '../../contract.ts';
import type { ServiceClient } from '../client.ts';
import type { Store } from '../store.ts';
import { btn, card, el, row, stack } from '../ui/dom.ts';

type PanelHost = Pick<HostClient, 'writeClipboard' | 'toast'>;

export const createRouterView = (
  store: Store,
  _client: ServiceClient,
  host: PanelHost,
  onNavigate?: (tab: string) => void,
) => {
  const root = stack(document.createElement('div'));
  let port = '';
  let seeded = false;
  let showKey = false;
  let localFailure = '';

  const syncDrafts = (state: RouterState): void => {
    port = String(state.config.port);
  };

  const copy = async (text: string, label: string): Promise<void> => {
    try {
      await host.writeClipboard(text);
      await host.toast({ kind: 'success', message: `${label} copied.` });
    } catch {
      localFailure = 'The clipboard refused the copy.';
      render();
    }
  };

  const savePort = async (): Promise<void> => {
    const next = Number(port);
    if (!Number.isInteger(next) || next < 1024 || next > 65535) {
      localFailure = 'The port must be a whole number between 1024 and 65535.';
      render();
      return;
    }
    localFailure = '';
    await store.run((service) => service.patchConfig({ port: next }));
    const state = store.state();
    if (state) syncDrafts(state);
    render();
  };

  const rotateKey = async (): Promise<void> => {
    localFailure = '';
    await store.run((service) => service.rotateKey());
    await host.toast({ kind: 'success', message: 'New API key generated and saved.' });
    render();
  };

  const render = (): void => {
    root.replaceChildren();
    const state = store.state();
    if (!state) {
      if (store.error()) {
        mountEmpty(root, {
          title: 'Local service is not reachable',
          body: 'Allow the local service for BlackRouter in Settings -> Extensions, then retry.',
          action: {
            label: 'Retry',
            onClick: () => {
              void store.load();
            },
          },
        });
        return;
      }
      const waiting = row(root);
      mountSpinner(waiting, { label: 'Connecting to local service...' });
      return;
    }

    if (!seeded) {
      syncDrafts(state);
      seeded = true;
    }

    if (!state.running) {
      const bannerBox = el('div');
      root.append(bannerBox);
      mountBanner(bannerBox, {
        tone: 'error',
        title: 'Router listener is not active',
        body: state.routerError || 'The listener did not start. Change the port below and save.',
      });
    }

    if (localFailure) {
      const bannerBox = el('div');
      root.append(bannerBox);
      mountBanner(bannerBox, { tone: 'error', title: 'Action failed', body: localFailure });
    }

    // 1. Connection & Endpoint Card
    const { card: connCard } = card(
      root,
      'Connection & Endpoint',
      'OpenCode and any OpenAI-compatible client connect to this loopback address.',
    );

    const kvGrid = el('div', 'br-kv-grid');
    connCard.append(kvGrid);

    // Box 1: Endpoint
    const epBox = el('div', 'br-kv-box');
    epBox.append(el('span', 'br-kv-label', 'Base URL (Endpoint)'));
    const epVal = el('div', 'br-kv-val');
    epVal.append(el('span', 'br-kv-text', state.endpoint));
    btn(epVal, 'Copy URL', () => void copy(state.endpoint, 'Endpoint'));
    epBox.append(epVal);
    kvGrid.append(epBox);

    // Box 2: API Key
    const keyBox = el('div', 'br-kv-box');
    keyBox.append(el('span', 'br-kv-label', 'API Key'));
    const keyVal = el('div', 'br-kv-val');
    keyVal.append(
      el(
        'span',
        'br-kv-text',
        showKey ? state.config.apiKey : `${state.config.apiKey.slice(0, 7)}••••••••••••••••`,
      ),
    );
    const keyActions = el('div', 'br-row');
    btn(keyActions, showKey ? 'Hide' : 'Reveal', () => {
      showKey = !showKey;
      render();
    });
    btn(keyActions, 'Copy', () => void copy(state.config.apiKey, 'API key'));
    btn(keyActions, 'Rotate', () => void rotateKey());
    keyVal.append(keyActions);
    keyBox.append(keyVal);
    kvGrid.append(keyBox);

    // Box 3: Port
    const portBox = el('div', 'br-kv-box');
    portBox.append(el('span', 'br-kv-label', 'Listening Port'));
    const portVal = el('div', 'br-kv-val');
    const portInput = el('input', 'br-search-input br-mono') as HTMLInputElement;
    portInput.type = 'number';
    portInput.value = port;
    portInput.style.maxWidth = '110px';
    portInput.oninput = () => {
      port = portInput.value;
      savePortBtn.disabled = port === String(state.config.port);
    };
    portVal.append(portInput);
    const savePortBtn = btn(portVal, 'Save Port', () => void savePort(), 'primary');
    savePortBtn.disabled = port === String(state.config.port);
    portBox.append(portVal);
    kvGrid.append(portBox);

    // Box 4: RTK Token Saver
    const rtkBox = el('div', 'br-kv-box');
    rtkBox.append(el('span', 'br-kv-label', 'RTK Token Saver'));
    const rtkVal = el('div', 'br-kv-val');
    mountSwitch(rtkVal, {
      label: state.config.rtkEnabled !== false ? 'Enabled' : 'Disabled',
      description: 'Compacts git diff, status, and grep tool outputs (saves ~30% tokens)',
      checked: state.config.rtkEnabled !== false,
      onChange: (checked) => {
        void store.run((service) => service.patchConfig({ rtkEnabled: checked }));
      },
    });
    rtkBox.append(rtkVal);
    kvGrid.append(rtkBox);

        // Optional response/code-economy profiles ported from 9Router's Caveman and Ponytail.
    const cavemanBox = el('div', 'br-kv-box');
    cavemanBox.append(el('span', 'br-kv-label', 'Caveman'));
    const cavemanSelect = el('select', 'br-search-input') as HTMLSelectElement;
    for (const option of [
      { value: 'off', label: 'Off' },
      { value: 'lite', label: 'Lite · concise sentences' },
      { value: 'full', label: 'Full · terse technical' },
      { value: 'ultra', label: 'Ultra · minimum words' },
    ]) {
      const item = document.createElement('option');
      item.value = option.value;
      item.textContent = option.label;
      cavemanSelect.append(item);
    }
    cavemanSelect.value = state.config.cavemanLevel;
    cavemanSelect.onchange = () => {
      void store.run((service) => service.patchConfig({
        cavemanLevel: cavemanSelect.value as 'off' | 'lite' | 'full' | 'ultra',
      }));
    };
    cavemanBox.append(cavemanSelect);
    cavemanBox.append(el('span', 'br-card-desc', 'Terse answers; technical literals and safety warnings stay intact.'));
    kvGrid.append(cavemanBox);

    const ponytailBox = el('div', 'br-kv-box');
    ponytailBox.append(el('span', 'br-kv-label', 'Ponytail'));
    const ponytailSelect = el('select', 'br-search-input') as HTMLSelectElement;
    for (const option of [
      { value: 'off', label: 'Off' },
      { value: 'lite', label: 'Lite · minimal changes' },
      { value: 'full', label: 'Full · YAGNI first' },
      { value: 'ultra', label: 'Ultra · smallest diff' },
    ]) {
      const item = document.createElement('option');
      item.value = option.value;
      item.textContent = option.label;
      ponytailSelect.append(item);
    }
    ponytailSelect.value = state.config.ponytailLevel;
    ponytailSelect.onchange = () => {
      void store.run((service) => service.patchConfig({
        ponytailLevel: ponytailSelect.value as 'off' | 'lite' | 'full' | 'ultra',
      }));
    };
    ponytailBox.append(ponytailSelect);
    ponytailBox.append(el('span', 'br-card-desc', 'Encourages minimal code without skipping validation, security, or requested behavior.'));
    kvGrid.append(ponytailBox);

// 2. Upstream Routing Card
    const { card: routeCard } = card(
      root,
      'Upstream Routing',
      'Traffic to OpenCode Zen can route directly or through a serverless proxy pool.',
    );
    const strategy = state.config.proxyStrategy || 'single';
    const activePools = state.config.proxyPools.filter((p) => p.isActive);
    const activePool = state.config.activePoolId
      ? activePools.find((p) => p.id === state.config.activePoolId) || activePools[0]
      : activePools[0];

    const routeRow = el('div', 'br-pool-card active');
    const routeLeft = el('div', 'br-pool-left');
    const routeInfo = el('div', 'br-pool-info');
    const routeTitleRow = el('div', 'br-pool-title-row');

    if (strategy === 'round-robin') {
      routeTitleRow.append(el('span', 'br-pool-name', 'Round-Robin Rotation'));
      routeTitleRow.append(el('span', 'br-badge br-badge-running', `${activePools.length} Pools`));
      routeInfo.append(routeTitleRow);
      routeInfo.append(
        el(
          'span',
          'br-pool-url',
          `Sequential rotation with sticky turn limit ${state.config.stickyLimit || 1}`,
        ),
      );
    } else if (strategy === 'random') {
      routeTitleRow.append(el('span', 'br-pool-name', 'Random Upstream Routing'));
      routeTitleRow.append(el('span', 'br-badge br-badge-primary', `${activePools.length} Pools`));
      routeInfo.append(routeTitleRow);
      routeInfo.append(
        el('span', 'br-pool-url', 'Uniform random distribution across active proxy pools'),
      );
    } else if (activePool) {
      routeTitleRow.append(el('span', 'br-pool-name', activePool.name));
      const typeBadge = el('span', 'br-badge br-badge-primary', activePool.type);
      routeTitleRow.append(typeBadge);
      routeInfo.append(routeTitleRow);
      routeInfo.append(el('span', 'br-pool-url', activePool.proxyUrl));
    } else {
      routeTitleRow.append(el('span', 'br-pool-name', 'Direct Routing'));
      const typeBadge = el('span', 'br-badge br-badge-neutral', 'Direct');
      routeTitleRow.append(typeBadge);
      routeInfo.append(routeTitleRow);
      routeInfo.append(
        el('span', 'br-pool-url', 'Direct requests from this machine to https://opencode.ai/zen/v1'),
      );
    }
    routeLeft.append(routeInfo);
    routeRow.append(routeLeft);

    const routeActions = el('div', 'br-pool-actions');
    if (onNavigate) {
      btn(routeActions, 'Manage Proxy Pools', () => onNavigate('proxy-pools'));
    }
    routeRow.append(routeActions);
    routeCard.append(routeRow);

    // 3. Usage & Reliability — aggregate only the persisted request metadata we actually know.
    const recentRequests = state.requests;
    const requestCount = recentRequests.length;
    const successfulCount = recentRequests.filter((entry) => entry.status >= 200 && entry.status < 300).length;
    const rateLimitedCount = recentRequests.filter((entry) => entry.status === 429).length;
    const fallbackCount = recentRequests.filter((entry) => entry.fallbackUsed === true).length;
    const failedCount = recentRequests.filter((entry) => entry.status < 200 || entry.status >= 300).length;
    const avgLatencyMs = requestCount > 0
      ? Math.round(recentRequests.reduce((sum, entry) => sum + Math.max(0, entry.ms), 0) / requestCount)
      : null;
    const tokenReportedRequests = recentRequests.filter((entry) =>
      entry.inputTokens !== undefined || entry.outputTokens !== undefined || entry.totalTokens !== undefined,
    ).length;
    const inputTokenTotal = recentRequests.reduce((sum, entry) => sum + (entry.inputTokens ?? 0), 0);
    const outputTokenTotal = recentRequests.reduce((sum, entry) => sum + (entry.outputTokens ?? 0), 0);
    const totalTokenTotal = recentRequests.reduce(
      (sum, entry) => sum + (
        entry.totalTokens
        ?? (entry.inputTokens !== undefined && entry.outputTokens !== undefined
          ? entry.inputTokens + entry.outputTokens
          : 0)
      ),
      0,
    );
    const numberFormat = new Intl.NumberFormat();

    const { card: usageCard } = card(
      root,
      'Usage & Reliability',
      'Summary of the most recent persisted request records. Token figures include only usage reported by the upstream.',
    );
    const usageGrid = el('div', 'br-kv-grid');
    const addMetric = (label: string, value: string, detail?: string): void => {
      const box = el('div', 'br-kv-box');
      box.append(el('span', 'br-kv-label', label));
      const valueRow = el('div', 'br-kv-val');
      valueRow.append(el('span', 'br-kv-text', value));
      box.append(valueRow);
      if (detail) box.append(el('span', 'br-card-desc', detail));
      usageGrid.append(box);
    };
    const successPercent = requestCount > 0 ? Math.round((successfulCount / requestCount) * 100) : null;
    addMetric('Requests', numberFormat.format(requestCount), 'Stored request records');
    addMetric('Success rate', successPercent === null ? '—' : successPercent + '%', numberFormat.format(successfulCount) + ' successful');
    addMetric('Errors', numberFormat.format(failedCount), numberFormat.format(rateLimitedCount) + ' rate-limited (429)');
    addMetric('Fallbacks', numberFormat.format(fallbackCount), 'Requests answered by a fallback model');
    addMetric('Average latency', avgLatencyMs === null ? '—' : avgLatencyMs + ' ms', 'Across stored requests');
    addMetric(
      'Reported tokens',
      tokenReportedRequests > 0 ? numberFormat.format(totalTokenTotal) : 'Not reported',
      tokenReportedRequests > 0
        ? numberFormat.format(inputTokenTotal) + ' input · ' + numberFormat.format(outputTokenTotal) +
          ' output · reported on ' + tokenReportedRequests + '/' + requestCount + ' requests'
        : 'No upstream token usage was available in this history',
    );
    usageCard.append(usageGrid);

    // 4. Recent Calls Card
    const { card: activityCard } = card(
      root,
      'Recent Calls',
      'The most recent request metadata is stored locally; prompts, tool output, and response bodies are not saved.',
    );

    if (state.requests.length === 0) {
      const emptyNote = el(
        'p',
        'br-card-desc',
        'No requests yet. Calls from OpenCode or other clients will appear here.',
      );
      activityCard.append(emptyNote);
    } else {
      const feed = el('div');
      for (const entry of state.requests.slice(0, 8)) {
        const item = el('div', 'br-call-row');
        const itemLeft = el('div', 'br-call-left');
        const badge = el(
          'span',
          `br-badge ${entry.status >= 200 && entry.status < 300 ? 'br-badge-running' : 'br-badge-stopped'}`,
          String(entry.status),
        );
        itemLeft.append(badge);
        const modelLabel = entry.requestedModel && entry.requestedModel !== entry.model
          ? entry.requestedModel + ' → ' + (entry.model || entry.path)
          : entry.model || entry.path;
        itemLeft.append(el('span', 'br-call-name', modelLabel));
        if (entry.poolName) {
          itemLeft.append(el('span', 'br-badge br-badge-neutral', entry.poolName));
        }
        if (entry.fallbackUsed) {
          itemLeft.append(el('span', 'br-badge br-badge-primary', 'Fallback'));
        }
        item.append(itemLeft);
        const callMeta: string[] = [];
        if (entry.totalTokens !== undefined) {
          callMeta.push(numberFormat.format(entry.totalTokens) + ' tokens');
        } else if (entry.inputTokens !== undefined || entry.outputTokens !== undefined) {
          const partialTokens = (entry.inputTokens ?? 0) + (entry.outputTokens ?? 0);
          callMeta.push(numberFormat.format(partialTokens) + ' reported tokens');
        }
        callMeta.push(entry.ms + 'ms');
        item.append(el('span', 'br-call-ms', callMeta.join(' · ')));
        feed.append(item);
        if (entry.fallbackReason) {
          const reason = el('p', 'br-card-desc', 'Fallback reason: ' + entry.fallbackReason);
          reason.style.margin = '0 0 8px 0';
          feed.append(reason);
        }
      }
      activityCard.append(feed);
    }
  };

  return {
    element: root,
    render,
  };
};
