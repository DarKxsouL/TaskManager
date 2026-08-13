

// const BASE_URL = import.meta.env.VITE_API_URL;

// const getAuthToken = () => localStorage.getItem('authToken');


// export const api = {
//   request: async (endpoint: string, options: RequestInit = {}) => {
//     try {

//       const headers: HeadersInit = {
//         'Content-Type': 'application/json',
//         // 2. Automatically inject Authorization header if token exists
//         ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
//         ...options.headers, // Allow overriding headers if needed
//       };


//       // const response = await fetch(`${BASE_URL}${endpoint}`, {
//       //   headers: { 'Content-Type': 'application/json' },
//       //   credentials: 'include',
//       //   ...options,
//       // });
//       const response = await fetch(`${BASE_URL}${endpoint}`, {
//         ...options,
//         headers,
//         credentials: 'include', // Keep this for Cookie support (hybrid approach)
//       });


//       if (response.status === 401) throw new Error('Unauthorized: Please log  in again');
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || 'API Request Failed');
//       }
//       if (response.status === 204) return null;
//       return await response.json();
//     } catch (error) {
//       console.error(`API Error [${endpoint}]:`, error);
//       throw error;
//     }
//   },
    
//   // AUTH ENDPOINTS
//   login: (credentials: any) => 
//     api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

//   register: (data: any) => 
//     api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

//   logout: () => 
//     api.request('/auth/logout', { method: 'POST' }),

//   checkSession: () => 
//     api.request('/auth/me'),

//   // TASK ENDPOINTS
//   getAssignedTasks: (username: string) => 
//     api.request(`/tasks/assigned?user=${encodeURIComponent(username)}`),

//   getCreatedTasks: (username: string) => 
//     api.request(`/tasks/created?user=${encodeURIComponent(username)}`),

//   createTask: (task: any) => 
//     api.request('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  
// // ROOM ENDPOINTS
// getMyRoom: () => 
//   api.request('/rooms/my-room'),

// requestJoinRoom: (roomId: string) => 
//   api.request('/rooms/request', { method: 'POST', body: JSON.stringify({ roomId }) }),

// getPendingRequests: () => 
//   api.request('/rooms/requests'),

// approveMember: (userId: string) => 
//   api.request(`/rooms/requests/${userId}/approve`, { method: 'PATCH' }),

// rejectMember: (userId: string) => 
//   api.request(`/rooms/requests/${userId}/reject`, { method: 'PATCH' }),

// removeMember: (userId: string) => 
//   api.request(`/rooms/members/${userId}/remove`, { method: 'PATCH' }),

// // Add to ROOM ENDPOINTS section:
// getPermissions: () => 
//   api.request('/rooms/permissions'),

// setMemberPermissions: (userId: string, permissions: string[]) => 
//   api.request(`/rooms/members/${userId}/permissions`, { 
//     method: 'PATCH', 
//     body: JSON.stringify({ permissions }) 
//   }),

//   getUserStats: (userId: string) => 
//   api.request(`/users/${userId}/stats`),

// // USER ENDPOINTS

//   getUsers: () => api.request('/users'),
//   createUser: (user: any) => api.request('/users', { method: 'POST', body: JSON.stringify(user) }),
//   deleteUser: (id: string) => api.request(`/users/${id}`, { method: 'DELETE' }),
//   updateUserRole: (id: string, role: string) => 
//     api.request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
//   updateTask: (id: string, updates: any) => 
//     api.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
//   deleteTask: (id: string) => 
//     api.request(`/tasks/${id}`, { method: 'DELETE' }),
  
//   getUserProfile: () => api.request('/users/profile'),
//   updateUserProfile: (data: any) => api.request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
//   getProfileStats: () => api.request('/users/profile/stats'),
//   deleteMyAccount: () => api.request('/users/profile', { method: 'DELETE' }),

//   getSettings: () => api.request('/settings'),
  
//   addJobRole: (role: string) => 
//     api.request('/settings/role', { method: 'POST', body: JSON.stringify({ role }) }),
    
//   addDesignation: (designation: string, role: string) => 
//     api.request('/settings/designation', { method: 'POST', body: JSON.stringify({ designation, role }) }),

//   deleteJobRole: (role: string) => 
//     api.request('/settings/role', { method: 'DELETE', body: JSON.stringify({ role }) }),

//   deleteDesignation: (designation: string, role: string) => 
//     api.request('/settings/designation', { method: 'DELETE', body: JSON.stringify({ designation, role }) }),
  
//   // getHistory: () => api.request('/tasks'),
//   getHistory: () => api.request('/tasks/history'),

//   forgotPassword: (email: string) => 
//   api.request('/auth/forgot-password', { 
//     method: 'POST', 
//     body: JSON.stringify({ email }) 
//   }),

// resetPassword: (data: any) => 
//   api.request('/auth/reset-password', { 
//     method: 'POST', 
//     body: JSON.stringify(data) 
//   }),
// };



const BASE_URL = import.meta.env.VITE_API_URL;

const getAuthToken = () => localStorage.getItem('authToken');


export const api = {
  request: async (endpoint: string, options: RequestInit = {}) => {
    try {

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        // 2. Automatically inject Authorization header if token exists
        ...(getAuthToken() ? { 'Authorization': `Bearer ${getAuthToken()}` } : {}),
        ...options.headers, // Allow overriding headers if needed
      };


      // const response = await fetch(`${BASE_URL}${endpoint}`, {
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'include',
      //   ...options,
      // });
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include', // Keep this for Cookie support (hybrid approach)
      });


      if (response.status === 401) throw new Error('Unauthorized: Please log  in again');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'API Request Failed');
      }
      if (response.status === 204) return null;
      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  },
    
  // AUTH ENDPOINTS
  login: (credentials: any) => 
    api.request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  register: (data: any) => 
    api.request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  logout: () => 
    api.request('/auth/logout', { method: 'POST' }),

  checkSession: () => 
    api.request('/auth/me'),

  // TASK ENDPOINTS
  getAssignedTasks: (username: string) => 
    api.request(`/tasks/assigned?user=${encodeURIComponent(username)}`),

  getCreatedTasks: (username: string) => 
    api.request(`/tasks/created?user=${encodeURIComponent(username)}`),

  createTask: (task: any) => 
    api.request('/tasks', { method: 'POST', body: JSON.stringify(task) }),

  
// ROOM ENDPOINTS
getMyRoom: () => 
  api.request('/rooms/my-room'),

requestJoinRoom: (roomId: string) => 
  api.request('/rooms/request', { method: 'POST', body: JSON.stringify({ roomId }) }),

getPendingRequests: () => 
  api.request('/rooms/requests'),

approveMember: (userId: string) => 
  api.request(`/rooms/requests/${userId}/approve`, { method: 'PATCH' }),

rejectMember: (userId: string) => 
  api.request(`/rooms/requests/${userId}/reject`, { method: 'PATCH' }),

removeMember: (userId: string) => 
  api.request(`/rooms/members/${userId}/remove`, { method: 'PATCH' }),

// Add to ROOM ENDPOINTS section:
getPermissions: () => 
  api.request('/rooms/permissions'),

setMemberPermissions: (userId: string, permissions: string[]) => 
  api.request(`/rooms/members/${userId}/permissions`, { 
    method: 'PATCH', 
    body: JSON.stringify({ permissions }) 
  }),

  getUserStats: (userId: string) => 
  api.request(`/users/${userId}/stats`),

// USER ENDPOINTS

  getUsers: () => api.request('/users'),
  createUser: (user: any) => api.request('/users', { method: 'POST', body: JSON.stringify(user) }),
  deleteUser: (id: string) => api.request(`/users/${id}`, { method: 'DELETE' }),
  updateUserRole: (id: string, role: string) => 
    api.request(`/users/${id}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  updateTask: (id: string, updates: any) => 
    api.request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteTask: (id: string) => 
    api.request(`/tasks/${id}`, { method: 'DELETE' }),
  
  getUserProfile: () => api.request('/users/profile'),
  updateUserProfile: (data: any) => api.request('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  getProfileStats: () => api.request('/users/profile/stats'),
  deleteMyAccount: () => api.request('/users/profile', { method: 'DELETE' }),

  getSettings: () => api.request('/settings'),
  
  addJobRole: (role: string) => 
    api.request('/settings/role', { method: 'POST', body: JSON.stringify({ role }) }),
    
  addDesignation: (designation: string, role: string) => 
    api.request('/settings/designation', { method: 'POST', body: JSON.stringify({ designation, role }) }),

  deleteJobRole: (role: string) => 
    api.request('/settings/role', { method: 'DELETE', body: JSON.stringify({ role }) }),

  deleteDesignation: (designation: string, role: string) => 
    api.request('/settings/designation', { method: 'DELETE', body: JSON.stringify({ designation, role }) }),
  
  // getHistory: () => api.request('/tasks'),
  getHistory: () => api.request('/tasks/history'),

  forgotPassword: (email: string) => 
  api.request('/auth/forgot-password', { 
    method: 'POST', 
    body: JSON.stringify({ email }) 
  }),

resetPassword: (data: any) => 
  api.request('/auth/reset-password', { 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),

  // NOTIFICATION ENDPOINTS
  getNotifications: () =>
    api.request('/notifications'),

  markNotificationRead: (id: string) =>
    api.request(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllNotificationsRead: () =>
    api.request('/notifications/read-all', { method: 'PATCH' }),
};