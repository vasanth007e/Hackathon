import { useCallback, useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'motion/react';
import { User, MapPin, Clock, FileText, Smartphone, AlertTriangle, Link as LinkIcon } from 'lucide-react';

const nodeTypes = {
  investigative: ({ data }: any) => (
    <motion.div 
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`p-3 border bg-black/90 min-w-[160px] shadow-2xl relative transition-all duration-500 ${
        data.isContradiction 
          ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
          : 'border-primary/20 shadow-[0_0_10px_rgba(212,255,0,0.05)] hover:border-primary/60'
      }`}
    >
      <div className="absolute -top-[1px] -left-[1px] w-2 h-2 border-t border-l border-primary/40" />
      <div className="absolute -bottom-[1px] -right-[1px] w-2 h-2 border-b border-r border-primary/40" />
      
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-primary/20 !border-primary/40" />
      
      <div className="flex items-start space-x-3">
        <div className={`p-1.5 rounded transition-colors ${data.isContradiction ? 'bg-red-500/10' : 'bg-primary/5 group-hover:bg-primary/15'}`}>
          {data.type === 'person' && <User className={data.isContradiction ? "w-3.5 h-3.5 text-red-400" : "w-3.5 h-3.5 text-primary"} />}
          {data.type === 'location' && <MapPin className="w-3.5 h-3.5 text-primary" />}
          {data.type === 'timestamp' && <Clock className="w-3.5 h-3.5 text-primary" />}
          {data.type === 'evidence' && <FileText className="w-3.5 h-3.5 text-primary" />}
          {data.type === 'device' && <Smartphone className="w-3.5 h-3.5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-zinc-100 uppercase tracking-tight truncate leading-tight">{data.label}</p>
          <div className="flex items-center mt-1 space-x-1.5">
             <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-900 px-1 border border-zinc-800">{data.type}</span>
             {data.isContradiction && <span className="text-[7px] font-mono text-red-500 uppercase font-black animate-pulse">CONFLICT_DET</span>}
          </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-primary/20 !border-primary/40" />
    </motion.div>
  ),
};

export default function InvestigationGraph({ entities = [], relationships = [] }: any) {
  const initialNodes = useMemo(() => entities.map((e: any, i: number) => ({
    id: e.id,
    type: 'investigative',
    position: { x: (i % 4) * 220 + 50, y: Math.floor(i / 4) * 150 + 50 },
    data: { 
      label: e.label, 
      type: e.type,
      isContradiction: relationships.some((r: any) => r.is_contradiction && (r.source_id === e.id || r.target_id === e.id)) 
    },
  })), [entities, relationships]);

  const initialEdges = useMemo(() => relationships.map((r: any) => ({
    id: r.id,
    source: r.source_id,
    target: r.target_id,
    label: r.type,
    labelStyle: { fill: r.is_contradiction ? '#ef4444' : '#d4ff00', fontSize: 8, fontWeight: 700, textTransform: 'uppercase' },
    labelBgPadding: [4, 2],
    labelBgStyle: { fill: '#000', fillOpacity: 0.8 },
    animated: true,
    style: { 
      strokeWidth: r.is_contradiction ? 2 : 1, 
      stroke: r.is_contradiction ? '#ef4444' : '#d4ff00',
      opacity: r.is_contradiction ? 1 : 0.3
    },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: r.is_contradiction ? '#ef4444' : '#d4ff00',
    },
  })), [relationships]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state with props
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="h-full w-full bg-black">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#111" gap={30} size={1} variant="lines" className="opacity-20" />
        <Controls className="!bg-black !border-zinc-800 !fill-primary scale-75 origin-bottom-left" />
        <Panel position="top-right" className="bg-black/90 border border-zinc-800 p-2 text-[8px] font-mono text-zinc-500 uppercase tracking-[0.3em] flex items-center space-x-2">
           <LinkIcon className="w-3 h-3 text-primary animate-pulse" />
           <span>Intelligence Graph Link Sync: ACTIVE</span>
        </Panel>
      </ReactFlow>
    </div>
  );
}
