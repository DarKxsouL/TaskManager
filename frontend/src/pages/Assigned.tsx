import { useState, useMemo } from "react";
import { useAssignedTasks } from "../hooks/useData"; 
import { useAuth } from "../context/AuthContext";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css"; 
import { useSearch } from "../context/SearchContext";
import TaskCard from "../components/TaskCard"; 

function Assigned() {
  const { user } = useAuth();
  const { searchQuery } = useSearch();

  const username = user?.name || "";
  
  const { data: assigntasks = [], isLoading, isError } = useAssignedTasks(username);

  // Default sort to Ascending (Earliest due date first)
  const [sortBy, setSortBy] = useState<string>('date_asc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  // -- FILTERING & SORTING PIPELINE --
  const processedTasks = useMemo(() => {
    let tasks = [...assigntasks]; 

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
  }, [assigntasks, filterStatus, filterPriority, sortBy, searchQuery]);

  const toggleStatus = (status: string) => {
    setFilterStatus(prev => prev === status ? null : status); 
  };

  const togglePriority = (priority: string) => {
    setFilterPriority(prev => prev === priority ? null : priority);
  };

  // -- HELPER FUNCTIONS (For filters badges) --
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
    return `${baseClasses} transition-all duration-300 ease-in-out ${isActive ? 'ring-1 ring-gray-400 font-bold' : 'opacity-70 hover:opacity-100'}`;
  }

  // -- SKELETON LOADER --
  if (isLoading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="grid grid-cols-3 gap-10 mb-10">
           {[1, 2, 3].map((i) => (
             <div key={i} className="flex flex-col gap-2">
               <Skeleton width={60} height={15} />
               <Skeleton height={40} borderRadius={8} />
             </div>
           ))}
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-200 rounded-xl p-6 mb-5 flex justify-between h-32">
             <div className="space-y-4 w-1/2">
                <Skeleton width={80} height={25} borderRadius={20} />
                <Skeleton width="90%" height={25} />
             </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500 font-bold">Failed to load tasks. Please try again later.</div>;
  }

  // -- MAIN UI --
  return (
    <>
      <div className='mx-20 h-screen'>
        
        {/* FILTERS SECTION */}
        <div className="grid grid-cols-3 py-2">
            <div>
                <div className="py-2 font-semibold text-gray-600">Sort by</div>
                <select 
                  className="w-60 px-2 py-1 rounded-lg border bg-white/70 outline-none focus:ring-2 focus:ring-blue-200"
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
                <div className="py-2 font-semibold text-gray-600">Status</div>
                <div className="flex gap-2">
                  {['To Do', 'Completed', 'Review', 'In Progress'].map(status => (
                    <button 
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={getFilterButtonStyle(filterStatus === status, `rounded-lg min-w-20 text-center border px-2 py-1 ${getStatusBadgeClass(status)}`)}
                    >
                      {status}
                    </button>
                  ))}
              </div>
            </div>
            <div>
                <div className="py-2 font-semibold text-gray-600">Priority</div>
                <div className="flex gap-2">
              {['Urgent', 'High', 'Medium', 'Low'].map(priority => (
                <button 
                  key={priority}
                  onClick={() => togglePriority(priority)}
                  className={getFilterButtonStyle(filterPriority === priority, `rounded-lg min-w-24 text-center border px-2 py-1 ${getPriorityBadgeClass(priority)}`)}
                >
                  {priority}
                </button>
              ))}
            </div>
            </div>
        </div>

        {/* TASKS LIST SECTION */}
        <div className="border-t-1 border-gray-400 mt-4 py-4 overflow-scroll h-2/3">
          {processedTasks.length === 0 ? (
            <div className="text-center mt-20 text-gray-500 text-xl font-bold">None Assigned tasks match your filters.</div>
          ) : (
            // Grid Layout for Cards
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

export default Assigned;