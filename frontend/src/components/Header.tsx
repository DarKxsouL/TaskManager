import { NavLink, useParams } from 'react-router-dom'
import AddTask from './AddTask';
import { useState, useRef } from 'react';

function Header() {
  const [addTaskBtnClicked, setAddTaskBtnClicked] = useState(false);
  const { username } = useParams();

  const buttonRef = useRef<HTMLButtonElement>(null!);

  const basePath = username ? `/${username}` : '/userId';

  return (
    <>
      <div className='flex justify-between items-end h-20 pt-40 mx-20 border-b-2 border-gray-300 overflow-none relative'>
        <div className='flex gap-x-2'>
          <NavLink
            to={basePath} 
            end
            className={({ isActive }) =>
              `w-50 h-10 flex items-center justify-center text-center border-b-2 
              ${isActive
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-800'
              }`
            }
          >
            My Assigned Tasks
          </NavLink>
          <NavLink
            to={`${basePath}/created`} 
            className={({ isActive }) =>
              `w-50 h-10 flex items-center justify-center text-center border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`
            }
          >
            Created by me
          </NavLink>
          <NavLink
            to={`${basePath}/overdue`} 
            className={({ isActive }) =>
              `w-50 h-10 flex items-center justify-center text-center border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`
            }
          >
            Overdued tasks
          </NavLink>
        </div>

        <button ref={buttonRef} onClick={() => setAddTaskBtnClicked(!addTaskBtnClicked)} className='rounded bg-blue-600 px-5 py-2 text-lg text-white font-bold cursor-pointer hover:bg-blue-700 transition-colors'>
          Create Task
        </button>
        <AddTask addTaskBtnClicked = {addTaskBtnClicked} setAddTaskBtnClicked={setAddTaskBtnClicked} toggleButtonRef={buttonRef}/>
      </div>
    </>
  )
}

export default Header;