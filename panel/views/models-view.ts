import type { HostClient } from '@openchamber/sdk';
import { mountBanner, mountCheckbox, mountEmpty } from '@openchamber/sdk/ui';

import type { RouterState, TestModelResult } from '../../contract.ts';
import type { ServiceClient } from '../client.ts';
import type { Store } from '../store.ts';
import { btn, card, el, stack } from '../ui/dom.ts';

const clockOf = (at: number | null): string => (at === null ? 'never' : new Date(at).toLocaleTimeString());

const formatTokens = (tokens: number): string => {
  if (tokens >= 1_000_000) {
    if (tokens === 1_000_000 || tokens === 1_048_576) return '1M';
    const m = tokens / 1_000_000;
    return `${m.toFixed(m % 1 === 0 ? 0 : 1)}M`;
  }
  if (tokens >= 1000) {
    if (tokens % 1000 === 0) return `${tokens / 1000}k`;
    return `${Math.round(tokens / 1024)}k`;
  }
  return `${tokens}`;
};

type PanelHost = Pick<HostClient, 'toast'>;

export const createModelsView = (
  store: Store,
  client: Pick<ServiceClient, 'testModel'>,
  host: PanelHost,
) => {
  const root = stack(document.createElement('div'));
  let failure = '';
  let searchQuery = '';
  let testingModelId: string | null = null;
  const testResults: Record<string, TestModelResult> = {};

  const selectedIds = (state: RouterState): string[] =>
    state.config.selectedModels.length > 0
      ? state.config.selectedModels
      : state.models.map((model) => model.id);

  const save = async (ids: string[]): Promise<void> => {
    failure = '';
    await store.run((service) => service.patchConfig({ selectedModels: ids }));
    render();
  };

  const toggle = (state: RouterState, id: string, checked: boolean): void => {
    const current = selectedIds(state);
    if (!checked && current.length <= 1) {
      failure = 'Keep at least one free model selected so OpenCode has an endpoint to call.';
      render();
      return;
    }
    const next = checked ? [...current, id] : current.filter((entry) => entry !== id);
    void save(next);
  };

  const selectAll = (state: RouterState): void => {
    void save(state.models.map((m) => m.id));
  };

  const clearSelection = (state: RouterState): void => {
    if (state.models.length > 0) {
      void save([state.models[0]!.id]);
    }
  };

  const refresh = async (): Promise<void> => {
    failure = '';
    await store.run((service) => service.refreshModels());
    if (store.error()) {
      await host.toast({ kind: 'error', message: store.error() });
    }
    render();
  };

  const render = (): void => {
    root.replaceChildren();
    const state = store.state();
    if (!state) return;

    const { card: modelsCard } = card(
      root,
      'OpenCode Zen Free Catalog',
      'Select the free models OpenCode and clients can call. Paid models are filtered out.',
    );

    if (state.modelsError) {
      const bannerBox = el('div');
      mountBanner(bannerBox, {
        tone: 'warning',
        title: 'Could not refresh catalog',
        body: state.modelsError,
      });
      modelsCard.append(bannerBox);
    }

    if (failure) {
      const bannerBox = el('div');
      mountBanner(bannerBox, { tone: 'error', title: 'Selection notice', body: failure });
      modelsCard.append(bannerBox);
    }

    if (state.models.length === 0) {
      mountEmpty(modelsCard, {
        title: 'No free models detected',
        body: 'Refresh the list. If it stays empty, check the upstream and any relay configured.',
        action: {
          label: 'Refresh',
          onClick: () => void refresh(),
        },
      });
      return;
    }

    // Search bar
    const searchInput = el('input', 'br-search-input') as HTMLInputElement;
    searchInput.type = 'text';
    searchInput.placeholder = 'Search free models by name or id...';
    searchInput.value = searchQuery;
    searchInput.oninput = () => {
      searchQuery = searchInput.value.toLowerCase();
      updateList();
    };
    modelsCard.append(searchInput);

    // Toolbar summary
    const toolbar = el('div', 'br-row between');
    const selected = selectedIds(state);

    const summaryText = el(
      'span',
      'br-muted br-mono',
      `${selected.length} of ${state.models.length} active · Updated ${clockOf(state.modelsFetchedAt)}`,
    );
    toolbar.append(summaryText);

    const actions = el('div', 'br-row');
    btn(actions, 'Select All', () => selectAll(state));
    btn(actions, 'Reset', () => clearSelection(state));
    btn(actions, 'Refresh List', () => void refresh());
    toolbar.append(actions);
    modelsCard.append(toolbar);

    // Grid container
    const grid = el('div', 'br-models-grid');
    modelsCard.append(grid);

    const updateList = (): void => {
      grid.replaceChildren();
      const filtered = state.models.filter(
        (m) =>
          m.id.toLowerCase().includes(searchQuery) || m.name.toLowerCase().includes(searchQuery),
      );

      if (filtered.length === 0) {
        const noMatch = el('p', 'br-muted', 'No free models match your filter.');
        grid.append(noMatch);
        return;
      }

      for (const model of filtered) {
        const isSelected = selected.includes(model.id);
        const cardItem = el('div', `br-model-card ${isSelected ? 'selected' : ''}`);

        const info = el('div', 'br-model-card-info');
        info.append(el('span', 'br-model-name', model.name));
        info.append(el('span', 'br-model-id', model.id));

        const badgeRow = el('div', 'br-row');
        badgeRow.style.gap = '4px';
        badgeRow.style.marginTop = '4px';

        const ctx = model.limit?.context ? formatTokens(model.limit.context) : '128k';
        badgeRow.append(el('span', 'br-badge br-badge-neutral', `${ctx} ctx`));

        if (model.limit?.output) {
          const out = formatTokens(model.limit.output);
          badgeRow.append(el('span', 'br-badge br-badge-neutral', `${out} out`));
        }

        if (model.capabilities?.input?.includes('image')) {
          badgeRow.append(el('span', 'br-badge br-badge-neutral', 'Vision'));
        }
        if (model.variants && model.variants.length > 0) {
          badgeRow.append(el('span', 'br-badge br-badge-running', 'Thinking'));
        }
        if (model.capabilities?.tools) {
          badgeRow.append(el('span', 'br-badge br-badge-neutral', 'Tools'));
        }
        info.append(badgeRow);

        cardItem.append(info);

        const rightSlot = el('div', 'br-model-right');

        const testRes = testResults[model.id];
        if (testRes) {
          if (testRes.ok) {
            rightSlot.append(el('span', 'br-badge br-badge-running', `${testRes.elapsedMs ?? 0}ms ✓`));
          } else {
            const failBadge = el('span', 'br-badge br-badge-stopped', 'Failed ✗');
            failBadge.title = testRes.error || 'Test failed';
            rightSlot.append(failBadge);
          }
        }

        const isTesting = testingModelId === model.id;
        const testBtn = btn(rightSlot, isTesting ? 'Testing...' : 'Test', async (e) => {
          e.stopPropagation();
          testingModelId = model.id;
          updateList();
          try {
            const res = await client.testModel(model.id);
            testResults[model.id] = res;
            if (res.ok) {
              await host.toast({
                kind: 'success',
                message: `${model.name}: Test passed (${res.elapsedMs ?? 0}ms). "${res.reply?.slice(0, 40) || 'OK'}"`,
              });
            } else {
              await host.toast({
                kind: 'error',
                message: `${model.name}: ${res.error || 'Test failed.'}`,
              });
            }
          } catch (err) {
            testResults[model.id] = { ok: false, modelId: model.id, error: String(err) };
            await host.toast({
              kind: 'error',
              message: err instanceof Error ? err.message : String(err),
            });
          } finally {
            testingModelId = null;
            updateList();
          }
        });
        testBtn.disabled = isTesting;

        const checkSlot = el('div');
        mountCheckbox(checkSlot, {
          label: '',
          checked: isSelected,
          onChange: (next) => toggle(state, model.id, next),
        });
        rightSlot.append(checkSlot);
        cardItem.append(rightSlot);

        cardItem.onclick = (e) => {
          if ((e.target as HTMLElement).closest('input, button')) return;
          toggle(state, model.id, !isSelected);
        };

        grid.append(cardItem);
      }
    };

    updateList();
  };

  return {
    element: root,
    render,
  };
};
