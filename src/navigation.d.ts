/*
 * Type declarations for the Navigation API
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigation_API
 */

interface NavigationHistoryEntry {
  readonly url: string;
  readonly key: string;
  readonly id: string;
  readonly index: number;
  readonly sameDocument: boolean;
  getState(): unknown;
}

interface NavigationTransition {
  readonly navigationType: NavigationTypeString;
  readonly from: NavigationHistoryEntry;
  readonly finished: Promise<void>;
}

interface NavigationNavigateOptions {
  state?: unknown;
  history?: 'auto' | 'push' | 'replace';
  info?: unknown;
}

interface NavigationReloadOptions {
  state?: unknown;
  info?: unknown;
}

interface NavigationResult {
  committed: Promise<NavigationHistoryEntry>;
  finished: Promise<NavigationHistoryEntry>;
}

type NavigationTypeString = 'reload' | 'push' | 'replace' | 'traverse';

interface NavigationDestination {
  readonly url: string;
  readonly key: string | null;
  readonly id: string | null;
  readonly index: number;
  readonly sameDocument: boolean;
  getState(): unknown;
}

interface NavigateEvent extends Event {
  readonly navigationType: NavigationTypeString;
  readonly destination: NavigationDestination;
  readonly canIntercept: boolean;
  readonly userInitiated: boolean;
  readonly hashChange: boolean;
  readonly signal: AbortSignal;
  readonly formData: FormData | null;
  readonly downloadRequest: string | null;
  readonly info: unknown;
  intercept(options?: { handler?: () => Promise<void> | void; focusReset?: 'after-transition' | 'manual'; scroll?: 'after-transition' | 'manual' }): void;
  scroll(): void;
}

interface NavigationEventMap {
  navigate: NavigateEvent;
  navigatesuccess: Event;
  navigateerror: ErrorEvent;
  currententrychange: Event;
}

interface Navigation extends EventTarget {
  readonly entries: ReadonlyArray<NavigationHistoryEntry>;
  readonly currentEntry: NavigationHistoryEntry | null;
  readonly transition: NavigationTransition | null;
  readonly canGoBack: boolean;
  readonly canGoForward: boolean;
  
  navigate(url: string, options?: NavigationNavigateOptions): NavigationResult;
  reload(options?: NavigationReloadOptions): NavigationResult;
  traverseTo(key: string, options?: NavigationNavigateOptions): NavigationResult;
  back(options?: NavigationNavigateOptions): NavigationResult;
  forward(options?: NavigationNavigateOptions): NavigationResult;
  
  addEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (this: Navigation, ev: NavigationEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ): void;
  removeEventListener<K extends keyof NavigationEventMap>(
    type: K,
    listener: (this: Navigation, ev: NavigationEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions
  ): void;
}

declare var navigation: Navigation;

interface Window {
  readonly navigation: Navigation;
}
