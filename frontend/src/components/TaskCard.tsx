// import { useState, useRef, useEffect } from "react";
// import { useAuth } from "../context/AuthContext";
// import { useUpdateTask, useDeleteTask } from "../hooks/useData";
// import { FaTrash, FaClock, FaUser, FaCheckCircle, FaChevronDown } from "react-icons/fa";
// import { toast } from "react-hot-toast";

// interface Task {
//   _id: string;
//   title: string;
//   description: string;
//   priority: string;
//   status: string;
//   dueDate: string;
//   assignedTo?: { _id: string; name: string; email: string };
//   createdBy?: { _id: string; name: string; email: string };
// }

// const TaskCard = ({ task }: { task: Task }) => {
//   const { user, isAdmin, hasPermission } = useAuth();  // ← add hasPermission
//   const updateTaskMutation = useUpdateTask();
//   const deleteTaskMutation = useDeleteTask();

//   const [isStatusOpen, setIsStatusOpen] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setIsStatusOpen(false);
//       }
//     }
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // --- PERMISSION CHECKS ---
//   const creatorId = task.createdBy?._id;
//   const assigneeId = task.assignedTo?._id;
//   const currentUserId = user?._id;

//   const isCreator = creatorId === currentUserId;
//   const isAssignee = assigneeId === currentUserId;

//   // Can update status if: assignee, creator, admin, or has UPDATE_ANY_TASK
//   const canUpdateStatus = isCreator || isAssignee || isAdmin || hasPermission('UPDATE_ANY_TASK');

//   // Can delete if: creator, admin, or has DELETE_ANY_TASK
//   const canDelete = isCreator || isAdmin || hasPermission('DELETE_ANY_TASK');

//   // --- STYLES ---
//   const getPriorityColor = (p: string) => {
//     switch (p) {
//       case "Urgent": return "bg-red-100 text-red-700 border-red-200";
//       case "High":   return "bg-orange-100 text-orange-700 border-orange-200";
//       case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
//       case "Low":    return "bg-emerald-100 text-emerald-700 border-emerald-200";
//       default:       return "bg-gray-100 text-gray-600 border-gray-200";
//     }
//   };

//   const getStatusColor = (s: string) => {
//     if (s === "Completed") return "text-emerald-600 font-bold";
//     return "text-stone-500 font-medium";
//   };

//   // --- HANDLERS ---
//   const handleStatusChange = (newStatus: string) => {
//     setIsStatusOpen(false);
//     toast.promise(
//       updateTaskMutation.mutateAsync({ id: task._id, updates: { status: newStatus } }),
//       {
//         loading: "Updating status...",
//         success: `Marked as ${newStatus}`,
//         error: "Failed to update status",
//       }
//     );
//   };

//   const handleDelete = () => {
//     if (confirm("Are you sure you want to delete this task?")) {
//       toast.promise(
//         deleteTaskMutation.mutateAsync(task._id),
//         {
//           loading: "Deleting task...",
//           success: "Task deleted",
//           error: "Could not delete task",
//         }
//       );
//     }
//   };

//   const assignedName = task.assignedTo?.name || "Unassigned";
//   const createdName  = task.createdBy?.name  || "Unknown";

//   const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
//     month: "short", day: "numeric",
//   });

//   const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";

//   const statusOptions = ["To Do", "In Progress", "Review", "Completed"];

//   return (
//     <div className="relative group bg-[#FFFBEB] border border-stone-200 p-5 rounded-xl hover:shadow-lg hover:border-stone-300 transition-all duration-300 hover:-translate-y-1">

//       {/* HEADER: Priority & Status */}
//       <div className="flex justify-between items-start mb-3">
//         <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(task.priority)}`}>
//           {task.priority}
//         </span>

//         {/* Status dropdown — only if canUpdateStatus */}
//         <div className="relative" ref={dropdownRef}>
//           <button
//             onClick={() => canUpdateStatus && setIsStatusOpen(!isStatusOpen)}
//             className={`flex items-center gap-1 text-sm px-2 py-1 rounded-md transition-colors ${getStatusColor(task.status)}
//               ${canUpdateStatus ? "cursor-pointer hover:bg-stone-100" : "cursor-default"}`}
//             title={canUpdateStatus ? "Change status" : "You don't have permission to update this task"}
//           >
//             {task.status}
//             {/* Only show chevron if user can actually change it */}
//             {canUpdateStatus && (
//               <FaChevronDown className={`text-xs transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`} />
//             )}
//           </button>

//           {isStatusOpen && canUpdateStatus && (
//             <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden">
//               <ul className="py-1">
//                 {statusOptions.map((option) => (
//                   <li
//                     key={option}
//                     onClick={() => handleStatusChange(option)}
//                     className={`px-4 py-2 text-sm cursor-pointer hover:bg-amber-50 text-stone-600 hover:text-stone-900 transition-colors
//                       ${task.status === option ? "bg-amber-50 font-semibold text-amber-700" : ""}`}
//                   >
//                     {option}
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* TITLE */}
//       <h3 className={`text-xl font-bold text-stone-800 mb-1 capitalize ${task.status === "Completed" ? "line-through text-stone-400" : ""}`}>
//         {task.title}
//       </h3>

//       {/* DETAILS */}
//       <div className="text-sm text-stone-500 mt-4 space-y-2">
//         <div className="flex items-center gap-2">
//           <FaClock className={isOverdue ? "text-red-500" : "text-stone-400"} />
//           <span className={isOverdue ? "text-red-600 font-bold" : "text-stone-600"}>
//             {formattedDate} {isOverdue ? "(Overdue)" : ""}
//           </span>
//         </div>

//         <div className="flex items-center gap-2">
//           <FaUser className="text-blue-400" />
//           <span>Assigned to: <b className="text-stone-700">{assignedName}</b></span>
//         </div>

//         <div className="flex items-center gap-2 text-xs text-stone-400 mt-2 pt-2 border-t border-stone-200">
//           <span>By: {createdName}</span>

//           {/* Show a badge if a delegated user is viewing — subtle indicator */}
//           {!isCreator && !isAssignee && canUpdateStatus && !isAdmin && (
//             <span className="ml-auto text-[10px] bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded font-bold">
//               DELEGATED
//             </span>
//           )}
//         </div>
//       </div>

//       {/* DELETE BUTTON — visible on hover if canDelete */}
//       {canDelete && (
//         <button
//           onClick={handleDelete}
//           className="absolute bottom-4 right-4 p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
//           title="Delete Task"
//         >
//           <FaTrash />
//         </button>
//       )}

//       {/* COMPLETED INDICATOR */}
//       {task.status === "Completed" && (
//         <div className="absolute top-4 right-4 text-emerald-500 opacity-20 pointer-events-none">
//           <FaCheckCircle size={40} />
//         </div>
//       )}
//     </div>
//   );
// };

// export default TaskCard;



//NEW UI

import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUpdateTask, useDeleteTask } from "../hooks/useData";
import { FaTrash, FaClock, FaUser, FaCheckCircle, FaChevronDown } from "react-icons/fa";
import { toast } from "react-hot-toast";

interface Task {
  _id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dueDate: string;
  assignedTo?: { _id: string; name: string; email: string };
  createdBy?: { _id: string; name: string; email: string };
}

const TaskCard = ({ task }: { task: Task }) => {
  const { user, isAdmin, hasPermission } = useAuth();  // ← add hasPermission
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- PERMISSION CHECKS ---
  const creatorId = task.createdBy?._id;
  const assigneeId = task.assignedTo?._id;
  const currentUserId = user?._id;

  const isCreator = creatorId === currentUserId;
  const isAssignee = assigneeId === currentUserId;

  // Can update status if: assignee, creator, admin, or has UPDATE_ANY_TASK
  const canUpdateStatus = isCreator || isAssignee || isAdmin || hasPermission('UPDATE_ANY_TASK');

  // Can delete if: creator, admin, or has DELETE_ANY_TASK
  const canDelete = isCreator || isAdmin || hasPermission('DELETE_ANY_TASK');

  // --- STYLES ---
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Urgent": return "bg-rose-50 text-rose-700 border-rose-200";
      case "High":   return "bg-amber-50 text-amber-700 border-amber-200";
      case "Medium": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "Low":    return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:       return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getStatusColor = (s: string) => {
    if (s === "Completed") return "text-emerald-600 font-bold";
    return "text-slate-500 font-medium";
  };

  // --- HANDLERS ---
  const handleStatusChange = (newStatus: string) => {
    setIsStatusOpen(false);
    toast.promise(
      updateTaskMutation.mutateAsync({ id: task._id, updates: { status: newStatus } }),
      {
        loading: "Updating status...",
        success: `Marked as ${newStatus}`,
        error: "Failed to update status",
      }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
      toast.promise(
        deleteTaskMutation.mutateAsync(task._id),
        {
          loading: "Deleting task...",
          success: "Task deleted",
          error: "Could not delete task",
        }
      );
    }
  };

  const assignedName = task.assignedTo?.name || "Unassigned";
  const createdName  = task.createdBy?.name  || "Unknown";

  const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
    month: "short", day: "numeric",
  });

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== "Completed";

  const statusOptions = ["To Do", "In Progress", "Review", "Completed"];

  return (
    <div className="relative group bg-white border border-slate-200/70 p-5 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">

      {/* HEADER: Priority & Status */}
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>

        {/* Status dropdown — only if canUpdateStatus */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => canUpdateStatus && setIsStatusOpen(!isStatusOpen)}
            className={`flex items-center gap-1 text-sm px-2 py-1 rounded-xl transition-colors ${getStatusColor(task.status)}
              ${canUpdateStatus ? "cursor-pointer hover:bg-slate-100" : "cursor-default"}`}
            title={canUpdateStatus ? "Change status" : "You don't have permission to update this task"}
          >
            {task.status}
            {/* Only show chevron if user can actually change it */}
            {canUpdateStatus && (
              <FaChevronDown className={`text-xs transition-transform duration-200 ${isStatusOpen ? "rotate-180" : ""}`} />
            )}
          </button>

          {isStatusOpen && canUpdateStatus && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-xl z-20 overflow-hidden">
              <ul className="py-1">
                {statusOptions.map((option) => (
                  <li
                    key={option}
                    onClick={() => handleStatusChange(option)}
                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-amber-50 text-slate-600 hover:text-slate-900 transition-colors
                      ${task.status === option ? "bg-amber-50 font-semibold text-amber-700" : ""}`}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* TITLE */}
      <h3 className={`text-xl font-bold text-slate-800 mb-1 capitalize ${task.status === "Completed" ? "line-through text-slate-400" : ""}`}>
        {task.title}
      </h3>

      {/* DETAILS */}
      <div className="text-sm text-slate-500 mt-4 space-y-2">
        <div className="flex items-center gap-2">
          <FaClock className={isOverdue ? "text-red-500" : "text-slate-400"} />
          <span className={isOverdue ? "text-red-600 font-bold" : "text-slate-600"}>
            {formattedDate} {isOverdue ? "(Overdue)" : ""}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <FaUser className="text-blue-400" />
          <span>Assigned to: <b className="text-slate-700">{assignedName}</b></span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-200">
          <span>By: {createdName}</span>

          {/* Show a badge if a delegated user is viewing — subtle indicator */}
          {!isCreator && !isAssignee && canUpdateStatus && !isAdmin && (
            <span className="ml-auto text-[10px] bg-violet-50 text-violet-700 border border-violet-200 px-2 py-0.5 rounded-full font-bold tracking-wide">
              DELEGATED
            </span>
          )}
        </div>
      </div>

      {/* DELETE BUTTON — visible on hover if canDelete */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute bottom-4 right-4 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
          title="Delete Task"
        >
          <FaTrash />
        </button>
      )}

      {/* COMPLETED INDICATOR */}
      {task.status === "Completed" && (
        <div className="absolute top-4 right-4 text-emerald-500 opacity-20 pointer-events-none">
          <FaCheckCircle size={40} />
        </div>
      )}
    </div>
  );
};

export default TaskCard;