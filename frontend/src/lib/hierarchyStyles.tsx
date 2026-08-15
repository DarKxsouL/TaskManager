export const isAdminTier = (role: string): boolean => role === 'Admin' || role === 'CEO';

export const getRoleBadgeClass = (role: string): string => {
  switch (role) {
    case 'Admin':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'CEO':
      return 'bg-violet-50 text-violet-700 border-violet-200';
    default:
      return 'bg-slate-100 text-slate-600 border-slate-200';
  }
};

const GRID_COLUMNS = 5;
const GRID_CELL_WIDTH = 220;
const GRID_CELL_HEIGHT = 150;
const GRID_START_Y = 560; // sits below where a typical small org tree settles

// Nodes that have never been dragged (hierarchyPosition.x/y still null) get
// arranged in a stable grid rather than stacking at (0,0). Stable means:
// same node always lands in the same grid cell across renders, so the
// layout doesn't jitter as the query refetches — callers should sort their
// id list identically every time (e.g. by _id) before calling this.
export const getFallbackPosition = (indexAmongUnpositioned: number): { x: number; y: number } => {
  const col = indexAmongUnpositioned % GRID_COLUMNS;
  const row = Math.floor(indexAmongUnpositioned / GRID_COLUMNS);
  return {
    x: 80 + col * GRID_CELL_WIDTH,
    y: GRID_START_Y + row * GRID_CELL_HEIGHT,
  };
};