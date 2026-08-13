// // src/hooks/useData.js
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
// import { api } from '../services/api'
// import { useAuth } from '../context/AuthContext';

// // interface TaskData {
// //   title: string;
// //   priority: string;
// //   assignedTo: string;
// //   status: string;
// //   dueDate: string;
// // }

// export interface SettingsData {
//     roles: string[];
//     designations: { name: string; role: string }[];
// }
// // Helper for artificial delay (to show off your Skeleton)
// const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// // --- HOOKS ---

// export const useAssignedTasks = (username: string) => {
//   return useQuery({
//     queryKey: ['assignedTasks', username],
//     queryFn: () => api.getAssignedTasks(username),
//     enabled: !!username
//   });
// };

// export const useCreatedTasks = (username: string) => {
//   return useQuery({
//     queryKey: ['createdTasks', username],
//     queryFn: () => api.getCreatedTasks(username),
//     enabled: !!username
//   });
// };

// export const useUsers = () => {
//   return useQuery({
//     queryKey: ['users'],
//     queryFn: async () => {
//       await wait(800);
//       return api.getUsers();
//     }
//   });
// };

// // export const useHistory = () => {
// //   return useQuery({
// //     queryKey: ['history'],
// //     queryFn: async () => {
// //       await wait(800);
// //       return api.getHistory();
// //     }
// //   });
// // };

// // Any mutation that creates/updates/deletes a task can affect: the assigned/created
// // lists, the completed-tasks history, and any userStats panel (Network detail panel
// // or the Profile page) currently viewing that data — so all task mutations should
// // invalidate this full set, not just the two list queries.
// const invalidateAllTaskViews = (queryClient: ReturnType<typeof useQueryClient>) => {
//   queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
//   queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
//   queryClient.invalidateQueries({ queryKey: ['tasks'] });       // covers ['tasks', 'history']
//   queryClient.invalidateQueries({ queryKey: ['userStats'] });   // covers Network panel + Profile ('me')
// };

// // Example Mutation (for adding a task later)
// export const useAddTask = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (newTask) => api.createTask(newTask),
//     onSuccess: () => {
//       // Invalidate and refetch
//       invalidateAllTaskViews(queryClient);
//     },
//   });
// };

// export const useAddCreatedTask = () => {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (newTask: any) => api.createTask(newTask),
//     onSuccess: () => {
//       // Invalidate both lists to ensure fresh data
//       invalidateAllTaskViews(queryClient);
//     },
//   });
// };

// export const useUpdateTask = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateTask(id, updates),
//     onSuccess: () => {
//       invalidateAllTaskViews(queryClient);
//     },
//   });
// };

// export const useDeleteTask = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (id: string) => api.deleteTask(id),
//     onSuccess: () => {
//       invalidateAllTaskViews(queryClient);
//     },
//   });
// };

// export const useUpdateProfile = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: any) => api.updateUserProfile(data),
//     onSuccess: () => {
//       // Invalidate 'user' queries to refresh data across the app
//       queryClient.invalidateQueries({ queryKey: ['userProfile'] }); 
//       // alert("Profile updated successfully!");
//     },
//     onError: (err: any) => {
//       // alert(err.message || "Failed to update profile");
//       console.log("profile save error: ", err)
//     }
//   });
// };

// export const useSettings = () => {
//   return useQuery({
//     queryKey: ['settings'],
//     queryFn: api.getSettings
//   });
// };

// export const useAddJobRole = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (role: string) => api.addJobRole(role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings'] });
//     }
//   });
// };


// export const useAddDesignation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     // Updated signature
//     mutationFn: (data: { designation: string, role: string }) => api.addDesignation(data.designation, data.role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings'] });
//     }
//   });
// };

// export const useDeleteJobRole = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (role: string) => api.deleteJobRole(role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings'] });
//     }
//   });
// };

// export const useDeleteDesignation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (data: { designation: string, role: string }) => api.deleteDesignation(data.designation, data.role),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['settings'] });
//     }
//   });
// };

// export const useDeleteAccount = () => {
//   const { logout } = useAuth(); // We need logout to clean up frontend state
//   return useMutation({
//     mutationFn: api.deleteMyAccount,
//     onSuccess: () => {
//       logout(); // Log them out immediately after deletion
//       alert("Your account has been deleted.");
//     }
//   });
// };

// export const useHistory = () => {
//   return useQuery({
//     queryKey: ['tasks', 'history'],
//     queryFn: api.getHistory,
//   });
// };

// export const useMyRoom = () => {
//   const { user } = useAuth();
//   return useQuery({
//     queryKey: ['myRoom'],
//     queryFn: api.getMyRoom,
//     enabled: !!user && user.roomStatus === 'approved'
//   });
// };

// export const usePendingRequests = () => {
//   const { user } = useAuth();
//   return useQuery({
//     queryKey: ['pendingRequests'],
//     queryFn: api.getPendingRequests,
//     enabled: !!user && (user.role === 'Admin' || user.role === 'CEO'),
//     refetchInterval: 30000 // poll every 30s as a fallback to sockets
//   });
// };

// export const useRequestJoinRoom = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (roomId: string) => api.requestJoinRoom(roomId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['myRoom'] });
//     }
//   });
// };

// export const useApproveMember = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (userId: string) => api.approveMember(userId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     }
//   });
// };

// export const useRejectMember = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (userId: string) => api.rejectMember(userId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
//     }
//   });
// };

// export const useRemoveMember = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (userId: string) => api.removeMember(userId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     }
//   });
// };

// export const usePermissions = () => {
//   return useQuery({
//     queryKey: ['permissions'],
//     queryFn: api.getPermissions,
//     staleTime: Infinity // permission keys never change at runtime
//   });
// };

// export const useSetMemberPermissions = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
//       api.setMemberPermissions(userId, permissions),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     }
//   });
// };

// export const useUserStats = (userId: string | null) => {
//   return useQuery({
//     queryKey: ['userStats', userId],
//     queryFn: () => api.getUserStats(userId!),
//     enabled: !!userId  // only fetch when a user is selected
//   });
// };

// // Own performance stats for the Profile page. Uses the same 'userStats' key
// // prefix (with 'me' instead of an id) so task mutations invalidate it too.
// export const useProfileStats = () => {
//   return useQuery({
//     queryKey: ['userStats', 'me'],
//     queryFn: async () => {
//       const response = await api.getProfileStats();
//       return response.stats; // Profile.tsx reads fields flat, e.g. stats?.totalCreated
//     },
//   });
// };

// src/hooks/useData.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext';
import type { AppNotification } from '../lib/notificationStyles';

// interface TaskData {
//   title: string;
//   priority: string;
//   assignedTo: string;
//   status: string;
//   dueDate: string;
// }

export interface SettingsData {
    roles: string[];
    designations: { name: string; role: string }[];
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
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

// Any mutation that creates/updates/deletes a task can affect: the assigned/created
// lists, the completed-tasks history, and any userStats panel (Network detail panel
// or the Profile page) currently viewing that data — so all task mutations should
// invalidate this full set, not just the two list queries.
const invalidateAllTaskViews = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
  queryClient.invalidateQueries({ queryKey: ['createdTasks'] });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });       // covers ['tasks', 'history']
  queryClient.invalidateQueries({ queryKey: ['userStats'] });   // covers Network panel + Profile ('me')
};

// Example Mutation (for adding a task later)
export const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newTask) => api.createTask(newTask),
    onSuccess: () => {
      // Invalidate and refetch
      invalidateAllTaskViews(queryClient);
    },
  });
};

export const useAddCreatedTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newTask: any) => api.createTask(newTask),
    onSuccess: () => {
      // Invalidate both lists to ensure fresh data
      invalidateAllTaskViews(queryClient);
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: any }) => api.updateTask(id, updates),
    onSuccess: () => {
      invalidateAllTaskViews(queryClient);
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      invalidateAllTaskViews(queryClient);
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
      // alert("Profile updated successfully!");
    },
    onError: (err: any) => {
      // alert(err.message || "Failed to update profile");
      console.log("profile save error: ", err)
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

export const useMyRoom = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['myRoom'],
    queryFn: api.getMyRoom,
    enabled: !!user && user.roomStatus === 'approved'
  });
};

export const usePendingRequests = () => {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['pendingRequests'],
    queryFn: api.getPendingRequests,
    enabled: !!user && (user.role === 'Admin' || user.role === 'CEO'),
    refetchInterval: 30000 // poll every 30s as a fallback to sockets
  });
};

export const useRequestJoinRoom = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roomId: string) => api.requestJoinRoom(roomId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRoom'] });
    }
  });
};

export const useApproveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.approveMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useRejectMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.rejectMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingRequests'] });
    }
  });
};

export const useRemoveMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => api.removeMember(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const usePermissions = () => {
  return useQuery({
    queryKey: ['permissions'],
    queryFn: api.getPermissions,
    staleTime: Infinity // permission keys never change at runtime
  });
};

export const useSetMemberPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      api.setMemberPermissions(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });
};

export const useUserStats = (userId: string | null) => {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => api.getUserStats(userId!),
    enabled: !!userId  // only fetch when a user is selected
  });
};

// Own performance stats for the Profile page. Uses the same 'userStats' key
// prefix (with 'me' instead of an id) so task mutations invalidate it too.
export const useProfileStats = () => {
  return useQuery({
    queryKey: ['userStats', 'me'],
    queryFn: async () => {
      const response = await api.getProfileStats();
      return response.stats; // Profile.tsx reads fields flat, e.g. stats?.totalCreated
    },
  });
};

// --- NOTIFICATIONS ---

// refetchInterval is a fallback for anyone whose socket connection dropped —
// sockets push a live update the moment a notification is created (see
// SocketManager's 'notification' listener), this just guarantees the bell
// never goes stale for more than a minute even without one.
export const useNotifications = () => {
  const { user } = useAuth();
  return useQuery<NotificationsResponse>({
    queryKey: ['notifications'],
    queryFn: api.getNotifications,
    enabled: !!user,
    refetchInterval: 60000,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};