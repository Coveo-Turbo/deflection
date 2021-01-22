import { DeflectionField } from "../fields/Field";

export interface IDeflectionFieldChangeEventArgs {
    field: DeflectionField;
}

export interface IDeflectionSubmitClickEventArgs {
    redirectURL: string;
}

export interface IDeflectionCancelClickEventArgs {
}

export interface IDeflectionCreateCaseEventArgs {
    fields: {};
    visitId: string;
    redirectURL: string;
    useDefaultRule: boolean;
}

export interface IDeflectionAddFieldEventArgs {
    field: DeflectionField;
}

export class DeflectionEvents {
    public static picklistChange = 'deflectionPicklistChange';
    public static fieldChange = 'deflectionFieldChange';
    public static submitClick = 'deflectionSubmitClick';
    public static cancelClick = 'deflectionCancelClick';

    public static addPicklist = 'deflectionAddPicklist';
    public static addField = 'deflectionAddField';

    public static createCase = 'createCase';
}
