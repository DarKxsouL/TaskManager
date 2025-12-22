import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";


export const socket = io(import.meta.env.VITE_BACKEND_URL); 

const SocketManager = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleTaskUpdate = () => {
      
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['history'] }); 
    };

    socket.on("tasks-updated", handleTaskUpdate);

    return () => {
      socket.off("tasks-updated", handleTaskUpdate);
    };
  }, [queryClient]);

  return null; 
};

export default SocketManager;