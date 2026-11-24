import { describe, expect, it } from "vitest";

import { configFromForm, formData } from "../src/editor";
import type { HomeAssistant } from "../src/hass";
import { averageOf, durationParts, stubConfig } from "../src/state-time-card";
import { statesOf } from "../src/types";
import type { StateTimeCardConfig } from "../src/types";

describe("durationParts", () => {
    it("rounds to the minute and carries a full hour", () => {
        expect(durationParts(7.15)).toEqual({ hours: 7, minutes: 9 });
        expect(durationParts(1.9999)).toEqual({ hours: 2, minutes: 0 });
        expect(durationParts(0.25)).toEqual({ hours: 0, minutes: 15 });
    });
});

describe("averageOf", () => {
    it("averages the days with a value, leaving today out", () => {
        expect(averageOf([null, 2, 4, 100])).toBe(3);
        expect(averageOf([null, 5])).toBeNull();
    });
});

describe("stubConfig", () => {
    it("picks an entity that is on or off", () => {
        const hass = { states: { "sensor.a": {}, "switch.tv": {} } } as unknown as HomeAssistant;
        expect(stubConfig(hass)).toEqual({ entity: "switch.tv", states: ["on"] });
    });
});

describe("statesOf", () => {
    it("gives each state the theme's colour in order unless it has its own", () => {
        const states = statesOf({ states: ["on", { state: "idle", color: "red" }] });
        expect(states).toEqual([
            { state: "on", color: "var(--primary-color)" },
            { state: "idle", color: "red" },
        ]);
    });
});

describe("the editor", () => {
    const config: StateTimeCardConfig = {
        type: "custom:state-time-card",
        entity: "sensor.desk",
        states: ["seisoo", { state: "istuu", name: "Istuen", color: "#6b7d99", counter: "sensor.istuma_aika" }],
        days: 30,
        row_step: "half",
    };

    it("round-trips a configuration, a state with nothing else written as a string", () => {
        expect(configFromForm(formData(config))).toEqual(config);
    });

    it("leaves out the default range, an empty title and empty fields of a state", () => {
        const value = { ...formData(config), days: "14", row_step: "full", title: "", states: [{ state: "on", name: "", color: "" }] };
        expect(configFromForm(value)).toEqual({ type: "custom:state-time-card", entity: "sensor.desk", states: ["on"] });
    });
});
