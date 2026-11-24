/** The little of Home Assistant a card needs, so the unmaintained custom-card-helpers isn't a dependency. */

export interface HassEntity {
    entity_id: string;
    state: string;
    last_changed: string;
    attributes: Record<string, unknown>;
}

/** One part of an entity's name, as `formatEntityName` puts them together. */
export interface NamePart {
    type: "entity" | "device" | "area" | "floor";
}

export interface HomeAssistant {
    states: Record<string, HassEntity | undefined>;
    language?: string;
    locale?: { language?: string };
    config?: { time_zone?: string };
    /** A websocket command, such as a recorder query. */
    callWS?: <T>(message: Record<string, unknown>) => Promise<T>;
    /** An entity's name from its device's and its own, since Home Assistant 2026.11. */
    formatEntityName?(state: HassEntity, parts: NamePart[]): string;
    /** A state as Home Assistant shows it, translated. */
    formatEntityState?(state: HassEntity, value?: string): string;
}

export interface LovelaceCardConfig {
    type: string;
    [key: string]: unknown;
}
