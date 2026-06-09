export type Severity = "warning" | "info";

export type ReportStatus = "ok" | "violations" | "skipped";

export interface Violation {
    file: string;
    line: number | null;
    rule: string;
    severity: Severity;
    title: string;
    detail: string;
    suggestion: string;
}

export interface ComplianceReport {
    summary: string;
    status: ReportStatus;
    violations: Violation[];
}
