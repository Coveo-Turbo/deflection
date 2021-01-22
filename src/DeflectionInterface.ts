import { Dom, ISearchInterfaceOptions, SearchInterface, ComponentOptions, IAnalyticsOptions, $$, l } from "coveo-search-ui";

export interface IDeflectionInterfaceOptions extends ISearchInterfaceOptions {
    beforeSearchMessage: string;
}

export class DeflectionInterface extends SearchInterface {
    public options: IDeflectionInterfaceOptions;
    public firstMessage: Dom;

    static options: ISearchInterfaceOptions = _.extend({}, SearchInterface.options, {
        autoTriggerQuery: ComponentOptions.buildBooleanOption({ defaultValue: false }),
        hideUntilFirstQuery: ComponentOptions.buildBooleanOption({ defaultValue: true }),
        firstLoadingAnimation: ComponentOptions.buildChildHtmlElementOption({
            childSelector: '.coveo-first-loading-animation',
            defaultFunction: () => DeflectionInterface.getBasicLoadingAnimation().el
        }),
        beforeSearchMessage: ComponentOptions.buildStringOption({ defaultValue: 'StartTypingCaseForSuggestions' })
    });

    static ID = 'DeflectionInterface';

    public constructor(public element: HTMLElement, options: IDeflectionInterfaceOptions, analyticsOptions: IAnalyticsOptions) {
        super(element, ComponentOptions.initComponentOptions(element, DeflectionInterface, options), analyticsOptions);
    }

    public static getBasicLoadingAnimation() {
        return $$('div', { 'className': 'coveo-case-creation-first-loading-animation' });
    }

    public showWaitAnimation() {
        $$(this.options.firstLoadingAnimation).detach();
        $$(this.element).addClass('coveo-waiting-for-first-query');
        if (this.options.beforeSearchMessage) {
            this.firstMessage = $$('div', { 'className': 'coveo-case-creation-before-search-message' });
            this.firstMessage.setHtml(l(this.options.beforeSearchMessage));
        } else {
            this.firstMessage = $$('div');
        }
        $$(this.element).find('.coveo-results-column').appendChild(this.firstMessage.el);
        $$(this.element).find('.coveo-results-column').appendChild(this.options.firstLoadingAnimation);
    }

    public hideWaitAnimation() {
        $$(this.options.firstLoadingAnimation).addClass('coveo-fade-in');
        var removeAnimation = () => {
            $$(this.options.firstLoadingAnimation).detach();
        };
        setTimeout(removeAnimation, 500);
        this.firstMessage.detach();
        $$(this.element).removeClass('coveo-waiting-for-first-query');
    }
}
