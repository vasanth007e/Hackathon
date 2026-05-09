import { FileText, AlertCircle, CheckCircle2, Loader2, Zap, Shield, Database } from 'lucide-react';
import { motion } from 'motion/react';
import { Progress } from '@/components/ui/progress';

interface EvidenceItem {
  id: string;
  type: string;
  title: string;
  trust_score: number;
  anomaly_score: number;
  status: string;
  created_at: string;
}

export default function EvidenceVault({ evidence }: { evidence: EvidenceItem[] }) {
  return (
    <div className="p-3 space-y-3">
      {evidence.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center text-zinc-800 border border-dashed border-zinc-900 rounded bg-zinc-950/20">
          <Database className="w-8 h-8 mb-4 opacity-10" />
          <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-zinc-700">Vault_Offline_Null</p>
        </div>
      ) : (
        evidence.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`p-3 bg-black border border-zinc-900 rounded group transition-all cursor-pointer relative overflow-hidden ${
                item.anomaly_score > 0.2 ? 'border-red-950/40' : 'hover:border-primary/40'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 bg-zinc-950 border border-zinc-900 rounded group-hover:border-primary/30 transition-all ${
                    item.anomaly_score > 0.2 ? 'text-red-500 bg-red-950/5' : 'text-zinc-600 group-hover:text-primary'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-[10px] font-black text-zinc-100 uppercase tracking-tighter line-clamp-1 truncate group-hover:text-primary transition-colors">{item.title}</h4>
                  <div className="flex items-center mt-0.5 space-x-2">
                     <span className="text-[7px] font-mono text-zinc-600 uppercase tracking-widest bg-zinc-950 px-1 border border-zinc-900 shrink-0">{item.type}</span>
                     <span className="text-[7px] font-mono text-zinc-800 uppercase tracking-widest shrink-0">ID: {item.id.slice(-4)}</span>
                  </div>
                </div>
              </div>
              {item.status === 'processing' ? (
                <Loader2 className="w-3 h-3 text-primary animate-spin" />
              ) : item.anomaly_score > 0.2 ? (
                <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              ) : (
                <Shield className="w-3.5 h-3.5 text-primary/40 group-hover:text-primary transition-colors" />
              )}
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-900/50">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest">Confidence_Metric</span>
                  <span className="text-[8px] font-mono text-primary font-bold">{(item.trust_score * 100).toFixed(1)}%</span>
                </div>
                <Progress value={item.trust_score * 100} className="h-[2px] bg-zinc-950" />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Zap className={`w-2.5 h-2.5 mr-1.5 ${item.anomaly_score > 0.2 ? 'text-red-500' : 'text-zinc-800'}`} />
                  <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest">Dissonance_lvl</span>
                </div>
                <span className={`text-[8px] font-mono font-bold ${item.anomaly_score > 0.2 ? 'text-red-500' : 'text-zinc-700 uppercase'}`}>
                   {item.anomaly_score > 0.2 ? `ALERT_${(item.anomaly_score * 100).toFixed(0)}` : 'NOMINAL'}
                </span>
              </div>
            </div>
          </motion.div>
        ))
      )}
    </div>
  );
}
