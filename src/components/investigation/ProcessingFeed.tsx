import { useEffect, useState, useRef } from 'react';
import { Socket } from 'socket.io-client';
import { Terminal, Cpu, Database, Network, Activity } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Log {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  level: 'info' | 'warn' | 'success' | 'process';
}

export default function ProcessingFeed({ caseId, socket }: { caseId: string, socket: Socket | null }) {
  const [logs, setLogs] = useState<Log[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial logs
    setLogs([
      { id: '1', type: 'SYS_INT', message: `Kernel v4.2.1 initialized for Case_${caseId.slice(-4)}`, timestamp: new Date().toLocaleTimeString(), level: 'success' },
      { id: '2', type: 'NEURAL', message: 'Gemini-3-Pro context injection complete. reasoning_depth: HIGH', timestamp: new Date().toLocaleTimeString(), level: 'process' },
      { id: '3', type: 'VECTOR', message: 'ChromaDB collection synchronized (1,280 vectors)', timestamp: new Date().toLocaleTimeString(), level: 'info' },
    ]);

    if (!socket) return;

    const handleProcessing = (data: any) => {
      const timestamp = new Date().toLocaleTimeString();
      const newLogs: Log[] = [
        { id: Math.random().toString(), type: 'INTAKE', message: `INGESTING evidence_unit: ${data.title}`, timestamp, level: 'process' },
      ];
      setLogs(prev => [...prev.slice(-40), ...newLogs]);

      // Add simulated detailed steps for better visual feedback as requested
      const steps = [
        { type: 'OCR', msg: 'EXTRACTING ENTITIES AND METADATA...', delay: 800 },
        { type: 'TIME', msg: 'PARSING TEMPORAL SIGNATURES...', delay: 1600 },
        { type: 'GRAPH', msg: 'BUILDING RELATIONSHIP CLUSTERS...', delay: 2400 },
        { type: 'ANALYSIS', msg: 'RUNNING CONTRADICTION ENGINE...', delay: 3200 },
        { type: 'MODEL', msg: 'GENERATING SIMULATION SCENARIOS...', delay: 4000 }
      ];

      steps.forEach(step => {
        setTimeout(() => {
          setLogs(prev => [...prev.slice(-49), {
            id: Math.random().toString(),
            type: step.type,
            message: step.msg,
            timestamp: new Date().toLocaleTimeString(),
            level: 'info'
          }]);
        }, step.delay);
      });
    };

    const handleUpdate = (data: any) => {
      setLogs(prev => [...prev.slice(-49), {
        id: Math.random().toString(),
        type: 'SYNC',
        message: 'NEURAL CONTEXT SYNCHRONIZED. FORENSIC CORE READY.',
        timestamp: new Date().toLocaleTimeString(),
        level: 'success'
      }]);
    };

    socket.on(`case:${caseId}:processing`, handleProcessing);
    socket.on(`case:${caseId}:update`, handleUpdate);
    return () => { 
      socket.off(`case:${caseId}:processing`, handleProcessing);
      socket.off(`case:${caseId}:update`, handleUpdate);
    };
  }, [caseId, socket]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="flex-1 flex flex-col h-full bg-black border-zinc-900">
      <div className="px-4 h-8 border-b border-zinc-900 flex items-center justify-between bg-zinc-950 shadow-lg">
         <div className="flex items-center space-x-3">
            <Activity className="w-3 h-3 text-primary animate-pulse" />
            <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Operational_Intel_Stream</span>
         </div>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1.5 grayscale opacity-50">
               <Cpu className="w-2.5 h-2.5 text-primary" />
               <span className="text-[8px] font-mono text-zinc-700 uppercase">LOAD: 0.12</span>
            </div>
            <div className="flex items-center space-x-1.5">
               <Network className="w-2.5 h-2.5 text-primary/40" />
               <span className="text-[8px] font-mono text-zinc-700 uppercase">SYNC: STABLE</span>
            </div>
         </div>
      </div>
      
      <ScrollArea className="flex-1 p-4 font-mono text-[10px] leading-relaxed custom-scrollbar opacity-70" viewportRef={scrollRef}>
        <div className="space-y-1.5">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start space-x-4 group border-l border-transparent hover:border-primary/20 hover:bg-primary/[0.02] pl-2 transition-all">
              <span className="text-zinc-800 shrink-0 select-none">[{log.timestamp}]</span>
              <span className={`shrink-0 w-20 ${
                log.level === 'success' ? 'text-emerald-600' : 
                log.level === 'warn' ? 'text-red-600' :
                log.level === 'process' ? 'text-primary' : 'text-zinc-700'
              } font-black tracking-tighter`}>
                {log.type}:
              </span>
              <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors uppercase truncate">{log.message}</span>
            </div>
          ))}
          <div className="flex items-center space-x-4 text-primary/30 mt-4">
             <span className="text-zinc-900 shrink-0 select-none">[{new Date().toLocaleTimeString()}]</span>
             <span className="shrink-0 w-20 font-black tracking-tighter uppercase">DAEMON:</span>
             <span className="italic uppercase animate-pulse">Monitoring temporal drift / awaiting intake...</span>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
