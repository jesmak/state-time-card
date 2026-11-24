import type { LovelaceCardConfig } from "./hass";
import type { RowStepConfig } from "./rows";

/** A state the card counts. Written as a plain string when it has nothing but the state. */
export interface StateConfig {
    state: string;
    /** Shown instead of the state as Home Assistant translates it. */
    name?: string;
    /** Any CSS colour. Each state has a default from the theme. */
    color?: string;
    /** A History Stats sensor of type time for this state, starting at midnight, whose statistics give days the history no longer has. */
    counter?: string;
}

export interface StateTimeCardConfig extends LovelaceCardConfig, RowStepConfig {
    entity: string;
    states: Array<string | StateConfig>;
    title?: string;
    /** The range the bars open at. */
    days?: number;
}

/** The ranges offered for the bars, in days. */
export const RANGES = [14, 30, 60, 90];
export const DEFAULT_RANGE = 14;

/** Each state's colour when it sets none, in order: the theme's own where it has one. */
export const COLORS = [
    "var(--primary-color)",
    "var(--state-time-card-second-color, #6b7d99)",
    "var(--info-color, #039be5)",
    "var(--warning-color, #ffa600)",
    "var(--success-color, #43a047)",
    "var(--error-color, #db4437)",
];

/** The states as objects, each with its colour, an entry left without its state dropped. */
export function statesOf(config: Pick<StateTimeCardConfig, "states">): Array<StateConfig & { color: string }> {
    return (config.states ?? [])
        .map((entry) => (typeof entry === "string" ? { state: entry } : entry))
        .filter((entry) => entry?.state)
        .map((state, index) => ({ ...state, color: state.color || COLORS[index % COLORS.length] }));
}
