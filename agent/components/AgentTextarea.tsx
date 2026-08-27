import React, { useEffect, useRef } from "react";
import { AgentUIRegistry } from "../registry";
import { AgentFieldType } from "../registry/types";

interface AgentTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    agentId: string;
    agentLabel: string;
    agentType?: AgentFieldType;
    agentDescription?: string;
}

export const AgentTextarea = React.forwardRef<HTMLTextAreaElement, AgentTextareaProps>(({
    agentId,
    agentLabel,
    agentType = "textarea",
    agentDescription,
    value,
    onChange,
    required,
    disabled,
    placeholder,
    ...props
}, forwardedRef) => {
    const localRef = useRef<HTMLTextAreaElement | null>(null);
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

                if (localRef.current) {
                    const nativeSetter = Object.getOwnPropertyDescriptor(
                        window.HTMLTextAreaElement.prototype,
                        "value"
                    )?.set;
                    if (nativeSetter) {
                        nativeSetter.call(localRef.current, strVal);
                    } else {
                        localRef.current.value = strVal;
                    }
                    localRef.current.dispatchEvent(new Event("input", { bubbles: true }));
                    localRef.current.dispatchEvent(new Event("change", { bubbles: true }));
                }

                if (onChangeRef.current) {
                    const event = {
                        target: {
                            name: fieldName,
                            value: strVal
                        }
                    } as React.ChangeEvent<HTMLTextAreaElement>;
                    onChangeRef.current(event);
                }
            }
        }]);

        return () => {
            AgentUIRegistry.removeField(agentId);
        };
    }, [agentId, agentLabel, agentType, agentDescription, required, disabled, placeholder]);

    useEffect(() => {
        const field = AgentUIRegistry.getField(agentId);
        if (field) {
            field.value = value;
        }
    }, [value, agentId]);

    const setRefs = (element: HTMLTextAreaElement | null) => {
        localRef.current = element;
        if (typeof forwardedRef === "function") {
            forwardedRef(element);
        } else if (forwardedRef) {
            (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = element;
        }
    };

    return (
        <textarea
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

AgentTextarea.displayName = "AgentTextarea";
