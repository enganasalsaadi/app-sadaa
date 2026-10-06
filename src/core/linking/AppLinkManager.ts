import { Linking } from 'react-native';
import { env } from '@/core/config';
import { parseAppLink, type AppLinkTarget } from './appLink';

export type AppLinkHandler = (target: AppLinkTarget) => void;

/** A link kept for a handler that isn't there yet (cold start, boot or a gate still showing). */
const PENDING_OPEN_TTL_MS = 30_000;

/**
 * Single entry point for URLs opened from outside (universal / app links and
 * `sada://`). URLs are parsed here, so nothing downstream sees a raw path.
 */
export class AppLinkManager {
  private started = false;
  private openHandler?: AppLinkHandler;
  private pendingOpen?: { target: AppLinkTarget; at: number };

  constructor(
    private readonly webHost: string,
    private readonly now: () => number = Date.now,
  ) {}

  /** Listens for the launch URL and every later one. Idempotent; lives as long as the app. */
  start(): void {
    if (this.started) return;
    this.started = true;
    Linking.addEventListener('url', ({ url }) => this.open(url));
    Linking.getInitialURL()
      .then(url => this.open(url))
      .catch(() => undefined);
  }

  /** The newest link waiting (≤ 30 s) is delivered immediately; returns the unsubscribe. */
  registerOpenHandler(handler: AppLinkHandler): () => void {
    this.openHandler = handler;
    const pending = this.pendingOpen;
    this.pendingOpen = undefined;
    if (pending && this.now() - pending.at < PENDING_OPEN_TTL_MS) {
      handler(pending.target);
    }
    return () => {
      if (this.openHandler === handler) {
        this.openHandler = undefined;
      }
    };
  }

  open(url: string | null | undefined): void {
    const target = parseAppLink(url, this.webHost);
    if (!target) return;
    if (this.openHandler) {
      this.openHandler(target);
    } else {
      this.pendingOpen = { target, at: this.now() };
    }
  }
}

export const appLinkManager = new AppLinkManager(env.PUBLIC_WEB_HOST);
