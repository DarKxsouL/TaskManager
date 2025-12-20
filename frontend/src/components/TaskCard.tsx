import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useUpdateTask, useDeleteTask } from "../hooks/useData";
import { FaTrash, FaClock, FaUser, FaCheckCircle, FaChevronDown } from "react-icons/fa"; 
import { toast } from "react-hot-toast"; // 1. Import Toast

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
  const { user } = useAuth();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  // --- CUSTOM DROPDOWN STATE ---
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

  // --- STYLES ---
  const getPriorityColor = (p: string) => {
    switch (p) {
      case "Urgent": return "bg-red-100 text-red-700 border-red-200";
      case "High": return "bg-orange-100 text-orange-700 border-orange-200";
      case "Medium": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Low": return "bg-emerald-100 text-emerald-700 border-emerald-200";
      default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
  };

  const getStatusColor = (s: string) => {
    if (s === "Completed") return "text-emerald-600 font-bold";
    return "text-stone-500 font-medium";
  };

  // --- HANDLERS WITH TOASTS ---
  
  const handleStatusChange = (newStatus: string) => {
    setIsStatusOpen(false); // Close dropdown immediately

    // 2. Use toast.promise for visual feedback
    toast.promise(
        updateTaskMutation.mutateAsync({ id: task._id, updates: { status: newStatus } }),
        {
            loading: 'Updating status...',
            success: `Marked as ${newStatus}`,
            error: 'Failed to update status',
        }
    );
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this task?")) {
        // 3. Use toast.promise for delete
        toast.promise(
            deleteTaskMutation.mutateAsync(task._id),
            {
                loading: 'Deleting task...',
                success: 'Task deleted',
                error: 'Could not delete task',
            }
        );
    }
  };

  // Safe checks for object access
  const creatorId = task.createdBy?._id; 
  const currentUserId = user?._id;
  const isCreator = creatorId === currentUserId;

  const assignedName = task.assignedTo?.name || "Unassigned";
  const createdName = task.createdBy?.name || "Unknown";

  const formattedDate = new Date(task.dueDate).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric'
  });

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  // Status Options
  const statusOptions = ["To Do", "In Progress", "Review", "Completed"];

  return (
    <div className="relative group bg-[#FFFBEB] border border-stone-200 p-5 rounded-xl hover:shadow-lg hover:border-stone-300 transition-all duration-300 hover:-translate-y-1">
      
      {/* HEADER: Priority & Status */}
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-1 rounded text-xs font-bold border ${getPriorityColor(task.priority)}`}>
            {task.priority}
        </span>
        
        {/* --- CUSTOM DROPDOWN --- */}
        <div className="relative" ref={dropdownRef}>
            <button 
                onClick={() => setIsStatusOpen(!isStatusOpen)}
                className={`flex items-center gap-1 text-sm cursor-pointer hover:bg-stone-100 px-2 py-1 rounded-md transition-colors ${getStatusColor(task.status)}`}
            >
                {task.status}
                <FaChevronDown className={`text-xs transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isStatusOpen && (
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-stone-200 rounded-lg shadow-xl z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                    <ul className="py-1">
                        {statusOptions.map((option) => (
                            <li 
                                key={option}
                                onClick={() => handleStatusChange(option)}
                                className={`px-4 py-2 text-sm cursor-pointer hover:bg-amber-50 text-stone-600 hover:text-stone-900 transition-colors
                                    ${task.status === option ? 'bg-amber-50 font-semibold text-amber-700' : ''}`}
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
      <h3 className={`text-xl font-bold text-stone-800 mb-1 capitalize ${task.status === 'Completed' ? 'line-through text-stone-400' : ''}`}>
        {task.title}
      </h3>
      
      {/* DETAILS */}
      <div className="text-sm text-stone-500 mt-4 space-y-2">
         {/* Due Date */}
         <div className="flex items-center gap-2">
            <FaClock className={isOverdue ? "text-red-500" : "text-stone-400"} />
            <span className={isOverdue ? "text-red-600 font-bold" : "text-stone-600"}>
                {formattedDate} {isOverdue ? "(Overdue)" : ""}
            </span>
         </div>

         {/* Assigned To */}
         <div className="flex items-center gap-2">
            <FaUser className="text-blue-400" />
            <span>Assigned to: <b className="text-stone-700">{assignedName}</b></span>
         </div>
         
         {/* Created By */}
         <div className="flex items-center gap-2 text-xs text-stone-400 mt-2 pt-2 border-t border-stone-200">
            <span>By: {createdName}</span>
         </div>
      </div>

      {/* DELETE BUTTON (Only visible if YOU created it) */}
      {isCreator && (
        <button 
            onClick={handleDelete}
            className="absolute bottom-4 right-4 p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
            title="Delete Task"
        >
            <FaTrash />
        </button>
      )}

      {/* COMPLETED INDICATOR */}
      {task.status === 'Completed' && (
          <div className="absolute top-4 right-4 text-emerald-500 opacity-20 pointer-events-none">
              <FaCheckCircle size={40} />
          </div>
      )}
    </div>
  );
};

export default TaskCard;