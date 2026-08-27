export type AgentFieldType =
    | "text"
    | "email"
    | "tel"
    | "number"
    | "select"
    | "textarea"
    | "checkbox"
    | "date"
    | "time"
    | "file";

export type AgentUIAction = {
    id: string;

    label: string;

    type:
    | "submit"
    | "next"
    | "previous"
    | "cancel";

    enabled: boolean;
};

export interface AgentField {
    id: string;

    label: string;

    type: AgentFieldType;

    value: unknown;

    required?: boolean;

    editable?: boolean;

    options?: string[];

    description?: string;

    placeholder?: string;
}

export interface AgentUIContext {
    pageId: string;

    pageTitle: string;

    fields: AgentField[];

    actions: AgentUIAction[];
}

