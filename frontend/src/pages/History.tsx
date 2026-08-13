// import { useHistory } from "../hooks/useData"; // Import the hook
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSearch } from "../context/SearchContext";
// import { useMemo } from "react";

// interface Task {
//   _id: string | number;
//   title?: string;
//   description?: string;
//   createdBy?: string;
//   date?: string;
//   time?: string;
// }

// function History() {
//   const { searchQuery } = useSearch();
//   const { data: history = [], isLoading, isError } = useHistory();

//   const filteredHistory = useMemo(() => {
//      if (!searchQuery) return history;
//      return history.filter((task: Task) => 
//         (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
//         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
//      );
//   }, [history, searchQuery]);

//   // -- SKELETON LOADER --
//   if (isLoading) {
//     return (
//       <div className="mx-20 pt-25 p-5 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300">
//         {/* Title Skeleton */}
//         <Skeleton width={200} height={32} />
        
//         <div className="mt-5 space-y-4 pr-2">
//           {filteredHistory.length === 0 ? (
//              <div className="text-gray-500 text-center mt-10">
//                 {searchQuery ? "No matching history found." : "No history available."}
//              </div>
//           ) : (
//             filteredHistory.map((task: Task) => (
//             <div key={task._id} className="border p-4 rounded-md bg-gray-50 border-gray-200">
//               {/* Header: Title + Badge */}
//               <div className="flex items-center justify-between mb-3">
//                 <Skeleton width={250} height={24} />
//                 <div className="flex items-center gap-2">
//                   <Skeleton width={80} /> {/* "Assigned By" text */}
//                   <Skeleton width={100} height={30} borderRadius={20} /> {/* Badge */}
//                 </div>
//               </div>
              
//               {/* Description */}
//               <div className="mb-3">
//                 <Skeleton count={2} />
//               </div>
              
//               {/* Footer: Date */}
//               <Skeleton width={180} height={16} />
//             </div>
//           ))
//           )}
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return <div className="p-10 text-center text-red-500 font-bold">Failed to load history. Please try again later.</div>;
//   }

//   // -- MAIN UI --
//   return (
//     <>
//       <div className="mx-20 pt-25 p-5 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 text-black">
//         <h1 className="text-2xl font-bold">Completed Tasks</h1>
//         <div className="mt-5 space-y-4 overflow-y-auto h-[85vh] pr-2">
//           {filteredHistory.length === 0 ? (
//              <div className="text-gray-500 text-center mt-10">No history available.</div>
//           ) : (
//             filteredHistory.map((task: Task) => (
//               <div key={task._id} className="border p-4 rounded-md bg-green-50">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-xl font-semibold">{task.title}</h2>
//                   <span>Assigned By: <span className="px-4 py-1 border bg-black/60 text-white/80 font-bold rounded-full text-center">{task.createdBy?.name}</span> </span>
//                 </div>
//                 <p className="text-gray-700">{task.description}</p>
//                 <span className="text-sm text-gray-500">Completed on: (new Date(task.createdAt).toLocaleDateString())</span>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </>
//   )
// }

// export default History;

//NEW REFORMED UI

import { useHistory } from "../hooks/useData"; // Import the hook
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearch } from "../context/SearchContext";
import { useMemo } from "react";
import { FaHistory } from "react-icons/fa";

interface Task {
  _id: string | number;
  title?: string;
  description?: string;
  createdBy?: { name: string };
  date?: string;
  time?: string;
  createdAt?: string;
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
        <Skeleton height={120} borderRadius={24} className="mb-6" />
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
        {/* Title Skeleton */}
        <Skeleton width={200} height={32} />
        
        <div className="mt-5 space-y-4 pr-2">
          {filteredHistory.length === 0 ? (
             <div className="text-slate-500 text-center mt-10">
                {searchQuery ? "No matching history found." : "No history available."}
             </div>
          ) : (
            filteredHistory.map((task: Task) => (
            <div key={task._id} className="border p-4 rounded-2xl bg-slate-50 border-slate-200">
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
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 pt-24 px-6">
        <div className="max-w-md mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">!</div>
          <h3 className="font-semibold text-slate-800">Failed to load history</h3>
          <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
        </div>
      </div>
    );
  }

  // -- MAIN UI --
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-slate-800">
      <div className="max-w-6xl mx-auto">

        {/* HERO HEADER */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-500 p-8 shadow-xl shadow-purple-500/20 mb-6">
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-fuchsia-300/20 rounded-full blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center ring-4 ring-white/20">
                <FaHistory className="text-2xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Completed Tasks</h1>
                <p className="text-purple-100 text-sm mt-0.5">A record of everything you've finished</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/15 backdrop-blur rounded-2xl px-5 py-3 border border-white/20">
                <div className="text-2xl font-bold leading-none">{filteredHistory.length}</div>
                <div className="text-[11px] uppercase tracking-wider text-purple-100 mt-1">Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
        <div className="space-y-4 overflow-y-auto h-[60vh] pr-2">
          {filteredHistory.length === 0 ? (
             <div className="text-center mt-10">
               <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">🗂️</div>
               <p className="text-slate-500">No history available.</p>
             </div>
          ) : (
            filteredHistory.map((task: Task) => (
              <div key={task._id} className="border border-emerald-100 p-4 rounded-2xl bg-emerald-50/60 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-slate-800">{task.title}</h2>
                  <span className="text-sm text-slate-600">Assigned By: <span className="px-4 py-1 border border-slate-700 bg-slate-800 text-white font-bold rounded-full text-center">{task.createdBy?.name}</span> </span>
                </div>
                <p className="text-slate-700">{task.description}</p>
                <span className="text-sm text-slate-500">Completed on: (new Date(task.createdAt).toLocaleDateString())</span>
              </div>
            ))
          )}
        </div>
        </div>
      </div>
      </div>
    </>
  )
}

export default History;

//NEW UI

// import { useHistory } from "../hooks/useData"; // Import the hook
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { useSearch } from "../context/SearchContext";
// import { useMemo } from "react";

// interface Task {
//   _id: string | number;
//   title?: string;
//   description?: string;
//   createdBy?: string;
//   date?: string;
//   time?: string;
// }

// function History() {
//   const { searchQuery } = useSearch();
//   const { data: history = [], isLoading, isError } = useHistory();

//   const filteredHistory = useMemo(() => {
//      if (!searchQuery) return history;
//      return history.filter((task: Task) => 
//         (task.title && task.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
//         (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
//      );
//   }, [history, searchQuery]);

//   // -- SKELETON LOADER --
//   if (isLoading) {
//     return (
//       <div className="mx-20 pt-25 p-5 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50">
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
//         {/* Title Skeleton */}
//         <Skeleton width={200} height={32} />
        
//         <div className="mt-5 space-y-4 pr-2">
//           {filteredHistory.length === 0 ? (
//              <div className="text-slate-500 text-center mt-10">
//                 {searchQuery ? "No matching history found." : "No history available."}
//              </div>
//           ) : (
//             filteredHistory.map((task: Task) => (
//             <div key={task._id} className="border p-4 rounded-2xl bg-slate-50 border-slate-200">
//               {/* Header: Title + Badge */}
//               <div className="flex items-center justify-between mb-3">
//                 <Skeleton width={250} height={24} />
//                 <div className="flex items-center gap-2">
//                   <Skeleton width={80} /> {/* "Assigned By" text */}
//                   <Skeleton width={100} height={30} borderRadius={20} /> {/* Badge */}
//                 </div>
//               </div>
              
//               {/* Description */}
//               <div className="mb-3">
//                 <Skeleton count={2} />
//               </div>
              
//               {/* Footer: Date */}
//               <Skeleton width={180} height={16} />
//             </div>
//           ))
//           )}
//         </div>
//         </div>
//       </div>
//     );
//   }

//   if (isError) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-rose-50 pt-24 px-6">
//         <div className="max-w-md mx-auto bg-white border border-rose-200 rounded-2xl p-8 text-center shadow-sm">
//           <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-xl">!</div>
//           <h3 className="font-semibold text-slate-800">Failed to load history</h3>
//           <p className="text-sm text-slate-500 mt-1">Please try again later.</p>
//         </div>
//       </div>
//     );
//   }

//   // -- MAIN UI --
//   return (
//     <>
//       <div className="mx-20 pt-25 pb-10 min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 text-slate-800">
//         <div className="bg-white rounded-2xl shadow-sm border border-slate-200/70 p-6">
//         <h1 className="text-2xl font-bold text-slate-800">Completed Tasks</h1>
//         <div className="mt-5 space-y-4 overflow-y-auto h-[80vh] pr-2">
//           {filteredHistory.length === 0 ? (
//              <div className="text-center mt-10">
//                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-2xl">🗂️</div>
//                <p className="text-slate-500">No history available.</p>
//              </div>
//           ) : (
//             filteredHistory.map((task: Task) => (
//               <div key={task._id} className="border border-emerald-100 p-4 rounded-2xl bg-emerald-50/60 hover:shadow-sm transition-shadow">
//                 <div className="flex items-center justify-between">
//                   <h2 className="text-xl font-semibold text-slate-800">{task.title}</h2>
//                   <span className="text-sm text-slate-600">Assigned By: <span className="px-4 py-1 border border-slate-700 bg-slate-800 text-white font-bold rounded-full text-center">{task.createdBy?.name}</span> </span>
//                 </div>
//                 <p className="text-slate-700">{task.description}</p>
//                 <span className="text-sm text-slate-500">Completed on: (new Date(task.createdAt).toLocaleDateString())</span>
//               </div>
//             ))
//           )}
//         </div>
//         </div>
//       </div>
//     </>
//   )
// }

// export default History;