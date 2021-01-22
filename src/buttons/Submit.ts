import { lazyComponent } from "@coveops/turbo-core";
import { Component, ComponentOptions, IComponentBindings, $$, Initialization } from "coveo-search-ui";
import { IDeflectionSubmitClickEventArgs, DeflectionEvents } from "../events/DeflectionEvents";

export interface ISubmitOptions {
    title: string;
    redirectUrl: string;
}

@lazyComponent
export class Submit extends Component {
    static ID = 'DeflectionSubmit';

    static options: ISubmitOptions = {
        title: ComponentOptions.buildStringOption({ defaultValue: 'Submit' }),
        redirectUrl: ComponentOptions.buildStringOption({ defaultValue: '' })
    };

    constructor(public element: HTMLElement,
        public options: ISubmitOptions,
        bindings?: IComponentBindings) {

        super(element, Submit.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, Submit, options);
        this.bindClick();
    }

    private bindClick() {
        this.bind.on(this.element, 'click', () => this.submit());
    }

    public submit() {
        var dataToSendOnSubmit: IDeflectionSubmitClickEventArgs = {
            redirectURL: this.options.redirectUrl
        };
        // Usage analytics event for case created is handled in top level CaseCreation Component
        // because it takes care of validating that all input are valid
        // before submit.
        $$(this.element).trigger(DeflectionEvents.submitClick, dataToSendOnSubmit);
    }

}
