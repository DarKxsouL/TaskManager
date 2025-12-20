import { useState, useEffect } from "react"
import { IoMdSearch, IoIosArrowDown, IoMdNotificationsOutline  } from "react-icons/io"
import { NavLink, useNavigate, useLocation } from "react-router-dom"
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../services/firebase";
import { useSearch } from "../context/SearchContext";

function Navbar() {
    const { searchQuery, setSearchQuery } = useSearch();
    const [profileMenuOpen, setProfileMenuOpen] = useState(false)
    const [username, setUsername] = useState("User");
    const [userPath, setUserPath] = useState("/user"); // Default fallback path

    const [searchCategory, setSearchCategory] = useState("Tasks");

    const navigate = useNavigate();
    const location = useLocation();
    const notification = 20

    useEffect(() => {
        const path = location.pathname;
        setSearchQuery("");

        if (path.endsWith('/network')) {
            setSearchCategory("Users");
        } else if (path.endsWith('/history')) {
            setSearchCategory("History");
        } else {
            // Default to Tasks for Dashboard or any other page
            setSearchCategory("Tasks");
        }
    }, [location.pathname, setSearchQuery]);

    useEffect(() => {
        // Listen for authentication state changes
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // Get display name, fallback to 'User' if empty
                const name = user.displayName || "User";
                setUsername(name);
                
                // Create a URL-friendly version of the name for the path
                const pathName = name.replace(/\s+/g, ''); 
                setUserPath(`/${pathName}`);
            } else {
                setUsername("User");
                setUserPath("/userId");
            }
        });

        return () => unsubscribe();
    }, []);

    const ProfileOpener = () => {
        setProfileMenuOpen(!profileMenuOpen)
    }

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error signing out: ", error);
        }
    }


  return (
    <>
      <div className="w-dvw fixed top-0 z-50 flex justify-between items-center px-20 py-5 bg-white/60 text-black backdrop-blur-sm border-b-2 border-gray-300">

        <div className="flex items-center gap-x-2">
          {/* You might want to update this image source */}
          
          <NavLink to={userPath} className="text-2xl font-bold text-black">
            <img className="w-auto h-12 bg-cover" src="/TaskFlowLogo.png" alt="Logo" />
          </NavLink>
        </div>

        <div className="flex border-gray-300 border-2 shadow-sm items-center rounded-md bg-gray-200 px-2">
            <IoMdSearch color="gray" className="cursor-pointer"/>
            <input 
                type="search" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${searchCategory}...`}
                className="text-black border-r-1 border-dashed border-gray-400 px-1 py-1 outline-none w-100 bg-transparent"
                 />
            <select 
                name="searchCategory" 
                id="searchCategory" 
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="bg-gray-200 text-black outline-none p-1 rounded-md cursor-pointer"> 
                <option value="Tasks">Tasks</option>
                <option value="Users">Users</option>
                {/* <option value="History">History</option> */}
            </select>
        </div>

        <div className="flex gap-x-4 relative items-center">
            <div className="flex items-center p-2 relative cursor-pointer">
                <IoMdNotificationsOutline color="gray" size={25} className="cursor-pointer"/>
                { /* Notification Badge */ }
                <div className="p-[2px] w-6 h-6 text-center text-xs bg-red-500 rounded-full text-white absolute -top-1 -right-1 border-2 border-white flex items-center justify-center font-bold">{notification}</div>
            </div>
            
            <div className="flex p-2 items-center bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition-colors"
                onClick={() => ProfileOpener()}
            >
                <img 
                    src={`https://ui-avatars.com/api/?name=${username}&background=random`} 
                    alt="avatar" 
                    className="rounded-full w-6 h-6" 
                />
                <span className="ml-2 text-black font-medium">{username}</span>
                <IoIosArrowDown color="gray" size={20} 
                    className={` ml-1 transition-transform duration-300
                                ${profileMenuOpen ? 'rotate-180' : ''}`} />
            </div>

            { /* Profile Dropdown Menu */ }
            <div className={`w-60 absolute top-14 z-10 -right-0
                             overflow-hidden rounded-bl-xl rounded-br-xl
                             bg-black/90 transition-all duration-400 ease-in-out
                             shadow-xl backdrop-blur-md
                             ${profileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                             `}>
                <div className="flex flex-col text-white relative w-full h-full">
                    {/* Dynamic Links using userPath */}
                    <NavLink onClick={() => setProfileMenuOpen(false)} to={userPath} end   className={({ isActive }) => `text-left text-lg font-semibold border-b border-gray-600 px-6 py-3  ${isActive ? 'text-blue-400 bg-white/10': 'hover:bg-white/10'}`}>Dashboard</NavLink>
                    <NavLink onClick={() => setProfileMenuOpen(false)} to={`${userPath}/profile`}  className={({ isActive }) => `text-left text-lg font-semibold border-b border-gray-600 px-6 py-3  ${isActive ? 'text-blue-400 bg-white/10': 'hover:bg-white/10'}`}>Profile</NavLink>
                    <NavLink onClick={() => setProfileMenuOpen(false)} to={`${userPath}/network`}  className={({ isActive }) => `text-left text-lg font-semibold border-b border-gray-600 px-6 py-3  ${isActive ? 'text-blue-400 bg-white/10': 'hover:bg-white/10'}`}>Network</NavLink>
                    {/* <NavLink onClick={() => setProfileMenuOpen(false)} to={`${userPath}/history`}  className={({ isActive }) => `text-left text-lg font-semibold border-b border-gray-600 px-6 py-3  ${isActive ? 'text-blue-400 bg-white/10': 'hover:bg-white/10'}`}>History</NavLink> */}
                    <NavLink onClick={() => setProfileMenuOpen(false)} to={`${userPath}/settings`} className={({ isActive }) => `text-left text-lg font-semibold border-b border-gray-600 px-6 py-3  ${isActive ? 'text-blue-400 bg-white/10': 'hover:bg-white/10'}`}>Settings</NavLink>
                    
                    <button onClick={handleLogout} className="w-full text-left text-lg font-semibold text-red-400 px-6 py-3 hover:bg-white/10 transition-colors">Logout</button>
                </div>
            </div>
        </div>
      </div>
    </>
  )
}

export default Navbar