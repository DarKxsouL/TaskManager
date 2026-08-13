// import { useState, useEffect } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { useRequestJoinRoom } from '../hooks/useData';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import { socket } from '../components/SocketManager';

// function JoinRoom() {
//   const { user, roomStatus, logout, refreshSession } = useAuth();
//   const navigate = useNavigate();
//   const requestJoinMutation = useRequestJoinRoom();

//   const [roomId, setRoomId] = useState('');

//   // If somehow an approved user lands here, send them to dashboard
//   useEffect(() => {
//     if (user && roomStatus === 'approved') {
//       navigate(`/${user.name.replace(/\s+/g, '')}`, { replace: true });
//     }
//   }, [user, roomStatus, navigate]);

// //   // Listen for real-time approval or rejection from admin
// //   useEffect(() => {
// //     if (!user) return;

// //     // Admin approved this user
// //     socket.on(`room-approved-${user._id}`, () => {
// //       toast.success('You have been approved! Welcome to the room.');
// //       // Force a full page reload so AuthContext re-fetches
// //       // the updated roomStatus from the backend
// //       window.location.href = `/${user.name.replace(/\s+/g, '')}`;
// //     });

// //     // Admin rejected this user
// //     socket.on(`room-rejected-${user._id}`, () => {
// //       toast.error('Your request was declined. You can try a different room ID.');
// //       // Reload so AuthContext picks up the reset roomStatus: 'none'
// //       window.location.reload();
// //     });

// //     return () => {
// //       socket.off(`room-approved-${user._id}`);
// //       socket.off(`room-rejected-${user._id}`);
// //     };
// //   }, [user, navigate]);

// useEffect(() => {
//   if (!user) return;

//   const handleApproved = async () => {
//     toast.success('You have been approved! Welcome to the room.');
//     // refreshSession updates AuthContext state → roomStatus becomes
//     // 'approved' → RequireApprovedRoom gate opens → user sees dashboard
//     await refreshSession();
//     // Navigate after session is fresh
//     navigate(`/${user.name.replace(/\s+/g, '')}`, { replace: true });
//   };

//   const handleRejected = async () => {
//     toast.error('Your request was declined. You can try a different room ID.');
//     await refreshSession();
//     // refreshSession resets roomStatus to 'none' → form shows again
//   };

//   socket.on(`room-approved-${user._id}`, handleApproved);
//   socket.on(`room-rejected-${user._id}`, handleRejected);

//   return () => {
//     socket.off(`room-approved-${user._id}`, handleApproved);
//     socket.off(`room-rejected-${user._id}`, handleRejected);
//   };
// }, [user, refreshSession, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!roomId.trim()) {
//       toast.error('Please enter a Room ID');
//       return;
//     }

//     toast.promise(
//       requestJoinMutation.mutateAsync(roomId.trim()),
//       {
//         loading: 'Sending request...',
//         success: 'Request sent! Waiting for admin approval.',
//         error: (err) => err.message || 'Failed to send request.',
//       }
//     );
//   };

//   const handleLogout = async () => {
//     await logout();
//     navigate('/');
//   };

//   // --- PENDING STATE ---
//   if (roomStatus === 'pending') {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 text-center border border-gray-100">

//           {/* Animated waiting indicator */}
//           <div className="flex justify-center mb-6">
//             <div className="relative w-20 h-20">
//               <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
//               <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
//               <div className="absolute inset-0 flex items-center justify-center text-2xl">⏳</div>
//             </div>
//           </div>

//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Request Pending
//           </h2>
//           <p className="text-gray-500 mb-2">
//             Your request to join the room has been sent.
//           </p>
//           <p className="text-gray-400 text-sm mb-8">
//             Please wait for the admin to approve your request. You'll be redirected automatically once approved.
//           </p>

//           {/* Visual status indicator */}
//           <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
//             <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
//             <span className="text-amber-700 text-sm font-medium">
//               Waiting for admin approval
//             </span>
//           </div>

//           <button
//             onClick={handleLogout}
//             className="text-sm text-gray-400 hover:text-red-500 transition-colors"
//           >
//             Logout and try a different account
//           </button>
//         </div>
//       </div>
//     );
//   }

//   // --- JOIN FORM STATE (roomStatus === 'none') ---
//   return (
//     <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-2xl shadow-lg max-w-md w-full p-8 border border-gray-100">

//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="text-4xl mb-3">🔑</div>
//           <h2 className="text-2xl font-bold text-gray-800 mb-2">
//             Join a Room
//           </h2>
//           <p className="text-gray-500 text-sm">
//             Enter the Room ID shared by your admin to request access.
//           </p>
//         </div>

//         {/* User info pill */}
//         <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl p-3 mb-6">
//           <img
//             src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
//             alt="avatar"
//             className="w-9 h-9 rounded-full"
//           />
//           <div>
//             <div className="font-semibold text-gray-800 text-sm">{user?.name}</div>
//             <div className="text-gray-400 text-xs">{user?.email}</div>
//           </div>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="flex flex-col gap-1.5">
//             <label className="text-sm font-semibold text-gray-700">
//               Room ID
//             </label>
//             <input
//               type="text"
//               value={roomId}
//               onChange={(e) => setRoomId(e.target.value)}
//               placeholder="e.g. 3f2a1b4c-8d9e-..."
//               className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-gray-800 font-mono text-sm transition-all"
//               disabled={requestJoinMutation.isPending}
//             />
//             <p className="text-xs text-gray-400">
//               Ask your admin to share their Room ID with you.
//             </p>
//           </div>

//           <button
//             type="submit"
//             disabled={requestJoinMutation.isPending || !roomId.trim()}
//             className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {requestJoinMutation.isPending ? 'Sending Request...' : 'Send Join Request'}
//           </button>
//         </form>

//         {/* Divider */}
//         <div className="flex items-center gap-3 my-6">
//           <div className="flex-1 h-px bg-gray-200"></div>
//           <span className="text-xs text-gray-400">or</span>
//           <div className="flex-1 h-px bg-gray-200"></div>
//         </div>

//         <button
//           onClick={handleLogout}
//           className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-2"
//         >
//           Logout and use a different account
//         </button>
//       </div>
//     </div>
//   );
// }

// export default JoinRoom;


//NEW UI

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRequestJoinRoom } from '../hooks/useData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { socket } from '../components/SocketManager';

function JoinRoom() {
  const { user, roomStatus, logout, refreshSession } = useAuth();
  const navigate = useNavigate();
  const requestJoinMutation = useRequestJoinRoom();

  const [roomId, setRoomId] = useState('');

  // If somehow an approved user lands here, send them to dashboard
  useEffect(() => {
    if (user && roomStatus === 'approved') {
      navigate(`/${user.name.replace(/\s+/g, '')}`, { replace: true });
    }
  }, [user, roomStatus, navigate]);

//   // Listen for real-time approval or rejection from admin
//   useEffect(() => {
//     if (!user) return;

//     // Admin approved this user
//     socket.on(`room-approved-${user._id}`, () => {
//       toast.success('You have been approved! Welcome to the room.');
//       // Force a full page reload so AuthContext re-fetches
//       // the updated roomStatus from the backend
//       window.location.href = `/${user.name.replace(/\s+/g, '')}`;
//     });

//     // Admin rejected this user
//     socket.on(`room-rejected-${user._id}`, () => {
//       toast.error('Your request was declined. You can try a different room ID.');
//       // Reload so AuthContext picks up the reset roomStatus: 'none'
//       window.location.reload();
//     });

//     return () => {
//       socket.off(`room-approved-${user._id}`);
//       socket.off(`room-rejected-${user._id}`);
//     };
//   }, [user, navigate]);

useEffect(() => {
  if (!user) return;

  const handleApproved = async () => {
    toast.success('You have been approved! Welcome to the room.');
    // refreshSession updates AuthContext state → roomStatus becomes
    // 'approved' → RequireApprovedRoom gate opens → user sees dashboard
    await refreshSession();
    // Navigate after session is fresh
    navigate(`/${user.name.replace(/\s+/g, '')}`, { replace: true });
  };

  const handleRejected = async () => {
    toast.error('Your request was declined. You can try a different room ID.');
    await refreshSession();
    // refreshSession resets roomStatus to 'none' → form shows again
  };

  socket.on(`room-approved-${user._id}`, handleApproved);
  socket.on(`room-rejected-${user._id}`, handleRejected);

  return () => {
    socket.off(`room-approved-${user._id}`, handleApproved);
    socket.off(`room-rejected-${user._id}`, handleRejected);
  };
}, [user, refreshSession, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomId.trim()) {
      toast.error('Please enter a Room ID');
      return;
    }

    toast.promise(
      requestJoinMutation.mutateAsync(roomId.trim()),
      {
        loading: 'Sending request...',
        success: 'Request sent! Waiting for admin approval.',
        error: (err) => err.message || 'Failed to send request.',
      }
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // --- PENDING STATE ---
  if (roomStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 max-w-md w-full p-8 text-center border border-slate-200/70">

          {/* Animated waiting indicator */}
          <div className="flex justify-center mb-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
              <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center text-2xl">⏳</div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Request Pending
          </h2>
          <p className="text-slate-500 mb-2">
            Your request to join the room has been sent.
          </p>
          <p className="text-slate-400 text-sm mb-8">
            Please wait for the admin to approve your request. You'll be redirected automatically once approved.
          </p>

          {/* Visual status indicator */}
          <div className="flex items-center justify-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></div>
            <span className="text-amber-700 text-sm font-medium">
              Waiting for admin approval
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-rose-500 transition-colors"
          >
            Logout and try a different account
          </button>
        </div>
      </div>
    );
  }

  // --- JOIN FORM STATE (roomStatus === 'none') ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl shadow-blue-500/5 max-w-md w-full p-8 border border-slate-200/70">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white flex items-center justify-center text-2xl shadow-md shadow-blue-500/20">🔑</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">
            Join a Room
          </h2>
          <p className="text-slate-500 text-sm">
            Enter the Room ID shared by your admin to request access.
          </p>
        </div>

        {/* User info pill */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3 mb-6">
          <img
            src={`https://ui-avatars.com/api/?name=${user?.name}&background=random`}
            alt="avatar"
            className="w-9 h-9 rounded-full ring-2 ring-white shadow-sm"
          />
          <div>
            <div className="font-semibold text-slate-800 text-sm">{user?.name}</div>
            <div className="text-slate-400 text-xs">{user?.email}</div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-slate-700">
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="e.g. 3f2a1b4c-8d9e-..."
              className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent text-slate-800 font-mono text-sm transition-all"
              disabled={requestJoinMutation.isPending}
            />
            <p className="text-xs text-slate-400">
              Ask your admin to share their Room ID with you.
            </p>
          </div>

          <button
            type="submit"
            disabled={requestJoinMutation.isPending || !roomId.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 hover:shadow-lg text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {requestJoinMutation.isPending ? 'Sending Request...' : 'Send Join Request'}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-200"></div>
          <span className="text-xs text-slate-400">or</span>
          <div className="flex-1 h-px bg-slate-200"></div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full text-sm text-slate-400 hover:text-rose-500 transition-colors py-2"
        >
          Logout and use a different account
        </button>
      </div>
    </div>
  );
}

export default JoinRoom;