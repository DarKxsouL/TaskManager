// src/lib/taskStyles.ts
//
// Single source of truth for how a task's status/priority is colored.
// Previously this switch statement was copy-pasted independently in
// Assigned.tsx, Created.tsx, Overdued.tsx, and re-implemented differently
// again in TaskCard.tsx — meaning the same status could render in two
// different colors depending on which screen you were on, and any future
// color change had to happen in four places by hand.
//
// Import these everywhere a status or priority is shown: task cards, list
// filters, history, the Network user-stats panel. A color should always
// mean the same thing across the whole app.

export const STATUS_OPTIONS = ["To Do", "In Progress", "Review", "Completed"] as const;
export const PRIORITY_OPTIONS = ["Urgent", "High", "Medium", "Low"] as const;

export type TaskStatus = (typeof STATUS_OPTIONS)[number];
export type TaskPriority = (typeof PRIORITY_OPTIONS)[number];

// Pill badge — background + text + border. Used for filter buttons, list
// badges, and the TaskCard status/priority tags.
export const getStatusBadgeClass = (status: string): string => {
  switch (status) {
    case "To Do":
      return "border-gray-300 bg-gray-100 text-gray-700";
    case "In Progress":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "Review":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Completed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-gray-300 bg-gray-100 text-gray-700";
  }
};

export const getPriorityBadgeClass = (priority: string): string => {
  switch (priority) {
    case "Urgent":
      return "border-red-200 bg-red-50 text-red-700";
    case "High":
      return "border-orange-200 bg-orange-50 text-orange-700";
    case "Medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "Low":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-gray-300 bg-gray-100 text-gray-700";
  }
};

// Small solid dot — used next to compact status text (e.g. in dropdowns)
// where a full pill would be too heavy.
export const getStatusDotClass = (status: string): string => {
  switch (status) {
    case "To Do":
      return "bg-gray-400";
    case "In Progress":
      return "bg-blue-500";
    case "Review":
      return "bg-amber-500";
    case "Completed":
      return "bg-emerald-500";
    default:
      return "bg-gray-400";
  }
};

export const getPriorityDotClass = (priority: string): string => {
  switch (priority) {
    case "Urgent":
      return "bg-red-500";
    case "High":
      return "bg-orange-500";
    case "Medium":
      return "bg-amber-500";
    case "Low":
      return "bg-emerald-500";
    default:
      return "bg-gray-400";
  }
};

// Solid color for the thin top accent bar on a task card.
export const getPriorityBarClass = (priority: string): string => {
  switch (priority) {
    case "Urgent":
      return "bg-red-500";
    case "High":
      return "bg-orange-400";
    case "Medium":
      return "bg-amber-400";
    case "Low":
      return "bg-emerald-400";
    default:
      return "bg-gray-300";
  }
};

export interface DueInfo {
  label: string;
  className: string;
}

// Human-readable due-date chip ("5d overdue" / "Due tomorrow" / "In 6d").
// Compares calendar days only (not exact timestamps) — see taskController's
// same-day-completion fix for why that distinction matters.
export const getDueInfo = (dueDate: string, status: string): DueInfo => {
  if (status === "Completed") {
    return { label: "Completed", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  }

  const due = new Date(dueDate);
  const dueDay = Date.UTC(due.getUTCFullYear(), due.getUTCMonth(), due.getUTCDate());
  const now = new Date();
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const diffDays = Math.round((dueDay - today) / 86400000);

  if (diffDays < 0) {
    return { label: `${Math.abs(diffDays)}d overdue`, className: "bg-red-50 text-red-700 border-red-200" };
  }
  if (diffDays === 0) {
    return { label: "Due today", className: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  if (diffDays === 1) {
    return { label: "Due tomorrow", className: "bg-amber-50 text-amber-700 border-amber-200" };
  }
  return { label: `In ${diffDays}d`, className: "bg-gray-50 text-gray-600 border-gray-200" };
};