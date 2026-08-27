import type {
    AgentField,
    AgentUIAction,
    AgentUIContext,
} from "./types";


export type RegisteredAgentField = AgentField & {
    setValue: (value: unknown) => void;
};

class AgentUIRegistry {
    private pageId = "";
    private pageName = "";

    private fields = new Map<string, RegisteredAgentField>();
    private actions = new Map<string, AgentUIAction>();

    registerPage(pageId: string, pageName: string) {
        this.pageId = pageId;
        this.pageName = pageName;
    }

    registerFields(fields: RegisteredAgentField[]) {
        fields.forEach((field) => {
            this.fields.set(field.id, field);
        });
    }

    registerActions(actions: AgentUIAction[]) {
        actions.forEach((action) => {
            this.actions.set(action.id, action);
        });
    }

    getField(id: string): RegisteredAgentField | undefined {
        return this.fields.get(id);
    }

    getAction(id: string): AgentUIAction | undefined {
        return this.actions.get(id);
    }

    removeField(id: string): boolean {
        return this.fields.delete(id);
    }

    removeAction(id: string): boolean {
        return this.actions.delete(id);
    }

    getFields(): RegisteredAgentField[] {
        return Array.from(this.fields.values());
    }

    getActions(): AgentUIAction[] {
        return Array.from(this.actions.values());
    }

    getUIContext(): AgentUIContext {
        return {
            pageId: this.pageId,
            pageTitle: this.pageName,
            fields: this.getFields(),
            actions: this.getActions(),
        };
    }

    clear() {
        this.pageId = "";
        this.pageName = "";
        this.fields.clear();
        this.actions.clear();
    }
}

export default new AgentUIRegistry();