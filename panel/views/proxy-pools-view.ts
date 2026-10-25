import type { HostClient } from '@openchamber/sdk';
import {
  mountBanner,
  mountTextField,
} from '@openchamber/sdk/ui';

import type { ProxyPool, ProxyPoolType, ProxyStrategy } from '../../contract.ts';
import type { ServiceClient } from '../client.ts';
import type { Store } from '../store.ts';
import { btn, card, el, stack } from '../ui/dom.ts';

type PanelHost = Pick<HostClient, 'writeClipboard' | 'toast'>;

type DeployTab = 'cloudflare' | 'vercel' | 'deno' | 'netlify' | 'http';

const DEPLOY_TABS: Array<{ id: DeployTab; label: string }> = [
  { id: 'cloudflare', label: 'Cloudflare Worker' },
  { id: 'vercel', label: 'Vercel Edge' },
  { id: 'deno', label: 'Deno Deploy' },
  { id: 'netlify', label: 'Netlify Function' },
  { id: 'http', label: 'Forward Proxy' },
];

export const createProxyPoolsView = (store: Store, client: ServiceClient, host: PanelHost) => {
  const root = stack(document.createElement('div'));
  let showDeployDrawer = false;
  let activeTab: DeployTab = 'cloudflare';
  let isSubmitting = false;
  let formError = '';
  let testingPoolId: string | null = null;

  // Form states
  const manualForm = { name: '', type: 'http' as ProxyPoolType, proxyUrl: '' };
  const cfForm = { accountId: '', apiToken: '', projectName: '' };
  const vercelForm = { vercelToken: '', projectName: '' };
  const denoForm = { denoToken: '', orgDomain: '', projectName: '' };
  const netlifyForm = { netlifyToken: '', projectName: '' };

  const copy = async (text: string, label: string): Promise<void> => {
    try {
      await host.writeClipboard(text);
      await host.toast({ kind: 'success', message: `${label} copied.` });
    } catch {
      formError = 'The clipboard refused the copy.';
      render();
    }
  };

  const copyRelaySource = async (type: ProxyPoolType): Promise<void> => {
    try {
      const source = await client.relaySource(type);
      await copy(source.code, `${type} relay code`);
    } catch (err) {
      await host.toast({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    }
  };

  const submitDeploy = async (): Promise<void> => {
    isSubmitting = true;
    formError = '';
    render();

    try {
      if (activeTab === 'http') {
        if (!manualForm.name.trim() || !manualForm.proxyUrl.trim()) {
          throw new Error('Name and Proxy URL are required.');
        }
        await store.run((s) =>
          s.createProxyPool({
            name: manualForm.name.trim(),
            type: 'http',
            proxyUrl: manualForm.proxyUrl.trim(),
            isActive: true,
          }),
        );
        manualForm.name = '';
        manualForm.proxyUrl = '';
      } else if (activeTab === 'cloudflare') {
        if (!cfForm.accountId.trim() || !cfForm.apiToken.trim()) {
          throw new Error('Cloudflare Account ID and API Token are required.');
        }
        await store.run((s) =>
          s.deployCloudflare({
            accountId: cfForm.accountId.trim(),
            apiToken: cfForm.apiToken.trim(),
            projectName: cfForm.projectName.trim() || undefined,
          }),
        );
        cfForm.accountId = '';
        cfForm.apiToken = '';
        cfForm.projectName = '';
      } else if (activeTab === 'vercel') {
        if (!vercelForm.vercelToken.trim()) {
          throw new Error('Vercel API Token is required.');
        }
        await store.run((s) =>
          s.deployVercel({
            vercelToken: vercelForm.vercelToken.trim(),
            projectName: vercelForm.projectName.trim() || undefined,
          }),
        );
        vercelForm.vercelToken = '';
        vercelForm.projectName = '';
      } else if (activeTab === 'deno') {
        if (!denoForm.denoToken.trim() || !denoForm.orgDomain.trim()) {
          throw new Error('Deno Deploy Token and Organization Domain are required.');
        }
        await store.run((s) =>
          s.deployDeno({
            denoToken: denoForm.denoToken.trim(),
            orgDomain: denoForm.orgDomain.trim(),
            projectName: denoForm.projectName.trim() || undefined,
          }),
        );
        denoForm.denoToken = '';
        denoForm.orgDomain = '';
        denoForm.projectName = '';
      } else if (activeTab === 'netlify') {
        if (!netlifyForm.netlifyToken.trim()) {
          throw new Error('Netlify API Token is required.');
        }
        await store.run((s) =>
          s.deployNetlify({
            netlifyToken: netlifyForm.netlifyToken.trim(),
            projectName: netlifyForm.projectName.trim() || undefined,
          }),
        );
        netlifyForm.netlifyToken = '';
        netlifyForm.projectName = '';
      }

      showDeployDrawer = false;
      await host.toast({ kind: 'success', message: 'Relay configured and activated.' });
    } catch (err) {
      formError = err instanceof Error ? err.message : String(err);
    } finally {
      isSubmitting = false;
      render();
    }
  };

  const togglePoolActive = async (pool: ProxyPool): Promise<void> => {
    await store.run((s) => s.updateProxyPool(pool.id, { isActive: !pool.isActive }));
  };

  const setStrategy = async (strategy: ProxyStrategy): Promise<void> => {
    await store.run((s) => s.patchConfig({ proxyStrategy: strategy }));
    await host.toast({ kind: 'info', message: `Routing strategy set to ${strategy}.` });
  };

  const setStickyLimit = async (limit: number): Promise<void> => {
    await store.run((s) => s.patchConfig({ stickyLimit: limit }));
  };

  const setPrimaryPool = async (pool: ProxyPool): Promise<void> => {
    const s = store.state();
    if (!s) return;
    const updated = s.config.proxyPools.map((p) => ({ ...p, isActive: p.id === pool.id }));
    await store.run((st) =>
      st.patchConfig({
        proxyPools: updated,
        activePoolId: pool.id,
        proxyStrategy: 'single',
      }),
    );
    await host.toast({ kind: 'success', message: `${pool.name} set as primary route.` });
  };

  const switchToDirect = async (): Promise<void> => {
    const state = store.state();
    if (!state) return;
    const deactivated = state.config.proxyPools.map((p) => ({ ...p, isActive: false }));
    await store.run((s) => s.patchConfig({ activePoolId: null, proxyPools: deactivated }));
    await host.toast({ kind: 'info', message: 'Switched to direct routing.' });
  };

  const deletePool = async (poolId: string): Promise<void> => {
    await store.run((s) => s.deleteProxyPool(poolId));
    await host.toast({ kind: 'success', message: 'Proxy pool removed.' });
  };

  const testPool = async (poolId: string): Promise<void> => {
    testingPoolId = poolId;
    render();
    try {
      const res = await client.testProxyPool(poolId);
      await store.load();
      if (res.ok) {
        await host.toast({ kind: 'success', message: `Relay test passed (${res.elapsedMs || 0}ms).` });
      } else {
        await host.toast({ kind: 'error', message: res.error || 'Relay test failed.' });
      }
    } catch (err) {
      await host.toast({ kind: 'error', message: err instanceof Error ? err.message : String(err) });
    } finally {
      testingPoolId = null;
      render();
    }
  };

  const render = (): void => {
    root.replaceChildren();
    const state = store.state();
    if (!state) return;

    const currentStrategy = state.config.proxyStrategy || 'single';
    const stickyLimit = state.config.stickyLimit ?? 1;

    // Card 1: Upstream Route & Strategy
    const { card: routeCard } = card(
      root,
      'Upstream Routing & Strategy',
      'Select whether calls go directly, through a dedicated relay, or load-balance across pools.',
    );

    // Strategy Toolbar
    const toolbar = el('div', 'br-strategy-toolbar');
    const stratGroup = el('div', 'br-strategy-group');
    stratGroup.append(el('span', 'br-strategy-label', 'Strategy:'));

    const stratTabs = el('div', 'br-strategy-tabs');
    const strategies: Array<{ id: ProxyStrategy; label: string }> = [
      { id: 'single', label: 'Single Pool' },
      { id: 'round-robin', label: 'Round-Robin' },
      { id: 'random', label: 'Random' },
    ];
    for (const strat of strategies) {
      const tab = el(
        'button',
        `br-strategy-tab ${currentStrategy === strat.id ? 'active' : ''}`,
        strat.label,
      );
      tab.onclick = () => void setStrategy(strat.id);
      stratTabs.append(tab);
    }
    stratGroup.append(stratTabs);
    toolbar.append(stratGroup);

    if (currentStrategy === 'round-robin') {
      const stickyBox = el('div', 'br-sticky-control');
      stickyBox.append(el('span', '', 'Sticky Turns:'));
      const stickyInput = el('input', 'br-sticky-input') as HTMLInputElement;
      stickyInput.type = 'number';
      stickyInput.min = '1';
      stickyInput.max = '100';
      stickyInput.value = String(stickyLimit);
      stickyInput.onchange = () => {
        const val = Math.max(1, parseInt(stickyInput.value, 10) || 1);
        stickyInput.value = String(val);
        void setStickyLimit(val);
      };
      stickyBox.append(stickyInput);
      toolbar.append(stickyBox);
    }

    routeCard.append(toolbar);

    const activePools = state.config.proxyPools.filter((p) => p.isActive);
    const primaryPool =
      state.config.proxyPools.find((p) => p.id === state.config.activePoolId) ||
      state.config.proxyPools.find((p) => p.isActive);

    const routeRow = el('div', 'br-pool-card active');
    const routeLeft = el('div', 'br-pool-left');
    const routeInfo = el('div', 'br-pool-info');
    const routeTitleRow = el('div', 'br-pool-title-row');

    if (currentStrategy === 'round-robin') {
      routeTitleRow.append(el('span', 'br-pool-name', 'Round-Robin Load Balancing'));
      routeTitleRow.append(
        el(
          'span',
          activePools.length > 0 ? 'br-badge br-badge-primary' : 'br-badge br-badge-stopped',
          `${activePools.length} Pools Active`,
        ),
      );
      routeInfo.append(routeTitleRow);
      routeInfo.append(
        el(
          'span',
          'br-pool-url',
          activePools.length > 0
            ? `Sequentially rotating across ${activePools.length} active relays with ${stickyLimit} sticky turn(s) each.`
            : 'No relays active in pool. Falling back to direct connection.',
        ),
      );
    } else if (currentStrategy === 'random') {
      routeTitleRow.append(el('span', 'br-pool-name', 'Random Upstream Routing'));
      routeTitleRow.append(
        el(
          'span',
          activePools.length > 0 ? 'br-badge br-badge-primary' : 'br-badge br-badge-stopped',
          `${activePools.length} Pools Active`,
        ),
      );
      routeInfo.append(routeTitleRow);
      routeInfo.append(
        el(
          'span',
          'br-pool-url',
          activePools.length > 0
            ? `Distributing requests uniformly at random across ${activePools.length} active relays.`
            : 'No relays active in pool. Falling back to direct connection.',
        ),
      );
    } else {
      if (primaryPool) {
        routeTitleRow.append(el('span', 'br-pool-name', primaryPool.name));
        routeTitleRow.append(
          el(
            'span',
            'br-badge br-badge-primary',
            primaryPool.type === 'http' ? 'Forward Proxy' : `${primaryPool.type} Relay`,
          ),
        );
        routeInfo.append(routeTitleRow);
        routeInfo.append(el('span', 'br-pool-url', primaryPool.proxyUrl));
      } else {
        routeTitleRow.append(el('span', 'br-pool-name', 'Direct Connection'));
        routeTitleRow.append(el('span', 'br-badge br-badge-neutral', 'Direct'));
        routeInfo.append(routeTitleRow);
        routeInfo.append(
          el('span', 'br-pool-url', 'Direct requests from this machine to https://opencode.ai/zen/v1'),
        );
      }
    }
    routeLeft.append(routeInfo);
    routeRow.append(routeLeft);

    const routeActions = el('div', 'br-pool-actions');
    if (currentStrategy === 'single' && primaryPool) {
      btn(routeActions, 'Switch to Direct', () => void switchToDirect());
    }
    btn(
      routeActions,
      showDeployDrawer ? 'Close Form' : '+ Add / Deploy Relay',
      () => {
        showDeployDrawer = !showDeployDrawer;
        formError = '';
        render();
      },
      showDeployDrawer ? 'default' : 'primary',
    );
    routeRow.append(routeActions);
    routeCard.append(routeRow);

    // Deploy Drawer (when opened)
    if (showDeployDrawer) {
      const deployBox = el('div', 'br-deploy-box');

      if (formError) {
        const errorBanner = el('div');
        mountBanner(errorBanner, { tone: 'error', title: 'Deployment error', body: formError });
        deployBox.append(errorBanner);
      }

      const nav = el('div', 'br-deploy-nav');
      for (const tab of DEPLOY_TABS) {
        const tabBtn = el(
          'button',
          `br-deploy-tab ${activeTab === tab.id ? 'active' : ''}`,
          tab.label,
        );
        tabBtn.onclick = () => {
          activeTab = tab.id;
          formError = '';
          render();
        };
        nav.append(tabBtn);
      }
      deployBox.append(nav);

      // Tab contents
      const formFields = el('div', 'br-stack');
      deployBox.append(formFields);

      if (activeTab === 'cloudflare') {
        mountTextField(formFields, {
          label: 'Account ID',
          value: cfForm.accountId,
          placeholder: 'Cloudflare dashboard -> Overview',
          onChange: (v) => (cfForm.accountId = v),
        });
        mountTextField(formFields, {
          label: 'API Token',
          value: cfForm.apiToken,
          password: true,
          placeholder: 'Cloudflare Workers edit permissions',
          onChange: (v) => (cfForm.apiToken = v),
        });
        mountTextField(formFields, {
          label: 'Worker Name',
          value: cfForm.projectName,
          placeholder: 'blackrouter-relay (optional)',
          onChange: (v) => (cfForm.projectName = v),
        });
      } else if (activeTab === 'vercel') {
        mountTextField(formFields, {
          label: 'Vercel API Token',
          value: vercelForm.vercelToken,
          password: true,
          placeholder: 'Account Settings -> Tokens',
          onChange: (v) => (vercelForm.vercelToken = v),
        });
        mountTextField(formFields, {
          label: 'Project Name',
          value: vercelForm.projectName,
          placeholder: 'blackrouter-relay (optional)',
          onChange: (v) => (vercelForm.projectName = v),
        });
      } else if (activeTab === 'deno') {
        mountTextField(formFields, {
          label: 'Deno Access Token',
          value: denoForm.denoToken,
          password: true,
          placeholder: 'Deno Deploy -> Access Tokens',
          onChange: (v) => (denoForm.denoToken = v),
        });
        mountTextField(formFields, {
          label: 'Organization / Subdomain',
          value: denoForm.orgDomain,
          placeholder: 'your-org.deno.dev',
          onChange: (v) => (denoForm.orgDomain = v),
        });
        mountTextField(formFields, {
          label: 'Project Name',
          value: denoForm.projectName,
          placeholder: 'blackrouter-relay (optional)',
          onChange: (v) => (denoForm.projectName = v),
        });
      } else if (activeTab === 'netlify') {
        mountTextField(formFields, {
          label: 'Netlify Personal Access Token',
          value: netlifyForm.netlifyToken,
          password: true,
          placeholder: 'User Settings -> Applications',
          onChange: (v) => (netlifyForm.netlifyToken = v),
        });
        mountTextField(formFields, {
          label: 'Site Name',
          value: netlifyForm.projectName,
          placeholder: 'blackrouter-relay (optional)',
          onChange: (v) => (netlifyForm.projectName = v),
        });
      } else if (activeTab === 'http') {
        mountTextField(formFields, {
          label: 'Proxy Name',
          value: manualForm.name,
          placeholder: 'e.g. Clash / Corporate Proxy',
          onChange: (v) => (manualForm.name = v),
        });
        mountTextField(formFields, {
          label: 'Proxy URL',
          value: manualForm.proxyUrl,
          placeholder: 'http://127.0.0.1:7890 or http://user:pass@host:port',
          onChange: (v) => (manualForm.proxyUrl = v),
        });
      }

      const formActions = el('div', 'br-row');
      btn(
        formActions,
        isSubmitting ? 'Saving...' : activeTab === 'http' ? 'Add Proxy' : 'Deploy & Activate',
        () => void submitDeploy(),
        'primary',
      );
      if (activeTab !== 'http') {
        btn(formActions, 'Copy Standalone Script', () => void copyRelaySource(activeTab));
      }
      btn(formActions, 'Cancel', () => {
        showDeployDrawer = false;
        render();
      });
      deployBox.append(formActions);
      root.append(deployBox);
    }

    // Card 2: Registered Proxy Pools List
    const { card: listCard } = card(
      root,
      'Configured Proxy Pools',
      currentStrategy === 'single'
        ? 'Manage deployed relays. Click "Set Primary" to route calls through that relay.'
        : 'Manage deployed relays. Toggle relays to include or exclude them from the active rotation pool.',
    );

    if (state.config.proxyPools.length === 0) {
      const emptyNote = el(
        'p',
        'br-card-desc',
        'No proxy pools configured. Deploy one using the button above to route through Cloudflare, Vercel, Deno, Netlify, or Forward Proxy.',
      );
      listCard.append(emptyNote);
    } else {
      const poolGrid = el('div', 'br-pool-grid');
      for (const pool of state.config.proxyPools) {
        const isPrimary = state.config.activePoolId
          ? pool.id === state.config.activePoolId
          : pool.isActive;
        const isCardActive = currentStrategy === 'single' ? isPrimary : pool.isActive;
        const poolCard = el('div', `br-pool-card ${isCardActive ? 'active' : ''}`);

        const left = el('div', 'br-pool-left');
        const info = el('div', 'br-pool-info');
        const titleRow = el('div', 'br-pool-title-row');

        titleRow.append(el('span', 'br-pool-name', pool.name));
        titleRow.append(
          el(
            'span',
            'br-badge br-badge-neutral',
            pool.type === 'http' ? 'Forward Proxy' : `${pool.type} Relay`,
          ),
        );

        if (pool.testStatus === 'active') {
          titleRow.append(el('span', 'br-badge br-badge-running', 'Healthy'));
        } else if (pool.testStatus === 'error') {
          titleRow.append(el('span', 'br-badge br-badge-stopped', 'Failed'));
        }

        info.append(titleRow);
        info.append(el('span', 'br-pool-url', pool.proxyUrl));
        left.append(info);
        poolCard.append(left);

        const actions = el('div', 'br-pool-actions');
        if (currentStrategy === 'single') {
          btn(
            actions,
            isPrimary ? 'Primary ✓' : 'Set Primary',
            () => void setPrimaryPool(pool),
            isPrimary ? 'primary' : 'default',
          );
        } else {
          btn(
            actions,
            pool.isActive ? 'In Rotation ✓' : 'Add to Rotation',
            () => void togglePoolActive(pool),
            pool.isActive ? 'primary' : 'default',
          );
        }

        const isTesting = testingPoolId === pool.id;
        const testBtn = btn(actions, isTesting ? 'Testing...' : 'Test', () => void testPool(pool.id));
        testBtn.disabled = isTesting;

        if (pool.type !== 'http') {
          btn(actions, 'Copy Script', () => void copyRelaySource(pool.type));
        }
        btn(actions, 'Delete', () => void deletePool(pool.id), 'destructive');

        poolCard.append(actions);
        poolGrid.append(poolCard);
      }
      listCard.append(poolGrid);
    }
  };

  return {
    element: root,
    render,
  };
};
