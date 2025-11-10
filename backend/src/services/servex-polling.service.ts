import EventEmitter from "events";
import axios, { AxiosError } from "axios";
import { ServexService } from "./servex.service";

export interface ServexSnapshot {
  fetchedAt: Date;
  clients: any[];
  source: "polling";
}

interface ServexPollingOptions {
  intervalMs?: number;
  clientsLimit?: number;
  maxBackoffMs?: number;
  jitterMs?: number;
}

export class ServexPollingService extends EventEmitter {
  private readonly intervalMs: number;
  private readonly clientsLimit: number;
  private readonly maxBackoffMs: number;
  private readonly cooldownMultiplier = 2;
  private readonly jitterMs: number;
  private timer: NodeJS.Timeout | null = null;
  private running = false;
  private fetching = false;
  private consecutive429 = 0;
  private snapshot: ServexSnapshot | null = null;

  constructor(
    private readonly servexService: ServexService,
    options: ServexPollingOptions = {}
  ) {
    super();
    this.intervalMs = options.intervalMs ?? 5000;
    this.clientsLimit = options.clientsLimit ?? 50;
    this.maxBackoffMs = options.maxBackoffMs ?? 30_000;
    this.jitterMs = options.jitterMs ?? 250;
  }

  start(): void {
    if (this.running) {
      return;
    }

    this.running = true;
    this.scheduleNextPoll(0);
  }

  stop(): void {
    this.clearTimer();
    this.running = false;
  }

  getSnapshot(): ServexSnapshot | null {
    return this.snapshot;
  }

  private async poll(): Promise<void> {
    if (!this.running || this.fetching) {
      return;
    }

    this.fetching = true;
    try {
      const clients = await this.servexService.obtenerClientes(
        {
          page: 1,
          limit: this.clientsLimit,
          scope: "meus",
        },
        { forceRefresh: true }
      );

      this.snapshot = {
        clients,
        fetchedAt: new Date(),
        source: "polling",
      };

      this.consecutive429 = 0;
      this.emit("snapshot", this.snapshot);
      this.scheduleNextPoll(this.intervalMs);
    } catch (error) {
      const retryDelay = this.getRetryDelay(error);
      this.emit("error", error);
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        this.emit("backoff", {
          delay: retryDelay,
          consecutive429: this.consecutive429,
        });
      }
      this.scheduleNextPoll(retryDelay);
    } finally {
      this.fetching = false;
    }
  }

  private scheduleNextPoll(delay: number): void {
    if (!this.running) {
      return;
    }

    this.clearTimer();
    this.timer = setTimeout(() => this.poll(), Math.max(0, delay));
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private getRetryDelay(error: unknown): number {
    if (axios.isAxiosError(error)) {
      const status = (error as AxiosError).response?.status;
      if (status === 429) {
        this.consecutive429 += 1;
        const headers = (error as AxiosError).response?.headers;
        const retryAfterHeader = headers?.["retry-after"] ?? headers?.["Retry-After"];
        const retryAfterMs = this.parseRetryAfter(retryAfterHeader);

        if (retryAfterMs !== null) {
          return Math.min(retryAfterMs + this.getJitter(), this.maxBackoffMs);
        }

        const exponentialDelay = this.intervalMs * Math.pow(
          this.cooldownMultiplier,
          this.consecutive429
        );
        const boundedDelay = Math.min(
          Math.max(exponentialDelay, this.intervalMs),
          this.maxBackoffMs
        );

        return Math.min(boundedDelay + this.getJitter(), this.maxBackoffMs);
      }
    }

    this.consecutive429 = 0;
    return this.intervalMs;
  }

  private parseRetryAfter(header: unknown): number | null {
    if (!header) {
      return null;
    }

    if (typeof header === "number") {
      return Math.max(header * 1000, 0);
    }

    const asString = header.toString().trim();
    const numericSeconds = Number(asString);

    if (!Number.isNaN(numericSeconds)) {
      return Math.max(numericSeconds * 1000, 0);
    }

    const parsedDate = Date.parse(asString);
    if (!Number.isNaN(parsedDate)) {
      const diff = parsedDate - Date.now();
      return diff > 0 ? diff : 0;
    }

    return null;
  }

  private getJitter(): number {
    if (this.jitterMs <= 0) {
      return 0;
    }

    return Math.floor(Math.random() * this.jitterMs);
  }
}
