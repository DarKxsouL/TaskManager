import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { 
    useUsers, 
    useSettings, 
    useAddJobRole, 
    useAddDesignation, 
    useDeleteJobRole, 
    useDeleteDesignation 
} from "../hooks/useData"; 
import { api } from "../services/api"; 
import { useQueryClient } from "@tanstack/react-query";
import { FaBriefcase, FaUserTag, FaPlus, FaTrash, FaChevronDown, FaTimes, FaCrown } from "react-icons/fa";
import { toast } from "react-hot-toast"; // 1. Import Toast

interface User {
  _id: string; 
  name: string;
  email: string;
  role: string;
  designation?: string;
  jobRole?: string;
}

// --- CELL DROPDOWN (Reusable) ---
interface CellDropdownProps {
    value: string;
    options: string[];
    onSelect: (val: string) => void;
    placeholder: string;
    emptyMsg: string;
    disabled?: boolean;
}

const CellDropdown = ({ value, options, onSelect, placeholder, emptyMsg, disabled }: CellDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => { if (!disabled) setIsOpen(!isOpen); };

    return (
        <div className="relative">
            <button 
                onClick={toggle}
                disabled={disabled}
                className={`w-full flex justify-between items-center border px-3 py-1.5 rounded-lg text-sm transition-all 
                ${disabled ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            >
                <span className={`truncate ${!value ? 'text-gray-400' : ''}`}>
                    {value || placeholder}
                </span>
                {!disabled && <FaChevronDown className={`text-gray-400 text-xs ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`} />}
            </button>

            {isOpen && !disabled && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                <div className="absolute z-50 mt-1 w-full min-w-[180px] bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-[100]">
                    {options && options.length > 0 ? (
                        <ul className="max-h-48 overflow-y-auto">
                            {options.map((opt) => (
                                <li 
                                    key={opt}
                                    onClick={() => { onSelect(opt); setIsOpen(false); }}
                                    className={`px-4 py-2 text-sm cursor-pointer hover:bg-blue-50 text-gray-700 ${value === opt ? 'bg-blue-50 font-semibold text-blue-600' : ''}`}
                                >
                                    {opt}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="p-3 text-xs text-orange-500 italic text-center bg-orange-50">
                            {emptyMsg}
                        </div>
                    )}
                </div>
                </>
            )}
        </div>
    );
};

// --- MAIN COMPONENT ---

function Settings() {
  const { user: dbUser, isAdmin } = useAuth();
  
  const { data: users = [], isLoading: loadingUsers } = useUsers();
  const { data: settings } = useSettings();
  
  const queryClient = useQueryClient();
  const addJobRoleMutation = useAddJobRole();
  const addDesignationMutation = useAddDesignation();
  const deleteJobRoleMutation = useDeleteJobRole();
  const deleteDesignationMutation = useDeleteDesignation();
  
  const [newRole, setNewRole] = useState("");
  const [newDesignationName, setNewDesignationName] = useState("");
  const [selectedRoleForDesignation, setSelectedRoleForDesignation] = useState("");

//   const [newUserEmail, setNewUserEmail] = useState("");
//   const [newUserName, setNewUserName] = useState("");

  // --- HANDLERS ---

  const handleAddRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    
    // Toast Promise with Mutation
    toast.promise(
        addJobRoleMutation.mutateAsync(newRole),
        {
            loading: 'Adding role...',
            success: 'Job role added!',
            error: 'Failed to add role'
        }
    ).then(() => setNewRole(""));
  };

  const handleDeleteRole = (role: string) => {
      if(confirm(`Delete role "${role}"? This will also remove linked designations.`)) {
          toast.promise(
            deleteJobRoleMutation.mutateAsync(role),
            {
                loading: 'Deleting role...',
                success: 'Role deleted',
                error: 'Failed to delete role'
            }
          );
      }
  }

  const handleAddDesignation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesignationName.trim() || !selectedRoleForDesignation) return;
    
    toast.promise(
        addDesignationMutation.mutateAsync({ 
            designation: newDesignationName, 
            role: selectedRoleForDesignation 
        }),
        {
            loading: 'Adding designation...',
            success: 'Designation added!',
            error: 'Failed to add designation'
        }
    ).then(() => setNewDesignationName(""));
  };

  const handleDeleteDesignation = (name: string, role: string) => {
      if(confirm(`Delete designation "${name}"?`)) {
        toast.promise(
            deleteDesignationMutation.mutateAsync({ designation: name, role }),
            {
                loading: 'Deleting designation...',
                success: 'Designation deleted',
                error: 'Failed to delete designation'
            }
        );
      }
  }

  const handleUpdateUserDetail = async (userId: string, field: 'jobRole' | 'designation', value: string) => {
      const updates: any = { [field]: value };
      if (field === 'jobRole') updates.designation = ""; 
      
      toast.promise(
          (async () => {
            await api.request(`/users/${userId}`, { method: 'PATCH', body: JSON.stringify(updates) });
            await queryClient.invalidateQueries({ queryKey: ['users'] });
          })(),
          {
              loading: 'Updating user...',
              success: 'User details updated',
              error: 'Failed to update user'
          }
      );
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this user from the network?")) {
        toast.promise(
            (async () => {
                await api.deleteUser(id);
                await queryClient.invalidateQueries({ queryKey: ['users'] });
            })(),
            {
                loading: 'Removing user...',
                success: 'User removed from network',
                error: 'Failed to delete user'
            }
        );
    }
  };

  const handlePromoteUser = async (id: string, currentRole: string) => {
      const isPromoting = currentRole !== 'Admin';
      const action = isPromoting ? "Promote to Admin" : "Demote to Employee";
      
      const confirm = window.confirm(`${action}?`);
      if (!confirm) return;

      const newRole = isPromoting ? 'Admin' : 'Employee';
      
      toast.promise(
          (async () => {
            await api.updateUserRole(id, newRole);
            await queryClient.invalidateQueries({ queryKey: ['users'] });
          })(),
          {
              loading: 'Updating permissions...',
              success: `User ${isPromoting ? 'Promoted' : 'Demoted'}`,
              error: 'Failed to change role'
          }
      );
  };

//   const handleAddUser = async (e: React.FormEvent) => {
//       e.preventDefault();
//       toast.promise(
//           (async () => {
//             await api.createUser({ name: newUserName, email: newUserEmail, role: 'Employee', designation: 'New Hire' });
//             await queryClient.invalidateQueries({ queryKey: ['users'] });
//           })(),
//           {
//               loading: 'Adding user...',
//               success: 'User added successfully',
//               error: 'Error adding user'
//           }
//       ).then(() => {
//           setNewUserEmail(""); 
//           setNewUserName("");
//       });
//   }

  const getDesignationsForRole = (roleName: string) => {
      if (!settings?.designations || !roleName) return [];
      return settings.designations
        .filter((d: any) => typeof d === 'object' ? d.role === roleName : true) 
        .map((d: any) => typeof d === 'object' ? d.name : d);
  };

  return (
    <div className="mx-20 pt-40 p-10 min-h-screen bg-white/90 backdrop-blur-sm border-2 border-gray-300 text-black overflow-y-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">System Settings</h1>

      {/* --- ADMIN CONFIGURATION --- */}
      {isAdmin && (
        <div className="mb-10">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* A. JOB ROLES */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FaBriefcase className="text-blue-500" />
                        <h3 className="font-bold text-lg">Job Roles</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                        {settings?.roles?.map((role: string) => (
                            <div key={role} className="relative group px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-100 flex items-center gap-2 pl-8"> 
                                {role}
                                <button 
                                    onClick={() => handleDeleteRole(role)}
                                    className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-blue-300 transition-colors flex items-center"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddRole} className="flex gap-2">
                        <input type="text" value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Add Role..." className="flex-1 border p-2 rounded text-sm outline-none focus:border-blue-500" />
                        <button disabled={addJobRoleMutation.isPending} className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"><FaPlus /></button>
                    </form>
                </div>

                {/* B. DESIGNATIONS */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <FaUserTag className="text-purple-500" />
                        <h3 className="font-bold text-lg">Designations</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4 min-h-[40px]">
                        {settings?.designations?.map((d: any, idx: number) => (
                            <div key={idx} className="relative group px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium border border-purple-100 flex items-center gap-1 pl-8"> 
                                {d.name} <span className="text-[10px] opacity-60 uppercase tracking-tighter">({d.role})</span>
                                <button 
                                    onClick={() => handleDeleteDesignation(d.name, d.role)}
                                    className="absolute top-0 left-0 h-full px-2 rounded-l-full hover:bg-red-500 hover:text-white text-purple-300 transition-colors flex items-center"
                                >
                                    <FaTimes size={10} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleAddDesignation} className="flex gap-2">
                        <select 
                            value={selectedRoleForDesignation}
                            onChange={(e) => setSelectedRoleForDesignation(e.target.value)}
                            className="w-1/3 border p-2 rounded text-sm outline-none focus:border-purple-500 bg-gray-50 text-gray-700"
                        >
                            <option value="">Select Role</option>
                            {settings?.roles?.map((r: string) => <option key={r} value={r}>{r}</option>)}
                        </select>

                        <input 
                            type="text" 
                            value={newDesignationName}
                            onChange={(e) => setNewDesignationName(e.target.value)}
                            placeholder="Title..."
                            disabled={!selectedRoleForDesignation}
                            className="flex-1 border p-2 rounded text-sm outline-none focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <button disabled={addDesignationMutation.isPending || !selectedRoleForDesignation} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:opacity-50">
                            <FaPlus />
                        </button>
                    </form>
                </div>
            </div>
        </div>
      )}

      {/* --- 2. USER DIRECTORY --- */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-800 border-b pb-2">User Directory</h2>
        
        {/* {isAdmin && (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-6">
            <form onSubmit={handleAddUser} className="flex gap-4">
                <input type="text" placeholder="Name" value={newUserName} onChange={e => setNewUserName(e.target.value)} className="border p-2 rounded flex-1 outline-none" required />
                <input type="email" placeholder="Email" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="border p-2 rounded flex-1 outline-none" required />
                <button className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700">Add</button>
            </form>
        </div>
        )} */}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            <table className="w-full text-left">
                <thead className="bg-gray-100 border-b text-gray-600 text-sm uppercase">
                    <tr>
                        <th className="p-4">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">System Access</th>
                        <th className="p-4 w-56">Job Role</th>
                        <th className="p-4 w-56">Designation</th>
                        {isAdmin && <th className="p-4 text-right">Actions</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {loadingUsers ? <tr><td className="p-4">Loading...</td></tr> : 
                    users.map((u: User) => {
                        // FIX: Updated isCEO check to look at Designation OR Job Role.
                        const isCEO = u.jobRole === 'CEO' || u.designation === 'CEO'; 
                        const isSelf = u._id === dbUser?._id;

                        return (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-medium text-gray-800 flex items-center gap-2">
                                {u.name}
                                {isCEO && <FaCrown className="text-yellow-500" title="CEO (Main Admin)" />}
                            </td>
                            <td className="p-4 text-gray-500">{u.email}</td>
                            
                            {/* System Access Badge */}
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-600'}`}>
                                    {u.role}
                                </span>
                            </td>

                            {/* JOB ROLE (Static "CEO" for CEO, Dropdown for everyone else) */}
                            <td className="p-4">
                                {isCEO ? (
                                    <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-200">CEO</span>
                                ) : (
                                    <CellDropdown 
                                        value={u.jobRole || ""}
                                        options={settings?.roles || []}
                                        onSelect={(val) => handleUpdateUserDetail(u._id, 'jobRole', val)}
                                        placeholder="Select Role"
                                        emptyMsg="Configure Roles"
                                        disabled={!isAdmin} 
                                    />
                                )}
                            </td>

                            {/* DESIGNATION (Static "CEO" for CEO, Dropdown for everyone else) */}
                            <td className="p-4">
                                {isCEO ? (
                                    <span className="font-bold text-gray-800 bg-gray-100 px-3 py-1 rounded border border-gray-200">CEO</span>
                                ) : (
                                    <CellDropdown 
                                        value={u.designation || ""}
                                        options={getDesignationsForRole(u.jobRole || "")}
                                        onSelect={(val) => handleUpdateUserDetail(u._id, 'designation', val)}
                                        placeholder="Select Title"
                                        emptyMsg={!u.jobRole ? "Select Job Role first" : "No titles"}
                                        disabled={!isAdmin || !u.jobRole} 
                                    />
                                )}
                            </td>

                            {isAdmin && (
                            <td className="p-4 text-right flex justify-end gap-3">
                                {/* Only allow actions if target is NOT CEO and NOT self */}
                                {!isCEO && !isSelf && (
                                    <>
                                        <button 
                                            onClick={() => handlePromoteUser(u._id, u.role)} 
                                            className="text-blue-600 hover:text-blue-800 text-sm font-semibold hover:underline"
                                        >
                                            {u.role === 'Admin' ? 'Demote' : 'Make Admin'}
                                        </button>
                                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors">
                                            <FaTrash />
                                        </button>
                                    </>
                                )}
                            </td>
                            )}
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

export default Settings;