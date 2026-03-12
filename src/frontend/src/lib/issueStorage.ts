// Issue reporting and storage system

export interface Issue {
  id: string;
  bookingReference?: string;
  category: "booking" | "payment" | "property" | "service" | "other";
  description: string;
  contactName: string;
  contactPhone: string;
  homeStayId?: string;
  homeStayName?: string;
  partnerId?: string;
  timestamp: number;
  status: "open" | "resolved";
}

const ISSUES_KEY = "mantralayam_issues";

export function loadIssues(): Issue[] {
  try {
    const stored = localStorage.getItem(ISSUES_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading issues:", error);
    return [];
  }
}

function saveIssues(issues: Issue[]): void {
  try {
    localStorage.setItem(ISSUES_KEY, JSON.stringify(issues));
    window.dispatchEvent(new Event("issuesUpdated"));
  } catch (error) {
    console.error("Error saving issues:", error);
  }
}

export function createIssue(
  issue: Omit<Issue, "id" | "timestamp" | "status">,
): Issue {
  const newIssue: Issue = {
    ...issue,
    id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: Date.now(),
    status: "open",
  };

  const issues = loadIssues();
  issues.push(newIssue);
  saveIssues(issues);

  return newIssue;
}

export function updateIssueStatus(
  issueId: string,
  status: "open" | "resolved",
): void {
  const issues = loadIssues();
  const updated = issues.map((issue) =>
    issue.id === issueId ? { ...issue, status } : issue,
  );
  saveIssues(updated);
}

export function deleteIssue(issueId: string): void {
  const issues = loadIssues();
  const filtered = issues.filter((issue) => issue.id !== issueId);
  saveIssues(filtered);
}
