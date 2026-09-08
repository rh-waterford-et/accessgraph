import React, { useState } from "react";
import { GRAPH_NODES, calculateBlastRadius } from "../utils/codebaseGraph";
import { MOCK_GRANITE_FIXES, type AIFixResponse } from "../services/mockGraniteService";
import { DeveloperLightspeed } from "../services/developerLightspeed";
import { ValidationEngine, type ValidationReport } from "../services/validationEngine";

export const DemoWorkspace: React.FC = () => {
    const [selectedFile, setSelectedFile] = useState<string>("Button.tsx");
    const [editorCode, setEditorCode] = useState<string>(MOCK_GRANITE_FIXES["Button.tsx"].originalCode);
    const [isFixed, setIsFixed] = useState<boolean>(false);

    // AI Query & Validation States
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [aiSuggestion, setAiSuggestion] = useState<AIFixResponse | null>(null);
    const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);

    // Derive Graph States
    const activeBrokenFile = isFixed ? null : selectedFile;
    const { allAffectedNodes, impactedSurfaces, impactCount } = calculateBlastRadius(activeBrokenFile || "");

    // Handlers
    const handleFileChange = (fileName: string) => {
        setSelectedFile(fileName);
        setEditorCode(MOCK_GRANITE_FIXES[fileName]?.originalCode || "");
        setIsFixed(false);
        setAiSuggestion(null);
        setValidationReport(null);
    };

    const handleQueryAI = async () => {
        setIsLoading(true);
        setAiSuggestion(null);
        setValidationReport(null);

        // Get metadata from active fix database for context
        const activeMetadata = MOCK_GRANITE_FIXES[selectedFile];

        // Run query through Developer Lightspeed middleware (secure enterprise wrapper)
        const result = await DeveloperLightspeed.orchestrateRemediation(
            selectedFile,
            editorCode,
            activeMetadata.ruleId,
            activeMetadata.wcagCriterion
        );

        if (result) {
            // Background Engine Code Validation
            const report = ValidationEngine.validateFix(result);
            setAiSuggestion(result);
            setValidationReport(report);
        }

        setIsLoading(false);
    };

    const handleApplyFix = () => {
        if (aiSuggestion && validationReport?.isValid) {
            setEditorCode(aiSuggestion.fixedCode);
            setIsFixed(true);
            setAiSuggestion(null);
            setValidationReport(null);
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans select-none overflow-hidden">

            {/* 1. LEFT PANEL: Simulated VS Code Editor */}
            <div className="w-1/2 border-r border-gray-800 flex flex-col bg-gray-950">
                {/* Editor Titlebar */}
                <div className="h-11 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                        <span className="w-3 h-3 rounded-full bg-red-500"></span>
                        <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-xs text-gray-400 font-mono pl-2">Red Hat Developer Workspace</span>
                    </div>
                    <div>
                        <select
                            value={selectedFile}
                            onChange={(e) => handleFileChange(e.target.value)}
                            className="bg-gray-800 border border-gray-700 text-gray-300 rounded text-xs px-2.5 py-1 font-mono focus:outline-none"
                        >
                            <option value="Button.tsx">src/components/Button.tsx</option>
                            <option value="FormField.tsx">src/components/FormField.tsx</option>
                        </select>
                    </div>
                </div>

                {/* Code Editor Window */}
                <div className="flex-1 p-6 font-mono text-sm relative overflow-auto leading-relaxed">
                    <div className="absolute left-3 top-6 text-gray-600 select-none text-right w-6 pr-2">
                        {editorCode.split("\n").map((_, i) => <div key={i}>{i + 1}</div>)}
                    </div>
                    <pre className="pl-8 bg-transparent text-gray-300 font-mono whitespace-pre focus:outline-none">
                        {isFixed ? (
                            <code className="text-green-400">{editorCode}</code>
                        ) : (
                            <code>
                                {selectedFile === "Button.tsx" ? (
                                    <>
                                        {`export const AddButton = ({ onClick }) => {
  return (`}
                                        <span className="border-b-2 border-dotted border-red-500 bg-red-950/40" title="Missing associated label">
                                            {`\n    <button className="pf-v5-c-button pf-m-primary" onClick={onClick}>
      <i className="fas fa-plus"></i>
    </button>`}
                                        </span>
                                        {`\n  );
};`}
                                    </>
                                ) : (
                                    <>
                                        {`export const UsernameField = () => {
  return (
    <div className="form-group">`}
                                        <span className="border-b-2 border-dotted border-red-500 bg-red-950/40" title="Label lacks associated input">
                                            {`\n      <label>Username</label>
      <input type="text" className="pf-v5-c-form-control" />`}
                                        </span>
                                        {`\n    </div>
  );
};`}
                                    </>
                                )}
                            </code>
                        )}
                    </pre>
                </div>
            </div>

            {/* 2. RIGHT PANEL: AccessGraph VS Code Extension Interface */}
            <div className="w-1/2 flex flex-col bg-gray-900 justify-between">

                {/* Header Panel */}
                <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-950/40">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                        <h2 className="text-sm font-bold tracking-wider text-red-400 uppercase">AccessGraph Analyzer</h2>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-400">Compliance Score:</span>
                        <div className={`px-2.5 py-0.5 rounded text-xs font-bold font-mono transition-colors duration-500 ${isFixed ? "bg-green-900/50 text-green-400 border border-green-700/50" : "bg-red-900/50 text-red-400 border border-red-700/50"
                            }`}>
                            {isFixed ? "100% PASS" : "45% CRITICAL"}
                        </div>
                    </div>
                </div>

                {/* Visual Graph Area */}
                <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
                        Workspace Dependency Tree (BFS Traversal)
                    </h3>

                    <div className="space-y-3 max-w-md mx-auto w-full">
                        {Object.keys(GRAPH_NODES).map((nodeId, idx) => {
                            const node = GRAPH_NODES[nodeId];
                            const isAffected = !isFixed && allAffectedNodes.includes(nodeId);

                            return (
                                <div key={nodeId} className="relative">
                                    {/* Connected arrow (for conceptual visual presentation) */}
                                    {idx > 0 && (
                                        <div className="absolute left-6 -top-3 w-0.5 h-3 bg-gray-800"></div>
                                    )}
                                    <div
                                        className={`flex justify-between items-center p-3 rounded-lg border transition-all duration-500 ${isAffected
                                            ? "border-red-500/60 bg-red-950/20 text-red-200 shadow-lg shadow-red-950/10 animate-pulse pl-10"
                                            : "border-gray-800 bg-gray-950/40 text-gray-500 pl-6"
                                            }`}
                                    >
                                        <div>
                                            <span className="font-mono text-xs block font-bold">{node.id}</span>
                                            <span className="text-[10px] opacity-70 block font-mono">{node.path}</span>
                                        </div>
                                        {isAffected && (
                                            <span className="text-[9px] font-bold bg-red-600 text-white px-2 py-0.5 rounded uppercase tracking-wider">
                                                {node.type === "surface" ? "Surface Blocked" : "Compromised"}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* AI Remediation Control Area */}
                <div className="p-6 border-t border-gray-800 bg-gray-950/40">
                    {!isFixed ? (
                        <div>
                            <div className="flex items-center space-x-2 text-red-400 text-xs mb-4">
                                <span>⚠️</span>
                                <span>
                                    <strong>Blast Radius:</strong> This localized component error transitively breaks <strong>{impactCount} code files</strong> across <strong>{impactedSurfaces.length} high-level Red Hat portal surfaces</strong>.
                                </span>
                            </div>

                            {!aiSuggestion && !isLoading && (
                                <button
                                    onClick={handleQueryAI}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded transition-all duration-200 text-sm tracking-wide shadow"
                                >
                                    Orchestrate Fix with Developer Lightspeed
                                </button>
                            )}

                            {isLoading && (
                                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                                    <span className="text-xs text-gray-400 font-mono">Developer Lightspeed initiating secure VPN/mTLS tunnel to RHOAI...</span>
                                </div>
                            )}

                            {aiSuggestion && validationReport && (
                                <div className="border border-green-900/60 bg-green-950/20 rounded-lg p-4 transition-all duration-500">
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="text-[10px] font-bold text-green-400 uppercase tracking-widest font-mono">
                                            {aiSuggestion.wcagCriterion} ({aiSuggestion.severity})
                                        </div>
                                        <span className="text-[9px] font-bold font-mono text-green-500 bg-green-900/20 px-2 py-0.5 rounded uppercase">
                                            ✓ Prop Shield Pass
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-300 mb-3 leading-relaxed">{aiSuggestion.explanation}</p>

                                    {/* Styled Code Difference Box */}
                                    <div className="bg-gray-950 border border-gray-800 text-green-400 font-mono text-xs p-3 rounded-md mb-4 max-h-36 overflow-y-auto leading-normal">
                                        <pre>{aiSuggestion.fixedCode}</pre>
                                    </div>

                                    <button
                                        onClick={handleApplyFix}
                                        disabled={!validationReport.isValid}
                                        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold py-2 rounded text-xs tracking-wider uppercase transition-colors"
                                    >
                                        Apply PatternFly Remediation
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-green-950/20 border border-green-900/60 p-4 rounded-lg text-center transition-all duration-500">
                            <span className="text-green-400 text-xl block mb-1">✓</span>
                            <p className="text-sm font-semibold text-green-400">Workspace Remediated Successfully!</p>
                            <p className="text-xs text-gray-400 mt-1">All dependency edges are clear. Downstream product surfaces restored.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
