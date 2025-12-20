import { useAuth } from "../context/AuthContext";
import { useUpdateProfile, useDeleteAccount } from "../hooks/useData";
import { useState, useEffect } from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal"; // 1. Ensure this is imported

function Profile() {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  const deleteAccountMutation = useDeleteAccount();
  
  // 2. Add State for the Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    designation: "",
    role: ""
  });
  
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile: (user as any).mobile || "", 
        designation: user.designation || "",
        role: user.role || "" 
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
            designation: formData.designation
        }),
        {
            loading: 'Saving changes...',
            success: 'Profile updated successfully!',
            error: 'Failed to update profile.',
        }
    );
  };

  // 3. Button Click Handler (Opens Modal)
  const handleDeleteClick = () => {
      setIsDeleteModalOpen(true);
  };

  // 4. Actual Delete Logic (Passed to Modal)
  const confirmDeleteAccount = () => {
      toast.promise(
        deleteAccountMutation.mutateAsync(),
        {
            loading: 'Deleting account...',
            success: 'Account deleted. Goodbye!',
            error: 'Failed to delete account.',
        }
      ).then(() => setIsDeleteModalOpen(false)); // Close modal on success
  };

  return (
    <>
      <div className="mx-20 pt-25 p-5 min-h-screen">
      <div className="bg-white/60 backdrop-blur-sm border-2 border-gray-300 rounded-xl p-8 shadow-lg text-black max-w-4xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">User Profile</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-bold border border-blue-200">
                {formData.role}
            </span>
        </div>

        <form onSubmit={handleSubmit} className="mb-5">
          {/* PERSONAL INFO */}
          <fieldset className="border border-gray-300 p-6 rounded-lg mb-6 bg-white/50">
            <legend className="text-lg px-2 font-bold text-gray-700 bg-transparent">Personal Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold text-gray-700">Full Name</label>
                    <input 
                        type="text" 
                        id="name" 
                        value={formData.name} 
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="Your Name" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="email" className="font-semibold text-gray-700">Email (Read Only)</label>
                    <input 
                        type="email" 
                        id="email" 
                        value={formData.email} 
                        disabled
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500" 
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="mobile" className="font-semibold text-gray-700">Mobile No</label>
                    <input 
                        type="tel" 
                        id="mobile" 
                        value={formData.mobile} 
                        onChange={handleChange}
                        className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                        placeholder="+1 234 567 890" 
                    />
                </div>
            </div>
          </fieldset>

          {/* PROFESSIONAL INFO */}
          <fieldset className="border border-gray-300 p-6 rounded-lg mb-8 bg-white/50">
            <legend className="text-lg px-2 font-bold text-gray-700 bg-transparent">Professional Information</legend>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                <div className="flex flex-col gap-2">
                    <label htmlFor="designation" className="font-semibold text-gray-700">Designation</label>
                    <input 
                        type="text" 
                        id="designation" 
                        value={formData.designation} 
                        disabled
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500" 
                    />
                </div>
                 
                <div className="flex flex-col gap-2">
                      <label className="font-semibold text-gray-700">Role</label>
                      <input 
                        type="text" 
                        value={formData.role} 
                        disabled
                        className="border border-gray-300 p-2 rounded-md bg-gray-100 cursor-not-allowed text-gray-500" 
                    />
                </div>
            </div>
          </fieldset>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-4">
            <button 
                type="button" 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 rounded-lg border border-gray-400 text-gray-600 hover:bg-gray-100 font-semibold transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="px-8 py-2 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </form>
        
        {/* DANGER ZONE */}
        <div className="border border-red-200 bg-red-50 rounded-lg p-6">
            <h3 className="text-red-600 font-bold text-lg mb-2 flex items-center gap-2">
                <FaExclamationTriangle /> Danger Zone
            </h3>
            <p className="text-red-500 text-sm mb-4">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <button 
                type="button"
                onClick={handleDeleteClick} // Updated Handler
                disabled={deleteAccountMutation.isPending}
                className="px-6 py-2 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
            >
                Delete Account
            </button>
        </div>
      </div>

      {/* 5. Render Modal */}
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
  )
}

export default Profile;