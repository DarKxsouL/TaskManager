import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

const getSocketUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl) {
    return apiUrl.replace('/api', ''); // Turns "https://.../api" into "https://..."
  }
  return "http://localhost:5000"; // Fallback for local dev
};

// export const socket = io(import.meta.env.VITE_BACKEND_URL); 
export const socket = io(getSocketUrl(), {
  withCredentials: true, // Critical: Allows cookies to be sent with the socket
  transports: ["websocket", "polling"], // Try WebSocket first for better performance
  autoConnect: true,
});


const SocketManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("🟢 Socket Connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("🔴 Socket Connection Error:", err.message);
    });
    const handleTaskUpdate = () => {
      console.log("🔔 Real-time update received! Refreshing data...");
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['history'] }); 
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    socket.on("tasks-updated", handleTaskUpdate);
    socket.on("task_created", handleTaskUpdate); // Listen for specific events if your backend emits them
    socket.on("task_deleted", handleTaskUpdate);

    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("tasks-updated", handleTaskUpdate);
      socket.off("task_created", handleTaskUpdate);
      socket.off("task_deleted", handleTaskUpdate);
    };
  }, [queryClient]);

  return null; 
};

export default SocketManager;