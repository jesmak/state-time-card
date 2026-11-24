/**
 * A dashboard card that shows how much of each day an entity spent in each of the states it is told to count: today's
 * time per state as large figures, today's timeline from midnight, and a stacked bar per day over 14 to 90 days, with
 * each state's average under them.
 *
 * Its parts are the same whatever the data, so its height depends only on its width and its states. In a sections view
 * on automatic rows it fills whole rows, the room left over spread between the parts. Held to more rows than it needs,
 * the bars grow into the room.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { CARD_VERSION } from "./const";
import {
    DAY,
    HOUR,
    MINUTE,
    counterNow,
    fetchChanges,
    fetchCounters,
    filled,
    historyStart,
    hoursFromCounter,
    hoursFromHistory,
    lastDays,
    mergeChanges,
    needsFetch,
    segmentsOf,
    startOfDay,
} from "./data";
import type { Asked, Change, Day, StatisticRow } from "./data";
import "./editor";
import type { HassEntity, HomeAssistant } from "./hass";
import { gridMinRows } from "./height";
import { browserLanguage, translate } from "./localize/localize";
import { drawnScale, fillLimit, filledHeight, heldSpare, validRowStep } from "./rows";
import { DEFAULT_RANGE, RANGES, statesOf } from "./types";
import type { StateConfig, StateTimeCardConfig } from "./types";

console.info(
    `%c  STATE-TIME-CARD \n%c  ${CARD_VERSION}    `,
    "color: orange; font-weight: bold; background: black",
    "color: white; font-weight: bold; background: dimgray",
);

interface CardRegistration {
    type: string;
    name: string;
    description: string;
    documentationURL?: string;
    preview?: boolean;
}

const registry = window as unknown as { customCards?: CardRegistration[] };
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
    type: "state-time-card",
    name: translate(browserLanguage(), "common.name"),
    description: translate(browserLanguage(), "common.description"),
    documentationURL: "https://github.com/jesmak/state-time-card",
    preview: true,
});

/** How often the recorder is asked again. A counter's hourly statistics change once an hour. */
const REFRESH_INTERVAL = 15 * MINUTE;
/** How often today's figures and timeline move on between the entity's own changes. */
const TICK_INTERVAL = MINUTE;
/** Every how many days a date is written under the bars, counting back from today. */
const LABEL_EVERY: Record<number, number> = { 14: 2, 30: 5, 60: 10, 90: 15 };
/** The bars' grid lines are this many hours apart. */
const GRID_HOURS = 4;

/** The domains whose entities are on or off, for the card picker's first entity. */
const ON_OFF_DOMAINS = ["switch", "input_boolean", "binary_sensor", "light", "fan"];

/** A state's days, and its colour and name for drawing. */
interface Series {
    state: string;
    name: string;
    color: string;
    hours: Array<number | null>;
}

/** Hours as `7 h 09 min`, or `45 min` under an hour. */
export function durationParts(hours: number): { hours: number; minutes: number } {
    const minutes = Math.round(hours * 60);
    return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}

/** The average of the days that have a value, today left out as it isn't over. */
export function averageOf(hours: Array<number | null>): number | null {
    const past = hours.slice(0, -1).filter((value): value is number => value !== null);
    return past.length ? past.reduce((sum, value) => sum + value, 0) / past.length : null;
}

/** The first entity the card picker can show something for: one that is on or off, counted while on. */
export function stubConfig(hass?: HomeAssistant): Record<string, unknown> {
    const ids = Object.keys(hass?.states ?? {}).sort();
    const entity = ids.find((id) => ON_OFF_DOMAINS.includes(id.split(".")[0])) ?? ids[0] ?? "";
    return { entity, states: ["on"] };
}

@customElement("state-time-card")
export class StateTimeCard extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    /** Set by the dashboard: "grid" in a sections view. */
    @property({ attribute: false }) public layout?: string;
    @state() private config?: StateTimeCardConfig;
    @state() private range = DEFAULT_RANGE;
    /** The entity's changes since the first day the history is read for, with the state at its start first. */
    @state() private changes?: Change[];
    /** Each counter's hourly maximums, in hours. */
    @state() private counterRows: Record<string, StatisticRow[]> = {};
    @state() private now = Date.now();
    /** The height that fills whole rows, 0 when the card doesn't fill rows. */
    @state() private filled = 0;
    /** Held to rows set in the layout tab, and whether the bars grow into the room there rather than the parts spreading out. */
    @state() private held = false;
    @state() private grows = false;

    /** What the last answers were asked for, to know when to ask again. */
    private asked?: Asked;
    private fetching = false;
    private timers: number[] = [];
    private readonly resizer = typeof ResizeObserver === "undefined" ? undefined : new ResizeObserver(() => this.scheduleFill());
    private fillFrame = 0;

    public static getConfigElement(): HTMLElement {
        return document.createElement("state-time-card-editor");
    }

    public static getStubConfig(hass?: HomeAssistant): Record<string, unknown> {
        return stubConfig(hass);
    }

    public setConfig(config: StateTimeCardConfig): void {
        const text = (key: string) => translate(this.language(), key);
        if (!config?.entity) {
            throw new Error(text("common.no_entity"));
        }
        if (!Array.isArray(config.states) || statesOf(config).length === 0) {
            throw new Error(text("common.no_states"));
        }
        if (config.days != null && !RANGES.includes(config.days)) {
            throw new Error(text("common.invalid_days"));
        }
        if (!validRowStep(config)) {
            throw new Error(text("common.invalid_row_step"));
        }
        const changed = this.config?.entity !== config.entity || JSON.stringify(this.config?.states) !== JSON.stringify(config.states);
        this.config = config;
        this.range = config.days ?? DEFAULT_RANGE;
        if (changed) {
            this.changes = undefined;
            this.counterRows = {};
            this.asked = undefined;
        }
    }

    public getCardSize(): number {
        return Math.ceil(this.minimumHeight() / 50);
    }

    public getGridOptions(): Record<string, unknown> {
        return { columns: 12, rows: "auto", min_columns: 6, min_rows: gridMinRows(this.minimumHeight()) };
    }

    public connectedCallback(): void {
        super.connectedCallback();
        this.timers = [
            window.setInterval(() => (this.now = Date.now()), TICK_INTERVAL),
            window.setInterval(() => this.load(true), REFRESH_INTERVAL),
        ];
        this.load();
    }

    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.timers.forEach((timer) => window.clearInterval(timer));
        this.timers = [];
        this.resizer?.disconnect();
        cancelAnimationFrame(this.fillFrame);
    }

    /**
     * Home Assistant hands the card a new `hass` at every state change in the house. Only the entity's, its counters' and
     * the language's or time zone's draw the card again.
     */
    protected shouldUpdate(changed: PropertyValues): boolean {
        const old = changed.get("hass") as HomeAssistant | undefined;
        const hass = this.hass;
        if (changed.size !== 1 || !old || !hass || !this.config) {
            return true;
        }
        const counters = statesOf(this.config).flatMap((entry) => (entry.counter ? [entry.counter] : []));
        const watched = [this.config.entity, ...counters];
        return (
            old.language !== hass.language ||
            old.locale?.language !== hass.locale?.language ||
            old.config?.time_zone !== hass.config?.time_zone ||
            watched.some((id) => old.states[id] !== hass.states[id])
        );
    }

    protected willUpdate(changed: PropertyValues): void {
        if (changed.has("hass") && this.hass && this.config) {
            const entity = this.hass.states[this.config.entity];
            const old = (changed.get("hass") as HomeAssistant | undefined)?.states[this.config.entity];
            // A change since the history was read is added to it, so today moves on without asking the recorder again.
            if (entity && old && entity.last_changed !== old.last_changed && this.changes) {
                this.changes = [...this.changes, { time: Date.parse(entity.last_changed), state: entity.state }];
                this.now = Date.now();
            }
        }
    }

    protected updated(changed: PropertyValues): void {
        if (changed.has("hass") || changed.has("config") || changed.has("range")) {
            this.load();
        }
        const card = this.renderRoot.querySelector("ha-card");
        if (card && this.resizer) {
            this.resizer.observe(card);
        }
        this.scheduleFill();
    }

    /** Asks the recorder for what the range needs, unless the last answers already cover it. Forced, it asks again. */
    private async load(force = false): Promise<void> {
        const hass = this.hass;
        const config = this.config;
        if (!hass?.callWS || !config || !hass.states[config.entity] || this.fetching) {
            return;
        }
        const timeZone = hass.config?.time_zone;
        const states = statesOf(config);
        const counters = states.map((entry) => entry.counter).filter((id): id is string => Boolean(id));
        const now = Date.now();
        const days = lastDays(this.range, now, timeZone);
        const wanted = {
            key: `${config.entity}|${counters.join(",")}`,
            from: startOfDay(days[0].time, timeZone),
            day: days[days.length - 1].day,
        };
        if (!force && !needsFetch(this.asked, wanted)) {
            return;
        }
        this.fetching = true;
        try {
            const counterRows = await fetchCounters(hass, counters, wanted.from, now);
            // The history is read as far back as some day has no counter to give it, and otherwise for today's timeline only.
            const counterDays = states.map((entry) =>
                entry.counter ? hoursFromCounter(counterRows[entry.counter] ?? [], days, null, timeZone) : null,
            );
            const changes = await fetchChanges(hass, config.entity, historyStart(counterDays, days, timeZone), now);
            // An answer for a configuration changed meanwhile, such as another entity picked in the editor, is dropped.
            if (this.config === config) {
                this.changes = mergeChanges(changes, this.changes ?? []);
                this.counterRows = counterRows;
                this.now = Date.now();
                this.asked = wanted;
            }
        } catch (error) {
            console.error("state-time-card: the recorder didn't answer", error);
        } finally {
            this.fetching = false;
        }
        if (this.config !== config) {
            this.load();
        }
    }

    protected render(): TemplateResult | typeof nothing {
        const hass = this.hass;
        const config = this.config;
        if (!hass || !config) {
            return nothing;
        }
        const entity = hass.states[config.entity];
        if (!entity) {
            return html`<ha-card><div class="warning">${this.text("common.unknown_entity")}: ${config.entity}</div></ha-card>`;
        }
        const timeZone = hass.config?.time_zone;
        const days = lastDays(this.range, this.now, timeZone);
        const series = this.series(entity, days);
        return html`
            <ha-card
                class=${this.grows ? "grows" : ""}
                style=${this.filled ? `min-height: ${this.filled}px` : this.held ? "height: 100%" : ""}
            >
                <div class="content">
                    <div class="head">
                        <span class="title">${config.title || this.entityName(entity)}</span>
                        <span class="date">${this.dateText(this.now, { weekday: "short", day: "numeric", month: "numeric" })}</span>
                    </div>
                    ${this.renderTotals(series)} ${this.renderTimeline(series)}
                    <div class="ranges" role="group" aria-label=${this.text("card.range")}>
                        ${RANGES.map(
                            (range) =>
                                html`<button
                                    class=${range === this.range ? "chip on" : "chip"}
                                    aria-pressed=${range === this.range}
                                    @click=${() => (this.range = range)}
                                >
                                    ${this.text("card.days").replace("{count}", String(range))}
                                </button>`,
                        )}
                    </div>
                    ${this.renderBars(series, days)} ${this.renderFoot(series)}
                </div>
            </ha-card>
        `;
    }

    /** Each counted state's hours per day: from its counter where it has one, and from the history for the days it has not. */
    private series(entity: HassEntity, days: Day[]): Series[] {
        const hass = this.hass as HomeAssistant;
        const timeZone = hass.config?.time_zone;
        return statesOf(this.config as StateTimeCardConfig).map((entry) => {
            const history = this.changes ? hoursFromHistory(this.changes, entry.state, days, this.now, timeZone) : days.map(() => null);
            return {
                state: entry.state,
                name: this.stateName(entity, entry),
                color: entry.color,
                hours: entry.counter
                    ? filled(
                          hoursFromCounter(this.counterRows[entry.counter] ?? [], days, counterNow(hass, entry.counter), timeZone),
                          history,
                      )
                    : history,
            };
        });
    }

    private renderTotals(series: Series[]): TemplateResult {
        const today = series.map((entry) => entry.hours[entry.hours.length - 1]);
        const counted = today.reduce<number>((sum, value) => sum + (value ?? 0), 0);
        const share = series.length > 1 && counted > 0 ? Math.round((100 * (today[0] ?? 0)) / counted) : null;
        return html`
            <div class="totals">
                ${series.map((entry, index) => {
                    const value = today[index];
                    return html`<div class="total">
                        <div class="value">${value === null ? "–" : this.duration(value, true)}</div>
                        <div class="label"><span class="swatch" style="background: ${entry.color}"></span>${entry.name}</div>
                    </div>`;
                })}
                ${
                    share === null
                        ? nothing
                        : html`<div class="total share">
                              <div class="value" style="color: ${series[0].color}">${share}<small>%</small></div>
                              <div class="label">${series[0].name}</div>
                          </div>`
                }
            </div>
        `;
    }

    private renderTimeline(series: Series[]): TemplateResult {
        const timeZone = this.hass?.config?.time_zone;
        const start = startOfDay(this.now, timeZone);
        const length = startOfDay(start + DAY + 2 * HOUR, timeZone) - start;
        const colors = new Map(series.map((entry) => [entry.state, entry]));
        const segments = segmentsOf(
            this.changes ?? [],
            start,
            this.now,
            series.map((entry) => entry.state),
        ).filter((segment) => segment.state !== null);
        /** A length of time as a share of the day's width. */
        const share = (milliseconds: number) => `${((100 * milliseconds) / length).toFixed(3)}%`;
        return html`
            <div class="timeline">
                <div class="track">
                    <div class="past" style="width: ${share(this.now - start)}"></div>
                    ${segments.map((segment) => {
                        const entry = colors.get(segment.state as string) as Series;
                        const tip = `${entry.name} ${this.clock(segment.start)}–${this.clock(segment.end)}`;
                        return html`<div
                            class="segment"
                            title=${tip}
                            style="left: ${share(segment.start - start)}; width: ${share(segment.end - segment.start)}; background: ${entry.color}"
                        ></div>`;
                    })}
                </div>
                <div class="ticks">${[0, 6, 12, 18, 24].map((hour) => html`<span style="left: ${(100 * hour) / 24}%">${hour}</span>`)}</div>
            </div>
        `;
    }

    private renderBars(series: Series[], days: Day[]): TemplateResult {
        const totals = days.map((_, index) => series.reduce((sum, entry) => sum + (entry.hours[index] ?? 0), 0));
        const top = Math.max(GRID_HOURS, Math.ceil(Math.max(...totals) / GRID_HOURS) * GRID_HOURS);
        const gap = days.length > 30 ? 1 : days.length > 14 ? 2 : 3;
        const every = LABEL_EVERY[days.length] ?? 5;
        const grid = [];
        for (let hours = GRID_HOURS; hours < top; hours += GRID_HOURS) {
            grid.push(
                html`<div class="grid" style="bottom: ${(100 * hours) / top}%"><span>${hours} ${this.text("card.hours")}</span></div>`,
            );
        }
        return html`
            <div class="chart">
                <div class="bars" style="gap: ${gap}px">
                    ${grid}
                    ${days.map((day, index) => {
                        const known = series.some((entry) => entry.hours[index] !== null);
                        const tip = [
                            this.dateText(day.time, { weekday: "short", day: "numeric", month: "numeric" }),
                            ...(known
                                ? series.map(
                                      (entry) =>
                                          `${entry.name} ${entry.hours[index] === null ? "–" : this.duration(entry.hours[index] ?? 0)}`,
                                  )
                                : [this.text("card.no_data")]),
                        ].join("\n");
                        return html`<div class=${index === days.length - 1 ? "day today" : "day"} title=${tip}>
                            ${series.map(
                                (entry) =>
                                    html`<div
                                        style="height: ${(100 * (entry.hours[index] ?? 0)) / top}%; background: ${entry.color}"
                                    ></div>`,
                            )}
                        </div>`;
                    })}
                </div>
                <div class="labels" style="gap: ${gap}px">
                    ${days.map(
                        (day, index) =>
                            html`<span
                                >${(days.length - 1 - index) % every === 0 ? this.dateText(day.time, { day: "numeric", month: "numeric" }) : ""}</span
                            >`,
                    )}
                </div>
            </div>
        `;
    }

    private renderFoot(series: Series[]): TemplateResult {
        const averages = series.map((entry) => averageOf(entry.hours));
        return html`
            <div class="foot">
                ${
                    averages.some((value) => value !== null)
                        ? html`<div class="averages">
                              <span>${this.text("card.average")}</span>
                              ${series.map((entry, index) =>
                                  averages[index] === null
                                      ? nothing
                                      : html`<span>${entry.name} <b>${this.duration(averages[index] ?? 0)}</b></span>`,
                              )}
                          </div>`
                        : nothing
                }
                <div class="legend">
                    ${series.map((entry) => html`<span><i style="background: ${entry.color}"></i>${entry.name}</span>`)}
                    <span><i class="other"></i>${this.text("card.other")}</span>
                </div>
            </div>
        `;
    }

    /** Hours as hours and minutes, large figures with their units small. */
    private duration(hours: number, large = false): TemplateResult | string {
        const { hours: whole, minutes } = durationParts(hours);
        const h = this.text("card.hours");
        const min = this.text("card.minutes");
        if (large) {
            return whole
                ? html`${whole}<small>${h}</small> ${String(minutes).padStart(2, "0")}<small>${min}</small>`
                : html`${minutes}<small>${min}</small>`;
        }
        return whole ? `${whole} ${h} ${String(minutes).padStart(2, "0")} ${min}` : `${minutes} ${min}`;
    }

    private dateText(time: number, options: Intl.DateTimeFormatOptions): string {
        return new Intl.DateTimeFormat(this.language(), { ...options, timeZone: this.hass?.config?.time_zone }).format(new Date(time));
    }

    private clock(time: number): string {
        return this.dateText(time, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    }

    private entityName(entity: HassEntity): string {
        const name = this.hass?.formatEntityName?.(entity, [{ type: "device" }, { type: "entity" }]);
        return name || String(entity.attributes.friendly_name ?? entity.entity_id);
    }

    private stateName(entity: HassEntity, entry: StateConfig): string {
        return entry.name || this.hass?.formatEntityState?.(entity, entry.state) || entry.state;
    }

    /**
     * The least height the card needs, from its states alone: the figures wrap to a line more for every three of them
     * at the narrowest. The parts' heights are the stylesheet's.
     */
    private minimumHeight(): number {
        const count = this.config ? statesOf(this.config).length : 1;
        const figures = Math.ceil((count + (count > 1 ? 1 : 0)) / 3) * 50;
        const legend = Math.ceil((count + 1) / 3) * 18;
        // Padding 32 and border 2, the head 24, the timeline 32, the chips 28, the bars 112, the averages 18 and five gaps of 12.
        return 34 + 24 + figures + 32 + 28 + 112 + 18 + legend + 6 * 12;
    }

    private scheduleFill(): void {
        cancelAnimationFrame(this.fillFrame);
        this.fillFrame = requestAnimationFrame(() => this.fillRows());
    }

    /**
     * In a sections view on automatic rows, the card takes the whole rows its parts need (or half rows with
     * `row_step: half`), the room left over spread between them. Held to rows set in the layout tab, less than a row of
     * room is spread the same way, and more goes to the bars.
     */
    private fillRows(): void {
        const card = this.renderRoot.querySelector<HTMLElement>("ha-card");
        const content = this.renderRoot.querySelector<HTMLElement>(".content");
        if (!card || !content || !card.clientWidth || !this.config) {
            return;
        }
        const rows = this.config.grid_options ? this.config.grid_options.rows : this.config.layout_options?.grid_rows;
        const held = this.layout === "grid" && typeof rows === "number";
        const limit = fillLimit(this.config, this.layout, this.minimumHeight());
        const scale = drawnScale(card);
        const style = getComputedStyle(card);
        const parts = [...content.children] as HTMLElement[];
        const gap = parseFloat(getComputedStyle(content).rowGap) || 0;
        const needed =
            parts.reduce((sum, part) => sum + part.getBoundingClientRect().height / scale, 0) +
            gap * (parts.length - 1) +
            (parseFloat(style.paddingTop) || 0) +
            (parseFloat(style.paddingBottom) || 0) +
            (parseFloat(style.borderTopWidth) || 0) +
            (parseFloat(style.borderBottomWidth) || 0);
        if (held !== this.held) this.held = held;
        if (held) {
            const height = card.getBoundingClientRect().height / scale;
            const grows = height > needed + 1 && !heldSpare(height, needed);
            if (grows !== this.grows) this.grows = grows;
            if (this.filled) this.filled = 0;
            return;
        }
        if (this.grows) this.grows = false;
        const filled = limit ? filledHeight(needed, this.config, limit) : 0;
        if (filled !== this.filled) this.filled = filled;
    }

    private text(key: string): string {
        return translate(this.language(), key);
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }

    static get styles(): CSSResultGroup {
        return css`
            ha-card {
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
                padding: 16px;
                container-type: inline-size;
                transition: none;
            }
            .content {
                flex: 1 0 auto;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                gap: 12px;
            }
            ha-card.grows .chart {
                flex: 1 1 auto;
            }
            ha-card.grows .content {
                justify-content: flex-start;
            }
            .warning {
                color: var(--error-color);
            }
            .head {
                display: flex;
                justify-content: space-between;
                align-items: baseline;
                gap: 8px;
                line-height: 24px;
            }
            .title {
                font-size: 16px;
                font-weight: 500;
                overflow-wrap: anywhere;
            }
            .date,
            .label,
            .ticks,
            .labels,
            .averages,
            .legend,
            .grid span {
                color: var(--secondary-text-color);
            }
            .date {
                font-size: 12px;
                white-space: nowrap;
            }
            .totals {
                display: flex;
                flex-wrap: wrap;
                gap: 4px 20px;
                align-items: flex-end;
            }
            .total .value {
                font-size: 26px;
                font-weight: 600;
                line-height: 32px;
                white-space: nowrap;
            }
            .total small {
                font-size: 14px;
                font-weight: 400;
                margin-left: 2px;
                color: var(--secondary-text-color);
            }
            .total.share {
                margin-left: auto;
                text-align: right;
            }
            .label {
                font-size: 12px;
                line-height: 18px;
                display: flex;
                align-items: center;
                gap: 5px;
            }
            .share .label {
                justify-content: flex-end;
            }
            .swatch {
                width: 8px;
                height: 8px;
                border-radius: 2px;
                flex: none;
            }
            .track {
                position: relative;
                height: 14px;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            .past {
                position: absolute;
                inset: 0 auto 0 0;
                background: repeating-linear-gradient(
                    135deg,
                    color-mix(in srgb, var(--secondary-text-color) 18%, transparent) 0 4px,
                    transparent 4px 8px
                );
            }
            .segment {
                position: absolute;
                top: 0;
                bottom: 0;
            }
            .ticks {
                position: relative;
                height: 14px;
                margin-top: 4px;
                font-size: 10px;
                line-height: 14px;
            }
            .ticks span {
                position: absolute;
                transform: translateX(-50%);
            }
            .ticks span:first-child {
                transform: none;
            }
            .ticks span:last-child {
                transform: translateX(-100%);
            }
            .ranges {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
            }
            .chip {
                font: inherit;
                font-size: 12px;
                line-height: 18px;
                padding: 3px 10px;
                border-radius: 999px;
                border: 1px solid var(--divider-color);
                background: none;
                color: var(--primary-text-color);
                cursor: pointer;
            }
            .chip.on {
                border-color: var(--primary-color);
                color: var(--primary-color);
                background: color-mix(in srgb, var(--primary-color) 12%, transparent);
            }
            .chip:focus-visible {
                outline: 2px solid var(--primary-color);
                outline-offset: 1px;
            }
            .chart {
                display: flex;
                flex-direction: column;
                min-height: 112px;
            }
            /* The hour labels of the grid have a gutter of their own on the right, so they never sit on a bar. */
            .bars,
            .labels {
                margin-right: 30px;
            }
            .bars {
                position: relative;
                flex: 1 1 auto;
                min-height: 96px;
                display: flex;
                align-items: stretch;
                border-bottom: 1px solid var(--divider-color);
            }
            .day {
                flex: 1;
                min-width: 0;
                display: flex;
                flex-direction: column-reverse;
            }
            .day > div:last-child {
                border-radius: 2px 2px 0 0;
            }
            .day.today {
                outline: 1px dashed color-mix(in srgb, var(--primary-color) 60%, transparent);
                outline-offset: 1px;
                border-radius: 2px;
            }
            .grid {
                position: absolute;
                left: 0;
                right: 0;
                border-top: 1px dashed color-mix(in srgb, var(--secondary-text-color) 25%, transparent);
                pointer-events: none;
            }
            .grid span {
                position: absolute;
                left: 100%;
                width: 30px;
                top: -6px;
                text-align: right;
                white-space: nowrap;
                font-size: 9px;
                line-height: 10px;
            }
            .labels {
                display: flex;
                margin-top: 4px;
                font-size: 9px;
                line-height: 12px;
            }
            .labels span {
                flex: 1;
                min-width: 0;
                text-align: center;
                white-space: nowrap;
                overflow: visible;
                display: flex;
                justify-content: center;
            }
            .foot {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            .averages,
            .legend {
                display: flex;
                flex-wrap: wrap;
                gap: 2px 14px;
                font-size: 12px;
                line-height: 18px;
            }
            .averages b {
                color: var(--primary-text-color);
                font-weight: 500;
            }
            .legend {
                font-size: 11px;
            }
            .legend i {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 2px;
                margin-right: 5px;
            }
            .legend i.other {
                background: repeating-linear-gradient(
                    135deg,
                    color-mix(in srgb, var(--secondary-text-color) 40%, transparent) 0 2px,
                    transparent 2px 4px
                );
                border: 1px solid var(--divider-color);
                box-sizing: border-box;
            }
            @container (max-width: 286px) {
                .total .value {
                    font-size: 22px;
                }
                .totals {
                    gap: 4px 14px;
                }
            }
        `;
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "state-time-card": StateTimeCard;
    }
}
