// components/LayoutSkeleton.jsx
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

const LayoutSkeleton = () => {
  // Inline styles for layout structure
  const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
  const flexRow: React.CSSProperties = { display: 'flex', gap: '15px', alignItems: 'center' };
  const subHeaderStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', marginBottom: '25px' };
  const filtersSectionStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' };
  const filterGroupStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };
  const pillsContainerStyle: React.CSSProperties = { display: 'flex', gap: '10px' };
  const taskMetaColumnStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: '8px' };

  // Style for the big gray card container representing the task list item
  const taskCardContainerStyle: React.CSSProperties = {
    backgroundColor: '#e8e8e8', // Slightly darker than base to stand out
    borderRadius: '12px',
    padding: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px'
  };
  const taskCardRightSideStyle: React.CSSProperties = { display: 'flex', gap: '50px' };
  


  return (
    // Using a light theme to match the image background
    <SkeletonTheme baseColor="#dbdbdb" highlightColor="#ededed">
      <div style={{ padding: '20px 80px', backgroundColor: '#f4f4f4', minHeight: '100vh' }}>

        {/* --- HEADER SECTION --- */}
        <div style={headerStyle}>
          {/* Left: Logo area */}
          <div style={flexRow}>
            <Skeleton height={35} width={35} borderRadius={8} /> {/* Logo Icon */}
            <Skeleton height={25} width={100} /> {/* "TaskFlow" Text */}
          </div>

          {/* Center: Search Bar */}
          <Skeleton height={45} width={500} borderRadius={25} />

          {/* Right: User area */}
          <div style={flexRow}>
            <Skeleton circle height={30} width={30} /> {/* Notification Icon */}
            <Skeleton height={35} width={120} borderRadius={20} /> {/* Profile Dropdown */}
          </div>
        </div>


        {/* --- TABS & ACTION BUTTON --- */}
        <div style={subHeaderStyle}>
          <div style={flexRow}>
            {/* "My Assigned Tasks" (Active tab is darker in image, simulated here by size/opacity) */}
            <Skeleton height={40} width={160} borderRadius={8} style={{opacity: 0.8}} />
            {/* "Created by me" */}
            <Skeleton height={40} width={140} borderRadius={8} style={{opacity: 0.5}} />
          </div>
          {/* "Add Task" Button */}
          <Skeleton height={45} width={110} borderRadius={8} />
        </div>


        {/* --- FILTERS SECTION --- */}
        <div style={filtersSectionStyle}>
          {/* Sort By */}
          <div style={filterGroupStyle}>
            <Skeleton width={60} height={15} /> {/* Label */}
            <Skeleton height={40} width={250} borderRadius={8} /> {/* Dropdown */}
          </div>

          {/* Status Pills */}
          <div style={filterGroupStyle}>
            <Skeleton width={50} height={15} /> {/* Label */}
            <div style={pillsContainerStyle}>
               {/* 4 separate pill skeletons */}
               <Skeleton height={30} width={70} borderRadius={20} />
               <Skeleton height={30} width={80} borderRadius={20} />
               <Skeleton height={30} width={70} borderRadius={20} />
               <Skeleton height={30} width={85} borderRadius={20} />
            </div>
          </div>

           {/* Priority Pills */}
           <div style={filterGroupStyle}>
            <Skeleton width={60} height={15} /> {/* Label */}
            <div style={pillsContainerStyle}>
               <Skeleton height={30} width={70} borderRadius={20} />
               <Skeleton height={30} width={60} borderRadius={20} />
               <Skeleton height={30} width={75} borderRadius={20} />
               <Skeleton height={30} width={60} borderRadius={20} />
            </div>
          </div>
        </div>


        {/* --- BIG TASK CARD SECTION --- */}
        {/* render 3 cards */}
        {[1, 2, 3].map((item) => (
        <div key={item} style={taskCardContainerStyle}>
          {/* Left Side: Urgent tag and Title */}
          <div>
            <Skeleton height={25} width={80} borderRadius={20} style={{marginBottom: '20px'}} /> {/* Urgent Pill */}
            <Skeleton height={25} width={350} borderRadius={5} /> {/* Task Title Bar */}
          </div>

          {/* Right Side: Meta Details Columns */}
          <div style={taskCardRightSideStyle}>
            {/* Status Column */}
            <div style={taskMetaColumnStyle}>
               <Skeleton width={50} height={15} /> {/* Label */}
               <Skeleton height={25} width={90} borderRadius={20} /> {/* Status Pill */}
            </div>
             {/* Due Date Column */}
            <div style={taskMetaColumnStyle}>
               <Skeleton width={70} height={15} /> {/* Label */}
               <Skeleton height={15} width={100} borderRadius={5} /> {/* Date text bar */}
            </div>
             {/* Assigned By Column */}
            <div style={taskMetaColumnStyle}>
               <Skeleton width={80} height={15} /> {/* Label */}
               <Skeleton height={15} width={80} borderRadius={5} /> {/* Name text bar */}
            </div>
          </div>
        </div>
        ))}

      </div>
    </SkeletonTheme>
  )
}

export default LayoutSkeleton