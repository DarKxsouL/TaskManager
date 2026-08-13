// import { useState, useMemo } from "react";
// import { useCreatedTasks } from "../hooks/useData"; 
// import { useAuth } from "../context/AuthContext";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSearch } from "../context/SearchContext";
// import TaskCard from "../components/TaskCard";

// function Created() {
//   const { user } = useAuth();
//   const { searchQuery } = useSearch();

//   const username = user?.name || "";
  
//   const { data: createdTasks = [], isLoading, isError } = useCreatedTasks(username);

//   // Default to Ascending (Earliest due date first)
//   const [sortBy, setSortBy] = useState<string>('date_asc');
//   const [filterStatus, setFilterStatus] = useState<string | null>(null);
//   const [filterPriority, setFilterPriority] = useState<string | null>(null);

//   // -- FILTERING & SORTING PIPELINE --
//   const processedTasks = useMemo(() => {
//     let tasks = [...createdTasks]; 

//     if (searchQuery) {
//         tasks = tasks.filter(t => 
//             t.title.toLowerCase().includes(searchQuery.toLowerCase())
//         );
//     }

//     // 1. Apply Status Filter
//     if (filterStatus) {
//       tasks = tasks.filter(t => t.status === filterStatus);
//     }

//     // 2. Apply Priority Filter
//     if (filterPriority) {
//       tasks = tasks.filter(t => t.priority === filterPriority);
//     }

//     // 3. Apply Sorting
//     switch (sortBy) {
//       case "date_asc":
//         // Earliest Date First
//         return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
//       case "date_desc":
//         // Latest Date First
//         return tasks.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
//       case "priority":
//         const priorityOrder: { [key: string]: number } = { "Urgent": 1, "High": 2, "Medium": 3, "Low": 4 };
//         return tasks.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
      
//       case "status":
//         const statusOrder: { [key: string]: number } = { "To Do": 1, "In Progress": 2, "Review": 3, "Completed": 4 };
//         return tasks.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5));
      
//       default:
//         return tasks;
//     }
//   }, [createdTasks, filterStatus, filterPriority, sortBy, searchQuery]);

//   const toggleStatus = (status: string) => {
//     setFilterStatus(prev => prev === status ? null : status);
//   };

//   const togglePriority = (priority: string) => {
//     setFilterPriority(prev => prev === priority ? null : priority);
//   };

//   // -- HELPER FUNCTIONS --
//   const getPriorityBadgeClass = (priority: string) => {
//     switch (priority) {
//       case "Urgent": return "border-red-300 bg-red-100 text-red-600";
//       case "High": return "border-orange-300 bg-orange-100 text-orange-600";
//       case "Medium": return "border-yellow-300 bg-yellow-100 text-yellow-600";
//       case "Low": return "border-green-300 bg-green-100 text-green-600";
//       default: return "border-gray-300 bg-gray-100";
//     }
//   };

//   const getStatusBadgeClass = (status: string) => {
//     switch (status) {
//       case "To Do": return "border-gray-300 bg-gray-200 text-gray-700";
//       case "Completed": return "border-green-300 bg-green-100 text-green-700";
//       case "Review": return "border-orange-300 bg-orange-100 text-orange-700";
//       case "In Progress": return "border-blue-300 bg-blue-100 text-blue-700";
//       default: return "border-gray-300 bg-gray-100";
//     }
//   };

//   const getFilterButtonStyle = (isActive: boolean, baseClasses: string) => {
//     return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-1 ring-gray-400 font-bold' : 'opacity-70 hover:opacity-100'}`;
//   }

//   // -- SKELETON LOADER --
//   if (isLoading) {
//     return (
//       <div className="p-8 bg-gray-50 min-h-screen">
//         <div className="grid grid-cols-3 gap-10 mb-10">
//            {[1, 2, 3].map((i) => (
//              <div key={i} className="flex flex-col gap-2">
//                <Skeleton width={60} height={15} />
//                <Skeleton height={40} borderRadius={8} />
//              </div>
//            ))}
//         </div>
//         {[1, 2, 3].map((i) => (
//           <div key={i} className="bg-gray-200 rounded-xl p-6 mb-5 flex justify-between h-32">
//              <div className="space-y-4 w-1/2">
//                 <Skeleton width={80} height={25} borderRadius={20} />
//                 <Skeleton width="90%" height={25} />
//              </div>
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (isError) {
//     return <div className="p-10 text-center text-red-500 font-bold">Failed to load tasks. Please try again later.</div>;
//   }

//   // -- MAIN UI --
//   return (
//     <>
//       <div className='mx-20 h-screen'>
        
//         {/* FILTERS SECTION */}
//         <div className="grid grid-cols-3 py-2">
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">Sort by</div>
//                 <select 
//                   className="w-60 px-2 py-1 rounded-lg border outline-none bg-white/70 focus:ring-2 focus:ring-blue-200"
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                 >
//                     <option value="date_asc">DueDate (Ascending)</option>
//                     <option value="date_desc">DueDate (Descending)</option>
//                     <option value="priority">Priority</option>
//                     <option value="status">Status</option>
//                 </select>
//             </div>
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">Status</div>
//                 <div className="flex gap-2">
//                   {['To Do', 'Completed', 'Review', 'In Progress'].map(status => (
//                     <button 
//                       key={status}
//                       onClick={() => toggleStatus(status)}
//                       className={getFilterButtonStyle(filterStatus === status, `rounded-lg min-w-20 text-center border px-2 py-1 ${getStatusBadgeClass(status)}`)}
//                     >
//                       {status}
//                     </button>
//                   ))}
//               </div>
//             </div>
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">Priority</div>
//                 <div className="flex gap-2">
//               {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
//                 <button 
//                   key={priority}
//                   onClick={() => togglePriority(priority)}
//                   className={getFilterButtonStyle(filterPriority === priority, `rounded-lg min-w-24 text-center border px-2 py-1 ${getPriorityBadgeClass(priority)}`)}
//                 >
//                   {priority}
//                 </button>
//               ))}
//             </div>
//             </div>
//         </div>

//         {/* TASKS LIST SECTION */}
//         <div className="border-t-1 border-gray-400 mt-4 py-4 overflow-scroll h-2/3">
//           {processedTasks.length === 0 ? (
//             <div className="text-center mt-20 text-gray-500 text-xl font-bold">None created tasks match your filters.</div>
//           ) : (
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {processedTasks.map((task: any) => (
//                     <TaskCard key={task._id} task={task} />
//                 ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Created;


//NEW REFORMED UI


import { useState, useMemo } from "react";
import { useCreatedTasks } from "../hooks/useData"; 
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearch } from "../context/SearchContext";
import TaskCard from "../components/TaskCard";
import { FaTasks } from "react-icons/fa";

function Created() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();

  const username = user?.name || "";
  
  const { data: createdTasks = [], isLoading, isError } = useCreatedTasks(username);

  // Default to Ascending (Earliest due date first)
  const [sortBy, setSortBy] = useState<string>('date_asc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // -- FILTERING & SORTING PIPELINE --
  const processedTasks = useMemo(() => {
    let tasks = [...createdTasks]; 

    if (searchQuery) {
        tasks = tasks.filter(t => 
            t.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // 1. Apply Status Filter
    if (filterStatus) {
      tasks = tasks.filter(t => t.status === filterStatus);
    }

    // 2. Apply Priority Filter
    if (filterPriority) {
      tasks = tasks.filter(t => t.priority === filterPriority);
    }

    // 3. Apply Sorting
    switch (sortBy) {
      case "date_asc":
        // Earliest Date First
        return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      
      case "date_desc":
        // Latest Date First
        return tasks.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
      
      case "priority":
        const priorityOrder: { [key: string]: number } = { "Urgent": 1, "High": 2, "Medium": 3, "Low": 4 };
        return tasks.sort((a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5));
      
      case "status":
        const statusOrder: { [key: string]: number } = { "To Do": 1, "In Progress": 2, "Review": 3, "Completed": 4 };
        return tasks.sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5));
      
      default:
        return tasks;
    }
  }, [createdTasks, filterStatus, filterPriority, sortBy, searchQuery]);

  const toggleStatus = (status: string) => {
    setFilterStatus(prev => prev === status ? null : status);
  };

  const togglePriority = (priority: string) => {
    setFilterPriority(prev => prev === priority ? null : priority);
  };

  // -- HELPER FUNCTIONS --
  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent": return "border-red-300 bg-red-100 text-red-600";
      case "High": return "border-orange-300 bg-orange-100 text-orange-600";
      case "Medium": return "border-yellow-300 bg-yellow-100 text-yellow-600";
      case "Low": return "border-green-300 bg-green-100 text-green-600";
      default: return "border-slate-300 bg-slate-100";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "To Do": return "border-slate-300 bg-slate-200 text-slate-700";
      case "Completed": return "border-green-300 bg-green-100 text-green-700";
      case "Review": return "border-orange-300 bg-orange-100 text-orange-700";
      case "In Progress": return "border-blue-300 bg-blue-100 text-blue-700";
      default: return "border-slate-300 bg-slate-100";
    }
  };

  const getFilterButtonStyle = (isActive: boolean, baseClasses: string) => {
    return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-2 ring-emerald-500 font-bold shadow-sm' : 'opacity-70 hover:opacity-100'}`;
  }

  // -- SKELETON LOADER --
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton height={120} borderRadius={24} className="mb-6" />
          <div className="grid grid-cols-3 gap-10 mb-6">
             {[1, 2, 3].map((i) => (
               <div key={i} className="flex flex-col gap-2">
                 <Skeleton width={60} height={15} />
                 <Skeleton height={40} borderRadius={12} />
               </div>
             ))}
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6 mb-5 flex justify-between h-32">
               <div className="space-y-4 w-1/2">
                  <Skeleton width={80} height={25} borderRadius={20} />
                  <Skeleton width="90%" height={25} />
               </div>
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
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">!</div>
          <h3 className="font-semibold text-slate-800">Failed to load tasks</h3>
          <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  // -- MAIN UI --
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 p-8 shadow-xl shadow-emerald-500/20 mb-6">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
                <FaTasks className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Created by Me</h1>
                <p className="text-emerald-100 text-sm mt-0.5">Tasks you've created and assigned out</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold leading-none">{processedTasks.length}</div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-100 mt-1">Showing</div>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold leading-none">{createdTasks.length}</div>
                <div className="text-[11px] uppercase tracking-wider text-emerald-100 mt-1">Total</div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 flex p-6 gap-20 mb-6">
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">Sort by</div>
                <select 
                  className="w-60 px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="date_asc">DueDate (Ascending)</option>
                    <option value="date_desc">DueDate (Descending)</option>
                    <option value="priority">Priority</option>
                    <option value="status">Status</option>
                </select>
            </div>
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">Status</div>
                <div className="flex gap-2 flex-wrap">
                  {['To Do', 'Completed', 'Review', 'In Progress'].map(status => (
                    <button 
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={getFilterButtonStyle(filterStatus === status, `rounded-full min-w-20 text-center border px-3 py-1 text-sm font-medium shadow-sm ${getStatusBadgeClass(status)}`)}
                    >
                      {status}
                    </button>
                  ))}
              </div>
            </div>
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">Priority</div>
                <div className="flex gap-2 flex-wrap">
              {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
                <button 
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={getFilterButtonStyle(filterPriority === priority, `rounded-full min-w-24 text-center border px-3 py-1 text-sm font-medium shadow-sm ${getPriorityBadgeClass(priority)}`)}
                >
                  {priority}
                </button>
              ))}
            </div>
            </div>
        </div>

        {/* TASKS LIST SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6 overflow-scroll h-2/3">
          {processedTasks.length === 0 ? (
            <div className="text-center mt-20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">📋</div>
              <h3 className="text-slate-800 text-xl font-bold">No created tasks match your filters</h3>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your filters above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedTasks.map((task: any) => (
                    <TaskCard key={task._id} task={task} />
                ))}
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

export default Created;