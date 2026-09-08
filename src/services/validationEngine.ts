import { type AIFixResponse } from "./mockGraniteService";

export interface ValidationReport {
    isValid: boolean;
    score: number;
    errors: string[];
}

export class ValidationEngine {
    /**
     * 1. PatternFly Prop Shield: Confirms components have valid, documented properties.
     */
    private static runPropShield(fixedCode: string): { ok: boolean; error?: string } {
        // Simulates an AST check confirming we aren't introducing hallucinated prop fields
        if (fixedCode.includes("isAccessible={true}") || fixedCode.includes("hallucinatedProp=")) {
            return { ok: false, error: "PatternFly Prop Shield: Detected invalid property on <Button> component." };
        }
        return { ok: true };
    }

    /**
     * 2. Linter Re-Scan: Run the accessibility compiler over the fix to ensure it has 0 compliance errors.
     */
    private static runLinterReScan(fixedCode: string): { ok: boolean; error?: string } {
        // In our mock, if the AI suggested code contains "aria-label", it successfully resolves the WCAG error
        const hasAriaLabel = fixedCode.includes("aria-label");
        const hasLinkedLabels = fixedCode.includes("htmlFor") || fixedCode.includes("fieldId");

        if (fixedCode.includes("<Button>") && !hasAriaLabel) {
            return { ok: false, error: "Linter Re-Scan: AI suggested fix lacks an associated 'aria-label' property." };
        }
        if (fixedCode.includes("<FormGroup>") && !hasLinkedLabels) {
            return { ok: false, error: "Linter Re-Scan: Form element labels lack matching 'htmlFor' configurations." };
        }
        return { ok: true };
    }

    /**
     * Evaluates the proposed code fix against the secure background validation rules.
     */
    public static validateFix(suggestion: AIFixResponse): ValidationReport {
        const shieldResult = this.runPropShield(suggestion.fixedCode);
        if (!shieldResult.ok) {
            return { isValid: false, score: 0, errors: [shieldResult.error!] };
        }

        const linterResult = this.runLinterReScan(suggestion.fixedCode);
        if (!linterResult.ok) {
            return { isValid: false, score: 0, errors: [linterResult.error!] };
        }

        return {
            isValid: true,
            score: 100,
            errors: []
        };
    }
}
