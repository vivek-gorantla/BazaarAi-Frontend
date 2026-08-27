import React, { useEffect, useRef } from "react";
import { AgentUIRegistry } from "../registry";
import { AgentFieldType } from "../registry/types";

interface AgentSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    agentId: string;
    agentLabel: string;
    agentType?: AgentFieldType;
    agentDescription?: string;
}

export const AgentSelect = React.forwardRef<HTMLSelectElement, AgentSelectProps>(({
    agentId,
    agentLabel,
    agentType = "select",
    agentDescription,
    value,
    onChange,
    required,
    disabled,
    children,
    ...props
}, forwardedRef) => {
    const localRef = useRef<HTMLSelectElement | null>(null);
    const onChangeRef = useRef(onChange);
    const propsNameRef = useRef(props.name);

    useEffect(() => {
        onChangeRef.current = onChange;
        propsNameRef.current = props.name;
    });

    useEffect(() => {
        AgentUIRegistry.registerFields([{
            id: agentId,
            label: agentLabel,
            type: agentType,
            value: value,
            required,
            editable: !disabled,
            description: agentDescription,
            setValue: (newValue: unknown) => {
                const fieldName = propsNameRef.current || agentId;
                const strVal = String(newValue ?? "");

                if (localRef.current) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLSelectElement.prototype,
                        "value"
                    )?.set;
                    if (nativeSetter) {
                        nativeSetter.call(localRef.current, strVal);
                    } else {
                        localRef.current.value = strVal;
                    }
                    localRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                }

                if (onChangeRef.current) {
                    const event = {
                        target: {
                            name: fieldName,
                            value: strVal
                        }
                    } as React.ChangeEvent<HTMLSelectElement>;
                    onChangeRef.current(event);
                }
            }
        }]);

        return () => {
            AgentUIRegistry.removeField(agentId);
        };
    }, [agentId, agentLabel, agentType, agentDescription, required, disabled]);

    useEffect(() => {
        const field = AgentUIRegistry.getField(agentId);
        if (field) {
            field.value = value;
        }
    }, [value, agentId]);

    const setRefs = (element: HTMLSelectElement | null) => {
        localRef.current = element;
        if (typeof forwardedRef === "function") {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLSelectElement | null>).current = element;
        }
    };

    return (
        <select
            ref={setRefs}
            value={value as string | number | readonly string[] | undefined}
            onChange={onChange}
            required={required}
            disabled={disabled}
            {...props}
        >
            {children}
        </select>
    );
});

AgentSelect.displayName = "AgentSelect";
