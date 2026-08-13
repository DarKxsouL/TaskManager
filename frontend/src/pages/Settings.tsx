// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   useUsers,
//   useSettings,
//   useAddJobRole,
//   useAddDesignation,
//   useDeleteJobRole,
//   useDeleteDesignation,
//   useMyRoom,
//   usePendingRequests,
//   useApproveMember,
//   useRejectMember,
//   // useRemoveMember,
//   usePermissions,
//   useSetMemberPermissions,
// } from "../hooks/useData";
// import { api } from "../services/api";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   FaBriefcase,
//   FaUserTag,
//   FaPlus,
//   FaTrash,
//   FaChevronDown,
//   FaTimes,
//   FaCrown,
//   FaCopy,
//   FaCheck,
//   FaDoorOpen,
//   FaUserClock,
// } from "react-icons/fa";
// import { toast } from "react-hot-toast";

// // Human-readable labels for each permission key
// const PERMISSION_LABELS: Record<
//   string,
//   { label: string; description: string }
// > = {
//   APPROVE_MEMBERS: {
//     label: "Approve Members",
//     description: "Can approve or reject room join requests",
//   },
//   REMOVE_MEMBERS: {
//     label: "Remove Members",
//     description: "Can remove approved members from the room",
//   },
//   PROMOTE_MEMBERS: {
//     label: "Promote / Demote",
//     description: "Can change a member's system role",
//   },
//   MANAGE_ROLES: {
//     label: "Manage Roles & Titles",
//     description: "Can add or delete job roles and designations",
//   },
//   ASSIGN_ROLES: {
//     label: "Assign Roles & Titles",
//     description: "Can assign job role and designation to members",
//   },
//   DELETE_ANY_TASK: {
//     label: "Delete Any Task",
//     description: "Can delete tasks they did not create",
//   },
//   UPDATE_ANY_TASK: {
//     label: "Update Any Task",
//     description: "Can update tasks they are not assigned to",
//   },
//   VIEW_ALL_STATS: {
//     label: "View All Stats",
//     description: "Can view performance stats of all members",
//   },
// };

// interface PermissionsModalProps {
//   user: User;
//   onClose: () => void;
// }

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
//   jobRole?: string;
// }

// // --- CELL DROPDOWN (Reusable) ---
// interface CellDropdownProps {
//   value: string;
//   options: string[];
//   onSelect: (val: string) => void;
//   placeholder: string;
//   emptyMsg: string;
//   disabled?: boolean;
// }

// const PermissionsModal = ({ user, onClose }: PermissionsModalProps) => {
//   const { data: permData } = usePermissions();
//   const setPermissionsMutation = useSetMemberPermissions();

//   // Initialize with current permissions the user already has
//   const [selected, setSelected] = useState<string[]>(
//     (user as any).permissions || [],
//   );

//   const allPermissions: string[] = permData?.permissions || [];

//   const toggle = (key: string) => {
//     setSelected((prev) =>
//       prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
//     );
//   };

//   const handleSave = () => {
//     toast
//       .promise(
//         setPermissionsMutation.mutateAsync({
//           userId: user._id,
//           permissions: selected,
//         }),
//         {
//           loading: "Saving permissions...",
//           success: `Permissions updated for ${user.name}`,
//           error: "Failed to update permissions",
//         },
//       )
//       .then(() => onClose());
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-2">
//           <div>
//             <h3 className="text-xl font-bold text-gray-900">
//               Manage Permissions
//             </h3>
//             <p className="text-sm text-gray-500">
//               Setting access for{" "}
//               <span className="font-semibold text-gray-700">{user.name}</span>
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-gray-100 rounded-full transition-colors"
//           >
//             <FaTimes className="text-gray-400" />
//           </button>
//         </div>

//         {/* Info banner */}
//         <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 mb-5 text-xs text-blue-700">
//           These permissions extend this employee's access beyond normal Employee
//           limits. Admins always have full access regardless of this list.
//         </div>

//         {/* Permission checkboxes */}
//         <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
//           {allPermissions.map((key) => {
//             const meta = PERMISSION_LABELS[key];
//             const isSelected = selected.includes(key);

//             return (
//               <label
//                 key={key}
//                 className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
//                   ${
//                     isSelected
//                       ? "border-blue-400 bg-blue-50"
//                       : "border-gray-100 hover:border-gray-300 bg-gray-50"
//                   }`}
//               >
//                 <div className="mt-0.5">
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => toggle(key)}
//                     className="w-4 h-4 accent-blue-600 cursor-pointer"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className={`font-semibold text-sm ${isSelected ? "text-blue-700" : "text-gray-700"}`}
//                   >
//                     {meta?.label || key}
//                   </p>
//                   <p className="text-xs text-gray-400 mt-0.5">
//                     {meta?.description}
//                   </p>
//                 </div>
//               </label>
//             );
//           })}
//         </div>

//         {/* Footer */}
//         <div className="flex justify-between items-center mt-5 pt-4 border-t border-gray-100">
//           <button
//             onClick={() => setSelected([])}
//             className="text-sm text-red-400 hover:text-red-600 transition-colors"
//           >
//             Clear all
//           </button>
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={setPermissionsMutation.isPending}
//               className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
//             >
//               {setPermissionsMutation.isPending ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CellDropdown = ({
//   value,
//   options,
//   onSelect,
//   placeholder,
//   emptyMsg,
//   disabled,
// }: CellDropdownProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const toggle = () => {
//     if (!disabled) setIsOpen(!isOpen);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={toggle}
//         disabled={disabled}
//         className={`w-full flex justify-between items-center border px-3 py-1.5 rounded-lg text-sm transition-all 
//                 ${disabled ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed" : "bg-white border-gray-300 text-gray-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
//       >
//         <span className={`truncate ${!value ? "text-gray-400" : ""}`}>
//           {value || placeholder}
//         </span>
//         {!disabled && (
//           <FaChevronDown
//             className={`text-gray-400 text-xs ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
//           />
//         )}
//       </button>

//       {isOpen && !disabled && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setIsOpen(false)}
//           ></div>
//           <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[100]">
//             {options && options.length > 0 ? (
//               <ul className="max-h-48 overflow-y-auto">
//                 {options.map((opt) => (
//                   <li
//                     key={opt}
//                     onClick={() => {
//                       onSelect(opt);
//                       setIsOpen(false);
//                     }}
//                     className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700 ${value === opt ? "bg-blue-50 font-semibold text-blue-600" : ""}`}
//                   >
//                     {opt}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <div className="p-3 text-xs text-orange-500 italic text-center bg-orange-50">
//                 {emptyMsg}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // --- ROOM ID PANEL ---
// const RoomPanel = () => {
//   const { data: room, isLoading } = useMyRoom();
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     if (!room?.roomId) return;
//     navigator.clipboard.writeText(room.roomId);
//     setCopied(true);
//     toast.success("Room ID copied to clipboard!");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (isLoading)
//     return (
//       <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-6 animate-pulse">
//         <div className="h-5 w-32 bg-gray-200 rounded mb-3"></div>
//         <div className="h-10 bg-gray-100 rounded"></div>
//       </div>
//     );

//   return (
//     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
//       <div className="flex items-center gap-2 mb-1">
//         <FaDoorOpen className="text-blue-500" />
//         <h3 className="font-bold text-lg text-blue-800">Your Room</h3>
//       </div>
//       <p className="text-sm text-blue-600 mb-4">
//         Share this Room ID with employees so they can request to join your room.
//       </p>

//       {/* Room name */}
//       <div className="mb-3">
//         <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
//           Company / Team
//         </span>
//         <p className="text-gray-800 font-bold text-lg">{room?.name}</p>
//       </div>

//       {/* Room ID with copy */}
//       <div className="flex items-center gap-3">
//         <div className="flex-1 bg-white border border-blue-200 rounded-lg px-4 py-3">
//           <span className="text-xs text-gray-400 block mb-0.5">Room ID</span>
//           <span className="font-mono text-sm text-gray-800 break-all select-all">
//             {room?.roomId}
//           </span>
//         </div>
//         <button
//           onClick={handleCopy}
//           className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all shadow-sm
//                         ${
//                           copied
//                             ? "bg-green-500 text-white"
//                             : "bg-blue-600 hover:bg-blue-700 text-white"
//                         }`}
//         >
//           {copied ? <FaCheck /> : <FaCopy />}
//           {copied ? "Copied!" : "Copy"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- PENDING REQUESTS PANEL ---
// const PendingRequestsPanel = () => {
//   const { data: pendingUsers = [], isLoading } = usePendingRequests();
//   const approveMutation = useApproveMember();
//   const rejectMutation = useRejectMember();

//   const handleApprove = (userId: string, name: string) => {
//     toast.promise(approveMutation.mutateAsync(userId), {
//       loading: `Approving ${name}...`,
//       success: `${name} has been approved!`,
//       error: "Failed to approve member",
//     });
//   };

//   const handleReject = (userId: string, name: string) => {
//     if (!window.confirm(`Reject ${name}'s request?`)) return;
//     toast.promise(rejectMutation.mutateAsync(userId), {
//       loading: `Rejecting ${name}...`,
//       success: `${name}'s request has been rejected.`,
//       error: "Failed to reject request",
//     });
//   };

//   return (
//     <div className="bg-white border border-amber-200 rounded-xl shadow-sm mb-8 overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
//         <div className="flex items-center gap-2">
//           <FaUserClock className="text-amber-500" />
//           <h3 className="font-bold text-lg text-amber-800">
//             Pending Join Requests
//           </h3>
//         </div>
//         {/* Badge showing count */}
//         {pendingUsers.length > 0 && (
//           <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
//             {pendingUsers.length}
//           </span>
//         )}
//       </div>

//       {isLoading ? (
//         <div className="p-6 space-y-3">
//           {[1, 2].map((i) => (
//             <div
//               key={i}
//               className="h-14 bg-gray-100 rounded-lg animate-pulse"
//             ></div>
//           ))}
//         </div>
//       ) : pendingUsers.length === 0 ? (
//         <div className="p-8 text-center text-gray-400">
//           <FaUserClock className="mx-auto text-3xl mb-2 opacity-30" />
//           <p className="text-sm">No pending requests right now.</p>
//         </div>
//       ) : (
//         <ul className="divide-y divide-gray-100">
//           {pendingUsers.map((u: User) => (
//             <li
//               key={u._id}
//               className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
//             >
//               {/* User info */}
//               <div className="flex items-center gap-3">
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`}
//                   alt={u.name}
//                   className="w-9 h-9 rounded-full"
//                 />
//                 <div>
//                   <p className="font-semibold text-gray-800 text-sm">
//                     {u.name}
//                   </p>
//                   <p className="text-xs text-gray-400">{u.email}</p>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handleApprove(u._id, u.name)}
//                   disabled={approveMutation.isPending}
//                   className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => handleReject(u._id, u.name)}
//                   disabled={rejectMutation.isPending}
//                   className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// // --- MAIN COMPONENT ---

// function Settings() {
//   const { user: dbUser, isAdmin, hasPermission } = useAuth();
//   const [permissionsTargetUser, setPermissionsTargetUser] =
//     useState<User | null>(null);

//   const { data: users = [], isLoading: loadingUsers } = useUsers();
//   const { data: settings } = useSettings();

//   const queryClient = useQueryClient();
//   const addJobRoleMutation = useAddJobRole();
//   const addDesignationMutation = useAddDesignation();
//   const deleteJobRoleMutation = useDeleteJobRole();
//   const deleteDesignationMutation = useDeleteDesignation();
//   //   const removeMemberMutation = useRemoveMember();

//   const [newRole, setNewRole] = useState("");
//   const [newDesignationName, setNewDesignationName] = useState("");
//   const [selectedRoleForDesignation, setSelectedRoleForDesignation] =
//     useState("");

//   const handleAddRole = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newRole.trim()) return;

//     // Toast Promise with Mutation
//     toast
//       .promise(addJobRoleMutation.mutateAsync(newRole), {
//         loading: "Adding role...",
//         success: "Job role added!",
//         error: "Failed to add role",
//       })
//       .then(() => setNewRole(""));
//   };

//   const handleDeleteRole = (role: string) => {
//     if (
//       confirm(
//         `Delete role "${role}"? This will also remove linked designations.`,
//       )
//     ) {
//       toast.promise(deleteJobRoleMutation.mutateAsync(role), {
//         loading: "Deleting role...",
//         success: "Role deleted",
//         error: "Failed to delete role",
//       });
//     }
//   };

//   const handleAddDesignation = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newDesignationName.trim() || !selectedRoleForDesignation) return;

//     toast
//       .promise(
//         addDesignationMutation.mutateAsync({
//           designation: newDesignationName,
//           role: selectedRoleForDesignation,
//         }),
//         {
//           loading: "Adding designation...",
//           success: "Designation added!",
//           error: "Failed to add designation",
//         },
//       )
//       .then(() => setNewDesignationName(""));
//   };

//   const handleDeleteDesignation = (name: string, role: string) => {
//     if (confirm(`Delete designation "${name}"?`)) {
//       toast.promise(
//         deleteDesignationMutation.mutateAsync({ designation: name, role }),
//         {
//           loading: "Deleting designation...",
//           success: "Designation deleted",
//           error: "Failed to delete designation",
//         },
//       );
//     }
//   };

//   const handleUpdateUserDetail = async (
//     userId: string,
//     field: "jobRole" | "designation",
//     value: string,
//   ) => {
//     const updates: any = { [field]: value };
//     if (field === "jobRole") updates.designation = "";

//     toast.promise(
//       (async () => {
//         await api.request(`/users/${userId}`, {
//           method: "PATCH",
//           body: JSON.stringify(updates),
//         });
//         await queryClient.invalidateQueries({ queryKey: ["users"] });
//       })(),
//       {
//         loading: "Updating user...",
//         success: "User details updated",
//         error: "Failed to update user",
//       },
//     );
//   };

//   // Now uses removeMember (room-scoped) instead of deleteUser (hard delete)
//   const handleRemoveUser = async (id: string, name: string) => {
//     if (
//       window.confirm(
//         `Remove ${name} from your room? They will lose access but their account won't be deleted.`,
//       )
//     ) {
//       toast.promise(
//         (async () => {
//           await api.removeMember(id);
//           await queryClient.invalidateQueries({ queryKey: ["users"] });
//         })(),
//         {
//           loading: "Removing user...",
//           success: `${name} removed from room`,
//           error: "Failed to remove user",
//         },
//       );
//     }
//   };

//   //   const handleDeleteUser = async (id: string) => {
//   //     if (window.confirm("Are you sure you want to remove this user from the network?")) {
//   //         toast.promise(
//   //             (async () => {
//   //                 await api.deleteUser(id);
//   //                 await queryClient.invalidateQueries({ queryKey: ['users'] });
//   //             })(),
//   //             {
//   //                 loading: 'Removing user...',
//   //                 success: 'User removed from network',
//   //                 error: 'Failed to delete user'
//   //             }
//   //         );
//   //     }
//   //   };

//   const handlePromoteUser = async (id: string, currentRole: string) => {
//     const isPromoting = currentRole !== "Admin";
//     const action = isPromoting ? "Promote to Admin" : "Demote to Employee";

//     const confirm = window.confirm(`${action}?`);
//     if (!confirm) return;

//     const newRole = isPromoting ? "Admin" : "Employee";

//     toast.promise(
//       (async () => {
//         await api.updateUserRole(id, newRole);
//         await queryClient.invalidateQueries({ queryKey: ["users"] });
//       })(),
//       {
//         loading: "Updating permissions...",
//         success: `User ${isPromoting ? "Promoted" : "Demoted"}`,
//         error: "Failed to change role",
//       },
//     );
//   };

//   const getDesignationsForRole = (roleName: string) => {
//     if (!settings?.designations || !roleName) return [];
//     return settings.designations
//       .filter((d: any) => (typeof d === "object" ? d.role === roleName : true))
//       .map((d: any) => (typeof d === "object" ? d.name : d))
//       .filter((name: string) => name !== "CEO");
//   };

//   return (
//     <div className="mx-20 pt-40 p-10 min-h-screen bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-black overflow-y-auto">
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">System Settings</h1>

//       {/* --- ADMIN CONFIGURATION --- */}
//       {/* {isAdmin && ( */}
//       <>
//         {/* --- ROOM PANEL --- */}
//         {isAdmin && <RoomPanel />}

//         {/* --- PENDING REQUESTS --- */}
//         {(isAdmin || hasPermission("APPROVE_MEMBERS")) && (
//           <PendingRequestsPanel />
//         )}

//         {(isAdmin || hasPermission("MANAGE_ROLES")) && (
//           <div className="mb-10">
//             <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
//               Configuration
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* A. JOB ROLES */}
//               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                 <div className="flex items-center gap-2 mb-4">
//                   <FaBriefcase className="text-blue-500" />
//                   <h3 className="font-bold text-lg">Job Roles</h3>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
//                   {settings?.roles?.map((role: string) => (
//                     <div
//                       key={role}
//                       className="relative group px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2 pl-8"
//                     >
//                       {role}
//                       <button
//                         onClick={() => handleDeleteRole(role)}
//                         className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-blue-300 transition-colors flex items-center"
//                       >
//                         <FaTimes size={10} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={handleAddRole} className="flex gap-2">
//                   <input
//                     type="text"
//                     value={newRole}
//                     onChange={(e) => setNewRole(e.target.value)}
//                     placeholder="Add Role..."
//                     className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500"
//                   />
//                   <button
//                     disabled={addJobRoleMutation.isPending}
//                     className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
//                   >
//                     <FaPlus />
//                   </button>
//                 </form>
//               </div>

//               {/* B. DESIGNATIONS */}
//               <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
//                 <div className="flex items-center gap-2 mb-4">
//                   <FaUserTag className="text-purple-500" />
//                   <h3 className="font-bold text-lg">Designations</h3>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
//                   {settings?.designations?.map((d: any, idx: number) => (
//                     <div
//                       key={idx}
//                       className="relative group px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 flex items-center gap-1 pl-8"
//                     >
//                       {d.name}{" "}
//                       <span className="text-[10px] opacity-60 uppercase tracking-tighter">
//                         ({d.role})
//                       </span>
//                       <button
//                         onClick={() => handleDeleteDesignation(d.name, d.role)}
//                         className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-purple-300 transition-colors flex items-center"
//                       >
//                         <FaTimes size={10} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={handleAddDesignation} className="flex gap-2">
//                   <select
//                     value={selectedRoleForDesignation}
//                     onChange={(e) =>
//                       setSelectedRoleForDesignation(e.target.value)
//                     }
//                     className="w-1/3 border p-2 rounded text-sm outline-none focus:border-purple-500 bg-gray-50 text-gray-700"
//                   >
//                     <option value="">Select Role</option>
//                     {settings?.roles?.map((r: string) => (
//                       <option key={r} value={r}>
//                         {r}
//                       </option>
//                     ))}
//                   </select>

//                   <input
//                     type="text"
//                     value={newDesignationName}
//                     onChange={(e) => setNewDesignationName(e.target.value)}
//                     placeholder="Title..."
//                     disabled={!selectedRoleForDesignation}
//                     className="flex-1 border p-2 rounded text-sm outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
//                   />
//                   <button
//                     disabled={
//                       addDesignationMutation.isPending ||
//                       !selectedRoleForDesignation
//                     }
//                     className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
//                   >
//                     <FaPlus />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </>
//       {/* )} */}

//       {/* --- 2. USER DIRECTORY --- */}
//       <div>
//         <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">
//           User Directory
//         </h2>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
//           <table className="w-full text-left">
//             <thead className="bg-gray-100 border-b text-gray-600 text-sm uppercase">
//               <tr>
//                 <th className="p-4">Name</th>
//                 <th className="p-4">Email</th>
//                 <th className="p-4">System Access</th>
//                 <th className="p-4 w-56">Job Role</th>
//                 <th className="p-4 w-56">Designation</th>
//                 {(isAdmin ||
//                   hasPermission("REMOVE_MEMBERS") ||
//                   hasPermission("PROMOTE_MEMBERS") ||
//                   hasPermission("ASSIGN_ROLES")) && (
//                   <th className="p-4 text-right">Actions</th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loadingUsers ? (
//                 <tr>
//                   <td className="p-4">Loading...</td>
//                 </tr>
//               ) : (
//                 users.map((u: User) => {
//                   // FIX: Updated isCEO check to look at Designation OR Job Role.
//                   const isCEO = u.role === "Admin";
//                   const isSelf = u._id === dbUser?._id;

//                   return (
//                     <tr
//                       key={u._id}
//                       className="hover:bg-gray-50 transition-colors"
//                     >
//                       <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
//                         {u.name}
//                         {isCEO && (
//                           <FaCrown
//                             className="text-yellow-500"
//                             title="CEO (Main Admin)"
//                           />
//                         )}
//                       </td>
//                       <td className="p-4 text-gray-500">{u.email}</td>

//                       {/* System Access Badge */}
//                       <td className="p-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-600"}`}
//                         >
//                           {u.role}
//                         </span>
//                       </td>

//                       {/* JOB ROLE (Static "CEO" for CEO, Dropdown for everyone else) */}
//                       <td className="p-4">
//                         {isCEO ? (
//                           <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-200">
//                             CEO
//                           </span>
//                         ) : (
//                           <CellDropdown
//                             value={u.jobRole || ""}
//                             options={(settings?.roles || []).filter(
//                               (r: string) => r !== "CEO",
//                             )}
//                             onSelect={(val) =>
//                               handleUpdateUserDetail(u._id, "jobRole", val)
//                             }
//                             placeholder="Select Role"
//                             emptyMsg="Configure Roles"
//                             disabled={
//                               !isAdmin && !hasPermission("ASSIGN_ROLES")
//                             }
//                           />
//                         )}
//                       </td>

//                       {/* DESIGNATION (Static "CEO" for CEO, Dropdown for everyone else) */}
//                       <td className="p-4">
//                         {isCEO ? (
//                           <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-200">
//                             CEO
//                           </span>
//                         ) : (
//                           <CellDropdown
//                             value={u.designation || ""}
//                             options={getDesignationsForRole(u.jobRole || "")}
//                             onSelect={(val) =>
//                               handleUpdateUserDetail(u._id, "designation", val)
//                             }
//                             placeholder="Select Title"
//                             emptyMsg={
//                               !u.jobRole ? "Select Job Role first" : "No titles"
//                             }
//                             disabled={
//                               (!isAdmin && !hasPermission("ASSIGN_ROLES")) ||
//                               !u.jobRole
//                             }
//                           />
//                         )}
//                       </td>

//                       {(isAdmin ||
//                         hasPermission("REMOVE_MEMBERS") ||
//                         hasPermission("PROMOTE_MEMBERS") ||
//                         hasPermission("ASSIGN_ROLES")) && (
//                         <td className="p-4 text-right">
//                           <div className="flex justify-end gap-3">
//                             {!isSelf && !isCEO && (
//                               <>
//                                 {/* Promote — only admin or PROMOTE_MEMBERS */}
//                                 {(isAdmin ||
//                                   hasPermission("PROMOTE_MEMBERS")) && (
//                                   <button
//                                     onClick={() =>
//                                       handlePromoteUser(u._id, u.role)
//                                     }
//                                     className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
//                                   >
//                                     {u.role === "Admin"
//                                       ? "Demote"
//                                       : "Make Admin"}
//                                   </button>
//                                 )}

//                                 {/* Permissions modal — only admin */}
//                                 {isAdmin && u.role !== "Admin" && (
//                                   <button
//                                     onClick={() => setPermissionsTargetUser(u)}
//                                     className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline"
//                                     title="Manage permissions"
//                                   >
//                                     Permissions
//                                   </button>
//                                 )}

//                                 {/* Remove — only admin or REMOVE_MEMBERS */}
//                                 {(isAdmin ||
//                                   hasPermission("REMOVE_MEMBERS")) && (
//                                   <button
//                                     onClick={() =>
//                                       handleRemoveUser(u._id, u.name)
//                                     }
//                                     className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
//                                     title="Remove from room"
//                                   >
//                                     <FaTrash />
//                                   </button>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       {permissionsTargetUser && (
//         <PermissionsModal
//           user={permissionsTargetUser}
//           onClose={() => setPermissionsTargetUser(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default Settings;







//NEW REFORMED UI

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  useUsers,
  useSettings,
  useAddJobRole,
  useAddDesignation,
  useDeleteJobRole,
  useDeleteDesignation,
  useMyRoom,
  usePendingRequests,
  useApproveMember,
  useRejectMember,
  // useRemoveMember,
  usePermissions,
  useSetMemberPermissions,
} from "../hooks/useData";
import { api } from "../services/api";
import { useQueryClient } from "@tanstack/react-query";
import {
  FaBriefcase,
  FaUserTag,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaTimes,
  FaCrown,
  FaCopy,
  FaCheck,
  FaDoorOpen,
  FaUserClock,
  FaCog,
} from "react-icons/fa";
import { toast } from "react-hot-toast";

// Human-readable labels for each permission key
const PERMISSION_LABELS: Record<
  string,
  { label: string; description: string }
> = {
  APPROVE_MEMBERS: {
    label: "Approve Members",
    description: "Can approve or reject room join requests",
  },
  REMOVE_MEMBERS: {
    label: "Remove Members",
    description: "Can remove approved members from the room",
  },
  PROMOTE_MEMBERS: {
    label: "Promote / Demote",
    description: "Can change a member's system role",
  },
  MANAGE_ROLES: {
    label: "Manage Roles & Titles",
    description: "Can add or delete job roles and designations",
  },
  ASSIGN_ROLES: {
    label: "Assign Roles & Titles",
    description: "Can assign job role and designation to members",
  },
  DELETE_ANY_TASK: {
    label: "Delete Any Task",
    description: "Can delete tasks they did not create",
  },
  UPDATE_ANY_TASK: {
    label: "Update Any Task",
    description: "Can update tasks they are not assigned to",
  },
  VIEW_ALL_STATS: {
    label: "View All Stats",
    description: "Can view performance stats of all members",
  },
};

interface PermissionsModalProps {
  user: User;
  onClose: () => void;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  jobRole?: string;
}

// --- CELL DROPDOWN (Reusable) ---
interface CellDropdownProps {
  value: string;
  options: string[];
  onSelect: (val: string) => void;
  placeholder: string;
  emptyMsg: string;
  disabled?: boolean;
}

const PermissionsModal = ({ user, onClose }: PermissionsModalProps) => {
  const { data: permData } = usePermissions();
  const setPermissionsMutation = useSetMemberPermissions();

  // Initialize with current permissions the user already has
  const [selected, setSelected] = useState<string[]>(
    (user as any).permissions || [],
  );

  const allPermissions: string[] = permData?.permissions || [];

  const toggle = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  const handleSave = () => {
    toast
      .promise(
        setPermissionsMutation.mutateAsync({
          userId: user._id,
          permissions: selected,
        }),
        {
          loading: "Saving permissions...",
          success: `Permissions updated for ${user.name}`,
          error: "Failed to update permissions",
        },
      )
      .then(() => onClose());
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Manage Permissions
            </h3>
            <p className="text-sm text-slate-500">
              Setting access for{" "}
              <span className="font-semibold text-slate-700">{user.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <FaTimes className="text-slate-400" />
          </button>
        </div>

        {/* Info banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 mb-5 text-xs text-blue-700">
          These permissions extend this employee's access beyond normal Employee
          limits. Admins always have full access regardless of this list.
        </div>

        {/* Permission checkboxes */}
        <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
          {allPermissions.map((key) => {
            const meta = PERMISSION_LABELS[key];
            const isSelected = selected.includes(key);

            return (
              <label
                key={key}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
                  ${
                    isSelected
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-100 hover:border-slate-300 bg-slate-50"
                  }`}
              >
                <div className="mt-0.5">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggle(key)}
                    className="w-4 h-4 accent-blue-600 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <p
                    className={`font-semibold text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {meta?.label || key}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {meta?.description}
                  </p>
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
          <button
            onClick={() => setSelected([])}
            className="text-sm text-red-400 hover:text-red-600 transition-colors"
          >
            Clear all
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={setPermissionsMutation.isPending}
              className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-lg text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {setPermissionsMutation.isPending ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CellDropdown = ({
  value,
  options,
  onSelect,
  placeholder,
  emptyMsg,
  disabled,
}: CellDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => {
    if (!disabled) setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <button
        onClick={toggle}
        disabled={disabled}
        className={`w-full flex justify-between items-center border px-3 py-1.5 rounded-xl text-sm transition-all 
                ${disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
      >
        <span className={`truncate ${!value ? "text-slate-400" : ""}`}>
          {value || placeholder}
        </span>
        {!disabled && (
          <FaChevronDown
            className={`text-slate-400 text-xs ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100]">
            {options && options.length > 0 ? (
              <ul className="max-h-48 overflow-y-auto">
                {options.map((opt) => (
                  <li
                    key={opt}
                    onClick={() => {
                      onSelect(opt);
                      setIsOpen(false);
                    }}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 text-slate-700 ${value === opt ? "bg-blue-50 font-semibold text-blue-600" : ""}`}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-3 text-xs text-orange-500 italic text-center bg-orange-50">
                {emptyMsg}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// --- ROOM ID PANEL ---
const RoomPanel = () => {
  const { data: room, isLoading } = useMyRoom();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!room?.roomId) return;
    navigator.clipboard.writeText(room.roomId);
    setCopied(true);
    toast.success("Room ID copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading)
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm mb-6 animate-pulse">
        <div className="h-5 w-32 bg-slate-200 rounded mb-3"></div>
        <div className="h-10 bg-slate-100 rounded"></div>
      </div>
    );

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <FaDoorOpen className="text-blue-500" />
        <h3 className="font-bold text-lg text-blue-800">Your Room</h3>
      </div>
      <p className="text-sm text-blue-600 mb-4">
        Share this Room ID with employees so they can request to join your room.
      </p>

      {/* Room name */}
      <div className="mb-3">
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
          Company / Team
        </span>
        <p className="text-slate-800 font-bold text-lg">{room?.name}</p>
      </div>

      {/* Room ID with copy */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3">
          <span className="text-xs text-slate-400 block mb-0.5">Room ID</span>
          <span className="font-mono text-sm text-slate-800 break-all select-all">
            {room?.roomId}
          </span>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm
                        ${
                          copied
                            ? "bg-green-500 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                        }`}
        >
          {copied ? <FaCheck /> : <FaCopy />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
};

// --- PENDING REQUESTS PANEL ---
const PendingRequestsPanel = () => {
  const { data: pendingUsers = [], isLoading } = usePendingRequests();
  const approveMutation = useApproveMember();
  const rejectMutation = useRejectMember();

  const handleApprove = (userId: string, name: string) => {
    toast.promise(approveMutation.mutateAsync(userId), {
      loading: `Approving ${name}...`,
      success: `${name} has been approved!`,
      error: "Failed to approve member",
    });
  };

  const handleReject = (userId: string, name: string) => {
    if (!window.confirm(`Reject ${name}'s request?`)) return;
    toast.promise(rejectMutation.mutateAsync(userId), {
      loading: `Rejecting ${name}...`,
      success: `${name}'s request has been rejected.`,
      error: "Failed to reject request",
    });
  };

  return (
    <div className="bg-white border border-amber-200 rounded-2xl shadow-sm mb-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
        <div className="flex items-center gap-2">
          <FaUserClock className="text-amber-500" />
          <h3 className="font-bold text-lg text-amber-800">
            Pending Join Requests
          </h3>
        </div>
        {/* Badge showing count */}
        {pendingUsers.length > 0 && (
          <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {pendingUsers.length}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="p-6 space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-14 bg-slate-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : pendingUsers.length === 0 ? (
        <div className="p-8 text-center text-slate-400">
          <FaUserClock className="mx-auto text-3xl mb-2 opacity-30" />
          <p className="text-sm">No pending requests right now.</p>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {pendingUsers.map((u: User) => (
            <li
              key={u._id}
              className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              {/* User info */}
              <div className="flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`}
                  alt={u.name}
                  className="w-9 h-9 rounded-full"
                />
                <div>
                  <p className="font-semibold text-slate-800 text-sm">
                    {u.name}
                  </p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleApprove(u._id, u.name)}
                  disabled={approveMutation.isPending}
                  className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(u._id, u.name)}
                  disabled={rejectMutation.isPending}
                  className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---

function Settings() {
  const { user: dbUser, isAdmin, hasPermission } = useAuth();
  const [permissionsTargetUser, setPermissionsTargetUser] =
    useState<User | null>(null);

  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: settings } = useSettings();

  const queryClient = useQueryClient();
  const addJobRoleMutation = useAddJobRole();
  const addDesignationMutation = useAddDesignation();
  const deleteJobRoleMutation = useDeleteJobRole();
  const deleteDesignationMutation = useDeleteDesignation();
  //   const removeMemberMutation = useRemoveMember();

  const [newRole, setNewRole] = useState("");
  const [newDesignationName, setNewDesignationName] = useState("");
  const [selectedRoleForDesignation, setSelectedRoleForDesignation] =
    useState("");

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;

    // Toast Promise with Mutation
    toast
      .promise(addJobRoleMutation.mutateAsync(newRole), {
        loading: "Adding role...",
        success: "Job role added!",
        error: "Failed to add role",
      })
      .then(() => setNewRole(""));
  };

  const handleDeleteRole = (role: string) => {
    if (
      confirm(
        `Delete role "${role}"? This will also remove linked designations.`,
      )
    ) {
      toast.promise(deleteJobRoleMutation.mutateAsync(role), {
        loading: "Deleting role...",
        success: "Role deleted",
        error: "Failed to delete role",
      });
    }
  };

  const handleAddDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignationName.trim() || !selectedRoleForDesignation) return;

    toast
      .promise(
        addDesignationMutation.mutateAsync({
          designation: newDesignationName,
          role: selectedRoleForDesignation,
        }),
        {
          loading: "Adding designation...",
          success: "Designation added!",
          error: "Failed to add designation",
        },
      )
      .then(() => setNewDesignationName(""));
  };

  const handleDeleteDesignation = (name: string, role: string) => {
    if (confirm(`Delete designation "${name}"?`)) {
      toast.promise(
        deleteDesignationMutation.mutateAsync({ designation: name, role }),
        {
          loading: "Deleting designation...",
          success: "Designation deleted",
          error: "Failed to delete designation",
        },
      );
    }
  };

  const handleUpdateUserDetail = async (
    userId: string,
    field: "jobRole" | "designation",
    value: string,
  ) => {
    const updates: any = { [field]: value };
    if (field === "jobRole") updates.designation = "";

    toast.promise(
      (async () => {
        await api.request(`/users/${userId}`, {
          method: "PATCH",
          body: JSON.stringify(updates),
        });
        await queryClient.invalidateQueries({ queryKey: ["users"] });
      })(),
      {
        loading: "Updating user...",
        success: "User details updated",
        error: "Failed to update user",
      },
    );
  };

  // Now uses removeMember (room-scoped) instead of deleteUser (hard delete)
  const handleRemoveUser = async (id: string, name: string) => {
    if (
      window.confirm(
        `Remove ${name} from your room? They will lose access but their account won't be deleted.`,
      )
    ) {
      toast.promise(
        (async () => {
          await api.removeMember(id);
          await queryClient.invalidateQueries({ queryKey: ["users"] });
        })(),
        {
          loading: "Removing user...",
          success: `${name} removed from room`,
          error: "Failed to remove user",
        },
      );
    }
  };

  //   const handleDeleteUser = async (id: string) => {
  //     if (window.confirm("Are you sure you want to remove this user from the network?")) {
  //         toast.promise(
  //             (async () => {
  //                 await api.deleteUser(id);
  //                 await queryClient.invalidateQueries({ queryKey: ['users'] });
  //             })(),
  //             {
  //                 loading: 'Removing user...',
  //                 success: 'User removed from network',
  //                 error: 'Failed to delete user'
  //             }
  //         );
  //     }
  //   };

  const handlePromoteUser = async (id: string, currentRole: string) => {
    const isPromoting = currentRole !== "Admin";
    const action = isPromoting ? "Promote to Admin" : "Demote to Employee";

    const confirm = window.confirm(`${action}?`);
    if (!confirm) return;

    const newRole = isPromoting ? "Admin" : "Employee";

    toast.promise(
      (async () => {
        await api.updateUserRole(id, newRole);
        await queryClient.invalidateQueries({ queryKey: ["users"] });
      })(),
      {
        loading: "Updating permissions...",
        success: `User ${isPromoting ? "Promoted" : "Demoted"}`,
        error: "Failed to change role",
      },
    );
  };

  const getDesignationsForRole = (roleName: string) => {
    if (!settings?.designations || !roleName) return [];
    return settings.designations
      .filter((d: any) => (typeof d === "object" ? d.role === roleName : true))
      .map((d: any) => (typeof d === "object" ? d.name : d))
      .filter((name: string) => name !== "CEO");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-slate-800">
    <div className="max-w-6xl mx-auto">

      {/* HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 p-8 shadow-xl shadow-slate-500/20 mb-6">
        <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-cyan-300/10 rounded-full blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
              <FaCog className="text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
              <p className="text-slate-300 text-sm mt-0.5">Manage your room, members, roles and permissions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
              <div className="text-2xl font-bold leading-none">{users.length}</div>
              <div className="text-[11px] uppercase tracking-wider text-slate-300 mt-1">Members</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ADMIN CONFIGURATION --- */}
      {/* {isAdmin && ( */}
      <>
        {/* --- ROOM PANEL --- */}
        {isAdmin && <RoomPanel />}

        {/* --- PENDING REQUESTS --- */}
        {(isAdmin || hasPermission("APPROVE_MEMBERS")) && (
          <PendingRequestsPanel />
        )}

        {(isAdmin || hasPermission("MANAGE_ROLES")) && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
              <h2 className="text-lg font-bold text-slate-800">Configuration</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* A. JOB ROLES */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaBriefcase className="text-blue-500" />
                  <h3 className="font-bold text-lg">Job Roles</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                  {settings?.roles?.map((role: string) => (
                    <div
                      key={role}
                      className="relative group px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2 pl-8"
                    >
                      {role}
                      <button
                        onClick={() => handleDeleteRole(role)}
                        className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-blue-300 transition-colors flex items-center"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddRole} className="flex gap-2">
                  <input
                    type="text"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Add Role..."
                    className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500"
                  />
                  <button
                    disabled={addJobRoleMutation.isPending}
                    className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-2 rounded-xl hover:shadow-md shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    <FaPlus />
                  </button>
                </form>
              </div>

              {/* B. DESIGNATIONS */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/70 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FaUserTag className="text-purple-500" />
                  <h3 className="font-bold text-lg">Designations</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                  {settings?.designations?.map((d: any, idx: number) => (
                    <div
                      key={idx}
                      className="relative group px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 flex items-center gap-1 pl-8"
                    >
                      {d.name}{" "}
                      <span className="text-[10px] opacity-60 uppercase tracking-tighter">
                        ({d.role})
                      </span>
                      <button
                        onClick={() => handleDeleteDesignation(d.name, d.role)}
                        className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-purple-300 transition-colors flex items-center"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddDesignation} className="flex gap-2">
                  <select
                    value={selectedRoleForDesignation}
                    onChange={(e) =>
                      setSelectedRoleForDesignation(e.target.value)
                    }
                    className="w-1/3 border p-2 rounded text-sm outline-none focus:border-purple-500 bg-slate-50 text-slate-700"
                  >
                    <option value="">Select Role</option>
                    {settings?.roles?.map((r: string) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={newDesignationName}
                    onChange={(e) => setNewDesignationName(e.target.value)}
                    placeholder="Title..."
                    disabled={!selectedRoleForDesignation}
                    className="flex-1 border p-2 rounded text-sm outline-none focus:border-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                  <button
                    disabled={
                      addDesignationMutation.isPending ||
                      !selectedRoleForDesignation
                    }
                    className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    <FaPlus />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </>
      {/* )} */}

      {/* --- 2. USER DIRECTORY --- */}
      <div>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
          <h2 className="text-lg font-bold text-slate-800">User Directory</h2>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-visible">
          <table className="w-full text-left">
            <thead className="bg-slate-100 border-b text-slate-600 text-sm uppercase">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">System Access</th>
                <th className="p-4 w-56">Job Role</th>
                <th className="p-4 w-56">Designation</th>
                {(isAdmin ||
                  hasPermission("REMOVE_MEMBERS") ||
                  hasPermission("PROMOTE_MEMBERS") ||
                  hasPermission("ASSIGN_ROLES")) && (
                  <th className="p-4 text-right">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loadingUsers ? (
                <tr>
                  <td className="p-4">Loading...</td>
                </tr>
              ) : (
                users.map((u: User) => {
                  // FIX: Updated isCEO check to look at Designation OR Job Role.
                  const isCEO = u.role === "Admin";
                  const isSelf = u._id === dbUser?._id;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
                        {u.name}
                        {isCEO && (
                          <FaCrown
                            className="text-yellow-500"
                            title="CEO (Main Admin)"
                          />
                        )}
                      </td>
                      <td className="p-4 text-slate-500">{u.email}</td>

                      {/* System Access Badge */}
                      <td className="p-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-600"}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* JOB ROLE (Static "CEO" for CEO, Dropdown for everyone else) */}
                      <td className="p-4">
                        {isCEO ? (
                          <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                            CEO
                          </span>
                        ) : (
                          <CellDropdown
                            value={u.jobRole || ""}
                            options={(settings?.roles || []).filter(
                              (r: string) => r !== "CEO",
                            )}
                            onSelect={(val) =>
                              handleUpdateUserDetail(u._id, "jobRole", val)
                            }
                            placeholder="Select Role"
                            emptyMsg="Configure Roles"
                            disabled={
                              !isAdmin && !hasPermission("ASSIGN_ROLES")
                            }
                          />
                        )}
                      </td>

                      {/* DESIGNATION (Static "CEO" for CEO, Dropdown for everyone else) */}
                      <td className="p-4">
                        {isCEO ? (
                          <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
                            CEO
                          </span>
                        ) : (
                          <CellDropdown
                            value={u.designation || ""}
                            options={getDesignationsForRole(u.jobRole || "")}
                            onSelect={(val) =>
                              handleUpdateUserDetail(u._id, "designation", val)
                            }
                            placeholder="Select Title"
                            emptyMsg={
                              !u.jobRole ? "Select Job Role first" : "No titles"
                            }
                            disabled={
                              (!isAdmin && !hasPermission("ASSIGN_ROLES")) ||
                              !u.jobRole
                            }
                          />
                        )}
                      </td>

                      {(isAdmin ||
                        hasPermission("REMOVE_MEMBERS") ||
                        hasPermission("PROMOTE_MEMBERS") ||
                        hasPermission("ASSIGN_ROLES")) && (
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-3">
                            {!isSelf && !isCEO && (
                              <>
                                {/* Promote — only admin or PROMOTE_MEMBERS */}
                                {(isAdmin ||
                                  hasPermission("PROMOTE_MEMBERS")) && (
                                  <button
                                    onClick={() =>
                                      handlePromoteUser(u._id, u.role)
                                    }
                                    className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
                                  >
                                    {u.role === "Admin"
                                      ? "Demote"
                                      : "Make Admin"}
                                  </button>
                                )}

                                {/* Permissions modal — only admin */}
                                {isAdmin && u.role !== "Admin" && (
                                  <button
                                    onClick={() => setPermissionsTargetUser(u)}
                                    className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline"
                                    title="Manage permissions"
                                  >
                                    Permissions
                                  </button>
                                )}

                                {/* Remove — only admin or REMOVE_MEMBERS */}
                                {(isAdmin ||
                                  hasPermission("REMOVE_MEMBERS")) && (
                                  <button
                                    onClick={() =>
                                      handleRemoveUser(u._id, u.name)
                                    }
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                                    title="Remove from room"
                                  >
                                    <FaTrash />
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {permissionsTargetUser && (
        <PermissionsModal
          user={permissionsTargetUser}
          onClose={() => setPermissionsTargetUser(null)}
        />
      )}
    </div>
    </div>
  );
}

export default Settings;









// NEW  UI

// import { useState } from "react";
// import { useAuth } from "../context/AuthContext";
// import {
//   useUsers,
//   useSettings,
//   useAddJobRole,
//   useAddDesignation,
//   useDeleteJobRole,
//   useDeleteDesignation,
//   useMyRoom,
//   usePendingRequests,
//   useApproveMember,
//   useRejectMember,
//   // useRemoveMember,
//   usePermissions,
//   useSetMemberPermissions,
// } from "../hooks/useData";
// import { api } from "../services/api";
// import { useQueryClient } from "@tanstack/react-query";
// import {
//   FaBriefcase,
//   FaUserTag,
//   FaPlus,
//   FaTrash,
//   FaChevronDown,
//   FaTimes,
//   FaCrown,
//   FaCopy,
//   FaCheck,
//   FaDoorOpen,
//   FaUserClock,
// } from "react-icons/fa";
// import { toast } from "react-hot-toast";

// // Human-readable labels for each permission key
// const PERMISSION_LABELS: Record<
//   string,
//   { label: string; description: string }
// > = {
//   APPROVE_MEMBERS: {
//     label: "Approve Members",
//     description: "Can approve or reject room join requests",
//   },
//   REMOVE_MEMBERS: {
//     label: "Remove Members",
//     description: "Can remove approved members from the room",
//   },
//   PROMOTE_MEMBERS: {
//     label: "Promote / Demote",
//     description: "Can change a member's system role",
//   },
//   MANAGE_ROLES: {
//     label: "Manage Roles & Titles",
//     description: "Can add or delete job roles and designations",
//   },
//   ASSIGN_ROLES: {
//     label: "Assign Roles & Titles",
//     description: "Can assign job role and designation to members",
//   },
//   DELETE_ANY_TASK: {
//     label: "Delete Any Task",
//     description: "Can delete tasks they did not create",
//   },
//   UPDATE_ANY_TASK: {
//     label: "Update Any Task",
//     description: "Can update tasks they are not assigned to",
//   },
//   VIEW_ALL_STATS: {
//     label: "View All Stats",
//     description: "Can view performance stats of all members",
//   },
// };

// interface PermissionsModalProps {
//   user: User;
//   onClose: () => void;
// }

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
//   jobRole?: string;
// }

// // --- CELL DROPDOWN (Reusable) ---
// interface CellDropdownProps {
//   value: string;
//   options: string[];
//   onSelect: (val: string) => void;
//   placeholder: string;
//   emptyMsg: string;
//   disabled?: boolean;
// }

// const PermissionsModal = ({ user, onClose }: PermissionsModalProps) => {
//   const { data: permData } = usePermissions();
//   const setPermissionsMutation = useSetMemberPermissions();

//   // Initialize with current permissions the user already has
//   const [selected, setSelected] = useState<string[]>(
//     (user as any).permissions || [],
//   );

//   const allPermissions: string[] = permData?.permissions || [];

//   const toggle = (key: string) => {
//     setSelected((prev) =>
//       prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
//     );
//   };

//   const handleSave = () => {
//     toast
//       .promise(
//         setPermissionsMutation.mutateAsync({
//           userId: user._id,
//           permissions: selected,
//         }),
//         {
//           loading: "Saving permissions...",
//           success: `Permissions updated for ${user.name}`,
//           error: "Failed to update permissions",
//         },
//       )
//       .then(() => onClose());
//   };

//   return (
//     <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//         onClick={onClose}
//       />

//       {/* Modal */}
//       <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 z-10">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-2">
//           <div>
//             <h3 className="text-xl font-bold text-slate-900">
//               Manage Permissions
//             </h3>
//             <p className="text-sm text-slate-500">
//               Setting access for{" "}
//               <span className="font-semibold text-slate-700">{user.name}</span>
//             </p>
//           </div>
//           <button
//             onClick={onClose}
//             className="p-2 hover:bg-slate-100 rounded-full transition-colors"
//           >
//             <FaTimes className="text-slate-400" />
//           </button>
//         </div>

//         {/* Info banner */}
//         <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 mb-5 text-xs text-blue-700">
//           These permissions extend this employee's access beyond normal Employee
//           limits. Admins always have full access regardless of this list.
//         </div>

//         {/* Permission checkboxes */}
//         <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
//           {allPermissions.map((key) => {
//             const meta = PERMISSION_LABELS[key];
//             const isSelected = selected.includes(key);

//             return (
//               <label
//                 key={key}
//                 className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all
//                   ${
//                     isSelected
//                       ? "border-blue-400 bg-blue-50"
//                       : "border-slate-100 hover:border-slate-300 bg-slate-50"
//                   }`}
//               >
//                 <div className="mt-0.5">
//                   <input
//                     type="checkbox"
//                     checked={isSelected}
//                     onChange={() => toggle(key)}
//                     className="w-4 h-4 accent-blue-600 cursor-pointer"
//                   />
//                 </div>
//                 <div className="flex-1">
//                   <p
//                     className={`font-semibold text-sm ${isSelected ? "text-blue-700" : "text-slate-700"}`}
//                   >
//                     {meta?.label || key}
//                   </p>
//                   <p className="text-xs text-slate-400 mt-0.5">
//                     {meta?.description}
//                   </p>
//                 </div>
//               </label>
//             );
//           })}
//         </div>

//         {/* Footer */}
//         <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-100">
//           <button
//             onClick={() => setSelected([])}
//             className="text-sm text-red-400 hover:text-red-600 transition-colors"
//           >
//             Clear all
//           </button>
//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSave}
//               disabled={setPermissionsMutation.isPending}
//               className="px-5 py-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-lg text-white font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
//             >
//               {setPermissionsMutation.isPending ? "Saving..." : "Save"}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const CellDropdown = ({
//   value,
//   options,
//   onSelect,
//   placeholder,
//   emptyMsg,
//   disabled,
// }: CellDropdownProps) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const toggle = () => {
//     if (!disabled) setIsOpen(!isOpen);
//   };

//   return (
//     <div className="relative">
//       <button
//         onClick={toggle}
//         disabled={disabled}
//         className={`w-full flex justify-between items-center border px-3 py-1.5 rounded-xl text-sm transition-all 
//                 ${disabled ? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed" : "bg-white border-slate-300 text-slate-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-100"}`}
//       >
//         <span className={`truncate ${!value ? "text-slate-400" : ""}`}>
//           {value || placeholder}
//         </span>
//         {!disabled && (
//           <FaChevronDown
//             className={`text-slate-400 text-xs ml-2 transition-transform ${isOpen ? "rotate-180" : ""}`}
//           />
//         )}
//       </button>

//       {isOpen && !disabled && (
//         <>
//           <div
//             className="fixed inset-0 z-40"
//             onClick={() => setIsOpen(false)}
//           ></div>
//           <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-[100]">
//             {options && options.length > 0 ? (
//               <ul className="max-h-48 overflow-y-auto">
//                 {options.map((opt) => (
//                   <li
//                     key={opt}
//                     onClick={() => {
//                       onSelect(opt);
//                       setIsOpen(false);
//                     }}
//                     className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 text-slate-700 ${value === opt ? "bg-blue-50 font-semibold text-blue-600" : ""}`}
//                   >
//                     {opt}
//                   </li>
//                 ))}
//               </ul>
//             ) : (
//               <div className="p-3 text-xs text-orange-500 italic text-center bg-orange-50">
//                 {emptyMsg}
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// // --- ROOM ID PANEL ---
// const RoomPanel = () => {
//   const { data: room, isLoading } = useMyRoom();
//   const [copied, setCopied] = useState(false);

//   const handleCopy = () => {
//     if (!room?.roomId) return;
//     navigator.clipboard.writeText(room.roomId);
//     setCopied(true);
//     toast.success("Room ID copied to clipboard!");
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (isLoading)
//     return (
//       <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 animate-pulse">
//         <div className="h-5 w-32 bg-slate-200 rounded mb-3"></div>
//         <div className="h-10 bg-slate-100 rounded"></div>
//       </div>
//     );

//   return (
//     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-6">
//       <div className="flex items-center gap-2 mb-1">
//         <FaDoorOpen className="text-blue-500" />
//         <h3 className="font-bold text-lg text-blue-800">Your Room</h3>
//       </div>
//       <p className="text-sm text-blue-600 mb-4">
//         Share this Room ID with employees so they can request to join your room.
//       </p>

//       {/* Room name */}
//       <div className="mb-3">
//         <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">
//           Company / Team
//         </span>
//         <p className="text-slate-800 font-bold text-lg">{room?.name}</p>
//       </div>

//       {/* Room ID with copy */}
//       <div className="flex items-center gap-3">
//         <div className="flex-1 bg-white border border-blue-200 rounded-xl px-4 py-3">
//           <span className="text-xs text-slate-400 block mb-0.5">Room ID</span>
//           <span className="font-mono text-sm text-slate-800 break-all select-all">
//             {room?.roomId}
//           </span>
//         </div>
//         <button
//           onClick={handleCopy}
//           className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm
//                         ${
//                           copied
//                             ? "bg-green-500 text-white"
//                             : "bg-blue-600 hover:bg-blue-700 text-white"
//                         }`}
//         >
//           {copied ? <FaCheck /> : <FaCopy />}
//           {copied ? "Copied!" : "Copy"}
//         </button>
//       </div>
//     </div>
//   );
// };

// // --- PENDING REQUESTS PANEL ---
// const PendingRequestsPanel = () => {
//   const { data: pendingUsers = [], isLoading } = usePendingRequests();
//   const approveMutation = useApproveMember();
//   const rejectMutation = useRejectMember();

//   const handleApprove = (userId: string, name: string) => {
//     toast.promise(approveMutation.mutateAsync(userId), {
//       loading: `Approving ${name}...`,
//       success: `${name} has been approved!`,
//       error: "Failed to approve member",
//     });
//   };

//   const handleReject = (userId: string, name: string) => {
//     if (!window.confirm(`Reject ${name}'s request?`)) return;
//     toast.promise(rejectMutation.mutateAsync(userId), {
//       loading: `Rejecting ${name}...`,
//       success: `${name}'s request has been rejected.`,
//       error: "Failed to reject request",
//     });
//   };

//   return (
//     <div className="bg-white border border-amber-200 rounded-xl shadow-sm mb-8 overflow-hidden">
//       {/* Header */}
//       <div className="flex items-center justify-between px-6 py-4 border-b border-amber-100 bg-amber-50">
//         <div className="flex items-center gap-2">
//           <FaUserClock className="text-amber-500" />
//           <h3 className="font-bold text-lg text-amber-800">
//             Pending Join Requests
//           </h3>
//         </div>
//         {/* Badge showing count */}
//         {pendingUsers.length > 0 && (
//           <span className="bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
//             {pendingUsers.length}
//           </span>
//         )}
//       </div>

//       {isLoading ? (
//         <div className="p-6 space-y-3">
//           {[1, 2].map((i) => (
//             <div
//               key={i}
//               className="h-14 bg-slate-100 rounded-xl animate-pulse"
//             ></div>
//           ))}
//         </div>
//       ) : pendingUsers.length === 0 ? (
//         <div className="p-8 text-center text-slate-400">
//           <FaUserClock className="mx-auto text-3xl mb-2 opacity-30" />
//           <p className="text-sm">No pending requests right now.</p>
//         </div>
//       ) : (
//         <ul className="divide-y divide-slate-100">
//           {pendingUsers.map((u: User) => (
//             <li
//               key={u._id}
//               className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
//             >
//               {/* User info */}
//               <div className="flex items-center gap-3">
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${u.name}&background=random&color=fff&bold=true`}
//                   alt={u.name}
//                   className="w-9 h-9 rounded-full"
//                 />
//                 <div>
//                   <p className="font-semibold text-slate-800 text-sm">
//                     {u.name}
//                   </p>
//                   <p className="text-xs text-slate-400">{u.email}</p>
//                 </div>
//               </div>

//               {/* Actions */}
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handleApprove(u._id, u.name)}
//                   disabled={approveMutation.isPending}
//                   className="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
//                 >
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => handleReject(u._id, u.name)}
//                   disabled={rejectMutation.isPending}
//                   className="px-4 py-1.5 bg-red-100 hover:bg-red-200 text-red-600 text-sm font-semibold rounded-xl transition-colors disabled:opacity-50"
//                 >
//                   Reject
//                 </button>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// // --- MAIN COMPONENT ---

// function Settings() {
//   const { user: dbUser, isAdmin, hasPermission } = useAuth();
//   const [permissionsTargetUser, setPermissionsTargetUser] =
//     useState<User | null>(null);

//   const { data: users = [], isLoading: loadingUsers } = useUsers();
//   const { data: settings } = useSettings();

//   const queryClient = useQueryClient();
//   const addJobRoleMutation = useAddJobRole();
//   const addDesignationMutation = useAddDesignation();
//   const deleteJobRoleMutation = useDeleteJobRole();
//   const deleteDesignationMutation = useDeleteDesignation();
//   //   const removeMemberMutation = useRemoveMember();

//   const [newRole, setNewRole] = useState("");
//   const [newDesignationName, setNewDesignationName] = useState("");
//   const [selectedRoleForDesignation, setSelectedRoleForDesignation] =
//     useState("");

//   const handleAddRole = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newRole.trim()) return;

//     // Toast Promise with Mutation
//     toast
//       .promise(addJobRoleMutation.mutateAsync(newRole), {
//         loading: "Adding role...",
//         success: "Job role added!",
//         error: "Failed to add role",
//       })
//       .then(() => setNewRole(""));
//   };

//   const handleDeleteRole = (role: string) => {
//     if (
//       confirm(
//         `Delete role "${role}"? This will also remove linked designations.`,
//       )
//     ) {
//       toast.promise(deleteJobRoleMutation.mutateAsync(role), {
//         loading: "Deleting role...",
//         success: "Role deleted",
//         error: "Failed to delete role",
//       });
//     }
//   };

//   const handleAddDesignation = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!newDesignationName.trim() || !selectedRoleForDesignation) return;

//     toast
//       .promise(
//         addDesignationMutation.mutateAsync({
//           designation: newDesignationName,
//           role: selectedRoleForDesignation,
//         }),
//         {
//           loading: "Adding designation...",
//           success: "Designation added!",
//           error: "Failed to add designation",
//         },
//       )
//       .then(() => setNewDesignationName(""));
//   };

//   const handleDeleteDesignation = (name: string, role: string) => {
//     if (confirm(`Delete designation "${name}"?`)) {
//       toast.promise(
//         deleteDesignationMutation.mutateAsync({ designation: name, role }),
//         {
//           loading: "Deleting designation...",
//           success: "Designation deleted",
//           error: "Failed to delete designation",
//         },
//       );
//     }
//   };

//   const handleUpdateUserDetail = async (
//     userId: string,
//     field: "jobRole" | "designation",
//     value: string,
//   ) => {
//     const updates: any = { [field]: value };
//     if (field === "jobRole") updates.designation = "";

//     toast.promise(
//       (async () => {
//         await api.request(`/users/${userId}`, {
//           method: "PATCH",
//           body: JSON.stringify(updates),
//         });
//         await queryClient.invalidateQueries({ queryKey: ["users"] });
//       })(),
//       {
//         loading: "Updating user...",
//         success: "User details updated",
//         error: "Failed to update user",
//       },
//     );
//   };

//   // Now uses removeMember (room-scoped) instead of deleteUser (hard delete)
//   const handleRemoveUser = async (id: string, name: string) => {
//     if (
//       window.confirm(
//         `Remove ${name} from your room? They will lose access but their account won't be deleted.`,
//       )
//     ) {
//       toast.promise(
//         (async () => {
//           await api.removeMember(id);
//           await queryClient.invalidateQueries({ queryKey: ["users"] });
//         })(),
//         {
//           loading: "Removing user...",
//           success: `${name} removed from room`,
//           error: "Failed to remove user",
//         },
//       );
//     }
//   };

//   //   const handleDeleteUser = async (id: string) => {
//   //     if (window.confirm("Are you sure you want to remove this user from the network?")) {
//   //         toast.promise(
//   //             (async () => {
//   //                 await api.deleteUser(id);
//   //                 await queryClient.invalidateQueries({ queryKey: ['users'] });
//   //             })(),
//   //             {
//   //                 loading: 'Removing user...',
//   //                 success: 'User removed from network',
//   //                 error: 'Failed to delete user'
//   //             }
//   //         );
//   //     }
//   //   };

//   const handlePromoteUser = async (id: string, currentRole: string) => {
//     const isPromoting = currentRole !== "Admin";
//     const action = isPromoting ? "Promote to Admin" : "Demote to Employee";

//     const confirm = window.confirm(`${action}?`);
//     if (!confirm) return;

//     const newRole = isPromoting ? "Admin" : "Employee";

//     toast.promise(
//       (async () => {
//         await api.updateUserRole(id, newRole);
//         await queryClient.invalidateQueries({ queryKey: ["users"] });
//       })(),
//       {
//         loading: "Updating permissions...",
//         success: `User ${isPromoting ? "Promoted" : "Demoted"}`,
//         error: "Failed to change role",
//       },
//     );
//   };

//   const getDesignationsForRole = (roleName: string) => {
//     if (!settings?.designations || !roleName) return [];
//     return settings.designations
//       .filter((d: any) => (typeof d === "object" ? d.role === roleName : true))
//       .map((d: any) => (typeof d === "object" ? d.name : d))
//       .filter((name: string) => name !== "CEO");
//   };

//   return (
//     <div className="mx-20 pt-40 p-10 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 text-slate-800 overflow-y-auto">
//       <h1 className="text-3xl font-bold mb-6 text-slate-800">System Settings</h1>

//       {/* --- ADMIN CONFIGURATION --- */}
//       {/* {isAdmin && ( */}
//       <>
//         {/* --- ROOM PANEL --- */}
//         {isAdmin && <RoomPanel />}

//         {/* --- PENDING REQUESTS --- */}
//         {(isAdmin || hasPermission("APPROVE_MEMBERS")) && (
//           <PendingRequestsPanel />
//         )}

//         {(isAdmin || hasPermission("MANAGE_ROLES")) && (
//           <div className="mb-10">
//             <h2 className="text-2xl font-bold mb-4 text-slate-800 border-b pb-2">
//               Configuration
//             </h2>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//               {/* A. JOB ROLES */}
//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//                 <div className="flex items-center gap-2 mb-4">
//                   <FaBriefcase className="text-blue-500" />
//                   <h3 className="font-bold text-lg">Job Roles</h3>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
//                   {settings?.roles?.map((role: string) => (
//                     <div
//                       key={role}
//                       className="relative group px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2 pl-8"
//                     >
//                       {role}
//                       <button
//                         onClick={() => handleDeleteRole(role)}
//                         className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-blue-300 transition-colors flex items-center"
//                       >
//                         <FaTimes size={10} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={handleAddRole} className="flex gap-2">
//                   <input
//                     type="text"
//                     value={newRole}
//                     onChange={(e) => setNewRole(e.target.value)}
//                     placeholder="Add Role..."
//                     className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500"
//                   />
//                   <button
//                     disabled={addJobRoleMutation.isPending}
//                     className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white p-2 rounded-xl hover:shadow-md shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
//                   >
//                     <FaPlus />
//                   </button>
//                 </form>
//               </div>

//               {/* B. DESIGNATIONS */}
//               <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
//                 <div className="flex items-center gap-2 mb-4">
//                   <FaUserTag className="text-purple-500" />
//                   <h3 className="font-bold text-lg">Designations</h3>
//                 </div>

//                 <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
//                   {settings?.designations?.map((d: any, idx: number) => (
//                     <div
//                       key={idx}
//                       className="relative group px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 flex items-center gap-1 pl-8"
//                     >
//                       {d.name}{" "}
//                       <span className="text-[10px] opacity-60 uppercase tracking-tighter">
//                         ({d.role})
//                       </span>
//                       <button
//                         onClick={() => handleDeleteDesignation(d.name, d.role)}
//                         className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-purple-300 transition-colors flex items-center"
//                       >
//                         <FaTimes size={10} />
//                       </button>
//                     </div>
//                   ))}
//                 </div>

//                 <form onSubmit={handleAddDesignation} className="flex gap-2">
//                   <select
//                     value={selectedRoleForDesignation}
//                     onChange={(e) =>
//                       setSelectedRoleForDesignation(e.target.value)
//                     }
//                     className="w-1/3 border p-2 rounded text-sm outline-none focus:border-purple-500 bg-slate-50 text-slate-700"
//                   >
//                     <option value="">Select Role</option>
//                     {settings?.roles?.map((r: string) => (
//                       <option key={r} value={r}>
//                         {r}
//                       </option>
//                     ))}
//                   </select>

//                   <input
//                     type="text"
//                     value={newDesignationName}
//                     onChange={(e) => setNewDesignationName(e.target.value)}
//                     placeholder="Title..."
//                     disabled={!selectedRoleForDesignation}
//                     className="flex-1 border p-2 rounded text-sm outline-none focus:border-purple-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
//                   />
//                   <button
//                     disabled={
//                       addDesignationMutation.isPending ||
//                       !selectedRoleForDesignation
//                     }
//                     className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50"
//                   >
//                     <FaPlus />
//                   </button>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </>
//       {/* )} */}

//       {/* --- 2. USER DIRECTORY --- */}
//       <div>
//         <h2 className="text-2xl font-bold mb-4 text-slate-800 border-b pb-2">
//           User Directory
//         </h2>

//         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
//           <table className="w-full text-left">
//             <thead className="bg-slate-100 border-b text-slate-600 text-sm uppercase">
//               <tr>
//                 <th className="p-4">Name</th>
//                 <th className="p-4">Email</th>
//                 <th className="p-4">System Access</th>
//                 <th className="p-4 w-56">Job Role</th>
//                 <th className="p-4 w-56">Designation</th>
//                 {(isAdmin ||
//                   hasPermission("REMOVE_MEMBERS") ||
//                   hasPermission("PROMOTE_MEMBERS") ||
//                   hasPermission("ASSIGN_ROLES")) && (
//                   <th className="p-4 text-right">Actions</th>
//                 )}
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-100">
//               {loadingUsers ? (
//                 <tr>
//                   <td className="p-4">Loading...</td>
//                 </tr>
//               ) : (
//                 users.map((u: User) => {
//                   // FIX: Updated isCEO check to look at Designation OR Job Role.
//                   const isCEO = u.role === "Admin";
//                   const isSelf = u._id === dbUser?._id;

//                   return (
//                     <tr
//                       key={u._id}
//                       className="hover:bg-slate-50 transition-colors"
//                     >
//                       <td className="p-4 font-medium text-slate-800 flex items-center gap-2">
//                         {u.name}
//                         {isCEO && (
//                           <FaCrown
//                             className="text-yellow-500"
//                             title="CEO (Main Admin)"
//                           />
//                         )}
//                       </td>
//                       <td className="p-4 text-slate-500">{u.email}</td>

//                       {/* System Access Badge */}
//                       <td className="p-4">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === "Admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-600"}`}
//                         >
//                           {u.role}
//                         </span>
//                       </td>

//                       {/* JOB ROLE (Static "CEO" for CEO, Dropdown for everyone else) */}
//                       <td className="p-4">
//                         {isCEO ? (
//                           <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
//                             CEO
//                           </span>
//                         ) : (
//                           <CellDropdown
//                             value={u.jobRole || ""}
//                             options={(settings?.roles || []).filter(
//                               (r: string) => r !== "CEO",
//                             )}
//                             onSelect={(val) =>
//                               handleUpdateUserDetail(u._id, "jobRole", val)
//                             }
//                             placeholder="Select Role"
//                             emptyMsg="Configure Roles"
//                             disabled={
//                               !isAdmin && !hasPermission("ASSIGN_ROLES")
//                             }
//                           />
//                         )}
//                       </td>

//                       {/* DESIGNATION (Static "CEO" for CEO, Dropdown for everyone else) */}
//                       <td className="p-4">
//                         {isCEO ? (
//                           <span className="font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded border border-slate-200">
//                             CEO
//                           </span>
//                         ) : (
//                           <CellDropdown
//                             value={u.designation || ""}
//                             options={getDesignationsForRole(u.jobRole || "")}
//                             onSelect={(val) =>
//                               handleUpdateUserDetail(u._id, "designation", val)
//                             }
//                             placeholder="Select Title"
//                             emptyMsg={
//                               !u.jobRole ? "Select Job Role first" : "No titles"
//                             }
//                             disabled={
//                               (!isAdmin && !hasPermission("ASSIGN_ROLES")) ||
//                               !u.jobRole
//                             }
//                           />
//                         )}
//                       </td>

//                       {(isAdmin ||
//                         hasPermission("REMOVE_MEMBERS") ||
//                         hasPermission("PROMOTE_MEMBERS") ||
//                         hasPermission("ASSIGN_ROLES")) && (
//                         <td className="p-4 text-right">
//                           <div className="flex justify-end gap-3">
//                             {!isSelf && !isCEO && (
//                               <>
//                                 {/* Promote — only admin or PROMOTE_MEMBERS */}
//                                 {(isAdmin ||
//                                   hasPermission("PROMOTE_MEMBERS")) && (
//                                   <button
//                                     onClick={() =>
//                                       handlePromoteUser(u._id, u.role)
//                                     }
//                                     className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
//                                   >
//                                     {u.role === "Admin"
//                                       ? "Demote"
//                                       : "Make Admin"}
//                                   </button>
//                                 )}

//                                 {/* Permissions modal — only admin */}
//                                 {isAdmin && u.role !== "Admin" && (
//                                   <button
//                                     onClick={() => setPermissionsTargetUser(u)}
//                                     className="text-purple-600 hover:text-purple-800 text-sm font-semibold hover:underline"
//                                     title="Manage permissions"
//                                   >
//                                     Permissions
//                                   </button>
//                                 )}

//                                 {/* Remove — only admin or REMOVE_MEMBERS */}
//                                 {(isAdmin ||
//                                   hasPermission("REMOVE_MEMBERS")) && (
//                                   <button
//                                     onClick={() =>
//                                       handleRemoveUser(u._id, u.name)
//                                     }
//                                     className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
//                                     title="Remove from room"
//                                   >
//                                     <FaTrash />
//                                   </button>
//                                 )}
//                               </>
//                             )}
//                           </div>
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//       {permissionsTargetUser && (
//         <PermissionsModal
//           user={permissionsTargetUser}
//           onClose={() => setPermissionsTargetUser(null)}
//         />
//       )}
//     </div>
//   );
// }

// export default Settings;