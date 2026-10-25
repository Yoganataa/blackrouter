import type { HostClient } from '@openchamber/sdk';
import { mountBanner } from '@openchamber/sdk/ui';

import type { Store } from '../store.ts';
import { btn, card, el, stack } from '../ui/dom.ts';

type PanelHost = Pick<HostClient, 'toast' | 'writeClipboard'>;

export const createOpenCodeView = (store: Store, host: PanelHost) => {
  const root = stack(document.createElement('div'));
  let confirmRemove = false;

  const copy = async (text: string, label: string): Promise<void> => {
    try {
      await host.writeClipboard(text);
      await host.toast({ kind: 'success', message: `${label} copied.` });
    } catch {
      await host.toast({ kind: 'error', message: 'Failed to copy.' });
    }
  };

  const run = async (action: Parameters<Store['run']>[0], done: string): Promise<void> => {
    confirmRemove = false;
    await store.run(action);
    if (store.error()) {
      await host.toast({ kind: 'error', message: store.error() });
    } else {
      await host.toast({ kind: 'success', message: done });
    }
    render();
  };

  const render = (): void => {
    root.replaceChildren();
    const state = store.state();
    if (!state) return;

    // Card 1: Registration Status Hero
    const { card: regCard } = card(
      root,
      'OpenCode Provider Registration',
      'BlackRouter registers this local endpoint directly into OpenCode’s configuration file.',
    );

    for (const warning of state.warnings) {
      const bannerBox = el('div');
      mountBanner(bannerBox, { tone: 'warning', title: 'File warning', body: warning });
      regCard.append(bannerBox);
    }

    const hero = el('div', 'br-opencode-hero');
    const desc = el('div', 'br-opencode-desc');

    const statusBadge = el(
      'span',
      `br-badge ${state.registration.installed ? 'br-badge-running' : 'br-badge-neutral'}`,
      state.registration.installed ? 'Registered' : 'Not Registered',
    );
    const titleRow = el('div', 'br-row');
    titleRow.append(statusBadge);
    titleRow.append(el('span', 'br-mono', state.registration.path));
    desc.append(titleRow);

    const subText = el(
      'span',
      'br-muted',
      state.registration.installed
        ? `${state.registration.models} free model${state.registration.models === 1 ? '' : 's'} registered in OpenCode config.`
        : 'Click register to add BlackRouter into your active OpenCode configuration.',
    );
    desc.append(subText);
    hero.append(desc);

    const actions = el('div', 'br-row');
    if (state.registration.installed) {
      btn(
        actions,
        'Update Provider',
        () =>
          void run(
            (service) => service.register(),
            'Provider updated in OpenCode config.',
          ),
        'primary',
      );
      btn(
        actions,
        confirmRemove ? 'Confirm Remove?' : 'Remove',
        () => {
          if (!confirmRemove) {
            confirmRemove = true;
            render();
            return;
          }
          void run(
            (service) => service.unregister(),
            'Provider removed from OpenCode config.',
          );
        },
        confirmRemove ? 'destructive' : 'default',
      );
    } else {
      const regBtn = btn(
        actions,
        'Register in OpenCode',
        () =>
          void run(
            (service) => service.register(),
            'Provider added to OpenCode config.',
          ),
        'primary',
      );
      regBtn.disabled = state.models.length === 0;
    }
    hero.append(actions);
    regCard.append(hero);

    // Card 2: Generated Provider JSON Preview
    const { card: previewCard } = card(
      root,
      'Config Block Preview',
      'The exact JSON configuration written to OpenCode.',
    );

    const codeBlock = el('pre', 'br-json-block', state.preview);
    previewCard.append(codeBlock);

    const previewActions = el('div', 'br-row');
    btn(previewActions, 'Copy JSON Block', () => void copy(state.preview, 'Config block'));
    previewCard.append(previewActions);
  };

  return {
    element: root,
    render,
  };
};
