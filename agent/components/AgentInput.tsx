import React, { useEffect, useRef } from "react";
import { AgentUIRegistry } from "../registry";
import { AgentFieldType } from "../registry/types";

interface AgentInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    agentId: string;
    agentLabel: string;
    agentType?: AgentFieldType;
    agentDescription?: string;
}

export const AgentInput = React.forwardRef<HTMLInputElement, AgentInputProps>(({
    agentId,
    agentLabel,
    agentType = "text",
    agentDescription,
    value,
    onChange,
    required,
    disabled,
    placeholder,
    ...props
}, forwardedRef) => {
    const localRef = useRef<HTMLInputElement | null>(null);
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
            placeholder,
            setValue: (newValue: unknown) => {
                const fieldName = propsNameRef.current || agentId;
                const strVal = String(newValue ?? "");

                // 1. Direct native input element value set & dispatch input event for React / DOM
                if (localRef.current) {
                    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLInputElement.prototype,
                        "value"
                    )?.set;
                    if (nativeInputValueSetter) {
                        nativeInputValueSetter.call(localRef.current, strVal);
                    } else {
                        localRef.current.value = strVal;
                    }
                    localRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                    localRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                }

                // 2. Invoke the latest onChange handler with synthetic event
                if (onChangeRef.current) {
                    const event = {
                        target: {
                            name: fieldName,
                            value: strVal
                        }
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChangeRef.current(event);
                }
            }
        }]);

        return () => {
            AgentUIRegistry.removeField(agentId);
        };
    }, [agentId, agentLabel, agentType, agentDescription, required, disabled, placeholder]);

    // Update value in registry if it changes from outside
    useEffect(() => {
        const field = AgentUIRegistry.getField(agentId);
        if (field) {
            field.value = value;
        }
    }, [value, agentId]);

    const setRefs = (element: HTMLInputElement | null) => {
        localRef.current = element;
        if (typeof forwardedRef === "function") {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLInputElement | null>).current = element;
        }
    };

    return (
        <input
            ref={setRefs}
            value={value as string | number | readonly string[] | undefined}
            onChange={onChange}
            required={required}
            disabled={disabled}
            placeholder={placeholder}
            {...props}
        />
    );
});

AgentInput.displayName = "AgentInput";
