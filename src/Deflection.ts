import { Component, IComponentBindings, ComponentOptions } from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';

import {
    DeflectionEvents,
    IDeflectionFieldChangeEventArgs,
    IDeflectionSubmitClickEventArgs,
    IDeflectionAddFieldEventArgs,
    IDeflectionCancelClickEventArgs,
    IDeflectionCreateCaseEventArgs
} from './events/DeflectionEvents';
import { DeflectionField } from './fields/Field';
import { Input } from './core/Input';
import { DeflectionQueryGenerator } from './DeflectionQueryGenerator';

export interface IDeflectionOptions {
    searchSort: string;
    useSomeQRE: boolean;
    someBest: string;
    someMatch: string;
    someMaximum: number;
    searchDelay: number;
    searchType: string;
    openLinkInNewWindow: boolean;
    useDefaultRule: boolean;
    sendCaseDataToAnalytic: boolean;
    useLongQuery: boolean;
}

export interface IAnalyticsCaseDeflectionInputChangeMeta extends Coveo.IAnalyticsCaseCreationInputChangeMeta {
    [name: string]: string;
}

@lazyComponent
export class Deflection extends Component {
    static ID = 'Deflection';
    static options: IDeflectionOptions = {
        searchSort: Coveo.ComponentOptions.buildStringOption({ defaultValue: 'relevancy' }),
        useSomeQRE: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false }),
        someBest: Coveo.ComponentOptions.buildStringOption({ defaultValue: '' }),
        someMatch: Coveo.ComponentOptions.buildStringOption({ defaultValue: '1' }),
        someMaximum: Coveo.ComponentOptions.buildNumberOption({ defaultValue: 300, min: 0 }),
        searchDelay: Coveo.ComponentOptions.buildNumberOption({ defaultValue: 500, min: 0 }),
        searchType: Coveo.ComponentOptions.buildStringOption({ defaultValue: '' }),
        openLinkInNewWindow: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: true }),
        useDefaultRule: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: true }),
        sendCaseDataToAnalytic: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: true }),
        useLongQuery: Coveo.ComponentOptions.buildBooleanOption({ defaultValue: false })
    };

    private fields: DeflectionField[] = [];
    private searchTimeout: number;
    private shouldLogOnUnload: boolean = true;
    private hasClicks: boolean = false;
    private visitId: string = null;
    private beforeUnload: (...args: any[]) => void;

    constructor(public element: HTMLElement, public options: IDeflectionOptions, public bindings: IComponentBindings) {
        super(element, Deflection.ID, bindings);
        this.options = ComponentOptions.initComponentOptions(element, Deflection, options);

        this.bindEvents();
        this.forceFetchVisitId();
    }

    private forceFetchVisitId(): Promise<string> {
        let promise = this.usageAnalytics.getCurrentVisitIdPromise();
        promise.then((visitId) => {
            this.visitId = visitId == null ? '' : visitId;
        }).catch(() => {
            this.logger.error('Unable to fetch visit id ! Please investigate the network call to the analytics service');
        });
        return promise;
    }

    private bindEvents() {
        this.bind.onRootElement(DeflectionEvents.addField, (args: IDeflectionAddFieldEventArgs) => { this.handleAddField(args); });

        this.bind.onRootElement(DeflectionEvents.fieldChange, (args: IDeflectionFieldChangeEventArgs) => { this.handleFieldChange(args); });
        this.bind.onRootElement(DeflectionEvents.submitClick, (args: IDeflectionSubmitClickEventArgs) => { this.handleSubmitClick(args); });
        this.bind.onRootElement(DeflectionEvents.cancelClick, (args: IDeflectionCancelClickEventArgs) => { this.handleCancelClick(args); });

        this.bind.onRootElement(Coveo.QueryEvents.buildingQuery, (args: Coveo.IBuildingQueryEventArgs) => { this.handleBuildingQuery(args); });
        this.beforeUnload = () => this.handlePageUnload();
        window.addEventListener('beforeunload', () => this.beforeUnload());


        this.bind.onRootElement(Coveo.InitializationEvents.nuke, this.handleNuke);
        this.bind.onRootElement(Coveo.ResultListEvents.newResultDisplayed, (args: Coveo.IDisplayedNewResultEventArgs) => { this.handleResultLinkClick(args); });
    }

    private handleNuke() {
        window.removeEventListener('beforeunload', () => this.beforeUnload());
    }

    private handlePageUnload() {
        if (this.shouldLogOnUnload) {
            this.usageAnalytics.logCustomEvent<Coveo.IAnalyticsCaseCreationDeflectionMeta>(
                Coveo.analyticsActionCauseList.caseCreationUnloadPage,
                this.buildAnalyticMetadata(),
                this.element);
        }
    }

    private handleResultLinkClick(args: Coveo.IDisplayedNewResultEventArgs) {
        this.bind.on(Coveo.$$(args.item).find('.' + Coveo.Component.computeCssClassNameForType(Coveo.ResultLink.ID)), 'click', () => {
            this.hasClicks = true;
        });
    }

    private handleAddField(args: IDeflectionAddFieldEventArgs) {
        this.fields.push(args.field);
    }

    private handleFieldChange(args: IDeflectionFieldChangeEventArgs) {
        this.startNewSearchTimeout(args);
    }

    private handleCancelClick(args: IDeflectionCancelClickEventArgs) {
        this.usageAnalytics.logCustomEvent<Coveo.IAnalyticsCaseCreationDeflectionMeta>(
            Coveo.analyticsActionCauseList.caseCreationCancelButton,
            this.buildAnalyticMetadata(), this.element);

        // We don't want to log an unload since we already canceled the case
        this.shouldLogOnUnload = false;

        this.queryController.deferExecuteQuery({
            beforeExecuteQuery: () => {
                this.usageAnalytics.logSearchEvent<Coveo.IAnalyticsNoMeta>(Coveo.analyticsActionCauseList.caseCreationCancelButton, {});
            }
        });
    }

    private handleSubmitClick(args: IDeflectionSubmitClickEventArgs) {
        this.visitId = this.usageAnalytics.getCurrentVisitId();

        if (this.isValid()) {
            // We don't want to log an unload since we submited the case
            this.shouldLogOnUnload = false;

            this.createCase(args.redirectURL);
        }
    }


    private addFieldsToDataToSendOnCreateCaseArgs(args: IDeflectionCreateCaseEventArgs, inputs: Input[]): IDeflectionCreateCaseEventArgs {
        _.each(inputs, (input: Input) => {
            var caseField = input.getCaseField();
            if (caseField) {
                args.fields[caseField] = input.getValue();
            }
        });

        args.visitId = this.visitId;
        return args;
    }

    private handleBuildingQuery(args: Coveo.IBuildingQueryEventArgs) {
        if (this.options.useSomeQRE) {
            this.addSomeOnAllKeywordsExtension(args.queryBuilder);
        } else if (this.options.useLongQuery) {
            this.addAllKeywordsForMLRefinedQuery(args.queryBuilder);
        }

        this.addFieldsToContext(args.queryBuilder);
        this.addCaseCreationQueryExpression(args.queryBuilder);
    }

    private addFieldsToContext(queryBuilder: Coveo.QueryBuilder) {
        const fieldsContext = this.getFieldsContext(this.fields);
        queryBuilder.addContext(fieldsContext);
    }
    private addAllKeywordsForMLRefinedQuery(queryBuilder: Coveo.QueryBuilder) {
        var keywords = this.getAllKeywords();

        if (!Coveo.Utils.isNullOrEmptyString(keywords)) {
            queryBuilder.longQueryExpression.add(keywords);
        }
    }

    private addSomeOnAllKeywordsExtension(queryBuilder: Coveo.QueryBuilder) {
        var keywords = this.getAllKeywords();
        if (Coveo.Utils.trim(keywords) !== '') {
            var query = DeflectionQueryGenerator.generateSomeQuery(keywords, this.options.someBest, this.options.someMatch, true, this.options.someMaximum);
            queryBuilder.expression.add(query);
        }
    }

    private getAllKeywords(): string {
        var keywords = this.getKeywords(this.fields);

        // to support breakchange in JS Framework
        // String.Utils.latinize (newer version) vs String.Utils.removePunctiation (older version)

        if (Coveo.StringUtils['latinize']) {
            keywords = Coveo.StringUtils.latinize(keywords);
        } else {
            keywords = Coveo.StringUtils['removePunctuation'](keywords);
            if (keywords.split(' ').length > this.options.someMaximum) {
                keywords = keywords.split(' ').slice(0, this.options.someMaximum).join(' ');
            }
        }
        return Coveo.Utils.trim(keywords);
    }

    private getKeywords(array: Input[]): string {
        var keywords = '';
        _.each(array, (input: Input) => {
            if (input.searchIsValid()) {
                keywords += input.getValue() + ' ';
            }
        });
        return keywords;
    }

    private getFieldsContext(array: Input[]): any {
        var context = {};
        _.each(array, (input: Input) => {
            var caseField = input.getCaseField();
            if (input.searchIsValid() && caseField) {
                context[caseField] = input.getValue();
            }
        });
        return context;
    }

    private addCaseCreationQueryExpression(queryBuilder: Coveo.QueryBuilder) {
        var extensions = '';
        if (this.options.searchType !== '') {
            extensions += DeflectionQueryGenerator.generateType(this.options.searchType);
        }
        extensions += DeflectionQueryGenerator.generateSort(this.options.searchSort);
        queryBuilder.advancedExpression.add(extensions);
    }

    private isValid(): boolean {
        return this.inputsAreValid(this.fields);
    }

    private inputsAreValid(array: Input[]): boolean {
        for (var i = 0; i < array.length; i++) {
            if (!array[i].isValid()) {
                return false;
            }
        }
        return true;
    }

    public createCase(redirectURL: string) {
        var dataToSendOnCreateCase: IDeflectionCreateCaseEventArgs = {
            fields: {},
            visitId: this.visitId,
            redirectURL: redirectURL,
            useDefaultRule: this.options.useDefaultRule
        };

        this.addFieldsToDataToSendOnCreateCaseArgs(dataToSendOnCreateCase, this.fields);

        this.usageAnalytics.logCustomEvent<Coveo.IAnalyticsCaseCreationDeflectionMeta>(
            Coveo.analyticsActionCauseList.caseCreationSubmitButton,
            this.buildAnalyticMetadata(),
            this.element);

        Coveo.$$(this.element).trigger(DeflectionEvents.createCase, dataToSendOnCreateCase);
    }

    private startNewSearchTimeout(args: IDeflectionFieldChangeEventArgs) {
        this.cancelAnyPendingSearchTimeout();
        this.searchTimeout = window.setTimeout(() => {
            this.queryController.deferExecuteQuery({
                beforeExecuteQuery: () => {
                    if (args.field.options.enableAnalytic) {
                        let dynamicFieldValue: string = (args.field.options.caseField || 'input') + 'Value';
                        var inputChangeMeta: IAnalyticsCaseDeflectionInputChangeMeta = {
                            inputTitle: args.field.options.title || 'No title',
                            input: args.field.options.caseField,
                            value: args.field.getValue(),
                            [dynamicFieldValue]: args.field.getValue()
                        };
                        this.usageAnalytics.logSearchAsYouType<IAnalyticsCaseDeflectionInputChangeMeta>(Coveo.analyticsActionCauseList.caseCreationInputChange, inputChangeMeta);
                    }
                }
            });
        }, this.options.searchDelay);
    }

    private cancelAnyPendingSearchTimeout() {
        if (Coveo.Utils.exists(this.searchTimeout)) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = undefined;
        }
    }

    private buildAnalyticMetadata(): Coveo.IAnalyticsCaseCreationDeflectionMeta {
        var values: { [field: string]: string } = {};

        // Similar to field change event, output a custom meta with format {fieldname}Value={value}. Dont remove previous impl (using values[]) for now.
        let retval: Coveo.IAnalyticsCaseCreationDeflectionMeta = {
            hasClicks: this.hasClicks,
            values: values
        };
        if (this.options.sendCaseDataToAnalytic) {
            _.each(this.fields, (field: DeflectionField) => {
                values[field.getCaseField()] = field.getValue();
                let dynamicFieldValue: string = (field.getCaseField() || 'input') + 'Value';
                retval[dynamicFieldValue] = field.getValue();
            });
        }

        return retval;
    }
}