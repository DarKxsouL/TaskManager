// src/hooks/useData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext';

// interface TaskData {
//   title: string;
//   priority: string;
//   assignedTo: string;
//   status: string;
//   dueDate: string;
// }

export interface SettingsData {
    roles: string[];
    designations: { name: string; role: string }[]; // Updated structure
}
// Helper for artificial delay (to show off your Skeleton)
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- HOOKS ---

export const useAssignedTasks = (username: string) => {
  return useQuery({
    queryKey: ['assignedTasks', username],
    queryFn: () => api.getAssignedTasks(username),
    enabled: !!username
  });
};

export const useCreatedTasks = (username: string) => {
  return useQuery({
    queryKey: ['createdTasks', username],
    queryFn: () => api.getCreatedTasks(username),
    enabled: !!username
  });
};

export const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      await wait(800);
      return api.getUsers();
    }
  });
};

// export const useHistory = () => {
//   return useQuery({
//     queryKey: ['history'],
//     queryFn: async () => {
//       await wait(800);
//       return api.getHistory();
//     }
//   });
// };

// Example Mutation (for adding a task later)
export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask) => api.createTask(newTask),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
    },
  });
};

export const useAddCreatedTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newTask: any) => api.createTask(newTask),
    onSuccess: () => {
      // Invalidate both lists to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateTask(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => api.updateUserProfile(data),
    onSuccess: () => {
      // Invalidate 'user' queries to refresh data across the app
      queryClient.invalidateQueries({ queryKey: ['userProfile'] }); 
      alert("Profile updated successfully!");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to update profile");
    }
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: api.getSettings
  });
};

export const useAddJobRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: string) => api.addJobRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};


export const useAddDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Updated signature
    mutationFn: (data: { designation: string, role: string }) => api.addDesignation(data.designation, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};

export const useDeleteJobRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: string) => api.deleteJobRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};

export const useDeleteDesignation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { designation: string, role: string }) => api.deleteDesignation(data.designation, data.role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });
};

export const useDeleteAccount = () => {
  const { logout } = useAuth(); // We need logout to clean up frontend state
  return useMutation({
    mutationFn: api.deleteMyAccount,
    onSuccess: () => {
      logout(); // Log them out immediately after deletion
      alert("Your account has been deleted.");
    }
  });
};

export const useHistory = () => {
  return useQuery({
    queryKey: ['tasks', 'history'],
    queryFn: api.getHistory,
  });
};