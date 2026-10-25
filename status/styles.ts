/** BlackRouter status section styles for the Work-Status panel. */
export const STYLES = `
.br-s-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  min-height: 20px;
  font-size: 11px;
}
.br-s-left {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  overflow: hidden;
}
.br-s-right {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.br-s-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
  background: var(--oc-muted);
}
.br-s-dot[data-state="on"] {
  background: var(--oc-success-text, #22c55e);
}
.br-s-dot[data-state="off"] {
  background: var(--oc-error-text, #ef4444);
}
.br-s-label {
  color: var(--oc-muted);
  white-space: nowrap;
}
.br-s-value {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--oc-fg);
}
.br-s-mono {
  font-family: var(--oc-mono);
  font-size: 11px;
}
.br-s-pill {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--oc-muted-surface, rgba(127, 127, 127, 0.1));
  border: 1px solid var(--oc-border);
  color: var(--oc-fg);
  white-space: nowrap;
}
.br-s-toggle {
  cursor: pointer;
  user-select: none;
  transition: opacity 0.15s ease;
}
.br-s-toggle:hover {
  opacity: 0.8;
}
.br-s-btn {
  all: unset;
  box-sizing: border-box;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 7px;
  border-radius: 4px;
  border: 1px solid var(--oc-border);
  background: var(--oc-muted-surface, transparent);
  color: var(--oc-fg);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.br-s-btn:hover:not(:disabled) {
  background: var(--oc-hover);
}
.br-s-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.br-s-btn:focus-visible {
  outline: 2px solid var(--oc-focus);
}
.br-s-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  padding-top: 4px;
  border-top: 1px solid var(--oc-border);
}
.br-s-error {
  color: var(--oc-error-text, #ef4444);
}
.br-s-success {
  color: var(--oc-success-text, #22c55e);
}
`;
