# Deflection

Disclaimer: This component was built by the community at large and is not an official Coveo JSUI Component. Use this component at your own risk.

## Getting Started

1. Install the component into your project.

```
npm i @coveops/deflection
```

2. Use the Component or extend it

Typescript:

```javascript
import { DeflectionInterface, IDeflectionInterfaceOptions, Deflection, IDeflectionOptions, DeflectionField, IFieldDeflectionOptions, Submit, ISubmitOptions, Cancel, ICancelOptions, DeflectionEvents } from '@coveops/deflection';
```

Javascript

```javascript
const Deflection = require('@coveops/deflection').Deflection;
```

3. You can also expose the component alongside other components being built in your project.

```javascript
export * from '@coveops/deflection'
```

4. Or for quick testing, you can add the script from unpkg

```html
<script src="https://unpkg.com/@coveops/deflection@latest/dist/index.min.js"></script>
```

> Disclaimer: Unpkg should be used for testing but not for production.

5. Include the components in your template as follows:

Instead of using the standard CoveoSearchInterface component, we use the CoveoDeflectionInterface component.
On the left side of the screen, we create a contact form that allows users to input mandatory information to open a support case.
The contact form is created using CoveoDeflection, CoveoDeflectionField, CoveoDeflectionSubmit and CoveoDeflectionCancel components.
By configuring caseField option on the CoveoDeflectionField component, we are sending the input value in the query context so we can override `q` and `lq` in the query pipeline. This is following the same documented approach to build a Self-Service Case Deflection using Coveo for Salesforce or Coveo for ServiceNow.

```html
<div id="coveo-self-service-case-deflection-interface" class="CoveoDeflectionInterface" data-enable-history="false" data-auto-trigger-query="true" style="border: 1px solid #ccc; padding-bottom: 10px;">
    <div class="CoveoAnalytics"></div>
    <div class="coveo-case-creation-column">
        <div class="CoveoDeflection">
            <h4>How Can We Help You?</h4>

            <div class="field CoveoDeflectionField" data-case-field="InputProduct">
                <textarea rows="2" placeholder="Product"></textarea>
            </div>
            <div class="field CoveoDeflectionField" data-case-field="InputSubject">
                <textarea rows="2" placeholder="Subject"></textarea>
            </div>
            <div class="field CoveoDeflectionField" data-case-field="InputDescription">
                <textarea rows="8" placeholder="Description"></textarea>
            </div>
            <button class="ui button CoveoDeflectionSubmit" type="submit">Submit</button>
            <button class="ui button CoveoDeflectionCancel" type="submit">Cancel</button>
        </div>
    </div>
    <div class="coveo-results-column results-with-actions">
        <!--  Add needed Coveo JS UI components -->
        <div class="CoveoResultList" data-layout="list" data-wait-animation="fade" data-auto-select-fields-to-include="true">
            <!--  Add needed Coveo JS UI results templates -->
        </div>
    </div>
</div>
```

6. Sending contact form information as context with the query:

After the user updates the content of the form, the deflection panel triggers a query with a context object. The naming of the context keys came from the configuration of the CoveoDeflectionField components caseField option.

```json
{
    "InputProduct":"productA",
    "InputSubject":"subject a b c",
    "InputDescription":"description x y z"
}
```

7. Self-Service Case Deflection - Query Pipeline configuration:

    You can start with the following custom Query Parameters rules:
    - Override query parameter enableQuerySyntax with false	
    - Override query parameter partialMatch with true	
    - Override query parameter partialMatchKeywords with 2	
    - Override query parameter partialMatchThreshold with 35%	
    - Override query parameter lqPartialMatchKeywords with 3	
    - Override query parameter lqPartialMatchThreshold with 50%	
    - Override query parameter q with <@+ $context.InputSubject +@>	
    - Override query parameter lq with <@+ $context.InputSubject $context.InputDescription +@>

    You can also leverage context values to create custom Result Ranking rules:

    - +100 | @product==@context$context.InputProduct | Context[InputProduct] is not empty

    To learn more about the query pipeline configuration, refer to the online documentation for both Coveo for Salesforce and Coveo for ServiceNow:
    - https://docs.coveo.com/en/2111/coveo-for-servicenow/configure-the-coveo-case-deflection-panel
    - https://docs.coveo.com/en/1163/coveo-for-salesforce/integrating-a-coveo-case-deflection-component

## Extending

Extending the component can be done as follows:

```javascript
import { Deflection, IDeflectionOptions } from "@coveops/deflection";

export interface IExtendedDeflectionOptions extends IDeflectionOptions {}

export class ExtendedDeflection extends Deflection {}
```

## Contribute

1. Clone the project
2. Copy `.env.dist` to `.env` and update the COVEO_ORG_ID and COVEO_TOKEN fields in the `.env` file to use your Coveo credentials and SERVER_PORT to configure the port of the sandbox - it will use 8080 by default.
3. Build the code base: `npm run build`
4. Serve the sandbox for live development `npm run serve`