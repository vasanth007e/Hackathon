import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Plus, Activity, FileText, AlertTriangle, ChevronRight, Clock, Database, Terminal, ShieldCheck, Zap, Network } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import CreateCaseModal from '@/components/dashboard/CreateCaseModal';

interface Case {
  id: string;
  name: string;
  description: string;
  status: string;
  created_at: string;
}

const MOCK_ACTIVITY = [
  { time: '00:00', load: 12 },
  { time: '04:00', load: 34 },
  { time: '08:00', load: 67 },
  { time: '12:00', load: 45 },
  { time: '16:00', load: 89 },
  { time: '20:00', load: 56 },
  { time: '23:59', load: 78 },
];

export default function Dashboard() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCases(Array.isArray(data) ? data : []);
      } else {
        toast.error(data.error || "Failed to fetch cases");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error fetching cases");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async (caseData: any) => {
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(caseData)
      });
      const newCase = await response.json();
      if (response.ok) {
        setCases([newCase, ...cases]);
        toast.success("WORKSPACE_GEN_SUCCESS", {
          description: `Case ${newCase.id} successfully established.`
        });
        navigate(`/investigation/${newCase.id}`);
      } else {
        toast.error(newCase.error || "Failed to create case");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error creating case");
    }
  };

  const handleSeed = async () => {
    try {
      const response = await fetch('/api/dev/seed', { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}` } 
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("Forensic assets seeded successfully");
        fetchCases();
      } else {
        toast.error(data.error || "Seeding failed");
      }
    } catch (err) {
      toast.error("Network error seeding assets");
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden select-none">
      {/* TACTICAL OVERVIEW TOP BAR */}
      <div className="h-24 border-b border-zinc-900 px-6 flex items-center gap-4 overflow-x-auto no-scrollbar shrink-0 bg-black z-20">
        {[
          { label: "Active_Intel_Threads", value: cases.length, color: "text-primary" },
          { label: "Dissonance_Events", value: "24", color: "text-red-500" },
          { label: "Neural_Sync_Accuracy", value: "94.2%", color: "text-primary/80" },
          { label: "Kernel_Uptime", value: "99.99%", color: "text-zinc-600" },
        ].map((stat, i) => (
          <div key={i} className="min-w-[180px] p-3 bg-zinc-950 border border-zinc-900 hover:border-primary/20 transition-all flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-5 group-hover:opacity-10 transition-opacity">
               <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-widest leading-none">{stat.label}</span>
              <Activity className={cn("w-2.5 h-2.5 transition-colors opacity-50", stat.color)} />
            </div>
            <div className="flex items-baseline space-x-2 mt-2 relative z-10">
              <span className={cn("text-xl font-black italic tracking-tighter leading-none", stat.color)}>{stat.value}</span>
              <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest leading-none">Status_OK</span>
            </div>
          </div>
        ))}
        
        <div className="ml-auto flex items-center space-x-2 pr-2">
          <Button onClick={handleSeed} variant="ghost" className="border border-zinc-900 text-zinc-600 hover:text-primary hover:bg-primary/5 text-[8px] font-black uppercase tracking-[0.2em] h-9 px-4 rounded-none">
            <Database className="w-3 h-3 mr-2" />
            Seed
          </Button>
          <Button onClick={() => setIsModalOpen(true)} className="bg-primary text-black text-[9px] font-black uppercase tracking-[0.2em] h-9 px-6 hover:bg-primary/80 transition-all rounded-none shadow-[0_0_15px_rgba(229,255,0,0.1)]">
            <Plus className="w-3.5 h-3.5 mr-2" />
            New_Case
          </Button>
        </div>
      </div>

      <CreateCaseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateCase} 
      />

      <div className="flex-1 flex overflow-hidden">
        {/* LEFT: ACTIVE CASES LIST */}
        <div className="w-[340px] border-r border-zinc-900 flex flex-col bg-black shrink-0">
          <div className="px-5 py-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/20">
            <div className="flex items-center space-x-2">
              <Terminal className="w-3 h-3 text-primary/60 animate-pulse" />
              <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.2em]">Asset_Registry</span>
            </div>
            <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest bg-black px-1.5 py-0.5 border border-zinc-900">{cases.length} UNT</span>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
               <div className="p-5 space-y-3 opacity-50">
                  {[1,2,3,4].map(i => <div key={i} className="h-16 bg-zinc-900/50 animate-pulse border border-zinc-900" />)}
               </div>
            ) : cases.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-zinc-900">
                <Clock className="w-8 h-8 mb-4 opacity-10" />
                <p className="text-[8px] font-mono uppercase tracking-[0.2em] leading-relaxed">No_Active_Assets<br/>Wait_Signal</p>
              </div>
            ) : (
              cases.map((c) => (
                <div 
                  key={c.id} 
                  onClick={() => navigate(`/investigation/${c.id}`)}
                  className="p-4 border-b border-zinc-900/50 hover:bg-primary/[0.01] cursor-pointer group transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <Zap className="w-2 h-2 text-primary/40" />
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-[0.2em]">ID: {c.id.slice(-6)}</span>
                    <div className="flex items-center space-x-1">
                       <div className="w-0.5 h-0.5 rounded-full bg-primary animate-pulse" />
                       <span className="text-[7px] font-bold text-primary/60 uppercase tracking-widest">Active</span>
                    </div>
                  </div>
                  <h3 className="text-[10px] font-black text-zinc-500 group-hover:text-white transition-colors uppercase tracking-tight truncate mb-3">{c.name}</h3>
                  <div className="flex items-center justify-between mt-auto opacity-30 group-hover:opacity-100 transition-opacity">
                     <div className="flex items-center space-x-3">
                        <div className="flex items-center text-[7px] font-mono text-zinc-700 group-hover:text-zinc-500 uppercase tracking-widest">
                           <Activity className="w-2.5 h-2.5 mr-1 text-zinc-800 group-hover:text-primary/40" /> SEC
                        </div>
                        <div className="flex items-center text-[7px] font-mono text-zinc-700 group-hover:text-zinc-500 uppercase tracking-widest">
                           <FileText className="w-2.5 h-2.5 mr-1 text-zinc-800 group-hover:text-primary/40" /> DAT
                        </div>
                     </div>
                     <ChevronRight className="w-2.5 h-2.5 text-zinc-900 group-hover:text-primary transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CENTER: DASHBOARD INTEL & VISUALS */}
        <div className="flex-1 flex flex-col overflow-hidden bg-zinc-950/10">
          <div className="flex-1 p-6 flex flex-col space-y-6 overflow-y-auto custom-scrollbar no-scrollbar">
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 h-auto xl:h-[260px] shrink-0">
                {/* ACTIVITY CHART */}
                <div className="bg-black border border-zinc-900 p-4 flex flex-col relative overflow-hidden group min-h-[240px] xl:min-h-0">
                  <div className="absolute top-0 left-0 w-full h-[px] bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center space-x-2">
                        <Activity className="w-3 h-3 text-primary/60" />
                        <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Load_Pulse</span>
                     </div>
                     <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">Realtime_Feed</span>
                  </div>
                  <div className="flex-1 min-h-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={MOCK_ACTIVITY}>
                        <defs>
                          <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#e5ff00" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#e5ff00" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 7, fill: '#333', fontFamily: 'monospace' }} 
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #222', fontSize: '9px', fontFamily: 'monospace', borderRadius: '0px' }} 
                          itemStyle={{ color: '#e5ff00' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="load" 
                          stroke="#e5ff00" 
                          strokeWidth={1.5}
                          fillOpacity={1} 
                          fill="url(#colorLoad)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* ALERTS PANEL */}
                <div className="bg-black border border-zinc-900 p-4 flex flex-col relative overflow-hidden">
                   <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center space-x-2">
                         <AlertTriangle className="w-3 h-3 text-red-600/80" />
                         <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Priority_Events</span>
                      </div>
                      <span className="text-[7px] font-mono text-red-500/80 uppercase tracking-widest bg-red-950/20 px-2 py-0.5 border border-red-900/30">2 CRITICAL</span>
                   </div>
                   <div className="space-y-3">
                      <div className="p-2.5 bg-red-950/[0.02] border border-red-900/10 group hover:border-red-600/20 transition-all cursor-pointer">
                         <div className="flex items-center justify-between mb-1.5">
                             <span className="text-[7px] font-mono text-red-500/50 uppercase">DISSONANCE_EVENT</span>
                             <span className="text-[7px] font-mono text-zinc-800 uppercase italic">3m ago</span>
                         </div>
                         <p className="text-[9px] font-mono text-zinc-500 truncate lowercase tracking-tighter group-hover:text-zinc-400 font-medium">Pier-4 reconstruction depth mismatch detected</p>
                      </div>
                      <div className="p-2.5 bg-zinc-950 border border-zinc-900 group hover:border-primary/20 transition-all cursor-pointer">
                         <div className="flex items-center justify-between mb-1.5">
                             <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest">PATH_DRIFT</span>
                             <span className="text-[7px] font-mono text-zinc-800 uppercase italic">15m ago</span>
                         </div>
                         <p className="text-[9px] font-mono text-zinc-500 truncate lowercase tracking-tighter group-hover:text-zinc-400 font-medium">Suspect_01 movement inconsistent with GPS data</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* GLOBAL SYSTEM FEED */}
             <div className="bg-black border border-zinc-900 flex flex-col flex-1 min-h-[300px]">
                <div className="px-5 py-2.5 border-b border-zinc-900 flex items-center justify-between bg-zinc-950/50">
                   <div className="flex items-center space-x-2">
                      <Network className="w-3 h-3 text-primary/30" />
                      <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.3em]">Neural_Processing_log</span>
                   </div>
                   <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                         <span className="w-1 h-1 bg-primary/40 rounded-full animate-pulse" />
                         <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest">Engine: Ready</span>
                      </div>
                   </div>
                </div>
                <div className="p-5 font-mono text-[9px] space-y-1.5">
                   {[
                      { level: 'SUCCESS', type: 'SYB', msg: 'Kernel synced with master vault (v4.2.0).' },
                      { level: 'PROCESS', type: 'OPS', msg: 'Analyzing witness semantic clusters...' },
                      { level: 'INFO', type: 'LOG', msg: 'System check: Status Green across all sectors.' },
                      { level: 'WARN', type: 'EVN', msg: 'Non-linear pathing detected in sector 4A.' },
                      { level: 'PROCESS', type: 'IMG', msg: 'Processing forensic visual reconstruction frames.' },
                   ].map((log, i) => (
                      <div key={i} className="flex items-start space-x-4 group hover:bg-zinc-900/30 transition-all py-0.5">
                         <span className="text-zinc-800 shrink-0 select-none">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                         <span className={cn("w-12 font-black tracking-tighter shrink-0 select-none", 
                            log.level === 'SUCCESS' ? 'text-emerald-900/60' :
                            log.level === 'PROCESS' ? 'text-primary/40' :
                            log.level === 'WARN' ? 'text-red-900' : 'text-zinc-800'
                         )}>{log.type}:</span>
                         <span className="text-zinc-600 uppercase tracking-tight group-hover:text-zinc-400 transition-colors">{log.msg}</span>
                      </div>
                   ))}
                   <div className="flex items-center space-x-4 text-primary/10 animate-pulse pt-2 select-none">
                       <span className="text-zinc-900 shrink-0">[{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                       <span className="w-12 font-black tracking-tighter shrink-0 uppercase">WAIT:</span>
                       <span className="italic uppercase tracking-widest">Listening...</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
