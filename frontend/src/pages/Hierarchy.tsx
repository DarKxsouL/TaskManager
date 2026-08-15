import { useState, useEffect, useCallback } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  type OnNodeDrag,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FaSitemap, FaLock } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import {
  useHierarchy,
  useCanViewHierarchy,
  useCanEditHierarchy,
  useUpdateHierarchyPosition,
  useCreateHierarchyConnection,
  useDetachHierarchyConnection,
  useDeleteHierarchyConnection,
} from "../hooks/useData";
import HierarchyNode, { type HierarchyNodeFields } from "../components/hierarchy/HierarchyNode";
import HierarchyEdge, { type HierarchyEdgeFields } from "../components/hierarchy/HierarchyEdge";
import ConfirmModal from "../components/ConfirmModal";
import { isAdminTier, getFallbackPosition } from "../lib/hierarchyStyles";
import { socket } from "../components/SocketManager";

// Declared outside the component — React Flow warns (and re-renders more
// than necessary) if nodeTypes/edgeTypes are recreated on every render.
const nodeTypes = { hierarchyNode: HierarchyNode };
const edgeTypes = { hierarchyEdge: HierarchyEdge };

function HierarchyCanvas() {
  const { isAdmin: isTrueAdmin } = useAuth();
  const canView = useCanViewHierarchy();
  const canEdit = useCanEditHierarchy();
  const queryClient = useQueryClient();
  const { fitView } = useReactFlow();

  const { data: rawNodes, isLoading, isError } = useHierarchy();
  const updatePosition = useUpdateHierarchyPosition();
  const createConnection = useCreateHierarchyConnection();
  const detachConnection = useDetachHierarchyConnection();
  const deleteConnection = useDeleteHierarchyConnection();

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [pendingParentId, setPendingParentId] = useState<string | null>(null);
  const [selectedEdgeChildId, setSelectedEdgeChildId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ childId: string; childName: string } | null>(null);
  const [hasFitOnce, setHasFitOnce] = useState(false);

  // Someone else on the team moved a node or changed a connection — refetch.
  useEffect(() => {
    const handleHierarchyUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["hierarchy"] });
    };
    socket.on("hierarchy-updated", handleHierarchyUpdate);
    return () => {
      socket.off("hierarchy-updated", handleHierarchyUpdate);
    };
  }, [queryClient]);

  // Escape clears whatever's mid-selection (pending parent or a selected edge)
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingParentId(null);
        setSelectedEdgeChildId(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const clearSelection = useCallback(() => {
    setPendingParentId(null);
    setSelectedEdgeChildId(null);
  }, []);

  const handleEdit = useCallback(
    (childId: string) => {
      detachConnection.mutate(childId, {
        onSuccess: () => toast.success("Connection removed."),
        onError: (err: unknown) =>
          toast.error(err instanceof Error ? err.message : "Could not remove that connection."),
      });
      clearSelection();
    },
    [detachConnection, clearSelection]
  );

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return;
    deleteConnection.mutate(deleteTarget.childId, {
      onSuccess: () => toast.success("Connection and everything below it removed."),
      onError: (err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not remove that connection."),
    });
    setDeleteTarget(null);
    clearSelection();
  }, [deleteTarget, deleteConnection, clearSelection]);

  // Rebuild the React Flow node/edge arrays whenever fresh data (or
  // selection state, which affects highlighting) changes.
  useEffect(() => {
    if (!rawNodes) return;

    // Stable ordering so the fallback grid never jitters between refetches.
    const sorted = [...rawNodes].sort((a, b) => a._id.localeCompare(b._id));
    const nodeById = new Map(sorted.map((n) => [n._id, n]));
    let unpositionedIndex = 0;

    const nextNodes: Node[] = sorted.map((n) => {
      const hasStoredPosition = n.hierarchyPosition?.x != null && n.hierarchyPosition?.y != null;
      const position = hasStoredPosition
        ? { x: n.hierarchyPosition.x as number, y: n.hierarchyPosition.y as number }
        : getFallbackPosition(unpositionedIndex++);

      const fields: HierarchyNodeFields = {
        name: n.name,
        role: n.role,
        designation: n.designation,
        isRoot: isAdminTier(n.role),
        isIndependent: !n.hierarchyParent && !isAdminTier(n.role),
        isPendingParent: n._id === pendingParentId,
      };

      return {
        id: n._id,
        type: "hierarchyNode",
        position,
        data: fields as unknown as Record<string, unknown>,
        draggable: canEdit,
      };
    });

    const nextEdges: Edge[] = sorted
      .filter((n) => !!n.hierarchyParent)
      .map((n) => {
        const parent = nodeById.get(n.hierarchyParent as string);
        const parentIsAdminTier = parent ? isAdminTier(parent.role) : false;
        const canManageThisEdge = canEdit && (!parentIsAdminTier || isTrueAdmin);
        const isSelected = n._id === selectedEdgeChildId;

        const fields: HierarchyEdgeFields = {
          isSelected,
          canManage: canManageThisEdge,
          onEdit: () => handleEdit(n._id),
          onDelete: () => setDeleteTarget({ childId: n._id, childName: n.name }),
        };

        return {
          id: `e-${n._id}`,
          source: n.hierarchyParent as string,
          target: n._id,
          type: "hierarchyEdge",
          data: fields as unknown as Record<string, unknown>,
          selectable: canEdit,
          zIndex: isSelected ? 1 : 0,
        };
      });

    setNodes(nextNodes);
    setEdges(nextEdges);

    if (!hasFitOnce && nextNodes.length > 0) {
      setHasFitOnce(true);
      requestAnimationFrame(() => fitView({ padding: 0.2, duration: 300 }));
    }
    // rawNodes and the handful of selection/permission flags above are the
    // only things that should rebuild the graph — setNodes/setEdges/fitView
    // identities are stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawNodes, pendingParentId, selectedEdgeChildId, canEdit, isTrueAdmin]);

  const handleNodeClick: NodeMouseHandler = useCallback(
    (_event, node) => {
      if (!canEdit) return;
      setSelectedEdgeChildId(null); // picking a node cancels any pending edge selection

      const clicked = (rawNodes ?? []).find((n) => n._id === node.id);
      if (!clicked) return;

      // --- Step 1: choosing the parent ---
      if (!pendingParentId) {
        if (isAdminTier(clicked.role) && !isTrueAdmin) {
          toast.error("Only an Admin can create a connection to the Admin node.");
          return;
        }
        setPendingParentId(clicked._id);
        return;
      }

      // Clicking the already-active parent again cancels the selection
      if (clicked._id === pendingParentId) {
        setPendingParentId(null);
        return;
      }

      // --- Step 2: choosing the independent child ---
      if (clicked.hierarchyParent) {
        toast.error("Select an independent node — that one already has a connection.");
        return;
      }
      if (isAdminTier(clicked.role)) {
        toast.error("An Admin can't be placed under another node.");
        return;
      }

      createConnection.mutate(
        { parentId: pendingParentId, childId: clicked._id },
        {
          onSuccess: () => toast.success("Connection created."),
          onError: (err: unknown) =>
            toast.error(err instanceof Error ? err.message : "Could not create that connection."),
        }
      );
      setPendingParentId(null);
    },
    [canEdit, pendingParentId, rawNodes, isTrueAdmin, createConnection]
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_event, edge) => {
      if (!canEdit) return;
      setPendingParentId(null); // picking an edge cancels any pending connection
      setSelectedEdgeChildId((current) => (current === edge.target ? null : edge.target));
    },
    [canEdit]
  );

  const handleNodeDragStop: OnNodeDrag = useCallback(
    (_event, node) => {
      if (!canEdit) return;
      updatePosition.mutate({ userId: node.id, x: node.position.x, y: node.position.y });
    },
    [canEdit, updatePosition]
  );

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
        <div className="p-4 rounded-full bg-slate-50 text-slate-300 mb-4">
          <FaLock size={28} />
        </div>
        <p className="text-slate-600 font-semibold text-lg">You don't have access to this page</p>
        <p className="text-slate-400 text-sm mt-1">Ask an Admin to grant you hierarchy access.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-slate-400">Loading hierarchy...</div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-rose-500">
        Couldn't load the hierarchy. Try refreshing.
      </div>
    );
  }

  return (
    <div className="w-full h-[calc(100vh-220px)] rounded-2xl border border-slate-200/70 bg-white shadow-sm overflow-hidden relative">
      {canEdit && (
        <div className="absolute top-4 left-4 z-10 max-w-md">
          <div className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur border border-slate-200/70 shadow-sm text-xs font-medium text-slate-600">
            {pendingParentId
              ? "Pick an independent node to connect underneath — or click the highlighted node again to cancel."
              : "Click a node to set it as the parent, then click an independent node to connect it."}
          </div>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={clearSelection}
        nodesDraggable={canEdit}
        nodesConnectable={false}
        elementsSelectable={canEdit}
        panOnScroll
        minZoom={0.3}
        maxZoom={1.5}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls showInteractive={false} />
      </ReactFlow>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete this connection?"
        message={`This removes ${deleteTarget?.childName ?? "this node"}'s connection and every connection below it. Nodes above it are not affected.`}
        confirmText="Delete"
        isDanger
        isLoading={deleteConnection.isPending}
      />
    </div>
  );
}

function Hierarchy() {
  return (
    <div className="px-8 md:px-20 pt-40 pb-10">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-sm">
          <FaSitemap size={16} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Team Hierarchy</h1>
      </div>

      <ReactFlowProvider>
        <HierarchyCanvas />
      </ReactFlowProvider>
    </div>
  );
}

export default Hierarchy;