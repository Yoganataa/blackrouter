import type { HostClient } from '@openchamber/sdk';
import { mountBanner, mountCheckbox, mountEmpty } from '@openchamber/sdk/ui';

import type { ModelCombo, RouterState, TestModelResult } from '../../contract.ts';
import type { ServiceClient } from '../client.ts';
import type { Store } from '../store.ts';
import { btn, card, el, stack } from '../ui/dom.ts';

const clockOf = (at: number | null): string => (at === null ? 'never' : new Date(at).toLocaleTimeString());

const canonicalModel = (id: string): string => {
  const trimmed = id.trim().replace(/\([^()]+\)\s*$/, '');
  return (trimmed.startsWith('blackrouter/') ? trimmed.slice('blackrouter/'.length) : trimmed).toLowerCase();
};

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
  let comboEditorOpen = false;
  let editingComboId: string | null = null;
  let comboDraftId = '';
  let comboDraftName = '';
  let comboDraftModels: string[] = [];
  let comboMemberToAdd = '';

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

  const saveFallbacks = async (ids: string[]): Promise<void> => {
    failure = '';
    await store.run((service) => service.patchConfig({ fallbackModels: ids.slice(0, 2) }));
    if (store.error()) {
      failure = store.error();
      render();
      return;
    }
    await host.toast({ kind: 'success', message: 'Model fallback order saved.' });
    render();
  };

  const saveModelCombos = async (combos: ModelCombo[]): Promise<void> => {
    failure = '';
    await store.run((service) => service.patchConfig({ modelCombos: combos }));
    if (store.error()) {
      failure = store.error();
      render();
      return;
    }
    comboEditorOpen = false;
    editingComboId = null;
    comboDraftId = '';
    comboDraftName = '';
    comboDraftModels = [];
    comboMemberToAdd = '';
    await host.toast({ kind: 'success', message: 'Named model combo saved.' });
    render();
  };

  const beginComboEdit = (combo?: ModelCombo): void => {
    failure = '';
    comboEditorOpen = true;
    editingComboId = combo?.id ?? null;
    comboDraftId = combo?.id ?? '';
    comboDraftName = combo?.name ?? '';
    comboDraftModels = combo ? [...combo.models] : [];
    comboMemberToAdd = '';
    render();
  };

  const saveComboDraft = async (combos: ModelCombo[]): Promise<void> => {
    const id = comboDraftId.trim().toLowerCase();
    const name = comboDraftName.trim();
    if (!/^[a-z0-9][a-z0-9._-]{0,39}$/.test(id)) {
      failure = 'Combo ID must be a lowercase slug (letters, numbers, dot, underscore, hyphen).';
      render();
      return;
    }
    if (!name || name.length > 80) {
      failure = 'Enter a combo name of 1–80 characters.';
      render();
      return;
    }
    if (comboDraftModels.length < 2 || comboDraftModels.length > 6) {
      failure = 'A named combo needs 2–6 models in priority order.';
      render();
      return;
    }
    const memberKeys = comboDraftModels.map(canonicalModel);
    if (new Set(memberKeys).size !== memberKeys.length) {
      failure = 'A model can appear only once in a combo.';
      render();
      return;
    }
    if (combos.some((combo) => combo.id.toLowerCase() === id && combo.id !== editingComboId)) {
      failure = 'That combo ID already exists.';
      render();
      return;
    }
    const nextCombo: ModelCombo = { id, name, models: [...comboDraftModels] };
    const next = editingComboId
      ? combos.map((combo) => combo.id === editingComboId ? nextCombo : combo)
      : [...combos, nextCombo];
    await saveModelCombos(next);
  };

  const removeCombo = async (id: string): Promise<void> => {
    const state = store.state();
    if (!state) return;
    await saveModelCombos((state.config.modelCombos ?? []).filter((combo) => combo.id !== id));
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

    // Keep this small routing control in the same model view as the catalog.
    const { card: fallbackCard } = card(
      root,
      'Automatic Model Fallback',
      'If a request fails with a retryable upstream error, BlackRouter tries these models in order. The requested model is always attempted first.',
    );

    const configuredFallbacks = state.config.fallbackModels ?? [];
    if (configuredFallbacks.length === 0) {
      fallbackCard.append(el('p', 'br-muted', 'No fallback models configured. Failed requests will return the upstream error.'));
    }

    const fallbackList = el('div', 'br-stack');
    for (let index = 0; index < configuredFallbacks.length; index += 1) {
      const modelId = configuredFallbacks[index]!;
      const model = state.models.find((entry) => canonicalModel(entry.id) === canonicalModel(modelId));
      const fallbackRow = el('div', 'br-row between');
      fallbackRow.style.alignItems = 'center';
      const info = el('div', 'br-stack');
      info.append(el('span', 'br-model-name', `${index + 1}. ${model?.name ?? modelId}`));
      info.append(el('span', 'br-model-id', modelId));
      fallbackRow.append(info);

      const actions = el('div', 'br-row');
      const up = btn(actions, 'Move up', () => {
        if (index === 0) return;
        const next = [...configuredFallbacks];
        [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
        void saveFallbacks(next);
      });
      up.disabled = index === 0;
      const down = btn(actions, 'Move down', () => {
        if (index >= configuredFallbacks.length - 1) return;
        const next = [...configuredFallbacks];
        [next[index + 1], next[index]] = [next[index]!, next[index + 1]!];
        void saveFallbacks(next);
      });
      down.disabled = index >= configuredFallbacks.length - 1;
      btn(actions, 'Remove', () => {
        void saveFallbacks(configuredFallbacks.filter((_, itemIndex) => itemIndex !== index));
      });
      fallbackRow.append(actions);
      fallbackList.append(fallbackRow);
    }
    fallbackCard.append(fallbackList);

    const used = new Set(configuredFallbacks.map(canonicalModel));
    const fallbackOptions = state.models.filter((model) => !used.has(canonicalModel(model.id)));
    const addRow = el('div', 'br-row');
    const picker = el('select', 'br-search-input') as HTMLSelectElement;
    picker.style.flex = '1';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = fallbackOptions.length > 0 ? 'Choose a fallback model…' : 'No additional models available';
    picker.append(placeholder);
    for (const model of fallbackOptions) {
      const option = document.createElement('option');
      option.value = model.id;
      option.textContent = model.name;
      picker.append(option);
    }
    picker.disabled = configuredFallbacks.length >= 2 || fallbackOptions.length === 0;
    addRow.append(picker);
    const addBtn = btn(addRow, 'Add fallback', () => {
      if (!picker.value || configuredFallbacks.length >= 2) return;
      void saveFallbacks([...configuredFallbacks, picker.value]);
    }, 'primary');
    addBtn.disabled = picker.disabled;
    fallbackCard.append(addRow);
    fallbackCard.append(el('p', 'br-muted', 'Fallbacks are tried only for HTTP 404, 408, 429, 500, 502, 503, or 504. Up to two fallback models are allowed per request.'));

    // Named fallback combos mirror the useful core of 9Router Combos: each
    // alias has its own bounded, ordered model chain and is registered in OpenCode.
    const { card: combosCard } = card(
      root,
      'Named Model Combos',
      'Create a reusable model alias with its own ordered fallback chain. In OpenCode, use blackrouter/combo/<id>.',
    );
    const configuredCombos = state.config.modelCombos ?? [];
    if (configuredCombos.length === 0) {
      combosCard.append(el('p', 'br-muted', 'No named combos yet. Each combo can contain 2–6 free models and is limited to a maximum of 20 combos.'));
    }

    for (const combo of configuredCombos) {
      const comboRow = el('div', 'br-stack');
      comboRow.style.gap = '6px';
      comboRow.style.padding = '10px 0';
      comboRow.style.borderBottom = '1px solid var(--border-subtle, rgba(127,127,127,.22))';
      const header = el('div', 'br-row between');
      const identity = el('div', 'br-stack');
      identity.append(el('span', 'br-model-name', combo.name));
      identity.append(el('span', 'br-model-id', 'blackrouter/combo/' + combo.id));
      header.append(identity);
      const actions = el('div', 'br-row');
      btn(actions, 'Edit', () => beginComboEdit(combo));
      btn(actions, 'Remove', () => void removeCombo(combo.id));
      header.append(actions);
      comboRow.append(header);
      combo.models.forEach((modelId, index) => {
        const model = state.models.find((entry) => canonicalModel(entry.id) === canonicalModel(modelId));
        comboRow.append(el('span', 'br-muted', (index + 1) + '. ' + (model?.name ?? modelId)));
      });
      combosCard.append(comboRow);
    }

    if (comboEditorOpen) {
      const editor = el('div', 'br-stack');
      editor.style.gap = '8px';
      editor.style.marginTop = '10px';
      const idInput = el('input', 'br-search-input') as HTMLInputElement;
      idInput.type = 'text';
      idInput.maxLength = 40;
      idInput.placeholder = 'combo-id (e.g. fast-coding)';
      idInput.value = comboDraftId;
      idInput.disabled = editingComboId !== null;
      idInput.oninput = () => { comboDraftId = idInput.value.toLowerCase(); };
      editor.append(el('label', 'br-muted', 'Combo ID'));
      editor.append(idInput);

      const nameInput = el('input', 'br-search-input') as HTMLInputElement;
      nameInput.type = 'text';
      nameInput.maxLength = 80;
      nameInput.placeholder = 'Display name';
      nameInput.value = comboDraftName;
      nameInput.oninput = () => { comboDraftName = nameInput.value; };
      editor.append(el('label', 'br-muted', 'Display name'));
      editor.append(nameInput);

      editor.append(el('label', 'br-muted', 'Priority order · ' + comboDraftModels.length + '/6 models'));
      const memberList = el('div', 'br-stack');
      for (let index = 0; index < comboDraftModels.length; index += 1) {
        const modelId = comboDraftModels[index]!;
        const model = state.models.find((entry) => canonicalModel(entry.id) === canonicalModel(modelId));
        const memberRow = el('div', 'br-row between');
        const memberInfo = el('div', 'br-stack');
        memberInfo.append(el('span', 'br-model-name', (index + 1) + '. ' + (model?.name ?? modelId)));
        memberInfo.append(el('span', 'br-model-id', modelId));
        memberRow.append(memberInfo);
        const memberActions = el('div', 'br-row');
        const upMember = btn(memberActions, '↑', () => {
          if (index === 0) return;
          [comboDraftModels[index - 1], comboDraftModels[index]] = [comboDraftModels[index]!, comboDraftModels[index - 1]!];
          render();
        });
        upMember.title = 'Move model up';
        upMember.disabled = index === 0;
        const downMember = btn(memberActions, '↓', () => {
          if (index >= comboDraftModels.length - 1) return;
          [comboDraftModels[index + 1], comboDraftModels[index]] = [comboDraftModels[index]!, comboDraftModels[index + 1]!];
          render();
        });
        downMember.title = 'Move model down';
        downMember.disabled = index >= comboDraftModels.length - 1;
        btn(memberActions, 'Remove', () => {
          comboDraftModels = comboDraftModels.filter((_, memberIndex) => memberIndex !== index);
          render();
        });
        memberRow.append(memberActions);
        memberList.append(memberRow);
      }
      editor.append(memberList);

      const existingMembers = new Set(comboDraftModels.map(canonicalModel));
      const options = state.models.filter((model) => !existingMembers.has(canonicalModel(model.id)));
      const memberAddRow = el('div', 'br-row');
      const memberPicker = el('select', 'br-search-input') as HTMLSelectElement;
      memberPicker.style.flex = '1';
      const memberPlaceholder = document.createElement('option');
      memberPlaceholder.value = '';
      memberPlaceholder.textContent = options.length > 0 ? 'Choose a free model…' : 'No additional models available';
      memberPicker.append(memberPlaceholder);
      for (const model of options) {
        const option = document.createElement('option');
        option.value = model.id;
        option.textContent = model.name;
        memberPicker.append(option);
      }
      memberPicker.value = comboMemberToAdd;
      memberPicker.disabled = comboDraftModels.length >= 6 || options.length === 0;
      memberAddRow.append(memberPicker);
      const addMemberBtn = btn(memberAddRow, 'Add model', () => {
        if (!comboMemberToAdd || comboDraftModels.length >= 6) return;
        comboDraftModels = [...comboDraftModels, comboMemberToAdd];
        comboMemberToAdd = '';
        render();
      });
      memberPicker.onchange = () => {
        comboMemberToAdd = memberPicker.value;
        addMemberBtn.disabled = memberPicker.disabled || !comboMemberToAdd;
      };
      addMemberBtn.disabled = memberPicker.disabled || !comboMemberToAdd;
      memberAddRow.append(addMemberBtn);
      editor.append(memberAddRow);

      const editorActions = el('div', 'br-row');
      btn(editorActions, 'Save Combo', () => void saveComboDraft(configuredCombos), 'primary');
      btn(editorActions, 'Cancel', () => {
        comboEditorOpen = false;
        editingComboId = null;
        comboDraftId = '';
        comboDraftName = '';
        comboDraftModels = [];
        comboMemberToAdd = '';
        render();
      });
      editor.append(editorActions);
      combosCard.append(editor);
    } else {
      const addComboBtn = btn(combosCard, 'Create Model Combo', () => beginComboEdit(), 'primary');
      addComboBtn.disabled = configuredCombos.length >= 20;
    }

  };

  return {
    element: root,
    render,
  };
};
