import type { AgentField } from "../registry/types";

interface AgentFieldsProps {
    fields: AgentField[];
    onChange: (fieldId: string, value: unknown) => void;
}

export const AgentFields = ({
    fields,
    onChange,
}: AgentFieldsProps) => {
    return (
        <div>
            {fields.map((field) => (
                <div key={field.id}>
                    <label htmlFor={field.id}>
                        {field.label}
                    </label>

                    <input
                        id={field.id}
                        type={field.type}
                        value={String(field.value ?? "")}
                        placeholder={field.placeholder}
                        required={field.required}
                        disabled={field.editable === false}
                        onChange={(event) =>
                            onChange(
                                field.id,
                                event.target.value
                            )
                        }
                    />
                </div>
            ))}
        </div>
    );
};