import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  FileText, Search, Plus, Activity, 
  ChevronRight, Clock, ShieldCheck, 
  Database, Terminal, Zap, Network,
  AlertTriangle, Filter
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Case {
  id: string;
  name: string;
  status: 'active' | 'closed' | 'archived';
  created_at: string;
  last_activity: string;
  priority: 'low' | 'medium' | 'high';
}

export default function Investigations() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
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
        setCases(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Tactical link failure: Could not reach case repository');
    } finally {
      setLoading(false);
    }
  };

  const createCase = async () => {
    const name = prompt("Enter Investigation Thread Name:");
    if (!name) return;

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });
      const data = await response.json();
      if (response.ok) {
        toast.success('Investigation core initialized');
        fetchCases();
      }
    } catch (err) {
      toast.error('Initialization failure');
    }
  };

  return (
    <div className="h-full flex flex-col bg-black select-none">
      <div className="p-8 border-b border-zinc-900 bg-zinc-950/20 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <Terminal className="w-4 h-4 text-primary animate-pulse" />
            <h2 className="text-[11px] font-mono text-zinc-600 uppercase tracking-[0.4em]">Asset_Registry_Full_Manifest</h2>
          </div>
          <p className="text-[10px] font-mono text-zinc-800 uppercase tracking-widest leading-loose">
            Accessing all active intelligence threads in primary storage.
          </p>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex items-center bg-zinc-900/50 border border-zinc-800 p-1 px-3">
              <Search className="w-3.5 h-3.5 text-zinc-700 mr-2" />
              <input 
                type="text" 
                placeholder="RECON_ID_FILTER..." 
                className="bg-transparent border-none focus:ring-0 text-[10px] font-mono text-primary uppercase placeholder:text-zinc-800 w-48"
              />
           </div>
           <Button onClick={createCase} className="bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] h-10 px-8 hover:bg-primary/80 transition-all rounded-none shadow-[0_0_20px_rgba(212,255,0,0.15)]">
              <Plus className="w-4 h-4 mr-2" />
              Init_Investigation
           </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top,rgba(212,255,0,0.02),transparent_50%)]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="h-40 bg-zinc-950 border border-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : cases.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-20 text-center">
            <Clock className="w-16 h-16 mb-8 text-zinc-800 animate-pulse" />
            <h3 className="text-sm font-black text-zinc-600 uppercase tracking-widest">No Active Intel Logs Found</h3>
            <p className="text-[10px] font-mono text-zinc-800 mt-2 uppercase tracking-tighter">Initialize a new investigation thread to begin neural reconstruction.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/investigation/${c.id}`)}
                className="group bg-zinc-950 border border-zinc-900 p-6 relative overflow-hidden cursor-pointer hover:border-primary/40 transition-all"
              >
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-40 transition-opacity">
                   <ShieldCheck className="w-12 h-12 text-primary" />
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                     <span className="text-[8px] font-mono text-zinc-700 uppercase tracking-[0.2em]">Thread_{c.id.slice(-4)}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Secured</span>
                  </div>
                </div>

                <h3 className="text-sm font-black text-zinc-400 group-hover:text-primary transition-colors uppercase tracking-tight mb-4 truncate">{c.name}</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center space-x-4">
                        <div className="flex flex-col">
                           <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">Created</span>
                           <span className="text-[9px] font-mono text-zinc-600 italic">{new Date(c.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest">Integrity</span>
                           <span className="text-[9px] font-mono text-emerald-900 font-bold">94.2%</span>
                        </div>
                     </div>
                     <ChevronRight className="w-4 h-4 text-zinc-900 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>

                  <div className="h-1 w-full bg-zinc-900 overflow-hidden relative">
                     <div className="absolute inset-0 bg-primary/20" style={{ width: '85%' }} />
                     <div className="absolute inset-0 bg-primary animate-pulse" style={{ width: '40%' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
