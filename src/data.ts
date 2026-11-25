/**
 * Time spent in each state, from Home Assistant's recorder.
 *
 * Today's timeline, and the daily totals of a state without a counter, come from the entity's state history, which the
 * recorder keeps for ten days by default. A state with a counter (a History Stats sensor of type time that starts at
 * midnight) takes its daily totals from the counter's hourly long-term statistics, which are kept for good: a day's
 * total is the highest of its hourly maximums. Days are Home Assistant's, in its time zone, as that is when the
 * counters start over.
 */
import type { HomeAssistant } from "./hass";

export const MINUTE = 60_000;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;

/** A state the entity took, and when. */
export interface Change {
    time: number;
    state: string;
}

/** A stretch of the timeline. `state` is null for a state that isn't counted. */
export interface Segment {
    start: number;
    end: number;
    state: string | null;
}

/** A calendar day in Home Assistant's time zone, as `YYYY-MM-DD`, with a moment inside it. */
export interface Day {
    day: string;
    time: number;
}

/** One row of `recorder/statistics_during_period`. Times are milliseconds. */
export interface StatisticRow {
    start: number;
    max?: number | null;
}

const formatters = new Map<string, Intl.DateTimeFormat>();

/** A formatter per time zone and options, made once: making one costs far more than using it, and a card asks for thousands. */
function formatter(timeZone: string | undefined, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = `${timeZone ?? ""}|${JSON.stringify(options)}`;
    let format = formatters.get(key);
    if (!format) {
        format = new Intl.DateTimeFormat("en-CA", { timeZone, hourCycle: "h23", ...options });
        formatters.set(key, format);
    }
    return format;
}

function part(parts: Intl.DateTimeFormatPart[], type: string): string {
    return parts.find((entry) => entry.type === type)?.value ?? "";
}

/** A function that gives the calendar day of a moment in Home Assistant's time zone, as `YYYY-MM-DD`. */
export function dayFormatter(timeZone?: string): (time: number) => string {
    const format = formatter(timeZone, { year: "numeric", month: "2-digit", day: "2-digit" });
    return (time) => {
        const parts = format.formatToParts(new Date(time));
        return `${part(parts, "year")}-${part(parts, "month")}-${part(parts, "day")}`;
    };
}

/**
 * The moment a day starts in the time zone: midnight, found by stepping back from a moment inside the day. A day that
 * daylight saving time makes 23 or 25 hours long still starts at its own midnight.
 */
export function startOfDay(time: number, timeZone?: string): number {
    const format = formatter(timeZone, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    const parts = format.formatToParts(new Date(time));
    const since = (Number(part(parts, "hour")) * 3600 + Number(part(parts, "minute")) * 60 + Number(part(parts, "second"))) * 1000;
    const guess = time - since - (time % 1000);
    // A day whose clocks moved since midnight is an hour off: the day of the moment an hour later or earlier says which way.
    const dayOf = dayFormatter(timeZone);
    const day = dayOf(time);
    if (dayOf(guess) !== day) {
        return guess + HOUR;
    }
    return dayOf(guess - HOUR) === day ? guess - HOUR : guess;
}

/** The moment the day that starts at `start` ends, the next midnight, whether the day is 23, 24 or 25 hours long. */
export function endOfDay(start: number, timeZone?: string): number {
    return startOfDay(start + DAY + 2 * HOUR, timeZone);
}

/** Whether the changes reach back to `start`: their first is the state the entity was in at that moment or before it. */
export function covers(changes: Change[] | undefined, start: number): boolean {
    return Boolean(changes?.length) && (changes as Change[])[0].time <= start;
}

/**
 * The day shown at the top after a bar is clicked: the bar's day, or none, meaning today, when the bar is today's or the
 * day already shown.
 */
export function nextSelection(current: string | undefined, clicked: string, today: string): string | undefined {
    return clicked === today || clicked === current ? undefined : clicked;
}

/**
 * The last `count` days, oldest first and ending today, each with a moment inside it. Stepping back a few hours at a
 * time never skips or repeats a day, whatever daylight saving time does.
 */
export function lastDays(count: number, now: number, timeZone?: string): Day[] {
    const dayOf = dayFormatter(timeZone);
    const days: Day[] = [];
    for (let time = now; days.length < count; time -= 6 * HOUR) {
        const day = dayOf(time);
        if (days[0]?.day !== day) {
            days.unshift({ day, time });
        }
    }
    return days;
}

/** The changes in a minimal `history/history_during_period` answer, oldest first. */
export function changesOf(answer: Record<string, Array<Record<string, unknown>>> | undefined, id: string): Change[] {
    const changes: Change[] = [];
    for (const row of answer?.[id] ?? []) {
        const seconds = Number(row.lc ?? row.lu);
        if (typeof row.s === "string" && Number.isFinite(seconds)) {
            changes.push({ time: seconds * 1000, state: row.s });
        }
    }
    return changes.sort((one, other) => one.time - other.time);
}

/**
 * The timeline between `from` and `to`: each stretch the entity spent in one state, a state not counted as null, and
 * neighbours in the same state joined. The time before the first change on record is left out, as nothing is known of it.
 */
export function segmentsOf(changes: Change[], from: number, to: number, counted: string[]): Segment[] {
    const segments: Segment[] = [];
    changes.forEach((change, index) => {
        const start = Math.max(change.time, from);
        const end = Math.min(changes[index + 1]?.time ?? to, to);
        if (end <= start) {
            return;
        }
        const state = counted.includes(change.state) ? change.state : null;
        const last = segments[segments.length - 1];
        if (last && last.state === state && last.end === start) {
            last.end = end;
        } else {
            segments.push({ start, end, state });
        }
    });
    return segments;
}

/**
 * Each day's hours in `state` from the state history, or null for a day the history doesn't reach: one that ended
 * before its first change. A day the history starts in counts from that change.
 */
export function hoursFromHistory(changes: Change[], state: string, days: Day[], now: number, timeZone?: string): Array<number | null> {
    const first = changes[0]?.time;
    return days.map(({ time }) => {
        const start = startOfDay(time, timeZone);
        const end = Math.min(endOfDay(start, timeZone), now);
        if (first === undefined || first >= end) {
            return null;
        }
        const spent = segmentsOf(changes, start, end, [state])
            .filter((segment) => segment.state === state)
            .reduce((sum, segment) => sum + segment.end - segment.start, 0);
        return spent / HOUR;
    });
}

/**
 * Each day's hours from a counter's hourly maximums, or null for a day the statistics don't reach. A day's total is the
 * highest of its hours except its first: an hour's statistics take in the state the counter had when the hour began,
 * which at midnight is still the previous day's total until the counter starts over, so a quiet day would be given the
 * day before's hours. The counter only grows through the day, so leaving out its first hour loses nothing. Today's total
 * is the counter's own state, as the statistics reach only to the last full hour.
 */
export function hoursFromCounter(rows: StatisticRow[], days: Day[], live: number | null, timeZone?: string): Array<number | null> {
    const dayOf = dayFormatter(timeZone);
    const totals = new Map<string, number>();
    for (const row of rows) {
        const day = dayOf(row.start);
        if (typeof row.max !== "number" || dayOf(row.start - HOUR) !== day) {
            continue;
        }
        totals.set(day, Math.max(totals.get(day) ?? row.max, row.max));
    }
    return days.map(({ day }, index) => {
        if (index === days.length - 1 && live !== null) {
            return live;
        }
        return totals.get(day) ?? null;
    });
}

/**
 * A counter's days, with the days its statistics don't reach filled from the state history where that has them: a
 * counter counts only from the day it was made, while the history may reach further back.
 */
export function filled(counter: Array<number | null>, history: Array<number | null>): Array<number | null> {
    return counter.map((value, index) => value ?? history[index] ?? null);
}

/** What the card last asked the recorder for: the entity and counters, from when, and on which day. */
export interface Asked {
    key: string;
    from: number;
    day: string;
}

/** Whether the recorder must be asked again: for another entity or counters, a range reaching further back, or a new day. */
export function needsFetch(asked: Asked | undefined, wanted: Asked): boolean {
    return !asked || asked.key !== wanted.key || asked.day !== wanted.day || wanted.from < asked.from;
}

/**
 * Where the state history must start: at the range's first day while a state has no counter, or at the first day a
 * counter has no statistics for, and otherwise at today's midnight, for today's timeline. `counters` holds each counted
 * state's days from its counter, null for a state without one. Today is left out, as the counter's own state covers it.
 */
export function historyStart(counters: Array<Array<number | null> | null>, days: Day[], timeZone?: string): number {
    const past = days.slice(0, -1);
    const first = past.findIndex((_, index) => counters.some((hours) => hours === null || hours[index] === null));
    return startOfDay(first === -1 ? days[days.length - 1].time : past[first].time, timeZone);
}

/**
 * The changes a fetch answered with, and after them the changes the card was handed by Home Assistant itself that are
 * newer than the answer's last: they came while the fetch was under way, or before the recorder had written them.
 */
export function mergeChanges(fetched: Change[], current: Change[]): Change[] {
    const last = fetched[fetched.length - 1]?.time ?? -Infinity;
    return [...fetched, ...current.filter((change) => change.time > last)];
}

/** The hours a duration sensor's value stands for, by its unit. Home Assistant's History Stats counts in hours. */
export function toHours(value: number, unit: unknown): number {
    switch (unit) {
        case "d":
            return value * 24;
        case "min":
            return value / 60;
        case "s":
            return value / 3600;
        default:
            return value;
    }
}

/** A counter's state now, in hours, or null while it has none. */
export function counterNow(hass: HomeAssistant, id: string): number | null {
    const entity = hass.states[id];
    const value = Number.parseFloat(entity?.state ?? "");
    return entity && Number.isFinite(value) ? toHours(value, entity.attributes.unit_of_measurement) : null;
}

/** The entity's changes since `from`, with the state it was in at that moment first. */
export async function fetchChanges(hass: HomeAssistant, id: string, from: number, now: number): Promise<Change[]> {
    if (!hass.callWS) {
        return [];
    }
    const answer = await hass.callWS<Record<string, Array<Record<string, unknown>>>>({
        type: "history/history_during_period",
        start_time: new Date(from).toISOString(),
        end_time: new Date(now).toISOString(),
        entity_ids: [id],
        minimal_response: true,
        no_attributes: true,
        significant_changes_only: false,
    });
    return changesOf(answer, id);
}

/** The counters' hourly maximums since `from`, in hours. */
export async function fetchCounters(
    hass: HomeAssistant,
    ids: string[],
    from: number,
    now: number,
): Promise<Record<string, StatisticRow[]>> {
    if (!hass.callWS || ids.length === 0) {
        return {};
    }
    const answer = await hass.callWS<Record<string, StatisticRow[]>>({
        type: "recorder/statistics_during_period",
        start_time: new Date(from).toISOString(),
        end_time: new Date(now).toISOString(),
        statistic_ids: ids,
        period: "hour",
        types: ["max"],
        units: { duration: "h" },
    });
    return answer ?? {};
}
