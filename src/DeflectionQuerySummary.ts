import { Component, IComponentBindings, ComponentOptions, IQuerySuccessEventArgs, QueryEvents, $$, l } from 'coveo-search-ui';
import { lazyComponent } from '@coveops/turbo-core';

export interface IDeflectionQuerySummaryOptions {
  messageOnNoResult: string;
}

@lazyComponent
export class DeflectionQuerySummary extends Component {
  static options: IDeflectionQuerySummaryOptions = {
    messageOnNoResult: ComponentOptions.buildStringOption({ defaultValue: l('CaseCreation_NoResults') })
  };
  static ID = 'DeflectionQuerySummary';

  constructor(public element: HTMLElement, public options: IDeflectionQuerySummaryOptions, bindings?: IComponentBindings) {
    super(element, DeflectionQuerySummary.ID, bindings);
    this.options = ComponentOptions.initComponentOptions(element, DeflectionQuerySummary, options);

    this.bind.onRootElement(QueryEvents.querySuccess, (args: IQuerySuccessEventArgs) => this.handleQuerySuccess(args));
    $$(this.element).addClass('coveo-hidden');
  }

  private handleQuerySuccess(args: IQuerySuccessEventArgs) {
    if (args.results.results.length == 0) {
      $$(this.element).removeClass('coveo-hidden');
      $$(this.element).setHtml(l(this.options.messageOnNoResult));
    } else {
      $$(this.element).addClass('coveo-hidden');
      $$(this.element).empty();
    }
  }
}