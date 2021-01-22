import { IInitializationParameters, Initialization } from 'coveo-search-ui';
import { DeflectionInterface } from './DeflectionInterface';

export function initDeflection(element: HTMLElement, options: any = {}) {
  Initialization.initializeFramework(element, options, () => {
    return initDeflectionInterface(element, options);
  });
}

function initDeflectionInterface(element: HTMLElement, options: any = {}) {
  options = Initialization.resolveDefaultOptions(element, options);
  var searchInterface = new DeflectionInterface(element, options.DeflectionInterface, options.Analytics);
  searchInterface.options.originalOptionsObject = options;
  var initParameters: IInitializationParameters = { options: options, bindings: searchInterface.getBindings() };
  return Initialization.automaticallyCreateComponentsInside(element, initParameters);
}

Initialization.registerNamedMethod('initDeflection', (element?: HTMLElement, options: any = {}) => {
  initDeflection(element, options);
});
