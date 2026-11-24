import { describe, expect, it } from "vitest";

import {
    HOUR,
    changesOf,
    dayFormatter,
    filled,
    historyStart,
    hoursFromCounter,
    hoursFromHistory,
    lastDays,
    mergeChanges,
    needsFetch,
    segmentsOf,
    startOfDay,
    toHours,
} from "../src/data";

const ZONE = "Europe/Helsinki";
/** A moment written in Helsinki's local time, given its offset that day. */
const at = (local: string, offset = "+02:00") => Date.parse(`${local}${offset}`);

describe("startOfDay", () => {
    it("is local midnight on an ordinary day", () => {
        expect(startOfDay(at("2026-11-24T15:30:12"), ZONE)).toBe(at("2026-11-24T00:00:00"));
    });

    it("is local midnight on the day the clocks go forward, 23 hours long", () => {
        expect(startOfDay(at("2026-03-29T20:00:00", "+03:00"), ZONE)).toBe(at("2026-03-29T00:00:00", "+02:00"));
    });

    it("is local midnight on the day the clocks go back, 25 hours long", () => {
        expect(startOfDay(at("2026-10-25T20:00:00", "+02:00"), ZONE)).toBe(at("2026-10-25T00:00:00", "+03:00"));
    });

    it("is local midnight before the clocks go forward on that day", () => {
        expect(startOfDay(at("2026-03-29T02:30:00", "+02:00"), ZONE)).toBe(at("2026-03-29T00:00:00", "+02:00"));
    });

    it("is local midnight in both runs of the hour the clocks go back over", () => {
        expect(startOfDay(at("2026-10-25T03:30:00", "+03:00"), ZONE)).toBe(at("2026-10-25T00:00:00", "+03:00"));
        expect(startOfDay(at("2026-10-25T03:30:00", "+02:00"), ZONE)).toBe(at("2026-10-25T00:00:00", "+03:00"));
    });

    it("is the moment itself at midnight", () => {
        expect(startOfDay(at("2026-11-24T00:00:00"), ZONE)).toBe(at("2026-11-24T00:00:00"));
    });
});

describe("lastDays", () => {
    it("ends today and counts back without skipping a day the clocks moved on", () => {
        const days = lastDays(3, at("2026-10-26T01:00:00"), ZONE).map((day) => day.day);
        expect(days).toEqual(["2026-10-24", "2026-10-25", "2026-10-26"]);
    });
});

describe("changesOf", () => {
    it("reads the minimal history's states and times, oldest first", () => {
        const answer = { "sensor.desk": [{ s: "istuu", lu: 200 }, { s: "seisoo", lc: 100 }, { s: 5 }] };
        expect(changesOf(answer, "sensor.desk")).toEqual([
            { time: 100_000, state: "seisoo" },
            { time: 200_000, state: "istuu" },
        ]);
    });
});

describe("segmentsOf", () => {
    const changes = [
        { time: at("2026-11-23T22:00:00"), state: "pois" },
        { time: at("2026-11-24T09:00:00"), state: "seisoo" },
        { time: at("2026-11-24T10:00:00"), state: "unavailable" },
        { time: at("2026-11-24T10:05:00"), state: "pois" },
        { time: at("2026-11-24T11:00:00"), state: "istuu" },
    ];

    it("clips to the window, marks uncounted states null and joins neighbours", () => {
        const from = at("2026-11-24T00:00:00");
        expect(segmentsOf(changes, from, at("2026-11-24T12:00:00"), ["seisoo", "istuu"])).toEqual([
            { start: from, end: at("2026-11-24T09:00:00"), state: null },
            { start: at("2026-11-24T09:00:00"), end: at("2026-11-24T10:00:00"), state: "seisoo" },
            { start: at("2026-11-24T10:00:00"), end: at("2026-11-24T11:00:00"), state: null },
            { start: at("2026-11-24T11:00:00"), end: at("2026-11-24T12:00:00"), state: "istuu" },
        ]);
    });

    it("leaves out the time before the first change", () => {
        expect(segmentsOf(changes.slice(1), at("2026-11-24T00:00:00"), at("2026-11-24T09:30:00"), ["seisoo"])).toEqual([
            { start: at("2026-11-24T09:00:00"), end: at("2026-11-24T09:30:00"), state: "seisoo" },
        ]);
    });
});

describe("hoursFromHistory", () => {
    const days = lastDays(3, at("2026-11-24T12:00:00"), ZONE);

    it("counts each day's hours in the state up to now, and nothing for days before the history starts", () => {
        const changes = [
            { time: at("2026-11-23T20:00:00"), state: "on" },
            { time: at("2026-11-24T02:00:00"), state: "off" },
            { time: at("2026-11-24T10:00:00"), state: "on" },
        ];
        expect(hoursFromHistory(changes, "on", days, at("2026-11-24T12:00:00"), ZONE)).toEqual([null, 4, 4]);
    });

    it("has nothing at all without history", () => {
        expect(hoursFromHistory([], "on", days, at("2026-11-24T12:00:00"), ZONE)).toEqual([null, null, null]);
    });

    it("counts a 25-hour day in full", () => {
        const change = [{ time: at("2026-10-24T12:00:00", "+03:00"), state: "on" }];
        const long = lastDays(2, at("2026-10-26T12:00:00"), ZONE);
        expect(hoursFromHistory(change, "on", long, at("2026-10-26T12:00:00"), ZONE)).toEqual([25, 12]);
    });

    it("counts a 23-hour day in full", () => {
        const change = [{ time: at("2026-03-28T12:00:00"), state: "on" }];
        const short = lastDays(2, at("2026-03-30T12:00:00", "+03:00"), ZONE);
        expect(hoursFromHistory(change, "on", short, at("2026-03-30T12:00:00", "+03:00"), ZONE)).toEqual([23, 12]);
    });
});

describe("hoursFromCounter", () => {
    const days = lastDays(3, at("2026-11-25T12:00:00"), ZONE);
    const hour = (local: string, max: number) => ({ start: at(local), max });

    it("takes each day's highest hour, leaving out the hour from midnight that still holds the day before's total", () => {
        const rows = [
            hour("2026-11-23T22:00:00", 6),
            hour("2026-11-23T23:00:00", 7.5),
            // The counter starts over at midnight, but this hour began with yesterday's 7.5.
            hour("2026-11-24T00:00:00", 7.5),
            hour("2026-11-24T01:00:00", 0),
            hour("2026-11-24T15:00:00", 1.25),
        ];
        expect(hoursFromCounter(rows, days, null, ZONE)).toEqual([7.5, 1.25, null]);
    });

    it("takes today's total from the counter's own state", () => {
        expect(hoursFromCounter([hour("2026-11-25T09:00:00", 1)], days, 2.5, ZONE)).toEqual([null, null, 2.5]);
    });

    it("skips rows with no maximum", () => {
        expect(hoursFromCounter([{ start: at("2026-11-24T05:00:00"), max: null }], days, null, ZONE)).toEqual([null, null, null]);
    });

    it("gives the hour over midnight to the day it began in, where hours start on the half hour", () => {
        const india = lastDays(2, Date.parse("2026-11-25T12:00:00+05:30"), "Asia/Kolkata");
        const rows = [
            { start: Date.parse("2026-11-24T22:30:00+05:30"), max: 5 },
            // Begins with the 24th's 5 hours and the counter starts over during it.
            { start: Date.parse("2026-11-24T23:30:00+05:30"), max: 5 },
            { start: Date.parse("2026-11-25T00:30:00+05:30"), max: 0.5 },
            { start: Date.parse("2026-11-25T01:30:00+05:30"), max: 1 },
        ];
        expect(hoursFromCounter(rows, india, null, "Asia/Kolkata")).toEqual([5, 1]);
    });
});

describe("filled", () => {
    it("takes the counter's days and the history's where the counter has none", () => {
        expect(filled([null, null, 3, 4], [1, null, 9, 9])).toEqual([1, null, 3, 4]);
    });
});

describe("needsFetch", () => {
    const asked = { key: "sensor.desk|sensor.a", from: at("2026-11-11T00:00:00"), day: "2026-11-24" };

    it("asks first, and again for other counters, a new day or a range reaching further back", () => {
        expect(needsFetch(undefined, asked)).toBe(true);
        expect(needsFetch(asked, { ...asked, key: "sensor.desk|" })).toBe(true);
        expect(needsFetch(asked, { ...asked, day: "2026-11-25" })).toBe(true);
        expect(needsFetch(asked, { ...asked, from: asked.from - 30 * 24 * HOUR })).toBe(true);
    });

    it("keeps the answers for the same or a shorter range", () => {
        expect(needsFetch(asked, asked)).toBe(false);
        expect(needsFetch(asked, { ...asked, from: asked.from + 7 * 24 * HOUR })).toBe(false);
    });
});

describe("historyStart", () => {
    const days = lastDays(4, at("2026-11-24T12:00:00"), ZONE);

    it("is the range's first day while a state has no counter", () => {
        expect(historyStart([[1, 2, 3, 4], null], days, ZONE)).toBe(at("2026-11-21T00:00:00"));
    });

    it("is the first past day a counter has no statistics for", () => {
        expect(historyStart([[null, null, 3, null]], days, ZONE)).toBe(at("2026-11-21T00:00:00"));
        expect(historyStart([[5, null, 3, null]], days, ZONE)).toBe(at("2026-11-22T00:00:00"));
    });

    it("is today's midnight once the counters cover every past day", () => {
        expect(historyStart([[1, 2, 3, null]], days, ZONE)).toBe(at("2026-11-24T00:00:00"));
    });
});

describe("mergeChanges", () => {
    it("keeps the changes the card was handed after the answer's last, and none the answer has", () => {
        const fetched = [
            { time: 100, state: "on" },
            { time: 200, state: "off" },
        ];
        const current = [
            { time: 150, state: "on" },
            { time: 200, state: "off" },
            { time: 220, state: "on" },
            { time: 300, state: "off" },
        ];
        expect(mergeChanges(fetched, current)).toEqual([...fetched, { time: 220, state: "on" }, { time: 300, state: "off" }]);
    });
});

describe("toHours", () => {
    it("converts the units a duration sensor can be shown in", () => {
        expect(toHours(2, "h")).toBe(2);
        expect(toHours(90, "min")).toBe(1.5);
        expect(toHours(1800, "s")).toBe(0.5);
        expect(toHours(1, "d")).toBe(24);
    });
});

it("days are Home Assistant's, not the browser's", () => {
    const time = at("2026-11-24T23:30:00");
    expect(dayFormatter(ZONE)(time)).toBe("2026-11-24");
    expect(dayFormatter("UTC")(time + 2 * HOUR)).toBe("2026-11-24");
});
