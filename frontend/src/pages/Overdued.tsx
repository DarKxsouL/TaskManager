import { useState, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import { useAssignedTasks, useCreatedTasks } from "../hooks/useData";
import TaskCard from "../components/TaskCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

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
      default: return "border-gray-300 bg-gray-100";
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "To Do": return "border-gray-300 bg-gray-200 text-gray-700";
      case "Completed": return "border-green-300 bg-green-100 text-green-700";
      case "Review": return "border-orange-300 bg-orange-100 text-orange-700";
      case "In Progress": return "border-blue-300 bg-blue-100 text-blue-700";
      default: return "border-gray-300 bg-gray-100";
    }
  };

  const getFilterButtonStyle = (isActive: boolean, baseClasses: string) => {
    return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-2 ring-gray-500 font-bold opacity-100' : 'opacity-60 hover:opacity-100'}`;
  }

  // -- LOADING STATE --
  if (loadingAssigned || loadingCreated) {
    return (
      <div className="mx-20 mt-10 grid grid-cols-3 gap-6">
         {[1, 2, 3].map(i => <Skeleton key={i} height={200} borderRadius={12} />)}
      </div>
    );
  }

  return (
    <>
      <div className="mx-20 h-screen">
        {/* FILTERS HEADER */}
        <div className="grid grid-cols-3 py-4 gap-4">
            
            {/* 1. View Selector (Source) */}
            <div>
                <div className="py-2 font-semibold text-gray-600">View Tasks</div>
                <select 
                  className="w-full max-w-[240px] px-3 py-2 rounded-lg border border-gray-300 outline-none bg-white/80 font-medium cursor-pointer"
                  value={viewType}
                  onChange={(e) => setViewType(e.target.value)}
                >
                    <option value="assigned_overdue">Assigned to Me (Overdue)</option>
                    <option value="created_overdue">Created by Me (Overdue)</option>
                </select>
            </div>

            {/* 2. Status Filter */}
            <div>
                <div className="py-2 font-semibold text-gray-600">Status</div>
                <div className="flex flex-wrap gap-2">
                  {['To Do', 'In Progress', 'Review'].map(status => (
                    <button 
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={getFilterButtonStyle(filterStatus === status, `rounded-lg min-w-[80px] text-center border px-2 py-1 text-sm ${getStatusBadgeClass(status)}`)}
                    >
                      {status}
                    </button>
                  ))}
                  {/* Note: 'Completed' is excluded from buttons because Completed tasks are usually not considered 'Overdue' in the same way, but you can add it back if needed */}
              </div>
            </div>

            {/* 3. Priority Filter */}
            <div>
                <div className="py-2 font-semibold text-gray-600">Priority</div>
                <div className="flex flex-wrap gap-2">
              {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
                <button 
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={getFilterButtonStyle(filterPriority === priority, `rounded-lg min-w-[80px] text-center border px-2 py-1 text-sm ${getPriorityBadgeClass(priority)}`)}
                >
                  {priority}
                </button>
              ))}
            </div>
            </div>
        </div>

        {/* RESULTS SECTION */}
        <div className="border-t border-gray-300 mt-2 py-6 overflow-y-auto h-[calc(100vh-200px)]">
            {processedTasks.length === 0 ? (
                <div className="text-center mt-20 text-gray-500">
                    <h3 className="text-xl font-bold">No Overdue Tasks Found</h3>
                    <p>Good job! You are up to date.</p>
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
    </>
  )
}

export default Overdued;