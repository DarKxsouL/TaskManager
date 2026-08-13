// import { useEffect } from "react";
// import { useQueryClient } from "@tanstack/react-query";
// import { io } from "socket.io-client";
// import { useAuth } from "../context/AuthContext";

// const getSocketUrl = () => {
//   const apiUrl = import.meta.env.VITE_API_URL;
//   if (apiUrl) {
//     return apiUrl.replace('/api', ''); // Turns "https://.../api" into "https://..."
//   }
//   return "http://localhost:5000"; // Fallback for local dev
// };

// // export const socket = io(import.meta.env.VITE_BACKEND_URL); 
// export const socket = io(getSocketUrl(), {
//   withCredentials: true, // Critical: Allows cookies to be sent with the socket
//   transports: ["websocket", "polling"], // Try WebSocket first for better performance
//   autoConnect: true,
// });


// const SocketManager = () => {
//   const queryClient = useQueryClient();
//   const { user, refreshSession  } = useAuth();

//   useEffect(() => {
//     socket.on("connect", () => {
//       console.log("🟢 Socket Connected:", socket.id);
//     });

//     socket.on("connect_error", (err) => {
//       console.error("🔴 Socket Connection Error:", err.message);
//     });
//     const handleTaskUpdate = () => {
//       console.log("🔔 Real-time update received! Refreshing data...");
//       queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
//       queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
//       queryClient.invalidateQueries({ queryKey: ['history'] }); 
//       queryClient.invalidateQueries({ queryKey: ['tasks'] });
//     };

//     socket.on("tasks-updated", handleTaskUpdate);
//     socket.on("task_created", handleTaskUpdate); // Listen for specific events if your backend emits them
//     socket.on("task_deleted", handleTaskUpdate);

//     return () => {
//       socket.off("connect");
//       socket.off("connect_error");
//       socket.off("tasks-updated", handleTaskUpdate);
//       socket.off("task_created", handleTaskUpdate);
//       socket.off("task_deleted", handleTaskUpdate);
//     };
//   }, [queryClient]);

//   useEffect(() => {
//     if (!user) return;

//     const handleApproved = async () => {
//       console.log("✅ Room approved! Refreshing session...");
//       // queryClient.invalidateQueries({ queryKey: ['session'] });
//       await refreshSession();
//     };

//     const handleRejected = async () => {
//       console.log("❌ Room request rejected. Refreshing session...");
//       // queryClient.invalidateQueries({ queryKey: ['session'] });
//       await refreshSession();
//     };

//     socket.on(`room-approved-${user._id}`, handleApproved);
//     socket.on(`room-rejected-${user._id}`, handleRejected);

//     return () => {
//       socket.off(`room-approved-${user._id}`, handleApproved);
//       socket.off(`room-rejected-${user._id}`, handleRejected);
//     };
//   }, [user, refreshSession]);

//   return null; 
// };

// export default SocketManager;


import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('/api', ''); // Turns "https://.../api" into "https://..."
  }
  return "http://localhost:5000"; // Fallback for local dev
};

// autoConnect is off on purpose. The backend now requires every socket to
// authenticate (see server.js's socketAuth middleware) so it can join the
// connection to a per-user room and target notifications with
// io.to(userId). Connecting before we know who's logged in would just get
// rejected and retried forever — instead we connect explicitly once
// AuthContext confirms a session (see the effect below).
export const socket = io(getSocketUrl(), {
  withCredentials: true, // lets the httpOnly cookie ride along as one auth path
  transports: ["websocket", "polling"],
  autoConnect: false,
});

interface NotificationPayload {
  _id: string;
  type: string;
  message: string;
}

const SocketManager = () => {
  const queryClient = useQueryClient();
  const { user, refreshSession } = useAuth();

  // --- CONNECTION LIFECYCLE ---
  // Tied to login state (a plain boolean), not to the `user` object
  // reference — refreshSession() creates a new user object on every room/
  // permission update, and we don't want to tear the socket down and
  // reconnect every time that happens.
  const isLoggedIn = !!user;

  useEffect(() => {
    if (isLoggedIn) {
      // Bearer-token fallback for the handshake, mirroring the dual
      // cookie/bearer auth the REST API already uses.
      socket.auth = { token: localStorage.getItem('authToken') };
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [isLoggedIn]);

  // --- CONNECTION LOGGING + TASK CACHE INVALIDATION ---
  useEffect(() => {
    const handleConnect = () => console.log("🟢 Socket Connected:", socket.id);
    const handleConnectError = (err: Error) => console.error("🔴 Socket Connection Error:", err.message);

    const handleTaskUpdate = () => {
      console.log("🔔 Real-time update received! Refreshing data...");
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    socket.on("tasks-updated", handleTaskUpdate);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("tasks-updated", handleTaskUpdate);
    };
  }, [queryClient]);

  // --- ROOM MEMBERSHIP EVENTS ---
  // These change req.user server-side, so the client needs a fresh session
  // (not just a cache invalidation) to pick up the new roomStatus/roomId.
  useEffect(() => {
    if (!user) return;

    const handleApproved = async () => {
      await refreshSession();
    };

    const handleRejected = async () => {
      await refreshSession();
    };

    // New — nothing previously listened for this on the frontend, so a
    // removed member never found out until they happened to refresh.
    const handleRemoved = async () => {
      toast.error('You have been removed from the room.');
      await refreshSession();
    };

    socket.on(`room-approved-${user._id}`, handleApproved);
    socket.on(`room-rejected-${user._id}`, handleRejected);
    socket.on(`room-removed-${user._id}`, handleRemoved);

    return () => {
      socket.off(`room-approved-${user._id}`, handleApproved);
      socket.off(`room-rejected-${user._id}`, handleRejected);
      socket.off(`room-removed-${user._id}`, handleRemoved);
    };
  }, [user, refreshSession]);

  // --- LIVE NOTIFICATIONS — feeds the bell + a toast preview ---
  useEffect(() => {
    if (!user) return;

    const handleNotification = (notification: NotificationPayload) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      // Whatever triggered this notification almost always touched task or
      // room data the rest of the app is displaying too — refresh broadly
      // rather than mapping every notification type to a specific query.
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['myRoom'] });

      toast(notification.message, { icon: '🔔' });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [user, queryClient]);

  return null; 
};

export default SocketManager;