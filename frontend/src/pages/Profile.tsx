// import { useAuth } from "../context/AuthContext";
// import {
//   useUpdateProfile,
//   useDeleteAccount,
//   useProfileStats,
// } from "../hooks/useData";
// import { useState, useEffect } from "react";
// import { FaExclamationTriangle } from "react-icons/fa";
// import { toast } from "react-hot-toast";
// import ConfirmModal from "../components/ConfirmModal";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";

// function Profile() {
//   const { user } = useAuth();
//   const updateProfileMutation = useUpdateProfile();
//   const deleteAccountMutation = useDeleteAccount();
//   const { data: stats, isLoading: statsLoading, isError: statsError } = useProfileStats();

//   // 2. Add State for the Modal
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     designation: "",
//     role: "",
//   });

//   // const [formData, setFormData] = useState(() => ({
//   //   name: user?.name || "",
//   //   email: user?.email || "",
//   //   mobile: (user as any)?.mobile || "",
//   //   designation: user?.designation || "",
//   //   role: user?.role || ""
//   // }));

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         email: user.email || "",
//         mobile: (user as any).mobile || "",
//         designation: user.designation || "",
//         role: user.role || "",
//       });
//     }
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     toast.promise(
//       updateProfileMutation.mutateAsync({
//         name: formData.name,
//         mobile: formData.mobile,
//         designation: formData.designation,
//       }),
//       {
//         loading: "Saving changes...",
//         success: "Profile updated successfully!",
//         error: "Failed to update profile.",
//       },
//     );
//   };

//   // 3. Button Click Handler (Opens Modal)
//   const handleDeleteClick = () => {
//     setIsDeleteModalOpen(true);
//   };

//   // 4. Actual Delete Logic (Passed to Modal)
//   const confirmDeleteAccount = () => {
//     toast
//       .promise(deleteAccountMutation.mutateAsync(), {
//         loading: "Deleting account...",
//         success: "Account deleted. Goodbye!",
//         error: "Failed to delete account.",
//       })
//       .then(() => setIsDeleteModalOpen(false)); // Close modal on success
//   };

//   return (
//     <>
//       <div className="mx-20 pt-25 p-5 min-h-screen">
//         <div className="bg-white/60 backdrop-blur-sm border-2 border-gray-300 rounded-xl p-8 shadow-lg text-black max-w-4xl mx-auto">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
//             <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold border border-blue-200">
//               {formData.role}
//             </span>
//           </div>

//           <form onSubmit={handleSubmit} className="mb-5">
//             {/* PERSONAL INFO */}
//             <fieldset className="border border-gray-300 p-6 rounded-lg mb-6 bg-white/50">
//               <legend className="text-lg px-2 font-bold text-gray-700 bg-transparent">
//                 Personal Information
//               </legend>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
//                 <div className="flex flex-col gap-2">
//                   <label htmlFor="name" className="font-semibold text-gray-700">
//                     Username
//                   </label>
//                   <input
//                     type="text"
//                     id="name"
//                     value={formData.name}
//                     onChange={handleChange}
//                     className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//                     placeholder="Your Name"
//                   />
//                 </div>

//                 <div className="flex flex-col gap-2">
//                   <label
//                     htmlFor="email"
//                     className="font-semibold text-gray-700"
//                   >
//                     Email
//                   </label>
//                   <input
//                     type="email"
//                     id="email"
//                     value={formData.email}
//                     disabled
//                     className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
//                   />
//                 </div>

//                 <div className="flex flex-col gap-2">
//                   <label
//                     htmlFor="mobile"
//                     className="font-semibold text-gray-700"
//                   >
//                     Mobile No
//                   </label>
//                   <input
//                     type="tel"
//                     id="mobile"
//                     value={formData.mobile}
//                     onChange={handleChange}
//                     className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
//                     placeholder="+1 234 567 890"
//                   />
//                 </div>
//               </div>
//             </fieldset>

//             {/* PROFESSIONAL INFO */}
//             <fieldset className="border border-gray-300 p-6 rounded-lg mb-8 bg-white/50">
//               <legend className="text-lg px-2 font-bold text-gray-700 bg-transparent">
//                 Professional Information
//               </legend>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
//                 <div className="flex flex-col gap-2">
//                   <label
//                     htmlFor="designation"
//                     className="font-semibold text-gray-700"
//                   >
//                     Designation
//                   </label>
//                   <input
//                     type="text"
//                     id="designation"
//                     value={formData.designation}
//                     disabled
//                     className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
//                   />
//                 </div>

//                 <div className="flex flex-col gap-2">
//                   <label className="font-semibold text-gray-700">Role</label>
//                   <input
//                     type="text"
//                     value={formData.role}
//                     disabled
//                     className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500"
//                   />
//                 </div>
//               </div>
//             </fieldset>

//             <fieldset className="border border-gray-300 p-6 rounded-lg mb-8 bg-white/50">
//               <legend className="text-lg px-2 font-bold text-gray-700 bg-transparent">
//                 Performance
//               </legend>

//               {statsLoading ? (
//                 <div className="space-y-3 mt-2">
//                   {[1, 2, 3, 4, 5].map((i) => (
//                     <div key={i} className="grid grid-cols-[3fr_1fr_3fr] gap-6">
//                       <Skeleton height={16} />
//                       <Skeleton height={16} width={10} />
//                       <Skeleton height={16} width={40} />
//                     </div>
//                   ))}
//                 </div>
//               ) : statsError ? (
//                 <div className="mt-2 flex items-center gap-2 text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3">
//                   <FaExclamationTriangle className="shrink-0" />
//                   Couldn't load performance stats. Please refresh the page — if this
//                   keeps happening, check that the backend has the latest deploy.
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr_3fr] gap-6 mt-2">
//                   <div className="text-green-900">Total Tasks Created</div>
//                   <div>:</div>
//                   <div className="font-semibold">
//                     {stats?.totalCreated ?? 0}
//                   </div>

//                   <div className="text-indigo-900">Total Tasks Assigned</div>
//                   <div>:</div>
//                   <div className="font-semibold">
//                     {stats?.totalAssigned ?? 0}
//                   </div>

//                   <div className="text-red-900">Deadlines Missed</div>
//                   <div>:</div>
//                   <div className="font-semibold">
//                     {stats?.deadlinesMissed ?? 0}
//                   </div>

//                   <div className="text-orange-900">In Progress Tasks</div>
//                   <div>:</div>
//                   <div className="font-semibold">{stats?.inProgress ?? 0}</div>

//                   <div className="font-semibold">
//                     Performance Evaluation (%)
//                   </div>
//                   <div>:</div>
//                   <div
//                     className={`font-black text-lg ${
//                       (stats?.performancePercent ?? 0) >= 70
//                         ? "text-green-600"
//                         : (stats?.performancePercent ?? 0) >= 40
//                           ? "text-orange-500"
//                           : "text-red-600"
//                     }`}
//                   >
//                     {stats?.performancePercent ?? 0}%
//                   </div>
//                 </div>
//               )}

//               <p className="text-xs text-gray-400 mt-4">
//                 Based on tasks completed on or before their due date, out of
//                 total tasks assigned.
//               </p>
//             </fieldset>

//             {/* ACTION BUTTONS */}
//             <div className="flex justify-end gap-4">
//               <button
//                 type="button"
//                 onClick={() => window.location.reload()}
//                 className="px-6 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={updateProfileMutation.isPending}
//                 className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </form>

//           {/* DANGER ZONE */}
//           <div className="border border-red-200 bg-red-50 rounded-lg p-6">
//             <h3 className="text-red-600 font-bold text-lg mb-2 flex items-center gap-2">
//               <FaExclamationTriangle /> Danger Zone
//             </h3>
//             <p className="text-red-500 text-sm mb-4">
//               Once you delete your account, there is no going back. Please be
//               certain.
//             </p>
//             <button
//               type="button"
//               onClick={handleDeleteClick} // Updated Handler
//               disabled={deleteAccountMutation.isPending}
//               className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
//             >
//               Delete Account
//             </button>
//           </div>
//         </div>

//         {/* 5. Render Modal */}
//         <ConfirmModal
//           isOpen={isDeleteModalOpen}
//           onClose={() => setIsDeleteModalOpen(false)}
//           onConfirm={confirmDeleteAccount}
//           title="Delete Account?"
//           message="Are you sure you want to do this? This action cannot be undone. It will permanently delete your account and remove you from the network."
//           confirmText="Yes, Delete Account"
//           isDanger={true}
//           isLoading={deleteAccountMutation.isPending}
//         />
//       </div>
//     </>
//   );
// }

// export default Profile;


//OLDEST UI
// import { useAuth } from "../context/AuthContext";
// import { useUpdateProfile, useDeleteAccount } from "../hooks/useData";
// import { useState, useEffect } from "react";
// import {
//   FaExclamationTriangle,
//   FaUser,
//   FaEnvelope,
//   FaPhone,
//   FaBriefcase,
//   FaUserShield,
//   FaCheckCircle,
// } from "react-icons/fa";
// import { toast } from "react-hot-toast";
// import ConfirmModal from "../components/ConfirmModal";

// function Profile() {
//   const { user } = useAuth();
//   const updateProfileMutation = useUpdateProfile();
//   const deleteAccountMutation = useDeleteAccount();

//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     mobile: "",
//     designation: "",
//     role: "",
//   });

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         name: user.name || "",
//         email: user.email || "",
//         mobile: (user as any).mobile || "",
//         designation: user.designation || "",
//         role: user.role || "",
//       });
//     }
//   }, [user]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setFormData({ ...formData, [e.target.id]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     toast.promise(
//       updateProfileMutation.mutateAsync({
//         name: formData.name,
//         mobile: formData.mobile,
//         designation: formData.designation,
//       }),
//       {
//         loading: "Saving changes...",
//         success: "Profile updated successfully!",
//         error: "Failed to update profile.",
//       }
//     );
//   };

//   const handleDeleteClick = () => setIsDeleteModalOpen(true);

//   const confirmDeleteAccount = () => {
//     toast
//       .promise(deleteAccountMutation.mutateAsync(), {
//         loading: "Deleting account...",
//         success: "Account deleted. Goodbye!",
//         error: "Failed to delete account.",
//       })
//       .then(() => setIsDeleteModalOpen(false));
//   };

//   const initials =
//     formData.name
//       ?.split(" ")
//       .map((n) => n[0])
//       .slice(0, 2)
//       .join("")
//       .toUpperCase() || "U";

//   const stats = [
//     { label: "Tasks Created", value: 300, accent: "from-emerald-400 to-teal-500" },
//     { label: "Tasks Assigned", value: 300, accent: "from-indigo-400 to-blue-500" },
//     { label: "Deadlines Missed", value: 20, accent: "from-rose-400 to-red-500" },
//     { label: "In Progress", value: 3, accent: "from-amber-400 to-orange-500" },
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
//       <div className="max-w-5xl mx-auto">
//         {/* HERO HEADER */}
//         <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 p-8 shadow-xl shadow-blue-500/20 mb-6">
//           <div className="absolute -top-10 -right-10 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
//           <div className="absolute -bottom-16 -left-10 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />

//           <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
//             <div className="relative">
//               <div className="w-24 h-24 rounded-2xl bg-white/95 text-indigo-700 flex items-center justify-center text-3xl font-bold shadow-lg ring-4 ring-white/30">
//                 {initials}
//               </div>
//               <span className="absolute -bottom-1 -right-1 bg-emerald-400 text-white p-1.5 rounded-full ring-4 ring-indigo-600">
//                 <FaCheckCircle className="w-3 h-3" />
//               </span>
//             </div>

//             <div className="flex-1 text-white">
//               <h1 className="text-3xl font-bold tracking-tight">
//                 {formData.name || "Your Name"}
//               </h1>
//               <p className="text-blue-100 mt-1 flex items-center gap-2">
//                 <FaEnvelope className="w-3.5 h-3.5" /> {formData.email}
//               </p>
//               <div className="flex flex-wrap gap-2 mt-3">
//                 {formData.role && (
//                   <span className="px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-xs font-semibold border border-white/30">
//                     {formData.role}
//                   </span>
//                 )}
//                 {formData.designation && (
//                   <span className="px-3 py-1 bg-white/20 backdrop-blur text-white rounded-full text-xs font-semibold border border-white/30">
//                     {formData.designation}
//                   </span>
//                 )}
//               </div>
//             </div>

//             <div className="text-right hidden sm:block">
//               <div className="text-5xl font-bold text-white">80%</div>
//               <div className="text-xs uppercase tracking-wider text-blue-100">
//                 Performance
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* STATS GRID */}
//         <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//           {stats.map((s) => (
//             <div
//               key={s.label}
//               className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/70 hover:shadow-md hover:-translate-y-0.5 transition-all"
//             >
//               <div
//                 className={`w-10 h-1 rounded-full bg-gradient-to-r ${s.accent} mb-3`}
//               />
//               <div className="text-2xl font-bold text-slate-800">{s.value}</div>
//               <div className="text-sm text-slate-500 mt-1">{s.label}</div>
//             </div>
//           ))}
//         </div>

//         {/* FORM CARD */}
//         <form
//           onSubmit={handleSubmit}
//           className="bg-white rounded-2xl shadow-sm border border-slate-200/70 overflow-hidden"
//         >
//           {/* Personal */}
//           <section className="p-8 border-b border-slate-100">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
//                 <FaUser />
//               </div>
//               <div>
//                 <h2 className="font-semibold text-slate-800">Personal Information</h2>
//                 <p className="text-sm text-slate-500">Update your personal details</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <Field
//                 id="name"
//                 label="Full Name"
//                 icon={<FaUser />}
//                 value={formData.name}
//                 onChange={handleChange}
//                 placeholder="Your name"
//               />
//               <Field
//                 id="email"
//                 label="Email Address"
//                 icon={<FaEnvelope />}
//                 value={formData.email}
//                 disabled
//               />
//               <Field
//                 id="mobile"
//                 label="Mobile Number"
//                 icon={<FaPhone />}
//                 type="tel"
//                 value={formData.mobile}
//                 onChange={handleChange}
//                 placeholder="+1 234 567 890"
//               />
//             </div>
//           </section>

//           {/* Professional */}
//           <section className="p-8 border-b border-slate-100 bg-slate-50/40">
//             <div className="flex items-center gap-3 mb-6">
//               <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
//                 <FaBriefcase />
//               </div>
//               <div>
//                 <h2 className="font-semibold text-slate-800">Professional Information</h2>
//                 <p className="text-sm text-slate-500">Managed by your administrator</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//               <Field
//                 id="designation"
//                 label="Designation"
//                 icon={<FaBriefcase />}
//                 value={formData.designation}
//                 disabled
//               />
//               <Field
//                 id="role"
//                 label="Role"
//                 icon={<FaUserShield />}
//                 value={formData.role}
//                 disabled
//               />
//             </div>
//           </section>

//           {/* Actions */}
//           <div className="px-8 py-5 bg-slate-50 flex flex-col-reverse sm:flex-row justify-end gap-3">
//             <button
//               type="button"
//               onClick={() => window.location.reload()}
//               className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-white font-medium transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={updateProfileMutation.isPending}
//               className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-semibold hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
//             >
//               {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
//             </button>
//           </div>
//         </form>

//         {/* DANGER ZONE */}
//         <div className="mt-6 bg-white rounded-2xl border border-red-200 overflow-hidden shadow-sm">
//           <div className="p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
//             <div className="flex items-start gap-4">
//               <div className="w-11 h-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
//                 <FaExclamationTriangle />
//               </div>
//               <div>
//                 <h3 className="font-semibold text-slate-800">Delete Account</h3>
//                 <p className="text-sm text-slate-500 mt-0.5">
//                   Permanently delete your account and all associated data. This action
//                   cannot be undone.
//                 </p>
//               </div>
//             </div>
//             <button
//               type="button"
//               onClick={handleDeleteClick}
//               disabled={deleteAccountMutation.isPending}
//               className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 whitespace-nowrap"
//             >
//               Delete Account
//             </button>
//           </div>
//         </div>
//       </div>

//       <ConfirmModal
//         isOpen={isDeleteModalOpen}
//         onClose={() => setIsDeleteModalOpen(false)}
//         onConfirm={confirmDeleteAccount}
//         title="Delete Account?"
//         message="Are you sure you want to do this? This action cannot be undone. It will permanently delete your account and remove you from the network."
//         confirmText="Yes, Delete Account"
//         isDanger={true}
//         isLoading={deleteAccountMutation.isPending}
//       />
//     </div>
//   );
// }

// /* Reusable input field */
// function Field({
//   id,
//   label,
//   icon,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   disabled = false,
// }: {
//   id?: string;
//   label: string;
//   icon?: React.ReactNode;
//   value: string;
//   onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   type?: string;
//   disabled?: boolean;
// }) {
//   return (
//     <div className="flex flex-col gap-1.5">
//       <label htmlFor={id} className="text-sm font-medium text-slate-700">
//         {label}
//       </label>
//       <div className="relative">
//         {icon && (
//           <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
//             {icon}
//           </span>
//         )}
//         <input
//           id={id}
//           type={type}
//           value={value}
//           onChange={onChange}
//           placeholder={placeholder}
//           disabled={disabled}
//           className={`w-full ${icon ? "pl-10" : "pl-3"} pr-3 py-2.5 rounded-xl border text-slate-800 placeholder:text-slate-400 transition-all outline-none ${
//             disabled
//               ? "bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed"
//               : "bg-white border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
//           }`}
//         />
//       </div>
//     </div>
//   );
// }

// export default Profile;

//NEW REFORMED UI

import { useAuth } from "../context/AuthContext";
import {
  useUpdateProfile,
  useDeleteAccount,
  useProfileStats,
} from "../hooks/useData";
import { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

function Profile() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();
  const { data: stats, isLoading: statsLoading, isError: statsError } = useProfileStats();

  // 2. Add State for the Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    role: "",
  });

  // const [formData, setFormData] = useState(() => ({
  //   name: user?.name || "",
  //   email: user?.email || "",
  //   mobile: (user as any)?.mobile || "",
  //   designation: user?.designation || "",
  //   role: user?.role || ""
  // }));

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: (user as any).mobile || "",
        designation: user.designation || "",
        role: user.role || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    toast.promise(
      updateProfileMutation.mutateAsync({
        name: formData.name,
        mobile: formData.mobile,
        designation: formData.designation,
      }),
      {
        loading: "Saving changes...",
        success: "Profile updated successfully!",
        error: "Failed to update profile.",
      },
    );
  };

  // 3. Button Click Handler (Opens Modal)
  const handleDeleteClick = () => {
    setIsDeleteModalOpen(true);
  };

  // 4. Actual Delete Logic (Passed to Modal)
  const confirmDeleteAccount = () => {
    toast
      .promise(deleteAccountMutation.mutateAsync(), {
        loading: "Deleting account...",
        success: "Account deleted. Goodbye!",
        error: "Failed to delete account.",
      })
      .then(() => setIsDeleteModalOpen(false)); // Close modal on success
  };

  return (
  <>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 pt-24 pb-16 px-4 sm:px-8 lg:px-20">
      <div className="max-w-4xl mx-auto">
        {/* HEADER CARD */}
        <div className="relative bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/70 overflow-hidden mb-6">
          <div className="h-32 bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400" />
          <div className="px-8 pb-6 -mt-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="h-24 w-24 rounded-2xl bg-white shadow-lg ring-4 ring-white flex items-center justify-center text-3xl font-black bg-gradient-to-br from-indigo-500 to-cyan-500 text-white">
                {formData.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {formData.name || "Your Profile"}
                </h1>
                <p className="text-sm text-slate-500">{formData.email}</p>
              </div>
            </div>
            <span className="self-start sm:self-auto px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold border border-blue-200 uppercase tracking-wider">
              {formData.role}
            </span>
          </div>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/70 text-slate-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* PERSONAL INFO */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
                <h2 className="text-lg font-bold text-slate-800">Personal Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="name" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Username</label>
                  <input
                    type="text" id="name" value={formData.name} onChange={handleChange}
                    className="border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white outline-none transition-all"
                    placeholder="Your Name"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="email" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                  <input
                    type="email" id="email" value={formData.email} disabled
                    className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-100 cursor-not-allowed text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label htmlFor="mobile" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mobile No</label>
                  <input
                    type="tel" id="mobile" value={formData.mobile} onChange={handleChange}
                    className="border border-slate-200 bg-slate-50/50 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white outline-none transition-all"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
            </section>

            {/* PROFESSIONAL INFO */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
                <h2 className="text-lg font-bold text-slate-800">Professional Information</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="designation" className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Designation</label>
                  <input
                    type="text" id="designation" value={formData.designation} disabled
                    className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-100 cursor-not-allowed text-slate-500"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Role</label>
                  <input
                    type="text" value={formData.role} disabled
                    className="border border-slate-200 px-4 py-2.5 rounded-xl bg-slate-100 cursor-not-allowed text-slate-500"
                  />
                </div>
              </div>
            </section>

            {/* PERFORMANCE */}
            <section>
              <div className="flex items-center gap-3 mb-5">
                <div className="h-8 w-1.5 rounded-full bg-gradient-to-b from-indigo-500 to-cyan-500" />
                <h2 className="text-lg font-bold text-slate-800">Performance</h2>
              </div>

              {statsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-2xl border border-slate-200 p-4">
                      <Skeleton height={12} width={80} />
                      <Skeleton height={28} width={60} />
                    </div>
                  ))}
                </div>
              ) : statsError ? (
                <div className="flex items-center gap-3 text-red-700 text-sm bg-red-50 border border-red-200 rounded-2xl p-4">
                  <FaExclamationTriangle className="shrink-0" />
                  Couldn't load performance stats. Please refresh the page.
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Created</p>
                      <p className="text-2xl font-black text-emerald-900 mt-1">{stats?.totalCreated ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4">
                      <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Assigned</p>
                      <p className="text-2xl font-black text-indigo-900 mt-1">{stats?.totalAssigned ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-red-100 bg-red-50/60 p-4">
                      <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Missed</p>
                      <p className="text-2xl font-black text-red-900 mt-1">{stats?.deadlinesMissed ?? 0}</p>
                    </div>
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/60 p-4">
                      <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide">In Progress</p>
                      <p className="text-2xl font-black text-orange-900 mt-1">{stats?.inProgress ?? 0}</p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-slate-700">Performance Evaluation</p>
                      <p className={`text-2xl font-black ${
                        (stats?.performancePercent ?? 0) >= 70 ? "text-emerald-600"
                        : (stats?.performancePercent ?? 0) >= 40 ? "text-orange-500"
                        : "text-red-600"
                      }`}>
                        {stats?.performancePercent ?? 0}%
                      </p>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          (stats?.performancePercent ?? 0) >= 70 ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                          : (stats?.performancePercent ?? 0) >= 40 ? "bg-gradient-to-r from-orange-400 to-orange-500"
                          : "bg-gradient-to-r from-red-400 to-red-600"
                        }`}
                        style={{ width: `${stats?.performancePercent ?? 0}%` }}
                      />
                    </div>
                  </div>
                </>
              )}

              <p className="text-xs text-slate-400 mt-4">
                Based on tasks completed on or before their due date, out of total tasks assigned.
              </p>
            </section>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 text-white font-bold hover:shadow-xl hover:shadow-blue-500/30 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>

        {/* DANGER ZONE */}
        <div className="mt-6 rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-rose-50 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FaExclamationTriangle />
              </div>
              <div>
                <h3 className="text-red-700 font-bold text-base">Danger Zone</h3>
                <p className="text-red-600/80 text-sm mt-0.5">
                  Once you delete your account, there is no going back.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDeleteClick}
              disabled={deleteAccountMutation.isPending}
              className="px-6 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md shadow-red-500/20 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account?"
        message="Are you sure you want to do this? This action cannot be undone. It will permanently delete your account and remove you from the network."
        confirmText="Yes, Delete Account"
        isDanger={true}
        isLoading={deleteAccountMutation.isPending}
      />
    </div>
  </>
);

}

export default Profile;
