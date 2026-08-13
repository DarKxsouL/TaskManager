import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaCheckDouble, FaBell } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "../hooks/useData";
import {
  getNotificationMeta,
  resolveNotificationPath,
  formatRelativeTime,
  type AppNotification,
} from "../lib/notificationStyles";

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationSidebar = ({ isOpen, onClose }: NotificationSidebarProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications: AppNotification[] = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const userPath = user ? `/${user.name.replace(/\s+/g, '')}` : '/';

  // Close on Escape — same convention as ConfirmModal
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  // Lock page scroll while the sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleNotificationClick = (notification: AppNotification) => {
    if (!notification.read) {
      markRead.mutate(notification._id);
    }
    onClose();
    navigate(resolveNotificationPath(userPath, notification.link));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm transition-opacity duration-300
          ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      />

      {/* Sliding panel */}
      <div
        role="dialog"
        aria-label="Notifications"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-[101] h-full w-full max-w-md bg-white shadow-2xl
          border-l border-slate-200/70 flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200/70 bg-gradient-to-r from-indigo-50 via-blue-50 to-cyan-50 shrink-0">
          <div className="flex items-center gap-2">
            <FaBell className="text-blue-600" size={18} />
            <h2 className="text-lg font-bold text-slate-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="ml-1 px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close notifications"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Mark all as read */}
        {notifications.length > 0 && (
          <div className="px-6 py-3 border-b border-slate-100 flex justify-end shrink-0">
            <button
              onClick={() => markAllRead.mutate()}
              disabled={unreadCount === 0 || markAllRead.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              <FaCheckDouble size={12} />
              Mark all as read
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
              <div className="p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
                <FaBell size={28} />
              </div>
              <p className="text-slate-500 font-medium">You're all caught up</p>
              <p className="text-slate-400 text-sm mt-1">New notifications will show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {notifications.map((notification) => {
                const { icon: Icon, accent } = getNotificationMeta(notification.type);
                return (
                  <li key={notification._id}>
                    <button
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full flex items-start gap-3 px-6 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer
                        ${!notification.read ? "bg-blue-50/40" : ""}`}
                    >
                      <div className={`shrink-0 p-2.5 rounded-xl ${accent}`}>
                        <Icon size={15} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm leading-snug ${
                            !notification.read ? "text-slate-900 font-semibold" : "text-slate-600"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatRelativeTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-600" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationSidebar;
