// import { useState, useEffect, useRef } from "react";
// import { useUsers, useAddCreatedTask } from "../hooks/useData";
// import { useAuth } from "../context/AuthContext";
// import { IoIosArrowDown } from "react-icons/io";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { toast } from "react-hot-toast"; // 1. Import Toast

// // --- CUSTOM CSS ---
// const customDatepickerStyles = `
//   .react-datepicker {
//     background-color: rgba(30, 30, 30, 0.95);
//     border: 1px solid rgba(255, 255, 255, 0.1);
//     font-family: inherit;
//     color: #fff;
//     border-radius: 0.75rem;
//     backdrop-filter: blur(10px);
//     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
//   }
//   .react-datepicker__header {
//     background-color: rgba(255, 255, 255, 0.05);
//     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//     border-top-left-radius: 0.75rem;
//     border-top-right-radius: 0.75rem;
//     padding-top: 15px;
//   }
//   .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
//     color: #fff;
//     font-weight: 700;
//   }
//   .react-datepicker__day-name {
//     color: rgba(255, 255, 255, 0.6);
//   }
//   .react-datepicker__day {
//     color: #fff;
//     transition: all 0.2s ease;
//     border-radius: 0.5rem;
//   }
//   .react-datepicker__day:hover {
//     background-color: rgba(255, 255, 255, 0.2);
//     color: #fff;
//   }
//   .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
//     background-color: #16a34a !important;
//     color: #fff !important;
//     font-weight: bold;
//   }
//   .react-datepicker__day--disabled {
//     color: rgba(255, 255, 255, 0.2);
//   }
//   .react-datepicker__navigation-icon::before {
//     border-color: #fff;
//   }
//   .react-datepicker__triangle {
//     display: none;
//   }
//   input::-webkit-outer-spin-button,
//   input::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//   input[type=number] {
//     -moz-appearance: textfield;
//   }
// `;

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
// }

// interface AddTaskProps {
//     addTaskBtnClicked: boolean;
//     setAddTaskBtnClicked: (value: boolean) => void;
//     toggleButtonRef: React.RefObject<HTMLButtonElement>;
// }

// // FIX: Helper defined outside or before state init
// const getToday = () => {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0); // Normalize to Midnight
//     return d;
// }

// function AddTask({addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef}: AddTaskProps) {
//   const { username } = useAuth();
//   const { data: users = [] } = useUsers();
//   const createTaskMutation = useAddCreatedTask();

//   const filteredUsers = users.filter((user: User) => user.name !== username);

//   const [title, setTitle] = useState("");
//   const [priority, setPriority] = useState("Medium");
//   const [assignedUserId, setAssignedUserId] = useState("");

//   // FIX: Initialize with getToday() instead of new Date() to avoid time mismatches
//   const [dueDate, setDueDate] = useState<Date | null>(getToday());
//   const [daysInput, setDaysInput] = useState<number | string>(1);

//   const [isUserOpen, setIsUserOpen] = useState(false);
//   const [isPriorityOpen, setIsPriorityOpen] = useState(false);
//   const [isDaysOpen, setIsDaysOpen] = useState(false);
  
//   const addTaskRef = useRef<HTMLFormElement>(null);
//   const userDropdownRef = useRef<HTMLDivElement>(null);
//   const priorityDropdownRef = useRef<HTMLDivElement>(null);
//   const daysDropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (filteredUsers.length > 0 && !assignedUserId) {
//       setAssignedUserId(filteredUsers[0]._id);
//     }
//   }, [filteredUsers, assignedUserId]);

//   const getAssignedUserName = () => {
//       const user = users.find((u: User) => u._id === assignedUserId);
//       return user ? user.name : "Select User";
//   };

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       const target = event.target as Node;

//       if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
//         setIsUserOpen(false);
//       }
//       if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
//         setIsPriorityOpen(false);
//       }
//       if (daysDropdownRef.current && !daysDropdownRef.current.contains(target)) {
//         setIsDaysOpen(false);
//       }

//       if (!addTaskBtnClicked) return;
//       if (!addTaskRef.current) return;
//       if (addTaskRef.current.contains(target)) return;
//       if (toggleButtonRef.current && toggleButtonRef.current.contains(target)) return;
//       if ((target as Element).closest && (target as Element).closest('.react-datepicker-popper')) return;

//       setAddTaskBtnClicked(false);
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef]);


//   const updateDateFromDays = (days: number) => {
//       const newDate = getToday();
//       newDate.setDate(newDate.getDate() + (days - 1));
//       setDueDate(newDate);
//   }

//   const handleDateChange = (date: Date | null) => {
//     // FIX: Normalize selected date to midnight before calculation
//     if (date) date.setHours(0, 0, 0, 0);
    
//     setDueDate(date);
//     if (date) {
//         const today = getToday();
//         const diffTime = date.getTime() - today.getTime();
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
//         setDaysInput(diffDays + 1); // 0 diff + 1 = 1 Day (Today)
//     } else {
//         setDaysInput("");
//     }
//   };

//   const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = parseInt(e.target.value);
//     setDaysInput(e.target.value);

//     if (!isNaN(val) && val > 0) {
//         updateDateFromDays(val);
//     } else {
//         setDueDate(null);
//     }
//   };

//   const handlePresetSelect = (days: number) => {
//       setDaysInput(days);
//       updateDateFromDays(days);
//       setIsDaysOpen(false);
//   };


//   const taskCreator = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!title || !assignedUserId) {
//       // 2. Updated Validation Toast
//       toast.error("Please fill in the Task Title and Assign a User.");
//       return;
//     }

//     const newTask = {
//       title: title,
//       priority: priority,
//       assignedTo: assignedUserId,
//       status: "To Do",
//       dueDate: dueDate ? dueDate.toISOString() : new Date().toISOString(),
//       createdBy: username
//     };

//     // 3. Start Loading Toast
//     const toastId = toast.loading("Creating Task...");

//     createTaskMutation.mutate(newTask, {
//       onSuccess: () => {
//         // 4. Update Toast to Success
//         toast.success("Task created successfully!", { id: toastId });
        
//         setAddTaskBtnClicked(false);

//         setTitle("");
//         setPriority("Medium");
//         setDueDate(getToday());
//         setDaysInput(1);
//         if (filteredUsers.length > 0) {
//             setAssignedUserId(filteredUsers[0]._id);
//         } else {
//             setAssignedUserId("");
//         }
//       },
//       onError: (err: any) => {
//         // 5. Update Toast to Error
//         toast.error(err.message || "Failed to create task.", { id: toastId });
//       }
//     });
//   };

//   return (
//     <>
//     <style>{customDatepickerStyles}</style>
//       <form ref={addTaskRef} onSubmit={taskCreator} className={`absolute top-40 right-0 rounded-b-xl rounded-l-xl bg-black/60 backdrop-blur-md z-20 
//                         grid grid-cols-5 gap-y-4 gap-x-2 shadow-2xl border border-white/10
//                         transition-all duration-400 ease-in-out
//                         ${addTaskBtnClicked? 'w-150 h-100 py-8 px-10 opacity-100 visible overflow-visible': 'w-32 h-0 p-0 opacity-0 invisible overflow-hidden'} `}>
//             <h1 className="col-span-5 text-white font-bold text-2xl text-center">Create a Task</h1>
            
//             <label className="col-span-1 font-bold text-white" htmlFor="title">Task Title: </label>
//             <input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="col-span-4 border border-white/20 rounded-lg text-white px-3 py-1 h-fit outline-none bg-white/10 focus:bg-white/20 transition-colors"
//               type="text"
//               placeholder="e.g. Fix Login Bug"
//               required />
            
//             <label className="col-span-1 font-bold text-white flex items-center" htmlFor="priority">Priority: </label>
//             <div className="col-span-4 relative" ref={priorityDropdownRef}>
            
//             <div 
//                 onClick={() => setIsPriorityOpen(!isPriorityOpen)}
//                 className="w-full border border-white/30 rounded-lg px-3 py-2 bg-white/10 cursor-pointer flex justify-between items-center hover:bg-white/20"
//             >
//                 <span className={'text-white'}>{priority}</span>
//                 <IoIosArrowDown className={`text-white transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
//             </div>

//             {isPriorityOpen && (
//                 <ul className="absolute top-full left-0 w-full mt-1 overflow-hidden bg-white rounded-lg shadow-xl z-50">
//                       <li onClick={() => { setPriority("Urgent"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors border-b border-red-200">
//                           Urgent
//                       </li>
//                       <li onClick={() => { setPriority("High"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-orange-100 text-orange-600 font-bold hover:bg-orange-200 transition-colors border-b border-orange-200">
//                           High
//                       </li>
//                       <li onClick={() => { setPriority("Medium"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-yellow-100 text-yellow-600 font-bold hover:bg-yellow-200 transition-colors border-b border-yellow-200">
//                           Medium
//                       </li>
//                       <li onClick={() => { setPriority("Low"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-green-100 text-green-600 font-bold hover:bg-green-200 transition-colors">
//                           Low
//                       </li>
//                 </ul>
//             )}
//         </div>
            
//             <label className="col-span-1 font-bold text-white flex items-center">Assign To: </label>
//         <div className="col-span-4 relative" ref={userDropdownRef}>
//             <div 
//                 onClick={() => setIsUserOpen(!isUserOpen)}
//                 className="w-full border border-white/30 rounded-lg text-white px-3 py-2 bg-white/10 cursor-pointer flex justify-between items-center hover:bg-white/20"
//             >
//                 <span>{getAssignedUserName() || "Select User"}</span>
//                 <IoIosArrowDown className={`transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
//             </div>

//             {isUserOpen && (
//                 <ul className="absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto bg-white rounded-lg shadow-xl z-50">
//                     {filteredUsers.length === 0 ? (
//                          <li className="px-4 py-2 text-gray-500 text-sm">No other users found...</li>
//                     ) : (
//                         filteredUsers.map((user: User) => (
//                             <li 
//                                 key={user._id}
//                                 onClick={() => {
//                                     setAssignedUserId(user._id);
//                                     setIsUserOpen(false);
//                                 }}
//                                 className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-black flex justify-between items-center border-b border-gray-100 last:border-0"
//                             >
//                                 <span className="font-semibold text-gray-800">{user.name}</span>
//                                 <span className="text-xs font-bold px-2 py-1 rounded bg-gray-200 text-gray-600">
//                                     {user.role}
//                                 </span>
//                             </li>
//                         ))
//                     )}
//                 </ul>
//             )}
//         </div>
        
//         <label className="col-span-1 font-bold text-white flex items-center">Due Date: </label>
//         <div className="col-span-2">
//              <DatePicker 
//                 selected={dueDate} 
//                 onChange={handleDateChange}
//                 minDate={new Date()}
//                 dateFormat="MM/dd/yyyy"
//                 className="w-full border border-white/30 rounded-lg text-white px-3 py-2 outline-none bg-white/10 focus:bg-white/20 transition-colors cursor-pointer"
//                 wrapperClassName="w-full"
//                 placeholderText="Select a due date"
//                 showPopperArrow={false}
//              />
//         </div>
//         <label className="col-span-1 font-bold text-white flex items-center" htmlFor="days">No of Days:</label>
//         <div className="col-span-1 relative" ref={daysDropdownRef}>
//              <div className="w-full h-full flex items-center border border-white/30 rounded-lg bg-white/10 focus-within:bg-white/20 transition-colors">
//                 <input 
//                     type="number" 
//                     min="1"
//                     placeholder="Days"
//                     value={daysInput}
//                     onChange={handleDaysChange}
//                     className="w-full h-full bg-transparent text-white pl-3 outline-none text-center font-bold" 
//                 />
//                 <div 
//                     onClick={() => setIsDaysOpen(!isDaysOpen)}
//                     className="h-full px-2 flex items-center cursor-pointer border-l border-white/10 hover:bg-white/10 rounded-r-lg"
//                 >
//                     <IoIosArrowDown className={`text-white text-xs transition-transform ${isDaysOpen ? 'rotate-180' : ''}`} />
//                 </div>
//              </div>

//              {isDaysOpen && (
//                  <ul className="absolute top-full right-0 w-40 mt-1 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
//                      <li onClick={() => handlePresetSelect(7)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 font-medium border-b border-gray-100 flex justify-between">
//                          <span>1 Week</span> <span className="text-gray-400 text-sm">7</span>
//                      </li>
//                      <li onClick={() => handlePresetSelect(15)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 font-medium border-b border-gray-100 flex justify-between">
//                          <span>Half Month</span> <span className="text-gray-400 text-sm">15</span>
//                      </li>
//                      <li onClick={() => handlePresetSelect(30)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-gray-800 font-medium flex justify-between">
//                          <span>1 Month</span> <span className="text-gray-400 text-sm">30</span>
//                      </li>
//                  </ul>
//              )}
//         </div>
//         <button
//               disabled={createTaskMutation.isPending} 
//               className="col-span-3 col-start-2 rounded-full font-bold text-white text-xl text-center bg-green-500 transition-colours duration-500 ease-in-out hover:bg-green-500 hover:text-green-900 hover:shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
//                 {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
//         </button>
//         </form>
//     </>
//   )
// }

// export default AddTask;

//NEW UI

// import { useState, useEffect, useRef } from "react";
// import { useUsers, useAddCreatedTask } from "../hooks/useData";
// import { useAuth } from "../context/AuthContext";
// import { IoIosArrowDown } from "react-icons/io";
// import DatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";
// import { toast } from "react-hot-toast"; // 1. Import Toast

// // --- CUSTOM CSS ---
// const customDatepickerStyles = `
//   .react-datepicker {
//     background-color: rgba(30, 30, 30, 0.95);
//     border: 1px solid rgba(255, 255, 255, 0.1);
//     font-family: inherit;
//     color: #fff;
//     border-radius: 0.75rem;
//     backdrop-filter: blur(10px);
//     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
//   }
//   .react-datepicker__header {
//     background-color: rgba(255, 255, 255, 0.05);
//     border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//     border-top-left-radius: 0.75rem;
//     border-top-right-radius: 0.75rem;
//     padding-top: 15px;
//   }
//   .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
//     color: #fff;
//     font-weight: 700;
//   }
//   .react-datepicker__day-name {
//     color: rgba(255, 255, 255, 0.6);
//   }
//   .react-datepicker__day {
//     color: #fff;
//     transition: all 0.2s ease;
//     border-radius: 0.5rem;
//   }
//   .react-datepicker__day:hover {
//     background-color: rgba(255, 255, 255, 0.2);
//     color: #fff;
//   }
//   .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
//     background-color: #16a34a !important;
//     color: #fff !important;
//     font-weight: bold;
//   }
//   .react-datepicker__day--disabled {
//     color: rgba(255, 255, 255, 0.2);
//   }
//   .react-datepicker__navigation-icon::before {
//     border-color: #fff;
//   }
//   .react-datepicker__triangle {
//     display: none;
//   }
//   input::-webkit-outer-spin-button,
//   input::-webkit-inner-spin-button {
//     -webkit-appearance: none;
//     margin: 0;
//   }
//   input[type=number] {
//     -moz-appearance: textfield;
//   }
// `;

// interface User {
//   _id: string;
//   name: string;
//   email: string;
//   role: string;
//   designation?: string;
// }

// interface AddTaskProps {
//     addTaskBtnClicked: boolean;
//     setAddTaskBtnClicked: (value: boolean) => void;
//     toggleButtonRef: React.RefObject<HTMLButtonElement>;
// }

// // FIX: Helper defined outside or before state init
// const getToday = () => {
//     const d = new Date();
//     d.setHours(0, 0, 0, 0); // Normalize to Midnight
//     return d;
// }

// function AddTask({addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef}: AddTaskProps) {
//   const { username } = useAuth();
//   const { data: users = [] } = useUsers();
//   const createTaskMutation = useAddCreatedTask();

//   const filteredUsers = users.filter((user: User) => user.name !== username);

//   const [title, setTitle] = useState("");
//   const [priority, setPriority] = useState("Medium");
//   const [assignedUserId, setAssignedUserId] = useState("");

//   // FIX: Initialize with getToday() instead of new Date() to avoid time mismatches
//   const [dueDate, setDueDate] = useState<Date | null>(getToday());
//   const [daysInput, setDaysInput] = useState<number | string>(1);

//   const [isUserOpen, setIsUserOpen] = useState(false);
//   const [isPriorityOpen, setIsPriorityOpen] = useState(false);
//   const [isDaysOpen, setIsDaysOpen] = useState(false);
  
//   const addTaskRef = useRef<HTMLFormElement>(null);
//   const userDropdownRef = useRef<HTMLDivElement>(null);
//   const priorityDropdownRef = useRef<HTMLDivElement>(null);
//   const daysDropdownRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (filteredUsers.length > 0 && !assignedUserId) {
//       setAssignedUserId(filteredUsers[0]._id);
//     }
//   }, [filteredUsers, assignedUserId]);

//   const getAssignedUserName = () => {
//       const user = users.find((u: User) => u._id === assignedUserId);
//       return user ? user.name : "Select User";
//   };

//   useEffect(() => {
//     function handleClickOutside(event: MouseEvent) {
//       const target = event.target as Node;

//       if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
//         setIsUserOpen(false);
//       }
//       if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
//         setIsPriorityOpen(false);
//       }
//       if (daysDropdownRef.current && !daysDropdownRef.current.contains(target)) {
//         setIsDaysOpen(false);
//       }

//       if (!addTaskBtnClicked) return;
//       if (!addTaskRef.current) return;
//       if (addTaskRef.current.contains(target)) return;
//       if (toggleButtonRef.current && toggleButtonRef.current.contains(target)) return;
//       if ((target as Element).closest && (target as Element).closest('.react-datepicker-popper')) return;

//       setAddTaskBtnClicked(false);
//     }

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef]);


//   const updateDateFromDays = (days: number) => {
//       const newDate = getToday();
//       newDate.setDate(newDate.getDate() + (days - 1));
//       setDueDate(newDate);
//   }

//   const handleDateChange = (date: Date | null) => {
//     // FIX: Normalize selected date to midnight before calculation
//     if (date) date.setHours(0, 0, 0, 0);
    
//     setDueDate(date);
//     if (date) {
//         const today = getToday();
//         const diffTime = date.getTime() - today.getTime();
//         const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
//         setDaysInput(diffDays + 1); // 0 diff + 1 = 1 Day (Today)
//     } else {
//         setDaysInput("");
//     }
//   };

//   const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const val = parseInt(e.target.value);
//     setDaysInput(e.target.value);

//     if (!isNaN(val) && val > 0) {
//         updateDateFromDays(val);
//     } else {
//         setDueDate(null);
//     }
//   };

//   const handlePresetSelect = (days: number) => {
//       setDaysInput(days);
//       updateDateFromDays(days);
//       setIsDaysOpen(false);
//   };


//   const taskCreator = (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!title || !assignedUserId) {
//       // 2. Updated Validation Toast
//       toast.error("Please fill in the Task Title and Assign a User.");
//       return;
//     }

//     const newTask = {
//       title: title,
//       priority: priority,
//       assignedTo: assignedUserId,
//       status: "To Do",
//       dueDate: dueDate ? dueDate.toISOString() : new Date().toISOString(),
//       createdBy: username
//     };

//     // 3. Start Loading Toast
//     const toastId = toast.loading("Creating Task...");

//     createTaskMutation.mutate(newTask, {
//       onSuccess: () => {
//         // 4. Update Toast to Success
//         toast.success("Task created successfully!", { id: toastId });
        
//         setAddTaskBtnClicked(false);

//         setTitle("");
//         setPriority("Medium");
//         setDueDate(getToday());
//         setDaysInput(1);
//         if (filteredUsers.length > 0) {
//             setAssignedUserId(filteredUsers[0]._id);
//         } else {
//             setAssignedUserId("");
//         }
//       },
//       onError: (err: any) => {
//         // 5. Update Toast to Error
//         toast.error(err.message || "Failed to create task.", { id: toastId });
//       }
//     });
//   };

//   return (
//     <>
//     <style>{customDatepickerStyles}</style>
//       <form ref={addTaskRef} onSubmit={taskCreator} className={`absolute top-40 right-0 rounded-b-xl rounded-l-xl bg-black/60 backdrop-blur-md z-20 
//                         grid grid-cols-5 gap-y-4 gap-x-2 shadow-2xl border border-white/10
//                         transition-all duration-400 ease-in-out
//                         ${addTaskBtnClicked? 'w-150 h-100 py-8 px-10 opacity-100 visible overflow-visible': 'w-32 h-0 p-0 opacity-0 invisible overflow-hidden'} `}>
//             <h1 className="col-span-5 text-white font-bold text-2xl text-center">Create a Task</h1>
            
//             <label className="col-span-1 font-bold text-white" htmlFor="title">Task Title: </label>
//             <input
//               id="title"
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               className="col-span-4 border border-white/20 rounded-xl text-white px-3 py-1 h-fit outline-none bg-white/10 focus:bg-white/20 transition-colors"
//               type="text"
//               placeholder="e.g. Fix Login Bug"
//               required />
            
//             <label className="col-span-1 font-bold text-white flex items-center" htmlFor="priority">Priority: </label>
//             <div className="col-span-4 relative" ref={priorityDropdownRef}>
            
//             <div 
//                 onClick={() => setIsPriorityOpen(!isPriorityOpen)}
//                 className="w-full border border-white/30 rounded-xl px-3 py-2 bg-white/10 cursor-pointer flex justify-between items-center hover:bg-white/20"
//             >
//                 <span className={'text-white'}>{priority}</span>
//                 <IoIosArrowDown className={`text-white transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
//             </div>

//             {isPriorityOpen && (
//                 <ul className="absolute top-full left-0 w-full mt-1 overflow-hidden bg-white rounded-xl shadow-xl z-50">
//                       <li onClick={() => { setPriority("Urgent"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-red-100 text-red-600 font-bold hover:bg-red-200 transition-colors border-b border-red-200">
//                           Urgent
//                       </li>
//                       <li onClick={() => { setPriority("High"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-orange-100 text-orange-600 font-bold hover:bg-orange-200 transition-colors border-b border-orange-200">
//                           High
//                       </li>
//                       <li onClick={() => { setPriority("Medium"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-yellow-100 text-yellow-600 font-bold hover:bg-yellow-200 transition-colors border-b border-yellow-200">
//                           Medium
//                       </li>
//                       <li onClick={() => { setPriority("Low"); setIsPriorityOpen(false); }} 
//                           className="px-4 py-2 cursor-pointer bg-green-100 text-green-600 font-bold hover:bg-green-200 transition-colors">
//                           Low
//                       </li>
//                 </ul>
//             )}
//         </div>
            
//             <label className="col-span-1 font-bold text-white flex items-center">Assign To: </label>
//         <div className="col-span-4 relative" ref={userDropdownRef}>
//             <div 
//                 onClick={() => setIsUserOpen(!isUserOpen)}
//                 className="w-full border border-white/30 rounded-xl text-white px-3 py-2 bg-white/10 cursor-pointer flex justify-between items-center hover:bg-white/20"
//             >
//                 <span>{getAssignedUserName() || "Select User"}</span>
//                 <IoIosArrowDown className={`transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
//             </div>

//             {isUserOpen && (
//                 <ul className="absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto bg-white rounded-xl shadow-xl z-50">
//                     {filteredUsers.length === 0 ? (
//                          <li className="px-4 py-2 text-slate-500 text-sm">No other users found...</li>
//                     ) : (
//                         filteredUsers.map((user: User) => (
//                             <li 
//                                 key={user._id}
//                                 onClick={() => {
//                                     setAssignedUserId(user._id);
//                                     setIsUserOpen(false);
//                                 }}
//                                 className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-black flex justify-between items-center border-b border-slate-100 last:border-0"
//                             >
//                                 <span className="font-semibold text-slate-800">{user.name}</span>
//                                 <span className="text-xs font-bold px-2 py-1 rounded bg-slate-200 text-slate-600">
//                                     {user.role}
//                                 </span>
//                             </li>
//                         ))
//                     )}
//                 </ul>
//             )}
//         </div>
        
//         <label className="col-span-1 font-bold text-white flex items-center">Due Date: </label>
//         <div className="col-span-2">
//              <DatePicker 
//                 selected={dueDate} 
//                 onChange={handleDateChange}
//                 minDate={new Date()}
//                 dateFormat="MM/dd/yyyy"
//                 className="w-full border border-white/30 rounded-xl text-white px-3 py-2 outline-none bg-white/10 focus:bg-white/20 transition-colors cursor-pointer"
//                 wrapperClassName="w-full"
//                 placeholderText="Select a due date"
//                 showPopperArrow={false}
//              />
//         </div>
//         <label className="col-span-1 font-bold text-white flex items-center" htmlFor="days">No of Days:</label>
//         <div className="col-span-1 relative" ref={daysDropdownRef}>
//              <div className="w-full h-full flex items-center border border-white/30 rounded-xl bg-white/10 focus-within:bg-white/20 transition-colors">
//                 <input 
//                     type="number" 
//                     min="1"
//                     placeholder="Days"
//                     value={daysInput}
//                     onChange={handleDaysChange}
//                     className="w-full h-full bg-transparent text-white pl-3 outline-none text-center font-bold" 
//                 />
//                 <div 
//                     onClick={() => setIsDaysOpen(!isDaysOpen)}
//                     className="h-full px-2 flex items-center cursor-pointer border-l border-white/10 hover:bg-white/10 rounded-r-lg"
//                 >
//                     <IoIosArrowDown className={`text-white text-xs transition-transform ${isDaysOpen ? 'rotate-180' : ''}`} />
//                 </div>
//              </div>

//              {isDaysOpen && (
//                  <ul className="absolute top-full right-0 w-40 mt-1 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
//                      <li onClick={() => handlePresetSelect(7)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium border-b border-slate-100 flex justify-between">
//                          <span>1 Week</span> <span className="text-slate-400 text-sm">7</span>
//                      </li>
//                      <li onClick={() => handlePresetSelect(15)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium border-b border-slate-100 flex justify-between">
//                          <span>Half Month</span> <span className="text-slate-400 text-sm">15</span>
//                      </li>
//                      <li onClick={() => handlePresetSelect(30)} 
//                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium flex justify-between">
//                          <span>1 Month</span> <span className="text-slate-400 text-sm">30</span>
//                      </li>
//                  </ul>
//              )}
//         </div>
//         <button
//               disabled={createTaskMutation.isPending} 
//               className="col-span-3 col-start-2 rounded-full font-bold text-white text-xl text-center bg-green-500 transition-colours duration-500 ease-in-out hover:bg-green-500 hover:text-green-900 hover:shadow-lg disabled:bg-slate-500 disabled:cursor-not-allowed">
//                 {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
//         </button>
//         </form>
//     </>
//   )
// }

// export default AddTask;

// NEW REFORMED UI

import { useState, useEffect, useRef } from "react";
import { useUsers, useAddCreatedTask } from "../hooks/useData";
import { useAuth } from "../context/AuthContext";
import { IoIosArrowDown } from "react-icons/io";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-hot-toast"; // 1. Import Toast

// --- CUSTOM CSS ---
const customDatepickerStyles = `
  .react-datepicker {
    background-color: #ffffff;
    border: 1px solid #e2e8f0;
    font-family: inherit;
    color: #1e293b;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.15);
  }
  .react-datepicker__header {
    background-color: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    padding-top: 15px;
  }
  .react-datepicker__current-month, .react-datepicker-time__header, .react-datepicker-year-header {
    color: #1e293b;
    font-weight: 700;
  }
  .react-datepicker__day-name {
    color: #64748b;
  }
  .react-datepicker__day {
    color: #1e293b;
    transition: all 0.2s ease;
    border-radius: 0.5rem;
  }
  .react-datepicker__day:hover {
    background-color: #eff6ff;
    color: #2563eb;
  }
  .react-datepicker__day--selected, .react-datepicker__day--keyboard-selected {
    background: linear-gradient(to right, #4f46e5, #2563eb, #06b6d4) !important;
    color: #fff !important;
    font-weight: bold;
  }
  .react-datepicker__day--disabled {
    color: #cbd5e1;
  }
  .react-datepicker__navigation-icon::before {
    border-color: #64748b;
  }
  .react-datepicker__triangle {
    display: none;
  }
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
}

interface AddTaskProps {
    addTaskBtnClicked: boolean;
    setAddTaskBtnClicked: (value: boolean) => void;
    toggleButtonRef: React.RefObject<HTMLButtonElement>;
}

// FIX: Helper defined outside or before state init
const getToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0); // Normalize to Midnight
    return d;
}

function AddTask({addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef}: AddTaskProps) {
  const { username } = useAuth();
  const { data: users = [] } = useUsers();
  const createTaskMutation = useAddCreatedTask();

  const filteredUsers = users.filter((user: User) => user.name !== username);

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [assignedUserId, setAssignedUserId] = useState("");

  // FIX: Initialize with getToday() instead of new Date() to avoid time mismatches
  const [dueDate, setDueDate] = useState<Date | null>(getToday());
  const [daysInput, setDaysInput] = useState<number | string>(1);

  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isPriorityOpen, setIsPriorityOpen] = useState(false);
  const [isDaysOpen, setIsDaysOpen] = useState(false);
  
  const addTaskRef = useRef<HTMLFormElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const priorityDropdownRef = useRef<HTMLDivElement>(null);
  const daysDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filteredUsers.length > 0 && !assignedUserId) {
      setAssignedUserId(filteredUsers[0]._id);
    }
  }, [filteredUsers, assignedUserId]);

  const getAssignedUserName = () => {
      const user = users.find((u: User) => u._id === assignedUserId);
      return user ? user.name : "Select User";
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;

      if (userDropdownRef.current && !userDropdownRef.current.contains(target)) {
        setIsUserOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(target)) {
        setIsPriorityOpen(false);
      }
      if (daysDropdownRef.current && !daysDropdownRef.current.contains(target)) {
        setIsDaysOpen(false);
      }

      if (!addTaskBtnClicked) return;
      if (!addTaskRef.current) return;
      if (addTaskRef.current.contains(target)) return;
      if (toggleButtonRef.current && toggleButtonRef.current.contains(target)) return;
      if ((target as Element).closest && (target as Element).closest('.react-datepicker-popper')) return;

      setAddTaskBtnClicked(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [addTaskBtnClicked, setAddTaskBtnClicked, toggleButtonRef]);


  const updateDateFromDays = (days: number) => {
      const newDate = getToday();
      newDate.setDate(newDate.getDate() + (days - 1));
      setDueDate(newDate);
  }

  const handleDateChange = (date: Date | null) => {
    // FIX: Normalize selected date to midnight before calculation
    if (date) date.setHours(0, 0, 0, 0);
    
    setDueDate(date);
    if (date) {
        const today = getToday();
        const diffTime = date.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        setDaysInput(diffDays + 1); // 0 diff + 1 = 1 Day (Today)
    } else {
        setDaysInput("");
    }
  };

  const handleDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setDaysInput(e.target.value);

    if (!isNaN(val) && val > 0) {
        updateDateFromDays(val);
    } else {
        setDueDate(null);
    }
  };

  const handlePresetSelect = (days: number) => {
      setDaysInput(days);
      updateDateFromDays(days);
      setIsDaysOpen(false);
  };


  const taskCreator = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title || !assignedUserId) {
      // 2. Updated Validation Toast
      toast.error("Please fill in the Task Title and Assign a User.");
      return;
    }

    const newTask = {
      title: title,
      priority: priority,
      assignedTo: assignedUserId,
      status: "To Do",
      dueDate: dueDate ? dueDate.toISOString() : new Date().toISOString(),
      createdBy: username
    };

    // 3. Start Loading Toast
    const toastId = toast.loading("Creating Task...");

    createTaskMutation.mutate(newTask, {
      onSuccess: () => {
        // 4. Update Toast to Success
        toast.success("Task created successfully!", { id: toastId });
        
        setAddTaskBtnClicked(false);

        setTitle("");
        setPriority("Medium");
        setDueDate(getToday());
        setDaysInput(1);
        if (filteredUsers.length > 0) {
            setAssignedUserId(filteredUsers[0]._id);
        } else {
            setAssignedUserId("");
        }
      },
      onError: (err: any) => {
        // 5. Update Toast to Error
        toast.error(err.message || "Failed to create task.", { id: toastId });
      }
    });
  };

  return (
    <>
    <style>{customDatepickerStyles}</style>
      <form ref={addTaskRef} onSubmit={taskCreator} className={`absolute top-40 right-0 rounded-2xl bg-white/95 backdrop-blur-md z-20 
                        grid grid-cols-5 gap-y-4 gap-x-2 shadow-2xl shadow-slate-300/50 border border-slate-200/70
                        transition-all duration-400 ease-in-out
                        ${addTaskBtnClicked? 'w-150 h-100 py-8 px-10 opacity-100 visible overflow-visible': 'w-32 h-0 p-0 opacity-0 invisible overflow-hidden'} `}>
            <h1 className="col-span-5 text-slate-800 font-bold text-2xl text-center">Create a Task</h1>
            
            <label className="col-span-1 font-bold text-slate-700" htmlFor="title">Task Title: </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-4 border border-slate-200 rounded-xl text-slate-800 px-3 py-1 h-fit outline-none bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
              type="text"
              placeholder="e.g. Fix Login Bug"
              required />
            
            <label className="col-span-1 font-bold text-slate-700 flex items-center" htmlFor="priority">Priority: </label>
            <div className="col-span-4 relative" ref={priorityDropdownRef}>
            
            <div 
                onClick={() => setIsPriorityOpen(!isPriorityOpen)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-slate-50/50 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors"
            >
                <span className={'text-slate-800 font-medium'}>{priority}</span>
                <IoIosArrowDown className={`text-slate-500 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`} />
            </div>

            {isPriorityOpen && (
                <ul className="absolute top-full left-0 w-full mt-1 overflow-hidden bg-white rounded-xl shadow-xl border border-slate-200/70 z-50">
                      <li onClick={() => { setPriority("Urgent"); setIsPriorityOpen(false); }} 
                          className="px-4 py-2 cursor-pointer bg-rose-50 text-rose-600 font-bold hover:bg-rose-100 transition-colors border-b border-rose-100">
                          Urgent
                      </li>
                      <li onClick={() => { setPriority("High"); setIsPriorityOpen(false); }} 
                          className="px-4 py-2 cursor-pointer bg-amber-50 text-amber-600 font-bold hover:bg-amber-100 transition-colors border-b border-amber-100">
                          High
                      </li>
                      <li onClick={() => { setPriority("Medium"); setIsPriorityOpen(false); }} 
                          className="px-4 py-2 cursor-pointer bg-yellow-50 text-yellow-600 font-bold hover:bg-yellow-100 transition-colors border-b border-yellow-100">
                          Medium
                      </li>
                      <li onClick={() => { setPriority("Low"); setIsPriorityOpen(false); }} 
                          className="px-4 py-2 cursor-pointer bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-colors">
                          Low
                      </li>
                </ul>
            )}
        </div>
            
            <label className="col-span-1 font-bold text-slate-700 flex items-center">Assign To: </label>
        <div className="col-span-4 relative" ref={userDropdownRef}>
            <div 
                onClick={() => setIsUserOpen(!isUserOpen)}
                className="w-full border border-slate-200 rounded-xl text-slate-800 px-3 py-2 bg-slate-50/50 cursor-pointer flex justify-between items-center hover:bg-slate-100 transition-colors font-medium"
            >
                <span>{getAssignedUserName() || "Select User"}</span>
                <IoIosArrowDown className={`text-slate-500 transition-transform ${isUserOpen ? 'rotate-180' : ''}`} />
            </div>

            {isUserOpen && (
                <ul className="absolute top-full left-0 w-full mt-1 max-h-40 overflow-y-auto bg-white rounded-xl shadow-xl border border-slate-200/70 z-50">
                    {filteredUsers.length === 0 ? (
                         <li className="px-4 py-2 text-slate-500 text-sm">No other users found...</li>
                    ) : (
                        filteredUsers.map((user: User) => (
                            <li 
                                key={user._id}
                                onClick={() => {
                                    setAssignedUserId(user._id);
                                    setIsUserOpen(false);
                                }}
                                className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 flex justify-between items-center border-b border-slate-100 last:border-0"
                            >
                                <span className="font-semibold text-slate-800">{user.name}</span>
                                <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                    {user.role}
                                </span>
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
        
        <label className="col-span-1 font-bold text-slate-700 flex items-center">Due Date: </label>
        <div className="col-span-2">
             <DatePicker 
                selected={dueDate} 
                onChange={handleDateChange}
                minDate={new Date()}
                dateFormat="MM/dd/yyyy"
                className="w-full border border-slate-200 rounded-xl text-slate-800 px-3 py-2 outline-none bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all cursor-pointer"
                wrapperClassName="w-full"
                placeholderText="Select a due date"
                showPopperArrow={false}
             />
        </div>
        <label className="col-span-1 font-bold text-slate-700 flex items-center" htmlFor="days">No of Days:</label>
        <div className="col-span-1 relative" ref={daysDropdownRef}>
             <div className="w-full h-full flex items-center border border-slate-200 rounded-xl bg-slate-50/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition-all">
                <input 
                    type="number" 
                    min="1"
                    placeholder="Days"
                    value={daysInput}
                    onChange={handleDaysChange}
                    className="w-full h-full bg-transparent text-slate-800 pl-3 outline-none text-center font-bold" 
                />
                <div 
                    onClick={() => setIsDaysOpen(!isDaysOpen)}
                    className="h-full px-2 flex items-center cursor-pointer border-l border-slate-200 hover:bg-slate-100 rounded-r-xl transition-colors"
                >
                    <IoIosArrowDown className={`text-slate-500 text-xs transition-transform ${isDaysOpen ? 'rotate-180' : ''}`} />
                </div>
             </div>

             {isDaysOpen && (
                 <ul className="absolute top-full right-0 w-40 mt-1 bg-white rounded-xl shadow-xl border border-slate-200/70 z-50 overflow-hidden">
                     <li onClick={() => handlePresetSelect(7)} 
                         className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium border-b border-slate-100 flex justify-between">
                         <span>1 Week</span> <span className="text-slate-400 text-sm">7</span>
                     </li>
                     <li onClick={() => handlePresetSelect(15)} 
                         className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium border-b border-slate-100 flex justify-between">
                         <span>Half Month</span> <span className="text-slate-400 text-sm">15</span>
                     </li>
                     <li onClick={() => handlePresetSelect(30)} 
                         className="px-4 py-2 hover:bg-blue-50 cursor-pointer text-slate-800 font-medium flex justify-between">
                         <span>1 Month</span> <span className="text-slate-400 text-sm">30</span>
                     </li>
                 </ul>
             )}
        </div>
        <button
              disabled={createTaskMutation.isPending} 
              className="col-span-3 col-start-2 rounded-full font-bold text-white text-xl text-center bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-blue-500/30 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed">
                {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
        </button>
        </form>
    </>
  )
}

export default AddTask;