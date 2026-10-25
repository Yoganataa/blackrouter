/** BlackRouter clean modern UI styles. */
export const STYLES = `
* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  background: var(--oc-bg);
  color: var(--oc-fg);
  font-family: var(--oc-font);
  font-size: 13px;
  line-height: 1.5;
}
button, input, textarea { font: inherit; color: inherit; }
[hidden] { display: none !important; }

.br-root {
  max-width: 920px;
  margin: 0 auto;
  padding: 16px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Header */
.br-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--oc-border);
}
.br-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.br-logo-box {
  width: 28px;
  height: 28px;
  border-radius: 7px;
  background: var(--oc-elevated);
  border: 1px solid var(--oc-border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.br-header-titles {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.br-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.br-title-row h1 {
  margin: 0;
  font-size: 15px;
  font-weight: 650;
  letter-spacing: -0.015em;
  color: var(--oc-fg);
}
.br-header-sub {
  margin: 0;
  font-size: 11px;
  color: var(--oc-muted);
}
.br-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Status Badges */
.br-badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 5px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 1px solid transparent;
  white-space: nowrap;
}
.br-badge-running {
  background: color-mix(in srgb, var(--oc-success) 12%, transparent);
  color: var(--oc-success-text);
  border-color: color-mix(in srgb, var(--oc-success) 24%, transparent);
}
.br-badge-stopped {
  background: color-mix(in srgb, var(--oc-error) 12%, transparent);
  color: var(--oc-error-text);
  border-color: color-mix(in srgb, var(--oc-error) 24%, transparent);
}
.br-badge-neutral {
  background: var(--oc-muted-surface);
  color: var(--oc-muted);
  border-color: var(--oc-border);
}
.br-badge-primary {
  background: color-mix(in srgb, var(--oc-primary) 12%, transparent);
  color: var(--oc-primary);
  border-color: color-mix(in srgb, var(--oc-primary) 24%, transparent);
}
.br-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.br-dot.on { background: var(--oc-success-text); }
.br-dot.off { background: var(--oc-error-text); }

/* Navigation Toolbar */
.br-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

/* Clean Cards */
.br-card {
  background: var(--oc-elevated, var(--oc-muted-surface));
  border: 1px solid var(--oc-border);
  border-radius: var(--oc-radius, 10px);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.br-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}
.br-card-title {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--oc-fg);
}
.br-card-desc {
  margin: 2px 0 0;
  font-size: 11.5px;
  color: var(--oc-muted);
}

/* KV Grid & Boxes */
.br-kv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 10px;
}
.br-kv-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  padding: 10px 12px;
}
.br-kv-label {
  font-size: 11px;
  color: var(--oc-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.br-kv-val {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
}
.br-kv-text {
  font-family: var(--oc-mono);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--oc-fg);
}

/* Custom minimal buttons */
.br-btn {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 5px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  transition: background 0.12s ease;
}
.br-btn:hover:not(:disabled) {
  background: var(--oc-hover);
}
.br-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.br-btn.primary {
  background: var(--oc-primary);
  color: var(--oc-primary-fg);
  border-color: var(--oc-primary);
}
.br-btn.primary:hover:not(:disabled) {
  opacity: 0.9;
}
.br-btn.destructive {
  background: color-mix(in srgb, var(--oc-error) 12%, transparent);
  color: var(--oc-error-text);
  border-color: color-mix(in srgb, var(--oc-error) 24%, transparent);
}
.br-btn.destructive:hover:not(:disabled) {
  background: color-mix(in srgb, var(--oc-error) 20%, transparent);
}

/* Proxy Pool Items */
.br-strategy-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  margin-bottom: 4px;
}
.br-strategy-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.br-strategy-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--oc-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.br-strategy-tabs {
  display: inline-flex;
  border: 1px solid var(--oc-border);
  border-radius: 6px;
  background: var(--oc-muted-surface);
  padding: 2px;
  gap: 2px;
}
.br-strategy-tab {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 9px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--oc-muted);
  transition: all 0.12s ease;
}
.br-strategy-tab:hover {
  color: var(--oc-fg);
}
.br-strategy-tab.active {
  background: var(--oc-bg);
  color: var(--oc-fg);
  font-weight: 600;
  box-shadow: 0 1px 2px rgba(0,0,0,0.06);
}
.br-sticky-control {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--oc-muted);
}
.br-sticky-input {
  width: 44px;
  padding: 2px 6px;
  font-size: 11px;
  font-family: var(--oc-mono);
  text-align: center;
  border-radius: 4px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  outline: none;
}
.br-sticky-input:focus {
  border-color: var(--oc-focus);
}

.br-pool-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
}
.br-pool-card {
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  background: var(--oc-bg);
  padding: 10px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  transition: border-color 0.15s ease;
}
.br-pool-card.active {
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 3%, var(--oc-bg));
}
.br-pool-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.br-pool-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.br-pool-title-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.br-pool-name {
  font-weight: 600;
  font-size: 12.5px;
  color: var(--oc-fg);
}
.br-pool-url {
  font-family: var(--oc-mono);
  font-size: 11px;
  color: var(--oc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-pool-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Deploy Form Box */
.br-deploy-box {
  border: 1px dashed var(--oc-border);
  border-radius: 8px;
  padding: 12px 14px;
  background: var(--oc-bg);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.br-deploy-nav {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--oc-border);
}
.br-deploy-tab {
  all: unset;
  box-sizing: border-box;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  color: var(--oc-muted);
  background: transparent;
  transition: all 0.1s ease;
}
.br-deploy-tab.active {
  color: var(--oc-fg);
  background: var(--oc-muted-surface);
  font-weight: 600;
}

/* Model Search & List */
.br-search-input {
  width: 100%;
  box-sizing: border-box;
  font: inherit;
  font-size: 12px;
  padding: 7px 10px;
  border-radius: 6px;
  border: 1px solid var(--oc-border);
  background: var(--oc-bg);
  color: var(--oc-fg);
  outline: none;
}
.br-search-input:focus {
  border-color: var(--oc-focus);
}
.br-models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 8px;
  max-height: 440px;
  overflow-y: auto;
  padding: 2px;
}
.br-model-card {
  border: 1px solid var(--oc-border);
  border-radius: 7px;
  background: var(--oc-bg);
  padding: 8px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  user-select: none;
  transition: all 0.12s ease;
}
.br-model-card:hover {
  background: var(--oc-hover);
}
.br-model-card.selected {
  border-color: var(--oc-primary);
  background: color-mix(in srgb, var(--oc-primary) 5%, var(--oc-bg));
}
.br-model-card-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.br-model-name {
  font-weight: 550;
  font-size: 12px;
  color: var(--oc-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-model-id {
  font-family: var(--oc-mono);
  font-size: 10.5px;
  color: var(--oc-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-model-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* Recent Calls Feed */
.br-call-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--oc-border) 40%, transparent);
  font-size: 12px;
}
.br-call-row:last-child {
  border-bottom: none;
}
.br-call-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.br-call-name {
  font-family: var(--oc-mono);
  font-size: 11px;
  color: var(--oc-fg);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.br-call-ms {
  color: var(--oc-muted);
  font-size: 11px;
  font-family: var(--oc-mono);
  flex-shrink: 0;
}

/* OpenCode View */
.br-opencode-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 8px;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
}
.br-opencode-desc {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.br-json-block {
  font-family: var(--oc-mono);
  font-size: 11px;
  line-height: 1.5;
  background: var(--oc-bg);
  border: 1px solid var(--oc-border);
  border-radius: 8px;
  padding: 10px 12px;
  margin: 0;
  max-height: 240px;
  overflow: auto;
  color: var(--oc-fg);
  white-space: pre-wrap;
  word-break: break-all;
}

/* General Layout Utilities */
.br-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.br-row.between {
  justify-content: space-between;
}
.br-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.br-mono {
  font-family: var(--oc-mono);
}
.br-muted {
  color: var(--oc-muted);
}
`;
