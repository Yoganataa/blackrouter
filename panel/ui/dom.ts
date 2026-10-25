/** Clean minimal DOM helpers for BlackRouter panel views. */

export const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className = '',
  text = '',
): HTMLElementTagNameMap[K] => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
};

export const row = (parent: Element, className = ''): HTMLDivElement => {
  const node = el('div', `br-row ${className}`.trim());
  parent.append(node);
  return node;
};

export const stack = (parent: Element, className = ''): HTMLDivElement => {
  const node = el('div', `br-stack ${className}`.trim());
  parent.append(node);
  return node;
};

export const card = (
  parent: Element,
  title: string,
  desc?: string,
): { card: HTMLElement; body: HTMLElement } => {
  const cardNode = el('section', 'br-card');
  const headerNode = el('header', 'br-card-header');
  const titlesNode = el('div');
  const titleNode = el('h3', 'br-card-title', title);
  titlesNode.append(titleNode);
  if (desc) {
    const descNode = el('p', 'br-card-desc', desc);
    titlesNode.append(descNode);
  }
  headerNode.append(titlesNode);
  cardNode.append(headerNode);
  parent.append(cardNode);
  return { card: cardNode, body: cardNode };
};

export const btn = (
  parent: Element,
  label: string,
  onClick: (e: MouseEvent) => void,
  variant: 'default' | 'primary' | 'destructive' = 'default',
): HTMLButtonElement => {
  const node = el('button', `br-btn ${variant !== 'default' ? variant : ''}`.trim(), label);
  node.type = 'button';
  node.addEventListener('click', onClick);
  parent.append(node);
  return node;
};
