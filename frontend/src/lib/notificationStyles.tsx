// src/lib/notificationStyles.tsx
//
// Single source of truth for how a notification type is presented — which
// icon it gets, what accent color, and which page it deep-links to. Mirrors
// the pattern in lib/taskStyles.tsx: one place to update instead of
// duplicating a switch statement anywhere a notification gets rendered.

import type { IconType } from "react-icons";
import {
  FaTasks,
  FaCheckCircle,
  FaUndo,
  FaTrashAlt,
  FaClock,
  FaExclamationCircle,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaUserMinus,
  FaUsers,
  FaShieldAlt,
  FaIdBadge,
  FaLock,
  FaKey,
  FaBell,
} from "react-icons/fa";

export type NotificationType =
  | "TASK_ASSIGNED"
  | "TASK_REASSIGNED"
  | "TASK_UPDATED"
  | "TASK_COMPLETED"
  | "TASK_REOPENED"
  | "TASK_DELETED"
  | "TASK_DUE_TODAY"
  | "TASK_OVERDUE"
  | "ROOM_JOIN_REQUEST"
  | "ROOM_JOIN_APPROVED"
  | "ROOM_JOIN_REJECTED"
  | "ROOM_MEMBER_REMOVED"
  | "ROOM_NEW_MEMBER"
  | "PERMISSIONS_UPDATED"
  | "ROLE_UPDATED"
  | "PROFILE_UPDATED"
  | "PASSWORD_CHANGED"
  | "PASSWORD_RESET_REQUESTED";

export type NotificationLink =
  | "assigned"
  | "created"
  | "overdue"
  | "network"
  | "settings"
  | "profile"
  | "history"
  | null;

// Mirrors the Notification model on the backend (models/Notification.js).
export interface AppNotification {
  _id: string;
  recipient: string;
  roomId: string | null;
  type: NotificationType;
  message: string;
  link: NotificationLink;
  relatedId: string | null;
  read: boolean;
  createdAt: string;
}

interface TypeMeta {
  icon: IconType;
  accent: string; // icon color + chip background
}

const META: Record<NotificationType, TypeMeta> = {
  TASK_ASSIGNED:            { icon: FaTasks,             accent: "bg-blue-50 text-blue-600" },
  TASK_REASSIGNED:          { icon: FaTasks,             accent: "bg-blue-50 text-blue-600" },
  TASK_UPDATED:             { icon: FaTasks,             accent: "bg-slate-100 text-slate-600" },
  TASK_COMPLETED:           { icon: FaCheckCircle,       accent: "bg-emerald-50 text-emerald-600" },
  TASK_REOPENED:            { icon: FaUndo,              accent: "bg-amber-50 text-amber-600" },
  TASK_DELETED:             { icon: FaTrashAlt,          accent: "bg-rose-50 text-rose-600" },
  TASK_DUE_TODAY:           { icon: FaClock,             accent: "bg-amber-50 text-amber-600" },
  TASK_OVERDUE:             { icon: FaExclamationCircle, accent: "bg-red-50 text-red-600" },
  ROOM_JOIN_REQUEST:        { icon: FaUserPlus,          accent: "bg-indigo-50 text-indigo-600" },
  ROOM_JOIN_APPROVED:       { icon: FaUserCheck,         accent: "bg-emerald-50 text-emerald-600" },
  ROOM_JOIN_REJECTED:       { icon: FaUserTimes,         accent: "bg-rose-50 text-rose-600" },
  ROOM_MEMBER_REMOVED:      { icon: FaUserMinus,         accent: "bg-rose-50 text-rose-600" },
  ROOM_NEW_MEMBER:          { icon: FaUsers,             accent: "bg-cyan-50 text-cyan-600" },
  PERMISSIONS_UPDATED:      { icon: FaShieldAlt,         accent: "bg-violet-50 text-violet-600" },
  ROLE_UPDATED:             { icon: FaIdBadge,           accent: "bg-violet-50 text-violet-600" },
  PROFILE_UPDATED:          { icon: FaIdBadge,           accent: "bg-slate-100 text-slate-600" },
  PASSWORD_CHANGED:         { icon: FaLock,              accent: "bg-slate-100 text-slate-600" },
  PASSWORD_RESET_REQUESTED: { icon: FaKey,               accent: "bg-slate-100 text-slate-600" },
};

export const getNotificationMeta = (type: string): TypeMeta =>
  META[type as NotificationType] ?? { icon: FaBell, accent: "bg-slate-100 text-slate-600" };

// Turns a backend page-key into a real route under the current user's path.
// The backend intentionally doesn't know about /:username-prefixed routing,
// so this is the one place that translates "assigned" -> "/JohnDoe".
export const resolveNotificationPath = (userPath: string, link: NotificationLink): string => {
  switch (link) {
    case "assigned": return userPath;
    case "created":  return `${userPath}/created`;
    case "overdue":  return `${userPath}/overdue`;
    case "network":  return `${userPath}/network`;
    case "settings": return `${userPath}/settings`;
    case "profile":  return `${userPath}/profile`;
    case "history":  return `${userPath}/history`;
    default:         return userPath;
  }
};

// Compact relative time — "Just now", "5m ago", "3h ago", "2d ago", then a
// short date past a week so old notifications don't show up as "47d ago".
export const formatRelativeTime = (isoDate: string): string => {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};
