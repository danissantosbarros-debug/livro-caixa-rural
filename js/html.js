import htm from 'https://cdn.jsdelivr.net/npm/htm@3.1.1/dist/htm.module.js';

export const React = window.React;
const createElement = React.createElement;

// Parses a CSS text string ("color:red;background:url('data:...;...')")
// into a React style object, respecting parentheses so semicolons/colons
// inside url(...) or color-mix(...) don't get split incorrectly.
function parseStyleString(str) {
  const style = {};
  let depth = 0, current = '';
  const rules = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) {
      rules.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) rules.push(current);
  rules.forEach((rule) => {
    const idx = rule.indexOf(':');
    if (idx === -1) return;
    let prop = rule.slice(0, idx).trim();
    const val = rule.slice(idx + 1).trim();
    if (!prop || !val) return;
    if (!prop.startsWith('--')) {
      prop = prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    }
    style[prop] = val;
  });
  return style;
}

// htm builds vnodes via this h() function. React's `style` prop must be an
// object, but our markup (ported from the design prototype) writes style as
// a plain CSS string — so normalize it here, once, for every element.
function h(type, props, ...children) {
  if (props && typeof props.style === 'string') {
    props = { ...props, style: parseStyleString(props.style) };
  }
  return createElement(type, props, ...children);
}

export const html = htm.bind(h);
