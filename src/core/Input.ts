
export interface Input {
    getQueryExpression?: () => string;
    searchIsValid(): boolean;
    setValid(): void;
    setInvalid(): void;
    isValid(): boolean;
    getValue(): string;
    getCaseField(): string;
    setValue(value: string, triggerChange: boolean): void;
}
