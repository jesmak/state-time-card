import { describe, expect, it } from "vitest";

import { DAY, HOUR, startOfDay } from "../src/data";
import type { Change } from "../src/data";
import { configFromForm, formData } from "../src/editor";
import type { HomeAssistant } from "../src/hass";
import { averageOf, durationParts, stubConfig } from "../src/state-time-card";
import type { StateTimeCard } from "../src/state-time-card";
import { statesOf } from "../src/types";
import type { StateTimeCardConfig } from "../src/types";

describe("clicking a bar", () => {
    it("shows the bar's day at the top, and today again on a second click", async () => {
        const zone = "UTC";
        const midnight = startOfDay(Date.now(), zone);
        const card = document.createElement("state-time-card") as StateTimeCard;
        card.setConfig({ type: "custom:state-time-card", entity: "switch.tv", states: ["on"] });
        card.hass = {
            states: { "switch.tv": { entity_id: "switch.tv", state: "off", last_changed: "", attributes: {} } },
            config: { time_zone: zone },
            language: "en",
        };
        // Three days ago the TV was on for two hours, and off since.
        (card as unknown as { changes: Change[] }).changes = [
            { time: midnight - 3 * DAY, state: "off" },
            { time: midnight - 3 * DAY + 8 * HOUR, state: "on" },
            { time: midnight - 3 * DAY + 10 * HOUR, state: "off" },
        ];
        document.body.appendChild(card);
        await card.updateComplete;
        const root = card.shadowRoot as ShadowRoot;
        const text = (selector: string) => (root.querySelector(selector)?.textContent ?? "").replace(/\s+/g, " ").trim();
        const bar = () => [...root.querySelectorAll<HTMLButtonElement>(".day")].at(-4) as HTMLButtonElement;
        const today = text(".date");
        expect(text(".total .value")).toBe("0min");

        bar().click();
        await card.updateComplete;
        expect(text(".date")).not.toBe(today);
        expect(text(".total .value")).toBe("2h 00min");
        expect(bar().classList.contains("shown")).toBe(true);
        expect(root.querySelectorAll(".segment")).toHaveLength(1);

        bar().click();
        await card.updateComplete;
        expect(text(".date")).toBe(today);
        expect(text(".total .value")).toBe("0min");
        card.remove();
    });
});

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
