import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, type EdgeProps } from "@xyflow/react";
import { FaUnlink, FaTrashAlt, FaLock } from "react-icons/fa";

export interface HierarchyEdgeFields {
  isSelected: boolean;
  canManage: boolean; // false when this edge touches the Admin node and the viewer isn't a real Admin
  onEdit: () => void;
  onDelete: () => void;
  [key: string]: unknown;
}

function HierarchyEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps) {
  const { isSelected, canManage, onEdit, onDelete } = (data ?? {}) as unknown as HierarchyEdgeFields;

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: isSelected ? "#2563eb" : "#cbd5e1",
          strokeWidth: isSelected ? 2.5 : 1.5,
        }}
      />
      {isSelected && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: "all",
            }}
            className="flex items-center gap-1.5 bg-white rounded-full shadow-lg border border-slate-200/70 p-1"
          >
            {canManage ? (
              <>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Remove just this connection — anything below stays connected"
                >
                  <FaUnlink size={10} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:shadow-md hover:shadow-rose-500/30 transition-all cursor-pointer"
                  title="Remove this connection and everything below it"
                >
                  <FaTrashAlt size={10} />
                  Delete
                </button>
              </>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500">
                <FaLock size={10} />
                Only an Admin can edit this
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

export default HierarchyEdge;