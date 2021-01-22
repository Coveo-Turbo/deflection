import { lazyComponent } from '@coveops/turbo-core';
import { $$, Component, ComponentOptions, IComponentBindings } from 'coveo-search-ui';
import { DeflectionEvents } from '../events/DeflectionEvents';

export interface ICancelOptions {
    title: string;
    redirectUrl: string;
}

@lazyComponent
export class Cancel extends Component {
    static ID = 'DeflectionCancel';

    static options: ICancelOptions = {
        title: ComponentOptions.buildStringOption({ defaultValue: 'Cancel' }),
        redirectUrl: ComponentOptions.buildStringOption({ defaultValue: '' })
    };

    constructor(public element: HTMLElement, public options: ICancelOptions, bindings?: IComponentBindings) {
        super(element, Cancel.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, Cancel, options);
        this.bindClick();
    }

    private bindClick() {
        this.bind.on(this.element, 'click', () => this.cancel());
    }

    public cancel() {
        $$(this.element).trigger(DeflectionEvents.cancelClick);
        if (this.options.redirectUrl != '') {
            this.redirect(this.options.redirectUrl);
        }
    }

    public redirect(url: string) {
        window.location.href = url;
    }

}
