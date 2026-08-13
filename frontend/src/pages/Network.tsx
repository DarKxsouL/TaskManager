// import { useMemo, useState } from "react";
// import UserDetailPanel from "../components/UserDetailPanel";
// import { useUsers, useSettings } from "../hooks/useData";
// import { useAuth } from "../context/AuthContext"; // Import Auth to check permissions
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSearch } from "../context/SearchContext";
// import { FaCrown } from "react-icons/fa";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
//   jobRole?: string;
// }

// function Network() {
//   const { searchQuery } = useSearch();
//   const { isAdmin, hasPermission } = useAuth();
//   const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

//   const canViewStats = isAdmin || hasPermission("VIEW_ALL_STATS");

//   const { data: userList = [], isLoading: loadingUsers, isError } = useUsers();
//   const { data: settings } = useSettings();

//   // -- GROUPING & FILTERING LOGIC --
//   const groupedUsers = useMemo(() => {
//     let filteredList = userList;

//     // 1. PRIVACY FILTER: Hide Admin/CEO from non-admin users
//     // if (!isAdmin) {
//     //     filteredList = filteredList.filter((u: User) => {
//     //         // Check if user is the Main Admin/CEO
//     //         // const isCEO = u.jobRole === 'CEO' || u.designation === 'CEO' || (u.role === 'Admin' && u.jobRole === 'N/A');
//     //         // return !isCEO; // Remove them from the list
//     //         const isAdminOrCEO = u.role === 'Admin' || u.role === 'CEO';
//     //         return !isAdminOrCEO;
//     //     });
//     // }

//     if (!isAdmin) {
//       filteredList = filteredList.filter((u: User) => {
//         const isAdminOrCEO = u.role === "Admin";
//         return !isAdminOrCEO;
//       });
//     }

//     // 2. SEARCH FILTER
//     if (searchQuery) {
//       filteredList = filteredList.filter(
//         (u: User) =>
//           u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (u.jobRole || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (u.designation || "")
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase()),
//       );
//     }

//     // 3. GROUPING LOGIC
//     return filteredList.reduce(
//       (groups: Record<string, User[]>, user: User) => {
//         // FIX: If user is Admin but has "N/A" job role, force them into "CEO" group
//         let key = user.jobRole || "Other";

//         const isMainAdmin =
//           user.role === "Admin" &&
//           (user.jobRole === "N/A" || !user.jobRole || user.jobRole === "CEO");
//         if (isMainAdmin) {
//           key = "CEO";
//         }

//         if (!groups[key]) {
//           groups[key] = [];
//         }
//         groups[key].push(user);
//         return groups;
//       },
//       {} as Record<string, User[]>,
//     );
//   }, [userList, searchQuery, isAdmin]); // Re-run if isAdmin changes

//   // -- SORTING LOGIC --
//   const sortedGroupKeys = useMemo(() => {
//     const keys = Object.keys(groupedUsers);
//     const configuredRoles = settings?.roles || [];

//     return keys.sort((a, b) => {
//       // 1. CEO always first
//       if (a === "CEO") return -1;
//       if (b === "CEO") return 1;

//       // 2. 'Other' always last
//       if (a === "Other") return 1;
//       if (b === "Other") return -1;

//       // 3. Respect Settings Order
//       const indexA = configuredRoles.indexOf(a);
//       const indexB = configuredRoles.indexOf(b);

//       if (indexA !== -1 && indexB !== -1) return indexA - indexB;
//       if (indexA !== -1) return -1;
//       if (indexB !== -1) return 1;

//       // 4. Alphabetical fallback
//       return a.localeCompare(b);
//     });
//   }, [groupedUsers, settings]);

//   // -- SKELETON LOADING --
//   if (loadingUsers) {
//     return (
//       <div className="mx-20 pt-20 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 overflow-y-auto">
//         {[1, 2, 3].map((group) => (
//           <div key={group}>
//             <div className="bg-blue-900 px-3 py-2">
//               <Skeleton
//                 baseColor="#1e3a8a"
//                 highlightColor="#3b82f6"
//                 width={100}
//                 height={20}
//               />
//             </div>
//             {[1, 2, 3].map((row) => (
//               <div
//                 key={row}
//                 className="border-b-2 border-gray-300 px-3 py-2 flex justify-between items-center"
//               >
//                 <div className="flex items-center gap-3">
//                   <Skeleton circle width={40} height={40} />
//                   <div className="flex flex-col">
//                     <Skeleton width={100} />
//                     <Skeleton width={150} />
//                   </div>
//                 </div>
//                 <Skeleton width={100} />
//               </div>
//             ))}
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="p-10 text-center text-red-500 font-bold">
//         Failed to load network. Please try again later.
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="mx-20 pt-20 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 text-black overflow-y-auto">
//         {sortedGroupKeys.map((role) => (
//           <div key={role}>
//             {/* Sticky Header */}
//             <div className="sticky top-0 z-10 bg-blue-900 text-white text-xl font-bold px-4 py-2 uppercase tracking-wider shadow-md flex justify-between items-center">
//               <span>{role}</span>
//               <span className="text-xs bg-blue-800 px-2 py-1 rounded-full text-blue-200 opacity-80">
//                 {groupedUsers[role].length}{" "}
//                 {groupedUsers[role].length === 1 ? "Person" : "People"}
//               </span>
//             </div>

//             {/* User List */}
//             {groupedUsers[role].map((user: User) => (
//               <div
//                 key={user._id}
//                 onClick={() => {
//                   if (canViewStats && user.role !== "Admin") {
//                     setSelectedUserId(user._id);
//                   }
//                 }}
//                 className={`border-b border-gray-300 px-4 py-3 transition-colors flex justify-between items-center group
//                             ${
//                               canViewStats && user.role !== "Admin"
//                                 ? "hover:bg-white/80 cursor-pointer"
//                                 : "hover:bg-white/40 cursor-default"
//                             }`}
//               >
//                 {/* Left: Avatar & Name */}
//                 <div className="flex items-center gap-4">
//                   <img
//                     src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&bold=true`}
//                     alt={user.name}
//                     className="w-10 h-10 rounded-full shadow-sm"
//                   />
//                   <div className="flex flex-col">
//                     <div className="flex items-center gap-2">
//                       <span className="font-semibold text-gray-800 text-lg">
//                         {user.name}
//                       </span>

//                       {/* Crown for CEO Group */}
//                       {role === "CEO" && (
//                         <FaCrown
//                           className="text-yellow-500 text-sm"
//                           title="CEO"
//                         />
//                       )}

//                       {/* Admin Badge for Promoted Employees */}
//                       {user.role === "Admin" && role !== "CEO" && (
//                         <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">
//                           ADMIN
//                         </span>
//                       )}
//                     </div>
//                     <span className="text-xs text-gray-500 font-mono">
//                       {user.email}
//                     </span>
//                   </div>
//                 </div>

//                 {/* Right: Designation + click hint */}
//                 <div className="flex items-center gap-3">
//                   <div className="text-sm font-medium text-gray-500 group-hover:text-blue-700 transition-colors">
//                     {user.designation || "No Title"}
//                   </div>
//                   {/* Subtle indicator for clickable rows */}
//                   {canViewStats && user.role !== "Admin" && (
//                     <span className="text-[10px] text-gray-300 group-hover:text-blue-400 transition-colors font-medium opacity-0 group-hover:opacity-100">
//                       View details →
//                     </span>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         ))}

//         {userList.length === 0 && (
//           <div className="text-center py-20 text-gray-500 text-lg flex flex-col items-center">
//             <div className="text-4xl mb-2">📭</div>
//             No users found in the network.
//           </div>
//         )}

//         {sortedGroupKeys.length === 0 && searchQuery && (
//           <div className="text-center py-10 text-gray-500">
//             No users found matching "{searchQuery}"
//           </div>
//         )}

//         {sortedGroupKeys.length === 0 && !searchQuery && !loadingUsers && (
//           <div className="text-center py-10 text-gray-500">
//             No visible users.
//           </div>
//         )}
//       </div>

//       {selectedUserId && (
//         <UserDetailPanel
//           userId={selectedUserId}
//           onClose={() => setSelectedUserId(null)}
//         />
//       )}
//     </>
//   );
// }

// export default Network;

//OLD UI

// import { useMemo } from "react";
// import { useUsers, useSettings } from "../hooks/useData";
// import { useAuth } from "../context/AuthContext";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSearch } from "../context/SearchContext";
// import { FaCrown, FaEnvelope, FaUsers, FaSearch, FaInbox } from "react-icons/fa";

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
//   jobRole?: string;
// }

// function Network() {
//   const { searchQuery } = useSearch();
//   const { isAdmin } = useAuth();

//   const { data: userList = [], isLoading: loadingUsers, isError } = useUsers();
//   const { data: settings } = useSettings();

//   const groupedUsers = useMemo(() => {
//     let filteredList = userList;

//     if (!isAdmin) {
//       filteredList = filteredList.filter((u: User) => {
//         const isAdminOrCEO = u.role === "Admin" || u.role === "CEO";
//         return !isAdminOrCEO;
//       });
//     }

//     if (searchQuery) {
//       filteredList = filteredList.filter(
//         (u: User) =>
//           u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (u.jobRole || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
//           (u.designation || "").toLowerCase().includes(searchQuery.toLowerCase())
//       );
//     }

//     return filteredList.reduce((groups: Record<string, User[]>, user: User) => {
//       let key = user.jobRole || "Other";
//       const isMainAdmin =
//         user.role === "Admin" &&
//         (user.jobRole === "N/A" || !user.jobRole || user.jobRole === "CEO");
//       if (isMainAdmin) key = "CEO";

//       if (!groups[key]) groups[key] = [];
//       groups[key].push(user);
//       return groups;
//     }, {} as Record<string, User[]>);
//   }, [userList, searchQuery, isAdmin]);

//   const sortedGroupKeys = useMemo(() => {
//     const keys = Object.keys(groupedUsers);
//     const configuredRoles = settings?.roles || [];

//     return keys.sort((a, b) => {
//       if (a === "CEO") return -1;
//       if (b === "CEO") return 1;
//       if (a === "Other") return 1;
//       if (b === "Other") return -1;

//       const indexA = configuredRoles.indexOf(a);
//       const indexB = configuredRoles.indexOf(b);
//       if (indexA !== -1 && indexB !== -1) return indexA - indexB;
//       if (indexA !== -1) return -1;
//       if (indexB !== -1) return 1;

//       return a.localeCompare(b);
//     });
//   }, [groupedUsers, settings]);

//   const totalPeople = useMemo(
//     () => Object.values(groupedUsers).reduce((sum, arr) => sum + arr.length, 0),
//     [groupedUsers]
//   );

//   // -- Group accent palette (cycled) --
//   const groupAccents = [
//     { bar: "from-indigo-500 to-blue-500", chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
//     { bar: "from-emerald-500 to-teal-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
//     { bar: "from-amber-500 to-orange-500", chip: "bg-amber-50 text-amber-700 border-amber-200" },
//     { bar: "from-rose-500 to-pink-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
//     { bar: "from-violet-500 to-purple-500", chip: "bg-violet-50 text-violet-700 border-violet-200" },
//     { bar: "from-cyan-500 to-sky-500", chip: "bg-cyan-50 text-cyan-700 border-cyan-200" },
//   ];
//   const getAccent = (role: string, idx: number) =>
//     role === "CEO"
//       ? { bar: "from-amber-400 via-yellow-500 to-orange-500", chip: "bg-amber-50 text-amber-800 border-amber-200" }
//       : groupAccents[idx % groupAccents.length];

//   // -- SKELETON LOADING --
//   if (loadingUsers) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-6xl mx-auto">
//           <Skeleton height={120} borderRadius={24} className="mb-6" />
//           {[1, 2, 3].map((g) => (
//             <div key={g} className="bg-white rounded-2xl shadow-sm border border-slate-200/70 mb-5 overflow-hidden">
//               <div className="px-6 py-4 border-b border-slate-100">
//                 <Skeleton width={140} height={22} />
//               </div>
//               {[1, 2, 3].map((r) => (
//                 <div key={r} className="px-6 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0">
//                   <Skeleton circle width={44} height={44} />
//                   <div className="flex-1">
//                     <Skeleton width={160} />
//                     <Skeleton width={220} />
//                   </div>
//                   <Skeleton width={120} />
//                 </div>
//               ))}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 pt-24 px-6">
//         <div className="max-w-md mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
//           <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">
//             !
//           </div>
//           <h3 className="font-semibold text-slate-800">Failed to load network</h3>
//           <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-6xl mx-auto">
//         {/* HERO HEADER */}
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 shadow-xl shadow-blue-500/20 mb-6">
//           <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
//           <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />
//           <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
//             <div className="flex items-center gap-4">
//               <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
//                 <FaUsers className="text-2xl" />
//               </div>
//               <div>
//                 <h1 className="text-3xl font-bold tracking-tight">Network</h1>
//                 <p className="text-blue-100 text-sm mt-0.5">
//                   Browse everyone in your organization
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center gap-3">
//               <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
//                 <div className="text-2xl font-bold leading-none">{totalPeople}</div>
//                 <div className="text-[11px] uppercase tracking-wider text-blue-100 mt-1">
//                   Members
//                 </div>
//               </div>
//               <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
//                 <div className="text-2xl font-bold leading-none">
//                   {sortedGroupKeys.length}
//                 </div>
//                 <div className="text-[11px] uppercase tracking-wider text-blue-100 mt-1">
//                   Departments
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* SEARCH RESULT BANNER */}
//         {searchQuery && (
//           <div className="mb-4 flex items-center gap-3 bg-white/70 backdrop-blur border border-slate-200 rounded-xl px-4 py-3">
//             <FaSearch className="text-slate-400" />
//             <span className="text-sm text-slate-600">
//               Showing results for{" "}
//               <span className="font-semibold text-slate-800">"{searchQuery}"</span>
//             </span>
//           </div>
//         )}

//         {/* GROUPS */}
//         <div className="space-y-5">
//           {sortedGroupKeys.map((role, idx) => {
//             const accent = getAccent(role, idx);
//             const people = groupedUsers[role];

//             return (
//               <section
//                 key={role}
//                 className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
//               >
//                 {/* Group Header */}
//                 <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
//                   <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />
//                   <div className="px-6 py-4 flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       {role === "CEO" && (
//                         <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
//                           <FaCrown />
//                         </div>
//                       )}
//                       <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">
//                         {role}
//                       </h2>
//                     </div>
//                     <span
//                       className={`text-xs font-semibold px-3 py-1 rounded-full border ${accent.chip}`}
//                     >
//                       {people.length} {people.length === 1 ? "Person" : "People"}
//                     </span>
//                   </div>
//                 </div>

//                 {/* User Rows */}
//                 <ul className="divide-y divide-slate-100">
//                   {people.map((user: User) => (
//                     <li
//                       key={user._id}
//                       className="group px-6 py-4 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
//                     >
//                       <div className="flex items-center gap-4 min-w-0">
//                         <div className="relative shrink-0">
//                           <img
//                             src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
//                               user.name
//                             )}&background=random&color=fff&bold=true`}
//                             alt={user.name}
//                             className="w-11 h-11 rounded-full shadow-sm ring-2 ring-white"
//                           />
//                           {role === "CEO" && (
//                             <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] flex items-center justify-center ring-2 ring-white shadow">
//                               <FaCrown />
//                             </span>
//                           )}
//                         </div>

//                         <div className="min-w-0">
//                           <div className="flex items-center gap-2 flex-wrap">
//                             <span className="font-semibold text-slate-800 truncate">
//                               {user.name}
//                             </span>
//                             {user.role === "Admin" && role !== "CEO" && (
//                               <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold border border-violet-200 tracking-wide">
//                                 ADMIN
//                               </span>
//                             )}
//                           </div>
//                           <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
//                             <FaEnvelope className="w-3 h-3 shrink-0" />
//                             <span className="truncate">{user.email}</span>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="text-right shrink-0">
//                         <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
//                           {user.designation || "—"}
//                         </div>
//                         <div className="text-[11px] text-slate-400 uppercase tracking-wider">
//                           {user.designation ? "Designation" : "No title"}
//                         </div>
//                       </div>
//                     </li>
//                   ))}
//                 </ul>
//               </section>
//             );
//           })}
//         </div>

//         {/* EMPTY STATES */}
//         {userList.length === 0 && (
//           <EmptyState
//             icon={<FaInbox />}
//             title="No users in network"
//             subtitle="Once people join, they'll appear here."
//           />
//         )}

//         {sortedGroupKeys.length === 0 && searchQuery && (
//           <EmptyState
//             icon={<FaSearch />}
//             title="No matches found"
//             subtitle={`Nothing matches "${searchQuery}". Try a different search.`}
//           />
//         )}

//         {sortedGroupKeys.length === 0 && !searchQuery && userList.length > 0 && (
//           <EmptyState
//             icon={<FaUsers />}
//             title="No visible users"
//             subtitle="There are no users you have permission to view."
//           />
//         )}
//       </div>
//     </div>
//   );
// }

// function EmptyState({
//   icon,
//   title,
//   subtitle,
// }: {
//   icon: React.ReactNode;
//   title: string;
//   subtitle: string;
// }) {
//   return (
//     <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
//       <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
//         {icon}
//       </div>
//       <h3 className="font-semibold text-slate-800">{title}</h3>
//       <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
//     </div>
//   );
// }

// export default Network;



//NEW REFORMED UI

import { useMemo, useState } from "react";
import UserDetailPanel from "../components/UserDetailPanel";
import { useUsers, useSettings } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearch } from "../context/SearchContext";
import { FaCrown, FaEnvelope, FaUsers, FaSearch, FaInbox } from "react-icons/fa";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  jobRole?: string;
}

function Network() {
  const { searchQuery } = useSearch();
  const { isAdmin, hasPermission } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const canViewStats = isAdmin || hasPermission("VIEW_ALL_STATS");

  const { data: userList = [], isLoading: loadingUsers, isError } = useUsers();
  const { data: settings } = useSettings();

  const groupedUsers = useMemo(() => {
    let filteredList = userList;

    if (!isAdmin) {
      filteredList = filteredList.filter((u: User) => u.role !== "Admin");
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filteredList = filteredList.filter(
        (u: User) =>
          u.name.toLowerCase().includes(q) ||
          (u.jobRole || "").toLowerCase().includes(q) ||
          (u.designation || "").toLowerCase().includes(q),
      );
    }

    return filteredList.reduce(
      (groups: Record<string, User[]>, user: User) => {
        let key = user.jobRole || "Other";
        const isMainAdmin =
          user.role === "Admin" &&
          (user.jobRole === "N/A" || !user.jobRole || user.jobRole === "CEO");
        if (isMainAdmin) key = "CEO";

        if (!groups[key]) groups[key] = [];
        groups[key].push(user);
        return groups;
      },
      {} as Record<string, User[]>,
    );
  }, [userList, searchQuery, isAdmin]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedUsers);
    const configuredRoles = settings?.roles || [];

    return keys.sort((a, b) => {
      if (a === "CEO") return -1;
      if (b === "CEO") return 1;
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      const indexA = configuredRoles.indexOf(a);
      const indexB = configuredRoles.indexOf(b);
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [groupedUsers, settings]);

  const totalPeople = useMemo(
    () => Object.values(groupedUsers).reduce((sum, arr) => sum + arr.length, 0),
    [groupedUsers],
  );

  // Group accent palette (cycled)
  const groupAccents = [
    { bar: "from-indigo-500 to-blue-500", chip: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { bar: "from-emerald-500 to-teal-500", chip: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { bar: "from-amber-500 to-orange-500", chip: "bg-amber-50 text-amber-700 border-amber-200" },
    { bar: "from-rose-500 to-pink-500", chip: "bg-rose-50 text-rose-700 border-rose-200" },
    { bar: "from-violet-500 to-purple-500", chip: "bg-violet-50 text-violet-700 border-violet-200" },
    { bar: "from-cyan-500 to-sky-500", chip: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  ];
  const getAccent = (role: string, idx: number) =>
    role === "CEO"
      ? { bar: "from-amber-400 via-yellow-500 to-orange-500", chip: "bg-amber-50 text-amber-800 border-amber-200" }
      : groupAccents[idx % groupAccents.length];

  // -- SKELETON LOADING --
  if (loadingUsers) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton height={120} borderRadius={24} className="mb-6" />
          {[1, 2, 3].map((g) => (
            <div key={g} className="bg-white rounded-2xl shadow-sm border border-slate-200/70 mb-5 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <Skeleton width={140} height={22} />
              </div>
              {[1, 2, 3].map((r) => (
                <div key={r} className="px-6 py-4 flex items-center gap-4 border-b border-slate-50 last:border-0">
                  <Skeleton circle width={44} height={44} />
                  <div className="flex-1">
                    <Skeleton width={160} />
                    <Skeleton width={220} />
                  </div>
                  <Skeleton width={120} />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 pt-24 px-6">
        <div className="max-w-md mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl font-bold">
            !
          </div>
          <h3 className="font-semibold text-slate-800">Failed to load network</h3>
          <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* HERO HEADER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 shadow-xl shadow-blue-500/20 mb-6">
            <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />
            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
                  <FaUsers className="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Network</h1>
                  <p className="text-blue-100 text-sm mt-0.5">Browse everyone in your organization</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                  <div className="text-2xl font-bold leading-none">{totalPeople}</div>
                  <div className="text-[11px] uppercase tracking-wider text-blue-100 mt-1">Members</div>
                </div>
                <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                  <div className="text-2xl font-bold leading-none">{sortedGroupKeys.length}</div>
                  <div className="text-[11px] uppercase tracking-wider text-blue-100 mt-1">Departments</div>
                </div>
              </div>
            </div>
          </div>

          {/* SEARCH BANNER */}
          {searchQuery && (
            <div className="mb-4 flex items-center gap-3 bg-white/70 backdrop-blur border border-slate-200 rounded-xl px-4 py-3">
              <FaSearch className="text-slate-400" />
              <span className="text-sm text-slate-600">
                Showing results for <span className="font-semibold text-slate-800">"{searchQuery}"</span>
              </span>
            </div>
          )}

          {/* GROUPS */}
          <div className="space-y-5">
            {sortedGroupKeys.map((role, idx) => {
              const accent = getAccent(role, idx);
              const people = groupedUsers[role];

              return (
                <section
                  key={role}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
                >
                  <div className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
                    <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />
                    <div className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {role === "CEO" && (
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center shadow-md shadow-amber-500/30">
                            <FaCrown />
                          </div>
                        )}
                        <h2 className="text-lg font-bold text-slate-800 uppercase tracking-wide">{role}</h2>
                      </div>
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${accent.chip}`}>
                        {people.length} {people.length === 1 ? "Person" : "People"}
                      </span>
                    </div>
                  </div>

                  <ul className="divide-y divide-slate-100">
                    {people.map((user: User) => {
                      const clickable = canViewStats && user.role !== "Admin";
                      return (
                        <li
                          key={user._id}
                          onClick={() => clickable && setSelectedUserId(user._id)}
                          className={`group px-6 py-4 flex items-center justify-between gap-4 transition-colors ${
                            clickable ? "hover:bg-slate-50/80 cursor-pointer" : "cursor-default"
                          }`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="relative shrink-0">
                              <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&color=fff&bold=true`}
                                alt={user.name}
                                className="w-11 h-11 rounded-full shadow-sm ring-2 ring-white"
                              />
                              {role === "CEO" && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white text-[10px] flex items-center justify-center ring-2 ring-white shadow">
                                  <FaCrown />
                                </span>
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-800 truncate">{user.name}</span>
                                {user.role === "Admin" && role !== "CEO" && (
                                  <span className="text-[10px] bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full font-bold border border-violet-200 tracking-wide">
                                    ADMIN
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5 truncate">
                                <FaEnvelope className="w-3 h-3 shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                                {user.designation || "—"}
                              </div>
                              <div className="text-[11px] text-slate-400 uppercase tracking-wider">
                                {user.designation ? "Designation" : "No title"}
                              </div>
                            </div>
                            {clickable && (
                              <span className="text-[11px] text-slate-300 group-hover:text-blue-500 transition-all font-medium opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0">
                                View →
                              </span>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>

          {/* EMPTY STATES */}
          {userList.length === 0 && (
            <EmptyState icon={<FaInbox />} title="No users in network" subtitle="Once people join, they'll appear here." />
          )}
          {sortedGroupKeys.length === 0 && searchQuery && (
            <EmptyState icon={<FaSearch />} title="No matches found" subtitle={`Nothing matches "${searchQuery}". Try a different search.`} />
          )}
          {sortedGroupKeys.length === 0 && !searchQuery && userList.length > 0 && (
            <EmptyState icon={<FaUsers />} title="No visible users" subtitle="There are no users you have permission to view." />
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserDetailPanel userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}
    </>
  );
}

function EmptyState({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-800">{title}</h3>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
}

export default Network;
