import { DeflectionEvents, IDeflectionAddFieldEventArgs, IDeflectionFieldChangeEventArgs } from '../events/DeflectionEvents';
import { $$, Component, ComponentOptions, IComponentBindings } from 'coveo-search-ui';
import { Input } from '../core/Input';
import { lazyComponent } from '@coveops/turbo-core';

export interface IFieldDeflectionOptions {
    title: string;
    caseField: string;
    numberOfLines: number;
    tooltip: string;
    isRequired: boolean;
    enableSearch: boolean;
    enableAnalytic: boolean;
    enableObserver: boolean;
    observerOnAttribute: boolean;
    observerOnChildList: boolean;
    observerOnCharacterData: boolean;
    observerOnSubtree: boolean;

}

@lazyComponent
export class DeflectionField extends Component implements Input {
    static ID = 'DeflectionField';

    static options: IFieldDeflectionOptions = {
        title: ComponentOptions.buildStringOption(),
        caseField: ComponentOptions.buildStringOption(),
        numberOfLines: ComponentOptions.buildNumberOption({ defaultValue: 1, min: 1 }),
        tooltip: ComponentOptions.buildStringOption(),
        isRequired: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        enableSearch: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        enableAnalytic: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        enableObserver: ComponentOptions.buildBooleanOption({ defaultValue: false }),
        observerOnAttribute: ComponentOptions.buildBooleanOption({ defaultValue: true, depend: 'enableObserver' }),
        observerOnChildList: ComponentOptions.buildBooleanOption({ defaultValue: true, depend: 'enableObserver' }),
        observerOnCharacterData: ComponentOptions.buildBooleanOption({ defaultValue: true, depend: 'enableObserver' }),
        observerOnSubtree: ComponentOptions.buildBooleanOption({ defaultValue: true, depend: 'enableObserver' })
    };

    private valid: boolean = true;
    private previousValue: string = null;

    constructor(public element: HTMLElement,
        public options: IFieldDeflectionOptions,
        bindings?: IComponentBindings) {
        super(element, DeflectionField.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, DeflectionField, options);


        if (this.options.enableObserver) {
            var that = this;
            // create an observer instance
            var observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    // console.log(mutation.type);
                    that.bindEvent();
                });
            });

            // configuration of the observer:
            var config = {
                attributes: this.options.observerOnAttribute,
                childList: this.options.observerOnChildList,
                characterData: this.options.observerOnChildList,
                subtree: this.options.observerOnSubtree,
            };

            // pass in the target node, as well as the observer options
            observer.observe(this.element, config);
        }

        this.bindEvent();
        this.register();
    }

    private bindEvent() {
        $$($$(this.element).find('input,textarea,select')).addClass('coveo-case-field-input');
        $$(this.element).findClass('coveo-case-field-input').forEach((el) => $$(el).on('input', () => this.handleFieldChange()));
        this.bind.onRootElement(DeflectionEvents.submitClick, () => this.handleSubmitClick());
        this.bind.onRootElement(DeflectionEvents.cancelClick, () => this.handleCancelClick());
    }

    private register() {
        var dataToSendOnAddField: IDeflectionAddFieldEventArgs = {
            field: this
        };
        $$(this.element).trigger(DeflectionEvents.addField, dataToSendOnAddField);
    }

    private handleFieldChange() {
        this.setValid();
        if (this.options.enableSearch) {
            // IE trigger events when we change the placeholder.
            // Make sure we send a change event only when there's a real change.
            var value = this.getValue();

            // Don't trigger an event if the value is the same as the previous one
            if (this.previousValue != null && value != this.previousValue ||
                // Don't trigger an event if it's the first one and the value is empty.
                this.previousValue == null && value != '') {
                this.previousValue = value;
                var datatoSendOnFieldChange: IDeflectionFieldChangeEventArgs = {
                    field: this
                };
                $$(this.element).trigger(DeflectionEvents.fieldChange, datatoSendOnFieldChange);
            }
        }
    }

    private handleCancelClick() {
        this.setValue('', false);
        $$(this.element).removeClass('coveo-filled');
        if (this.options.title) {
            $$(this.element).find('input,textarea').setAttribute('placeholder', this.options.title);
        }
        this.setValid();
    }

    private handleSubmitClick() {
        if (this.options.isRequired && this.getValue() == '') {
            this.setInvalid();
        }
    }

    public searchIsValid(): boolean {
        return this.options.enableSearch && this.getValue() !== '';
    }

    public setValid() {
        $$(this.element).removeClass('coveo-case-invalid-field');
        this.valid = true;
    }

    public setInvalid() {
        $$(this.element).addClass('coveo-case-invalid-field');
        this.valid = false;
    }

    public isValid(): boolean {
        if (this.options.isRequired && this.getValue() === '') {
            return false;
        }
        return this.valid;
    }

    public getValue() {
        var fieldInput = (<HTMLInputElement>$$(this.element).find('.coveo-case-field-input'));
        return fieldInput ? fieldInput.value : '';
    }

    public getCaseField() {
        return this.options.caseField;
    }

    public setValue(value: string, triggerChange = true) {
        var fieldInput = (<HTMLInputElement>$$(this.element).find('.coveo-case-field-input'));
        if (fieldInput) {
            fieldInput.value = value;
            if (triggerChange) {
                $$(this.element).trigger(DeflectionEvents.fieldChange);
            }
        }
    }
}