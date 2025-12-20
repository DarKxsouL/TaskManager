import { useHistory } from "../hooks/useData"; // Import the hook
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearch } from "../context/SearchContext";
import { useMemo } from "react";

interface Task {
  id: string | number;
  title?: string;
  description?: string;
  assignedBy?: string;
  date?: string;
  time?: string;
}

function History() {
  const { searchQuery } = useSearch();
  const { data: history = [], isLoading, isError } = useHistory();

  const filteredHistory = useMemo(() => {
     if (!searchQuery) return history;
     return history.filter((task: Task) => 
        (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
     );
  }, [history, searchQuery]);

  // -- SKELETON LOADER --
  if (isLoading) {
    return (
      <div className="mx-20 pt-25 p-5 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300">
        {/* Title Skeleton */}
        <Skeleton width={200} height={32} />
        
        <div className="mt-5 space-y-4 pr-2">
          {filteredHistory.length === 0 ? (
             <div className="text-gray-500 text-center mt-10">
                {searchQuery ? "No matching history found." : "No history available."}
             </div>
          ) : (
            filteredHistory.map((task: Task) => (
            <div key={task.id} className="border p-4 rounded-md bg-gray-50 border-gray-200">
              {/* Header: Title + Badge */}
              <div className="flex items-center justify-between mb-3">
                <Skeleton width={250} height={24} />
                <div className="flex items-center gap-2">
                  <Skeleton width={80} /> {/* "Assigned By" text */}
                  <Skeleton width={100} height={30} borderRadius={20} /> {/* Badge */}
                </div>
              </div>
              
              {/* Description */}
              <div className="mb-3">
                <Skeleton count={2} />
              </div>
              
              {/* Footer: Date */}
              <Skeleton width={180} height={16} />
            </div>
          ))
          )}
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500 font-bold">Failed to load history. Please try again later.</div>;
  }

  // -- MAIN UI --
  return (
    <>
      <div className="mx-20 pt-25 p-5 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 text-black">
        <h1 className="text-2xl font-bold">Completed Tasks</h1>
        <div className="mt-5 space-y-4 overflow-y-auto h-[85vh] pr-2">
          {filteredHistory.length === 0 ? (
             <div className="text-gray-500 text-center mt-10">No history available.</div>
          ) : (
            filteredHistory.map((task: Task) => (
              <div key={task.id} className="border p-4 rounded-md bg-green-50">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{task.title}</h2>
                  <span>Assigned By: <span className="px-4 py-1 border bg-black/60 text-white/80 font-bold rounded-full text-center">{task.assignedBy}</span> </span>
                </div>
                <p className="text-gray-700">{task.description}</p>
                <span className="text-sm text-gray-500">Completed on: {task.date} {task.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

export default History;