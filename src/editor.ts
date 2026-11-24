/**
 * The card's visual editor: the entity, the title, the states to count with their names, colours and counters, the
 * range the bars open at, and how the card rounds its height to the rows of a sections view.
 */
import { LitElement, css, html, nothing } from "lit";
import type { CSSResultGroup, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import type { HomeAssistant } from "./hass";
import { browserLanguage, translate } from "./localize/localize";
import { rowStepData, rowStepSchema, tidyRowStep } from "./rows";
import { DEFAULT_RANGE, RANGES } from "./types";
import type { StateConfig, StateTimeCardConfig } from "./types";

interface SchemaEntry {
    name: string;
}

/** A field inside the object selector takes its label and helper from the schema, as ha-form's computeLabel doesn't reach it. */
function schema(config: StateTimeCardConfig, text: (key: string) => string) {
    return [
        { name: "entity", required: true, selector: { entity: {} } },
        { name: "title", selector: { text: {} } },
        {
            name: "states",
            required: true,
            selector: {
                object: {
                    multiple: true,
                    label_field: "state",
                    description_field: "name",
                    fields: {
                        state: {
                            label: text("editor.state"),
                            description: text("editor.state_helper"),
                            required: true,
                            selector: { text: {} },
                        },
                        name: { label: text("editor.name"), selector: { text: {} } },
                        color: { label: text("editor.color"), description: text("editor.color_helper"), selector: { text: {} } },
                        counter: {
                            label: text("editor.counter"),
                            description: text("editor.counter_helper"),
                            selector: { entity: { filter: { domain: "sensor", integration: "history_stats" } } },
                        },
                    },
                },
            },
        },
        {
            name: "days",
            selector: {
                select: {
                    mode: "dropdown",
                    options: RANGES.map((days) => ({ value: String(days), label: text("card.days").replace("{count}", String(days)) })),
                },
            },
        },
        ...rowStepSchema(config, text),
    ];
}

/** The form's values: every state as an object, the range as the select's string. */
export function formData(config: StateTimeCardConfig): Record<string, unknown> {
    const states = (config.states ?? []).map((entry) => (typeof entry === "string" ? { state: entry } : entry));
    return { ...rowStepData(config), states, days: String(config.days ?? DEFAULT_RANGE) };
}

/** The form's values as the card's configuration: a state with nothing but its name as a string, defaults and empty values left out. */
export function configFromForm(value: Record<string, unknown>): StateTimeCardConfig {
    const config = tidyRowStep({ ...value }) as StateTimeCardConfig & { days?: unknown };
    config.states = ((value.states as StateConfig[] | undefined) ?? []).map((entry) => {
        const tidy: StateConfig = { state: entry.state };
        for (const key of ["name", "color", "counter"] as const) {
            if (entry[key]) {
                tidy[key] = entry[key];
            }
        }
        return Object.keys(tidy).length === 1 ? tidy.state : tidy;
    });
    const days = Number(config.days);
    if (!days || days === DEFAULT_RANGE) {
        delete config.days;
    } else {
        config.days = days;
    }
    if (!config.title) {
        delete config.title;
    }
    return config;
}

@customElement("state-time-card-editor")
export class StateTimeCardEditor extends LitElement {
    @property({ attribute: false }) public hass?: HomeAssistant;
    @state() private config: StateTimeCardConfig = { type: "custom:state-time-card", entity: "", states: [] };

    public setConfig(config: StateTimeCardConfig): void {
        this.config = { ...config };
    }

    protected render(): TemplateResult | typeof nothing {
        if (!this.hass) {
            return nothing;
        }
        const text = (key: string) => translate(this.language(), key);
        const data = formData(this.config);
        const fields = schema(this.config, text);
        // Two forms, so that the states' helper, which Home Assistant's list of objects doesn't show, sits under the states.
        const form = (part: unknown[]) => html`
            <ha-form
                .hass=${this.hass}
                .data=${data}
                .schema=${part}
                .computeLabel=${(entry: SchemaEntry) => text(`editor.${entry.name}`)}
                .computeHelper=${(entry: SchemaEntry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
        return html`${form(fields.slice(0, 3))}
            <p class="helper">${text("editor.states_helper")}</p>
            ${form(fields.slice(3))}`;
    }

    static get styles(): CSSResultGroup {
        return css`
            .helper {
                margin: 8px 0 16px;
                padding: 0 16px;
                font-size: 12px;
                line-height: 1.4;
                color: var(--secondary-text-color);
            }
        `;
    }

    private valueChanged(event: CustomEvent<{ value: Record<string, unknown> }>): void {
        const config = configFromForm(event.detail.value);
        this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
    }

    private helper(name: string): string | undefined {
        const key = `editor.${name}_helper`;
        const helper = translate(this.language(), key);
        return helper === key ? undefined : helper;
    }

    private language(): string {
        return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
    }
}

declare global {
    interface HTMLElementTagNameMap {
        "state-time-card-editor": StateTimeCardEditor;
    }
}
