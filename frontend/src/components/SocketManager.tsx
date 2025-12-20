import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

// 1. Initialize connection outside the component to prevent multiple connections
// Ensure this matches your backend URL
export const socket = io("http://localhost:5000"); 

const SocketManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    // 2. Define the event handler
    const handleTaskUpdate = () => {
      console.log("⚡ Socket: Tasks updated! Refetching data...");
      
      // 3. Invalidate queries to trigger a re-fetch in the background
      // This matches the keys used in your useData.ts hooks
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      // If you have a query for history or specific task details, invalidate those too
      queryClient.invalidateQueries({ queryKey: ['history'] }); 
    };

    // 4. Listen for the event from the backend
    socket.on("tasks-updated", handleTaskUpdate);

    // 5. Cleanup listener on unmount
    return () => {
      socket.off("tasks-updated", handleTaskUpdate);
    };
  }, [queryClient]);

  return null; // This component renders nothing visually
};

export default SocketManager;