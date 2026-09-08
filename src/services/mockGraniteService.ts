export interface AIFixResponse {
    ruleId: string;
    wcagCriterion: string;
    severity: "A" | "AA" | "AAA";
    explanation: string;
    originalCode: string;
    fixedCode: string;
}

export const MOCK_GRANITE_FIXES: Record<string, AIFixResponse> = {
    "Button.tsx": {
        ruleId: "jsx-a11y/control-has-associated-label",
        wcagCriterion: "WCAG 2.1.1 (Keyboard) & 4.1.2 (Name, Role, Value)",
        severity: "A",
        explanation: "Replaced raw HTML <button> containing an unlabelled icon with PatternFly's standard <Button> component. Injected an explicit 'aria-label' and utilized PatternFly's native SVG icons to guarantee screen reader compatibility.",
        originalCode: `export const AddButton = ({ onClick }) => {
  return (
    <button className="pf-v5-c-button pf-m-primary" onClick={onClick}>
      <i className="fas fa-plus"></i>
    </button>
  );
};`,
        fixedCode: `import { Button } from '@patternfly/react-core';
import PlusCircleIcon from '@patternfly/react-icons/dist/esm/icons/plus-circle-icon';

export const AddButton = ({ onClick }) => {
  return (
    <Button variant="primary" onClick={onClick} aria-label="Add new cluster item">
      <PlusCircleIcon />
    </Button>
  );
};`
    },

    "FormField.tsx": {
        ruleId: "jsx-a11y/label-has-associated-control",
        wcagCriterion: "WCAG 1.3.1 (Info and Relationships)",
        severity: "A",
        explanation: "Linked the PatternFly <FormGroup> label with the nesting <TextInput> using matching 'id' and 'fieldId' attributes so assistive technologies can resolve the input's context.",
        originalCode: `export const UsernameField = () => {
  return (
    <div className="form-group">
      <label>Username</label>
      <input type="text" className="pf-v5-c-form-control" />
    </div>
  );
};`,
        fixedCode: `import { FormGroup, TextInput } from '@patternfly/react-core';

export const UsernameField = () => {
  return (
    <FormGroup label="Username" isRequired fieldId="username-input">
      <TextInput isRequired type="text" id="username-input" name="username-input" />
    </FormGroup>
  );
};`
    }
};

/**
 * Simulates an API call to a Granite Code Model running securely on Red Hat OpenShift AI.
 * (Now wrapped and managed by the Developer Lightspeed Orchestration Middleware)
 */
export function requestRawGraniteFix(fileName: string): Promise<AIFixResponse | null> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOCK_GRANITE_FIXES[fileName] || null);
        }, 1500); // 1.5 seconds simulated inference latency
    });
}