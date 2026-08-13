// import { useState, useMemo } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useAssignedTasks, useCreatedTasks } from "../hooks/useData";
// import TaskCard from "../components/TaskCard";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

// function Overdued() {
//   const { user } = useAuth();

//   const username = user?.name || "";

//   // 1. Fetch both data sources
//   const { data: assignedTasks = [], isLoading: loadingAssigned } = useAssignedTasks(username);
//   const { data: createdTasks = [], isLoading: loadingCreated } = useCreatedTasks(username);

//   // 2. State Management
//   // Default to 'assigned_overdue' (Tasks assigned to me that I need to finish)
//   const [viewType, setViewType] = useState<string>("assigned_overdue");
//   const [filterStatus, setFilterStatus] = useState<string | null>(null);
//   const [filterPriority, setFilterPriority] = useState<string | null>(null);

//   // 3. Filtering Pipeline
//   const processedTasks = useMemo(() => {
//     // A. Select Source
//     let tasks = viewType === 'assigned_overdue' ? assignedTasks : createdTasks;

//     // B. Apply "Overdue" Logic (Mandatory)
//     // Task is overdue if Due Date is in the past AND it is NOT completed
//     tasks = tasks.filter((t: any) => {
//         const isPastDue = new Date(t.dueDate) < new Date();
//         const isNotCompleted = t.status !== "Completed";
//         return isPastDue && isNotCompleted;
//     });

//     // C. Apply Status Filter (Optional)
//     if (filterStatus) {
//       tasks = tasks.filter((t: any) => t.status === filterStatus);
//     }

//     // D. Apply Priority Filter (Optional)
//     if (filterPriority) {
//       tasks = tasks.filter((t: any) => t.priority === filterPriority);
//     }

//     return tasks;
//   }, [viewType, assignedTasks, createdTasks, filterStatus, filterPriority]);

//   // -- HANDLERS --
//   const toggleStatus = (status: string) => {
//     setFilterStatus(prev => prev === status ? null : status);
//   };

//   const togglePriority = (priority: string) => {
//     setFilterPriority(prev => prev === priority ? null : priority);
//   };

//   // -- STYLE HELPERS --
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
//     return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-2 ring-gray-500 font-bold opacity-100' : 'opacity-60 hover:opacity-100'}`;
//   }

//   // -- LOADING STATE --
//   if (loadingAssigned || loadingCreated) {
//     return (
//       <div className="mx-20 mt-10 grid grid-cols-3 gap-6">
//          {[1, 2, 3].map(i => <Skeleton key={i} height={200} borderRadius={12} />)}
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="mx-20 h-screen">
//         {/* FILTERS HEADER */}
//         <div className="grid grid-cols-3 py-4 gap-4">
            
//             {/* 1. View Selector (Source) */}
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">View Tasks</div>
//                 <select 
//                   className="w-full max-w-[240px] px-3 py-2 rounded-lg border border-gray-300 outline-none bg-white/80 font-medium cursor-pointer"
//                   value={viewType}
//                   onChange={(e) => setViewType(e.target.value)}
//                 >
//                     <option value="assigned_overdue">Assigned to Me (Overdue)</option>
//                     <option value="created_overdue">Created by Me (Overdue)</option>
//                 </select>
//             </div>

//             {/* 2. Status Filter */}
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">Status</div>
//                 <div className="flex flex-wrap gap-2">
//                   {['To Do', 'In Progress', 'Review'].map(status => (
//                     <button 
//                       key={status}
//                       onClick={() => toggleStatus(status)}
//                       className={getFilterButtonStyle(filterStatus === status, `rounded-lg min-w-[80px] text-center border px-2 py-1 text-sm ${getStatusBadgeClass(status)}`)}
//                     >
//                       {status}
//                     </button>
//                   ))}
//                   {/* Note: 'Completed' is excluded from buttons because Completed tasks are usually not considered 'Overdue' in the same way, but you can add it back if needed */}
//               </div>
//             </div>

//             {/* 3. Priority Filter */}
//             <div>
//                 <div className="py-2 font-semibold text-gray-600">Priority</div>
//                 <div className="flex flex-wrap gap-2">
//               {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
//                 <button 
//                   key={priority}
//                   onClick={() => togglePriority(priority)}
//                   className={getFilterButtonStyle(filterPriority === priority, `rounded-lg min-w-[80px] text-center border px-2 py-1 text-sm ${getPriorityBadgeClass(priority)}`)}
//                 >
//                   {priority}
//                 </button>
//               ))}
//             </div>
//             </div>
//         </div>

//         {/* RESULTS SECTION */}
//         <div className="border-t border-gray-300 mt-2 py-6 overflow-y-auto h-[calc(100vh-200px)]">
//             {processedTasks.length === 0 ? (
//                 <div className="text-center mt-20 text-gray-500">
//                     <h3 className="text-xl font-bold">No Overdue Tasks Found</h3>
//                     <p>Good job! You are up to date.</p>
//                 </div>
//             ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
//                     {processedTasks.map((task: any) => (
//                         <TaskCard key={task._id} task={task} />
//                     ))}
//                 </div>
//             )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default Overdued;


//NEW REFORMED UI

import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAssignedTasks, useCreatedTasks } from "../hooks/useData";
import TaskCard from "../components/TaskCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaExclamationTriangle } from "react-icons/fa";

function Overdued() {
  const { user } = useAuth();

  const username = user?.name || "";

  // 1. Fetch both data sources
  const { data: assignedTasks = [], isLoading: loadingAssigned } = useAssignedTasks(username);
  const { data: createdTasks = [], isLoading: loadingCreated } = useCreatedTasks(username);

  // 2. State Management
  // Default to 'assigned_overdue' (Tasks assigned to me that I need to finish)
  const [viewType, setViewType] = useState<string>("assigned_overdue");
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // 3. Filtering Pipeline
  const processedTasks = useMemo(() => {
    // A. Select Source
    let tasks = viewType === 'assigned_overdue' ? assignedTasks : createdTasks;

    // B. Apply "Overdue" Logic (Mandatory)
    // Task is overdue if Due Date is in the past AND it is NOT completed
    tasks = tasks.filter((t: any) => {
        const isPastDue = new Date(t.dueDate) < new Date();
        const isNotCompleted = t.status !== "Completed";
        return isPastDue && isNotCompleted;
    });

    // C. Apply Status Filter (Optional)
    if (filterStatus) {
      tasks = tasks.filter((t: any) => t.status === filterStatus);
    }

    // D. Apply Priority Filter (Optional)
    if (filterPriority) {
      tasks = tasks.filter((t: any) => t.priority === filterPriority);
    }

    return tasks;
  }, [viewType, assignedTasks, createdTasks, filterStatus, filterPriority]);

  // -- HANDLERS --
  const toggleStatus = (status: string) => {
    setFilterStatus(prev => prev === status ? null : status);
  };

  const togglePriority = (priority: string) => {
    setFilterPriority(prev => prev === priority ? null : priority);
  };

  // -- STYLE HELPERS --
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
    return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-2 ring-slate-500 font-bold opacity-100' : 'opacity-60 hover:opacity-100'}`;
  }

  // -- LOADING STATE --
  if (loadingAssigned || loadingCreated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <Skeleton height={120} borderRadius={24} className="mb-6" />
          <div className="grid grid-cols-3 gap-6">
             {[1, 2, 3].map(i => <Skeleton key={i} height={200} borderRadius={16} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-10 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-600 to-orange-500 p-8 shadow-xl shadow-rose-500/20 mb-6">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
                <FaExclamationTriangle className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Overdue Tasks</h1>
                <p className="text-rose-100 text-sm mt-0.5">Tasks that have missed their due date</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold leading-none">{processedTasks.length}</div>
                <div className="text-[11px] uppercase tracking-wider text-rose-100 mt-1">Overdue</div>
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 flex p-6 gap-20 mb-6">
            
            {/* 1. View Selector (Source) */}
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">View Tasks</div>
                <select 
                  className="w-full max-w-[240px] px-3 py-2 rounded-xl border border-slate-200 outline-none bg-white font-medium cursor-pointer focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                    <option value="assigned_overdue">Assigned to Me (Overdue)</option>
                    <option value="created_overdue">Created by Me (Overdue)</option>
                </select>
            </div>

            {/* 2. Status Filter */}
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">Status</div>
                <div className="flex flex-wrap gap-2">
                  {['To Do', 'In Progress', 'Review'].map(status => (
                    <button 
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={getFilterButtonStyle(filterStatus === status, `rounded-full min-w-[80px] text-center border px-3 py-1 text-sm font-semibold shadow-sm ${getStatusBadgeClass(status)}`)}
                    >
                      {status}
                    </button>
                  ))}
                  {/* Note: 'Completed' is excluded from buttons because Completed tasks are usually not considered 'Overdue' in the same way, but you can add it back if needed */}
              </div>
            </div>

            {/* 3. Priority Filter */}
            <div>
                <div className="py-2 font-semibold text-slate-600 text-sm uppercase tracking-wide">Priority</div>
                <div className="flex flex-wrap gap-2">
              {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
                <button 
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={getFilterButtonStyle(filterPriority === priority, `rounded-full min-w-[80px] text-center border px-3 py-1 text-sm font-semibold shadow-sm ${getPriorityBadgeClass(priority)}`)}
                >
                  {priority}
                </button>
              ))}
            </div>
            </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 py-6 px-6 overflow-y-auto h-[calc(100vh-420px)]">
            {processedTasks.length === 0 ? (
                <div className="text-center mt-20 text-slate-500">
                    <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">✓</div>
                    <h3 className="text-xl font-bold text-slate-800">No Overdue Tasks Found</h3>
                    <p className="text-sm text-slate-500 mt-1">Good job! You are up to date.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
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

export default Overdued;