// import { useAuth } from "../context/AuthContext";
// import { useUserStats } from "../hooks/useData";
// import { useUpdateTask, useDeleteTask } from "../hooks/useData";
// import { useState } from "react";
// import { 
//   FaTimes, FaClock, FaUser, 
// //   FaCheckCircle, 
//   FaExclamationTriangle, FaChevronDown, FaTrash,
//   FaBriefcase, FaEnvelope, FaChartBar
// } from "react-icons/fa";
// import { toast } from "react-hot-toast";

// interface UserDetailPanelProps {
//   userId: string;
//   onClose: () => void;
// }

// // Status dropdown for inline task update
// const STATUS_OPTIONS = ["To Do", "In Progress", "Review", "Completed"];

// const InlineTaskRow = ({ 
//   task, 
//   canUpdate, 
//   canDelete,
// //   roomId
// }: { 
//   task: any; 
//   canUpdate: boolean; 
//   canDelete: boolean;
//   roomId: string | null;
// }) => {
//   const updateMutation = useUpdateTask();
//   const deleteMutation = useDeleteTask();
//   const [statusOpen, setStatusOpen] = useState(false);

//   const now = new Date();
//   const isOverdue = new Date(task.dueDate) < now && task.status !== 'Completed';
//   // DELETE_ANY_TASK rule: cannot delete after deadline
//   const isPastDeadline = new Date(task.dueDate) < now;
//   const canDeleteThis = canDelete && !isPastDeadline;

//   const handleStatusChange = (newStatus: string) => {
//     setStatusOpen(false);
//     toast.promise(
//       updateMutation.mutateAsync({ id: task._id, updates: { status: newStatus } }),
//       {
//         loading: 'Updating...',
//         success: `Marked as ${newStatus}`,
//         error: 'Failed to update'
//       }
//     );
//   };

//   const handleDelete = () => {
//     if (!window.confirm(`Delete "${task.title}"?`)) return;
//     toast.promise(
//       deleteMutation.mutateAsync(task._id),
//       {
//         loading: 'Deleting...',
//         success: 'Task deleted',
//         error: 'Failed to delete'
//       }
//     );
//   };

//   const getPriorityColor = (p: string) => {
//     switch (p) {
//       case 'Urgent': return 'bg-red-100 text-red-700';
//       case 'High':   return 'bg-orange-100 text-orange-700';
//       case 'Medium': return 'bg-yellow-100 text-yellow-700';
//       case 'Low':    return 'bg-emerald-100 text-emerald-700';
//       default:       return 'bg-gray-100 text-gray-600';
//     }
//   };

//   const getStatusColor = (s: string) => {
//     switch (s) {
//       case 'Completed':   return 'text-emerald-600 bg-emerald-50 border-emerald-200';
//       case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
//       case 'Review':      return 'text-orange-600 bg-orange-50 border-orange-200';
//       default:            return 'text-gray-600 bg-gray-50 border-gray-200';
//     }
//   };

//   return (
//     <div className={`p-3 rounded-lg border mb-2 transition-all
//       ${task.status === 'Completed' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-white border-gray-200'}
//       ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
//     >
//       {/* Row 1: Title + Priority */}
//       <div className="flex items-start justify-between gap-2 mb-2">
//         <p className={`font-semibold text-sm text-gray-800 flex-1 capitalize
//           ${task.status === 'Completed' ? 'line-through text-gray-400' : ''}`}>
//           {task.title}
//         </p>
//         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getPriorityColor(task.priority)}`}>
//           {task.priority}
//         </span>
//       </div>

//       {/* Row 2: Meta info */}
//       <div className="flex items-center gap-3 text-xs text-gray-500 mb-2 flex-wrap">
//         {/* Due date */}
//         <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
//           <FaClock className="text-[10px]" />
//           {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
//           {isOverdue && ' (Overdue)'}
//         </span>

//         {/* Who created / who it's assigned to */}
//         {task.createdBy?.name && (
//           <span className="flex items-center gap-1">
//             <FaUser className="text-[10px] text-blue-400" />
//             By: <b className="text-gray-700">{task.createdBy.name}</b>
//           </span>
//         )}
//         {task.assignedTo?.name && (
//           <span className="flex items-center gap-1">
//             <FaUser className="text-[10px] text-purple-400" />
//             To: <b className="text-gray-700">{task.assignedTo.name}</b>
//           </span>
//         )}
//       </div>

//       {/* Row 3: Status + Actions */}
//       <div className="flex items-center justify-between">
//         {/* Status — dropdown if canUpdate, badge if not */}
//         {canUpdate ? (
//           <div className="relative">
//             <button
//               onClick={() => setStatusOpen(!statusOpen)}
//               className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer
//                 ${getStatusColor(task.status)}`}
//             >
//               {task.status}
//               <FaChevronDown className={`text-[9px] transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
//             </button>
//             {statusOpen && (
//               <>
//                 <div className="fixed inset-0 z-30" onClick={() => setStatusOpen(false)} />
//                 <div className="absolute left-0 top-full mt-1 z-40 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden w-36">
//                   {STATUS_OPTIONS.map(opt => (
//                     <div
//                       key={opt}
//                       onClick={() => handleStatusChange(opt)}
//                       className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 text-gray-700
//                         ${task.status === opt ? 'bg-blue-50 font-bold text-blue-600' : ''}`}
//                     >
//                       {opt}
//                     </div>
//                   ))}
//                 </div>
//               </>
//             )}
//           </div>
//         ) : (
//           <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
//             {task.status}
//           </span>
//         )}

//         {/* Delete button */}
//         {canDelete && (
//           <button
//             onClick={handleDelete}
//             disabled={!canDeleteThis || deleteMutation.isPending}
//             title={isPastDeadline ? "Cannot delete tasks past their deadline" : "Delete task"}
//             className={`p-1.5 rounded-full transition-colors text-xs
//               ${canDeleteThis 
//                 ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer' 
//                 : 'text-gray-200 cursor-not-allowed'}`}
//           >
//             <FaTrash />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// // --- MAIN PANEL ---
// const UserDetailPanel = ({ userId, onClose }: UserDetailPanelProps) => {
//   const { isAdmin, hasPermission, roomId } = useAuth();
//   const { data, isLoading, isError } = useUserStats(userId);

//   const canUpdate = isAdmin || hasPermission('UPDATE_ANY_TASK');
//   const canDelete = isAdmin || hasPermission('DELETE_ANY_TASK');

//   // Tab state — assigned tasks vs created tasks
//   const [activeTab, setActiveTab] = useState<'assigned' | 'created'>('assigned');

//   const getPerformanceColor = (pct: number) => {
//     if (pct >= 70) return 'text-emerald-600';
//     if (pct >= 40) return 'text-orange-500';
//     return 'text-red-600';
//   };

//   const getPerformanceBg = (pct: number) => {
//     if (pct >= 70) return 'bg-emerald-500';
//     if (pct >= 40) return 'bg-orange-400';
//     return 'bg-red-500';
//   };

//   return (
//     <>
//       {/* Backdrop */}
//       <div 
//         className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
//         onClick={onClose}
//       />

//       {/* Slide-in panel from right */}
//       <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
//         {/* --- HEADER --- */}
//         <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 shrink-0">
//           <div>
//             <h2 className="text-lg font-bold text-gray-800">Member Details</h2>
//             <p className="text-xs text-gray-400">Viewing performance and task history</p>
//           </div>
//           <button 
//             onClick={onClose}
//             className="p-2 hover:bg-gray-200 rounded-full transition-colors"
//           >
//             <FaTimes className="text-gray-500" />
//           </button>
//         </div>

//         {/* --- SCROLLABLE BODY --- */}
//         <div className="flex-1 overflow-y-auto px-6 py-5">

//           {isLoading && (
//             <div className="space-y-4 animate-pulse">
//               <div className="flex items-center gap-4">
//                 <div className="w-16 h-16 rounded-full bg-gray-200" />
//                 <div className="space-y-2">
//                   <div className="h-5 w-40 bg-gray-200 rounded" />
//                   <div className="h-3 w-32 bg-gray-100 rounded" />
//                 </div>
//               </div>
//               <div className="h-24 bg-gray-100 rounded-xl" />
//               <div className="h-48 bg-gray-100 rounded-xl" />
//             </div>
//           )}

//           {isError && (
//             <div className="text-center py-20 text-red-500">
//               <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
//               <p className="font-semibold">Failed to load user details</p>
//               <p className="text-sm text-gray-400 mt-1">You may not have permission to view this</p>
//             </div>
//           )}

//           {data && (
//             <>
//               {/* --- USER IDENTITY --- */}
//               <div className="flex items-center gap-4 mb-6">
//                 <img
//                   src={`https://ui-avatars.com/api/?name=${data.user.name}&background=random&color=fff&bold=true&size=128`}
//                   alt={data.user.name}
//                   className="w-16 h-16 rounded-full shadow-md"
//                 />
//                 <div>
//                   <h3 className="text-xl font-bold text-gray-900">{data.user.name}</h3>
//                   <div className="flex items-center gap-2 mt-1 flex-wrap">
//                     {data.user.jobRole && data.user.jobRole !== 'N/A' && (
//                       <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
//                         <FaBriefcase className="text-[9px]" />
//                         {data.user.jobRole}
//                       </span>
//                     )}
//                     {data.user.designation && data.user.designation !== 'Employee' && (
//                       <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
//                         {data.user.designation}
//                       </span>
//                     )}
//                     <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//                       {data.user.role}
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
//                     <FaEnvelope className="text-[9px]" />
//                     {data.user.email}
//                   </div>
//                 </div>
//               </div>

//               {/* --- PERFORMANCE STATS --- */}
//               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-5">
//                 <div className="flex items-center gap-2 mb-3">
//                   <FaChartBar className="text-blue-500 text-sm" />
//                   <h4 className="font-bold text-gray-700">Performance Overview</h4>
//                 </div>

//                 {/* Performance bar */}
//                 <div className="mb-4">
//                   <div className="flex justify-between items-center mb-1">
//                     <span className="text-xs text-gray-500">On-time completion rate</span>
//                     <span className={`text-lg font-black ${getPerformanceColor(data.stats.performancePercent)}`}>
//                       {data.stats.performancePercent}%
//                     </span>
//                   </div>
//                   <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
//                     <div 
//                       className={`h-full rounded-full transition-all duration-700 ${getPerformanceBg(data.stats.performancePercent)}`}
//                       style={{ width: `${data.stats.performancePercent}%` }}
//                     />
//                   </div>
//                 </div>

//                 {/* Stat grid */}
//                 <div className="grid grid-cols-2 gap-3">
//                   <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
//                     <div className="text-2xl font-black text-indigo-600">{data.stats.totalAssigned}</div>
//                     <div className="text-xs text-gray-400 mt-0.5">Tasks Assigned</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
//                     <div className="text-2xl font-black text-green-600">{data.stats.totalCreated}</div>
//                     <div className="text-xs text-gray-400 mt-0.5">Tasks Created</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
//                     <div className="text-2xl font-black text-red-500">{data.stats.deadlinesMissed}</div>
//                     <div className="text-xs text-gray-400 mt-0.5">Deadlines Missed</div>
//                   </div>
//                   <div className="bg-white rounded-lg p-3 border border-gray-100 text-center">
//                     <div className="text-2xl font-black text-blue-500">{data.stats.inProgress}</div>
//                     <div className="text-xs text-gray-400 mt-0.5">In Progress</div>
//                   </div>
//                 </div>
//               </div>

//               {/* --- TASK LISTS --- */}
//               <div>
//                 {/* Tab switcher */}
//                 <div className="flex gap-1 bg-gray-100 p-1 rounded-lg mb-4">
//                   <button
//                     onClick={() => setActiveTab('assigned')}
//                     className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all
//                       ${activeTab === 'assigned' 
//                         ? 'bg-white text-blue-700 shadow-sm' 
//                         : 'text-gray-500 hover:text-gray-700'}`}
//                   >
//                     Assigned ({data.assignedTasks.length})
//                   </button>
//                   <button
//                     onClick={() => setActiveTab('created')}
//                     className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all
//                       ${activeTab === 'created' 
//                         ? 'bg-white text-blue-700 shadow-sm' 
//                         : 'text-gray-500 hover:text-gray-700'}`}
//                   >
//                     Created ({data.createdTasks.length})
//                   </button>
//                 </div>

//                 {/* Permission banner — only show if user has relevant permissions */}
//                 {(canUpdate || canDelete) && (
//                   <div className="flex flex-wrap gap-2 mb-3">
//                     {canUpdate && (
//                       <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold border border-blue-200">
//                         ✓ Can update task status
//                       </span>
//                     )}
//                     {canDelete && (
//                       <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold border border-red-200">
//                         ✓ Can delete tasks (before deadline)
//                       </span>
//                     )}
//                   </div>
//                 )}

//                 {/* Task list */}
//                 <div>
//                   {activeTab === 'assigned' && (
//                     <>
//                       {data.assignedTasks.length === 0 ? (
//                         <div className="text-center py-8 text-gray-400 text-sm">
//                           No tasks assigned to this member yet.
//                         </div>
//                       ) : (
//                         data.assignedTasks.map((task: any) => (
//                           <InlineTaskRow
//                             key={task._id}
//                             task={task}
//                             canUpdate={canUpdate}
//                             canDelete={canDelete}
//                             roomId={roomId}
//                           />
//                         ))
//                       )}
//                     </>
//                   )}

//                   {activeTab === 'created' && (
//                     <>
//                       {data.createdTasks.length === 0 ? (
//                         <div className="text-center py-8 text-gray-400 text-sm">
//                           This member hasn't created any tasks yet.
//                         </div>
//                       ) : (
//                         data.createdTasks.map((task: any) => (
//                           <InlineTaskRow
//                             key={task._id}
//                             task={task}
//                             canUpdate={canUpdate}
//                             canDelete={canDelete}
//                             roomId={roomId}
//                           />
//                         ))
//                       )}
//                     </>
//                   )}
//                 </div>
//               </div>
//             </>
//           )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default UserDetailPanel;


//NEW UI

import { useAuth } from "../context/AuthContext";
import { useUserStats } from "../hooks/useData";
import { useUpdateTask, useDeleteTask } from "../hooks/useData";
import { useState } from "react";
import { 
  FaTimes, FaClock, FaUser, 
//   FaCheckCircle, 
  FaExclamationTriangle, FaChevronDown, FaTrash,
  FaBriefcase, FaEnvelope, FaChartBar
} from "react-icons/fa";
import { toast } from "react-hot-toast";

interface UserDetailPanelProps {
  userId: string;
  onClose: () => void;
}

// Status dropdown for inline task update
const STATUS_OPTIONS = ["To Do", "In Progress", "Review", "Completed"];

const InlineTaskRow = ({ 
  task, 
  canUpdate, 
  canDelete,
//   roomId
}: { 
  task: any; 
  canUpdate: boolean; 
  canDelete: boolean;
  roomId: string | null;
}) => {
  const updateMutation = useUpdateTask();
  const deleteMutation = useDeleteTask();
  const [statusOpen, setStatusOpen] = useState(false);

  const now = new Date();
  const isOverdue = new Date(task.dueDate) < now && task.status !== 'Completed';
  // DELETE_ANY_TASK rule: cannot delete after deadline
  const isPastDeadline = new Date(task.dueDate) < now;
  const canDeleteThis = canDelete && !isPastDeadline;

  const handleStatusChange = (newStatus: string) => {
    setStatusOpen(false);
    toast.promise(
      updateMutation.mutateAsync({ id: task._id, updates: { status: newStatus } }),
      {
        loading: 'Updating...',
        success: `Marked as ${newStatus}`,
        error: 'Failed to update'
      }
    );
  };

  const handleDelete = () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    toast.promise(
      deleteMutation.mutateAsync(task._id),
      {
        loading: 'Deleting...',
        success: 'Task deleted',
        error: 'Failed to delete'
      }
    );
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'Urgent': return 'bg-red-100 text-red-700';
      case 'High':   return 'bg-orange-100 text-orange-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Low':    return 'bg-emerald-100 text-emerald-700';
      default:       return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Completed':   return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'In Progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Review':      return 'text-orange-600 bg-orange-50 border-orange-200';
      default:            return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className={`p-3 rounded-xl border mb-2 transition-all
      ${task.status === 'Completed' ? 'bg-slate-50 border-slate-100 opacity-70' : 'bg-white border-slate-200'}
      ${isOverdue ? 'border-l-4 border-l-red-400' : ''}`}
    >
      {/* Row 1: Title + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className={`font-semibold text-sm text-slate-800 flex-1 capitalize
          ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </p>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
      </div>

      {/* Row 2: Meta info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 mb-2 flex-wrap">
        {/* Due date */}
        <span className={`flex items-center gap-1 ${isOverdue ? 'text-red-500 font-bold' : ''}`}>
          <FaClock className="text-[10px]" />
          {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          {isOverdue && ' (Overdue)'}
        </span>

        {/* Who created / who it's assigned to */}
        {task.createdBy?.name && (
          <span className="flex items-center gap-1">
            <FaUser className="text-[10px] text-blue-400" />
            By: <b className="text-slate-700">{task.createdBy.name}</b>
          </span>
        )}
        {task.assignedTo?.name && (
          <span className="flex items-center gap-1">
            <FaUser className="text-[10px] text-purple-400" />
            To: <b className="text-slate-700">{task.assignedTo.name}</b>
          </span>
        )}
      </div>

      {/* Row 3: Status + Actions */}
      <div className="flex items-center justify-between">
        {/* Status — dropdown if canUpdate, badge if not */}
        {canUpdate ? (
          <div className="relative">
            <button
              onClick={() => setStatusOpen(!statusOpen)}
              className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer
                ${getStatusColor(task.status)}`}
            >
              {task.status}
              <FaChevronDown className={`text-[9px] transition-transform ${statusOpen ? 'rotate-180' : ''}`} />
            </button>
            {statusOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setStatusOpen(false)} />
                <div className="absolute left-0 top-full mt-1 z-40 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-36">
                  {STATUS_OPTIONS.map(opt => (
                    <div
                      key={opt}
                      onClick={() => handleStatusChange(opt)}
                      className={`px-3 py-2 text-xs cursor-pointer hover:bg-blue-50 text-slate-700
                        ${task.status === opt ? 'bg-blue-50 font-bold text-blue-600' : ''}`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        )}

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={!canDeleteThis || deleteMutation.isPending}
            title={isPastDeadline ? "Cannot delete tasks past their deadline" : "Delete task"}
            className={`p-1.5 rounded-full transition-colors text-xs
              ${canDeleteThis 
                ? 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer' 
                : 'text-slate-200 cursor-not-allowed'}`}
          >
            <FaTrash />
          </button>
        )}
      </div>
    </div>
  );
};

// --- MAIN PANEL ---
const UserDetailPanel = ({ userId, onClose }: UserDetailPanelProps) => {
  const { isAdmin, hasPermission, roomId } = useAuth();
  const { data, isLoading, isError } = useUserStats(userId);

  const canUpdate = isAdmin || hasPermission('UPDATE_ANY_TASK');
  const canDelete = isAdmin || hasPermission('DELETE_ANY_TASK');

  // Tab state — assigned tasks vs created tasks
  const [activeTab, setActiveTab] = useState<'assigned' | 'created'>('assigned');

  const getPerformanceColor = (pct: number) => {
    if (pct >= 70) return 'text-emerald-600';
    if (pct >= 40) return 'text-orange-500';
    return 'text-red-600';
  };

  const getPerformanceBg = (pct: number) => {
    if (pct >= 70) return 'bg-emerald-500';
    if (pct >= 40) return 'bg-orange-400';
    return 'bg-red-500';
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Slide-in panel from right */}
      <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Member Details</h2>
            <p className="text-xs text-slate-400">Viewing performance and task history</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors"
          >
            <FaTimes className="text-slate-500" />
          </button>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {isLoading && (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-200" />
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-200 rounded" />
                  <div className="h-3 w-32 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="h-24 bg-slate-100 rounded-xl" />
              <div className="h-48 bg-slate-100 rounded-xl" />
            </div>
          )}

          {isError && (
            <div className="text-center py-20 text-red-500">
              <FaExclamationTriangle className="mx-auto text-3xl mb-2" />
              <p className="font-semibold">Failed to load user details</p>
              <p className="text-sm text-slate-400 mt-1">You may not have permission to view this</p>
            </div>
          )}

          {data && (
            <>
              {/* --- USER IDENTITY --- */}
              <div className="flex items-center gap-4 mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${data.user.name}&background=random&color=fff&bold=true&size=128`}
                  alt={data.user.name}
                  className="w-16 h-16 rounded-full shadow-md"
                />
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{data.user.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {data.user.jobRole && data.user.jobRole !== 'N/A' && (
                      <span className="flex items-center gap-1 text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        <FaBriefcase className="text-[9px]" />
                        {data.user.jobRole}
                      </span>
                    )}
                    {data.user.designation && data.user.designation !== 'Employee' && (
                      <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                        {data.user.designation}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {data.user.role}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
                    <FaEnvelope className="text-[9px]" />
                    {data.user.email}
                  </div>
                </div>
              </div>

              {/* --- PERFORMANCE STATS --- */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <FaChartBar className="text-blue-500 text-sm" />
                  <h4 className="font-bold text-slate-700">Performance Overview</h4>
                </div>

                {/* Performance bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-slate-500">On-time completion rate</span>
                    <span className={`text-lg font-black ${getPerformanceColor(data.stats.performancePercent)}`}>
                      {data.stats.performancePercent}%
                    </span>
                  </div>
                  <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${getPerformanceBg(data.stats.performancePercent)}`}
                      style={{ width: `${data.stats.performancePercent}%` }}
                    />
                  </div>
                </div>

                {/* Stat grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <div className="text-2xl font-black text-indigo-600">{data.stats.totalAssigned}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Tasks Assigned</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <div className="text-2xl font-black text-green-600">{data.stats.totalCreated}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Tasks Created</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <div className="text-2xl font-black text-red-500">{data.stats.deadlinesMissed}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Deadlines Missed</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-slate-100 text-center">
                    <div className="text-2xl font-black text-blue-500">{data.stats.inProgress}</div>
                    <div className="text-xs text-slate-400 mt-0.5">In Progress</div>
                  </div>
                </div>
              </div>

              {/* --- TASK LISTS --- */}
              <div>
                {/* Tab switcher */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-4">
                  <button
                    onClick={() => setActiveTab('assigned')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all
                      ${activeTab === 'assigned' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Assigned ({data.assignedTasks.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('created')}
                    className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all
                      ${activeTab === 'created' 
                        ? 'bg-white text-blue-700 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Created ({data.createdTasks.length})
                  </button>
                </div>

                {/* Permission banner — only show if user has relevant permissions */}
                {(canUpdate || canDelete) && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {canUpdate && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-bold border border-blue-200">
                        ✓ Can update task status
                      </span>
                    )}
                    {canDelete && (
                      <span className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded-full font-bold border border-red-200">
                        ✓ Can delete tasks (before deadline)
                      </span>
                    )}
                  </div>
                )}

                {/* Task list */}
                <div>
                  {activeTab === 'assigned' && (
                    <>
                      {data.assignedTasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                          No tasks assigned to this member yet.
                        </div>
                      ) : (
                        data.assignedTasks.map((task: any) => (
                          <InlineTaskRow
                            key={task._id}
                            task={task}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            roomId={roomId}
                          />
                        ))
                      )}
                    </>
                  )}

                  {activeTab === 'created' && (
                    <>
                      {data.createdTasks.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                          This member hasn't created any tasks yet.
                        </div>
                      ) : (
                        data.createdTasks.map((task: any) => (
                          <InlineTaskRow
                            key={task._id}
                            task={task}
                            canUpdate={canUpdate}
                            canDelete={canDelete}
                            roomId={roomId}
                          />
                        ))
                      )}
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default UserDetailPanel;