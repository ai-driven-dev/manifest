import { afterEach, describe, expect, it, vi } from 'vitest';
import { initSmoothAnchors } from './scroll';

afterEach(() => vi.unstubAllGlobals());

function setup(hash = '#principles', reducedMotion = true) {
  let click: (event: MouseEvent) => void;
  let blur: () => void;
  const attributes = new Map<string, string>();
  const target = {
    tabIndex: -1,
    hasAttribute: (name: string) => attributes.has(name),
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    removeAttribute: (name: string) => attributes.delete(name),
    addEventListener: vi.fn((_name: string, listener: () => void) => { blur = listener; }),
    focus: vi.fn(),
    getBoundingClientRect: () => ({ top: 600 }),
  };
  const link = { getAttribute: () => hash, hasAttribute: () => false, target: '' };
  const event = {
    target: { closest: () => link },
    button: 0,
    preventDefault: vi.fn(),
  };
  const root = { style: { scrollBehavior: 'smooth' } };
  const scrollTo = vi.fn();
  const pushState = vi.fn();
  vi.stubGlobal('document', {
    documentElement: root,
    getElementById: (id: string) => id === hash.slice(1) ? target : null,
    addEventListener: (_name: string, listener: typeof click) => { click = listener; },
  });
  vi.stubGlobal('window', {
    scrollY: 100,
    matchMedia: () => ({ matches: reducedMotion }),
    location: { hash: '' },
    scrollTo,
  });
  vi.stubGlobal('history', { pushState });
  vi.stubGlobal('getComputedStyle', () => ({ scrollMarginTop: '24px' }));
  const frame = vi.fn();
  vi.stubGlobal('requestAnimationFrame', frame);
  initSmoothAnchors();
  return {
    target, link, attributes, event, root, scrollTo, pushState, frame,
    click: (overrides = {}) => click({ ...event, ...overrides } as unknown as MouseEvent),
    blur: () => blur(),
  };
}

describe('in-page anchor focus', () => {
  it.each(['#main', '#principles'])('focuses %s without a second scroll or a permanent tab stop', (hash) => {
    const test = setup(hash);
    test.click();

    expect(test.target.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(test.attributes.get('tabindex')).toBe('-1');
    expect(test.scrollTo).toHaveBeenCalledWith(0, 676);
    expect(test.root.style.scrollBehavior).toBe('smooth');
    expect(test.pushState).toHaveBeenCalledWith(null, '', hash);
    test.blur();
    expect(test.attributes.has('tabindex')).toBe(false);
  });

  it('moves focus immediately even when smooth scrolling is animated', () => {
    const test = setup('#principles', false);
    test.click();
    expect(test.target.focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(test.frame).toHaveBeenCalledOnce();
  });

  it('preserves an existing tabindex and avoids duplicate history entries', () => {
    const test = setup();
    test.attributes.set('tabindex', '-1');
    window.location.hash = '#principles';
    test.click();
    expect(test.target.focus).toHaveBeenCalledOnce();
    expect(test.target.addEventListener).not.toHaveBeenCalled();
    expect(test.pushState).not.toHaveBeenCalled();
  });

  it.each(['ctrlKey', 'metaKey', 'shiftKey', 'altKey', 'defaultPrevented'])('leaves %s navigation to the browser', (flag) => {
    const test = setup();
    test.click({ [flag]: true });
    expect(test.event.preventDefault).not.toHaveBeenCalled();
    expect(test.target.focus).not.toHaveBeenCalled();
  });

  it('leaves new-tab and download links to the browser', () => {
    const test = setup();
    test.link.target = '_blank';
    test.click();
    test.link.target = '';
    test.link.hasAttribute = () => true;
    test.click();
    expect(test.event.preventDefault).not.toHaveBeenCalled();
    expect(test.target.focus).not.toHaveBeenCalled();
  });
});
