import { useMemo } from "react";
import { useUsers, useSettings } from "../hooks/useData"; 
import { useAuth } from "../context/AuthContext"; // Import Auth to check permissions
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useSearch } from "../context/SearchContext";
import { FaCrown } from "react-icons/fa";

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
  const { isAdmin } = useAuth(); // Get current user's admin status
  
  const { data: userList = [], isLoading: loadingUsers, isError } = useUsers();
  const { data: settings } = useSettings();

  // -- GROUPING & FILTERING LOGIC --
  const groupedUsers = useMemo(() => {
    let filteredList = userList;

    // 1. PRIVACY FILTER: Hide Admin/CEO from non-admin users
    if (!isAdmin) {
        filteredList = filteredList.filter((u: User) => {
            // Check if user is the Main Admin/CEO
            const isCEO = u.jobRole === 'CEO' || u.designation === 'CEO' || (u.role === 'Admin' && u.jobRole === 'N/A');
            return !isCEO; // Remove them from the list
        });
    }

    // 2. SEARCH FILTER
    if (searchQuery) {
        filteredList = filteredList.filter((u: User) => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            (u.jobRole || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.designation || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }

    // 3. GROUPING LOGIC
    return filteredList.reduce((groups: Record<string, User[]>, user: User) => {
      // FIX: If user is Admin but has "N/A" job role, force them into "CEO" group
      let key = user.jobRole || 'Other';
      
      const isMainAdmin = user.role === 'Admin' && (user.jobRole === 'N/A' || !user.jobRole || user.jobRole === 'CEO');
      if (isMainAdmin) {
          key = 'CEO';
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(user);
      return groups;
    }, {} as Record<string, User[]>);
  }, [userList, searchQuery, isAdmin]); // Re-run if isAdmin changes

  // -- SORTING LOGIC --
  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedUsers);
    const configuredRoles = settings?.roles || [];

    return keys.sort((a, b) => {
        // 1. CEO always first
        if (a === 'CEO') return -1;
        if (b === 'CEO') return 1;

        // 2. 'Other' always last
        if (a === 'Other') return 1;
        if (b === 'Other') return -1;

        // 3. Respect Settings Order
        const indexA = configuredRoles.indexOf(a);
        const indexB = configuredRoles.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB; 
        if (indexA !== -1) return -1; 
        if (indexB !== -1) return 1;  

        // 4. Alphabetical fallback
        return a.localeCompare(b);
    });
  }, [groupedUsers, settings]);


  // -- SKELETON LOADING --
  if (loadingUsers) {
    return (
      <div className="mx-20 pt-20 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 overflow-y-auto">
        {[1, 2, 3].map((group) => (
          <div key={group}>
            <div className="bg-blue-900 px-3 py-2">
               <Skeleton baseColor="#1e3a8a" highlightColor="#3b82f6" width={100} height={20} />
            </div>
            {[1, 2, 3].map((row) => (
               <div key={row} className="border-b-2 border-gray-300 px-3 py-2 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Skeleton circle width={40} height={40} />
                    <div className="flex flex-col">
                        <Skeleton width={100} />
                        <Skeleton width={150} />
                    </div>
                  </div>
                  <Skeleton width={100} />
               </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return <div className="p-10 text-center text-red-500 font-bold">Failed to load network. Please try again later.</div>;
  }

  return (
    <>
      <div className="mx-20 pt-20 h-screen bg-white/60 backdrop-blur-sm border-2 border-gray-300 text-black overflow-y-auto">
        
        {sortedGroupKeys.map((role) => (
          <div key={role}>
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-blue-900 text-white text-xl font-bold px-4 py-2 uppercase tracking-wider shadow-md flex justify-between items-center">
              <span>{role}</span>
              <span className="text-xs bg-blue-800 px-2 py-1 rounded-full text-blue-200 opacity-80">
                {groupedUsers[role].length} {groupedUsers[role].length === 1 ? 'Person' : 'People'}
              </span>
            </div>

            {/* User List */}
            {groupedUsers[role].map((user: User) => (
              <div 
                key={user._id} 
                className="border-b border-gray-300 px-4 py-3 hover:bg-white/80 transition-colors flex justify-between items-center group"
              >
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-4">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&bold=true`} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full shadow-sm" 
                  />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 text-lg">{user.name}</span>
                        
                        {/* Crown for CEO Group */}
                        {role === 'CEO' && <FaCrown className="text-yellow-500 text-sm" title="CEO" />}
                        
                        {/* Admin Badge for Promoted Employees */}
                        {user.role === 'Admin' && role !== 'CEO' && (
                            <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold border border-purple-200">
                                ADMIN
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-gray-500 font-mono">{user.email}</span>
                  </div>
                </div>

                {/* Right: Designation */}
                <div className="text-sm font-medium text-gray-500 group-hover:text-blue-700 transition-colors">
                  {user.designation || "No Title"}
                </div>
              </div>
            ))}
          </div>
        ))}

        {userList.length === 0 && (
          <div className="text-center py-20 text-gray-500 text-lg flex flex-col items-center">
            <div className="text-4xl mb-2">📭</div>
            No users found in the network.
          </div>
        )}

        {sortedGroupKeys.length === 0 && searchQuery && (
             <div className="text-center py-10 text-gray-500">
                No users found matching "{searchQuery}"
             </div>
        )}
        
        {sortedGroupKeys.length === 0 && !searchQuery && !loadingUsers && (
            <div className="text-center py-10 text-gray-500">
                No visible users.
            </div>
        )}

      </div>
    </>
  );
}

export default Network;