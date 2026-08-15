import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { FaCrown } from "react-icons/fa";
import { getRoleBadgeClass } from "../../lib/hierarchyStyles";

export interface HierarchyNodeFields {
  name: string;
  role: string;
  designation: string;
  isRoot: boolean;
  isIndependent: boolean;
  isPendingParent: boolean;
  [key: string]: unknown;
}

function HierarchyNode({ data }: NodeProps) {
  const { name, role, designation, isRoot, isIndependent, isPendingParent } =
    data as unknown as HierarchyNodeFields;

  return (
    <div
      className={`relative min-w-[190px] rounded-2xl bg-white px-4 py-3 border shadow-sm transition-all duration-200
        ${isPendingParent
          ? "border-blue-400 ring-2 ring-blue-400 shadow-lg shadow-blue-500/20"
          : isRoot
          ? "border-indigo-200 ring-2 ring-indigo-200 ring-offset-2"
          : isIndependent
          ? "border-dashed border-slate-300"
          : "border-slate-200/70"
        }`}
    >
      {/* Invisible anchors so React Flow can compute edge attachment points —
          not manually connectable, connections are made via node clicks. */}
      <Handle type="target" position={Position.Top} isConnectable={false} style={{ visibility: "hidden" }} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} style={{ visibility: "hidden" }} />

      {isRoot && (
        <div className="absolute -top-2.5 -right-2.5 p-1.5 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 text-white shadow-sm">
          <FaCrown size={10} />
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <img
          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`}
          alt=""
          className="w-8 h-8 rounded-full ring-2 ring-white shadow-sm shrink-0"
        />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{name}</p>
          <p className="text-xs text-slate-500 truncate">{designation}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-2.5">
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getRoleBadgeClass(role)}`}>
          {role}
        </span>
        {isIndependent && !isRoot && (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
            Unconnected
          </span>
        )}
      </div>
    </div>
  );
}

export default memo(HierarchyNode);