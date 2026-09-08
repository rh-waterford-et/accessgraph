export interface GraphNodeMetadata {
    id: string;
    label: string;
    type: "component" | "surface";
    path: string;
}

// 1. Define the component dependencies as an Adjacency List (The "Real" Graph)
// Key: The component being imported
// Value: Array of downstream components/files that import it (its dependents)
export const CODEBASE_ADJACENCY_LIST: Record<string, string[]> = {
    "Button.tsx": ["FormField.tsx"],
    "FormField.tsx": ["LoginForm.tsx"],
    "LoginForm.tsx": ["DashboardSurface.tsx", "BillingSurface.tsx"],
    "DashboardSurface.tsx": [], // Leaf node (Product Surface)
    "BillingSurface.tsx": []    // Leaf node (Product Surface)
};

// 2. Visual metadata for rendering the graph nodes in our UI
export const GRAPH_NODES: Record<string, GraphNodeMetadata> = {
    "Button.tsx": { id: "Button.tsx", label: "Button Component", type: "component", path: "src/components/Button.tsx" },
    "FormField.tsx": { id: "FormField.tsx", label: "FormField Wrapper", type: "component", path: "src/components/FormField.tsx" },
    "LoginForm.tsx": { id: "LoginForm.tsx", label: "LoginForm Card", type: "component", path: "src/components/LoginForm.tsx" },
    "DashboardSurface.tsx": { id: "DashboardSurface.tsx", label: "console.redhat.com/dashboard", type: "surface", path: "apps/dashboard" },
    "BillingSurface.tsx": { id: "BillingSurface.tsx", label: "console.redhat.com/billing", type: "surface", path: "apps/billing" }
};

export interface BlastRadiusResult {
    allAffectedNodes: string[];     // All files caught in the blast radius (inclusive)
    impactedSurfaces: string[];     // Just the leaf product surfaces (console.redhat.com)
    impactCount: number;            // Total number of compromised files
}

/**
 * Executes a Breadth-First Search (BFS) starting from the broken component 
 * to find all transitively impacted downstream components and product surfaces.
 */
export function calculateBlastRadius(brokenComponent: string): BlastRadiusResult {
    if (!brokenComponent) {
        return { allAffectedNodes: [], impactedSurfaces: [], impactCount: 0 };
    }

    const queue: string[] = [brokenComponent];
    const visited = new Set<string>();
    const impactedSurfaces: string[] = [];

    while (queue.length > 0) {
        const current = queue.shift()!;
        if (visited.has(current)) continue;
        visited.add(current);

        // If it is a leaf node containing "Surface", it represents a product surface
        if (current.includes("Surface")) {
            impactedSurfaces.push(current);
        }

        // Traverse outward to downstream components that import this component
        const dependents = CODEBASE_ADJACENCY_LIST[current] || [];
        for (const dependent of dependents) {
            if (!visited.has(dependent)) {
                queue.push(dependent);
            }
        }
    }

    return {
        allAffectedNodes: Array.from(visited),
        impactedSurfaces,
        impactCount: visited.size
    };
}