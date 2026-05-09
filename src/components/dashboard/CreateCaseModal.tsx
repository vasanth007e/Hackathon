import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { ShieldAlert, Briefcase, MapPin, User, Info } from 'lucide-react';

interface CreateCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CreateCaseModal({ isOpen, onClose, onSubmit }: CreateCaseModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'homicide',
    priority: 'medium',
    lead: '',
    location: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-950 border-zinc-900 shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-6 bg-black border-b border-zinc-900">
          <DialogTitle className="text-xl font-black italic uppercase tracking-tighter text-white flex items-center">
            <ShieldAlert className="w-5 h-5 text-primary mr-3" />
            INIT_NEW_INVESTIGATION
          </DialogTitle>
          <DialogDescription className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest mt-1">
            Establishing secure encrypted case directory in master vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center">
                <Briefcase className="w-3 h-3 mr-2 text-primary/40" /> Investigation_Name
              </Label>
              <Input 
                required
                placeholder="e.g. DOCKYARD_HOMICIDE_RECON"
                className="bg-black border-zinc-800 text-zinc-300 rounded-none h-10 font-mono text-xs placeholder:text-zinc-800 focus-visible:ring-primary/20"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                  <SelectTrigger className="bg-black border-zinc-800 text-zinc-400 rounded-none h-10 font-mono text-[10px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="homicide" className="text-[10px] font-mono uppercase">Homicide</SelectItem>
                    <SelectItem value="theft" className="text-[10px] font-mono uppercase">Theft</SelectItem>
                    <SelectItem value="recon" className="text-[10px] font-mono uppercase">Surveillance</SelectItem>
                    <SelectItem value="cyber" className="text-[10px] font-mono uppercase">Cyber_Crime</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Priority</Label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="bg-black border-zinc-800 text-zinc-400 rounded-none h-10 font-mono text-[10px] uppercase">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-950 border-zinc-800">
                    <SelectItem value="low" className="text-zinc-500 text-[10px] font-mono uppercase">Low</SelectItem>
                    <SelectItem value="medium" className="text-primary/60 text-[10px] font-mono uppercase">Medium</SelectItem>
                    <SelectItem value="high" className="text-red-500 text-[10px] font-mono uppercase">High</SelectItem>
                    <SelectItem value="critical" className="text-red-600 font-bold text-[10px] font-mono uppercase">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center">
                  <User className="w-3 h-3 mr-2" /> Lead_Agent
                </Label>
                <Input 
                  placeholder="ID_7712"
                  className="bg-black border-zinc-800 text-zinc-300 rounded-none h-10 font-mono text-xs placeholder:text-zinc-800"
                  value={formData.lead}
                  onChange={(e) => setFormData({...formData, lead: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center">
                   <MapPin className="w-3 h-3 mr-2" /> Location
                </Label>
                <Input 
                  placeholder="Sector_G4"
                  className="bg-black border-zinc-800 text-zinc-300 rounded-none h-10 font-mono text-xs placeholder:text-zinc-800"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center">
                <Info className="w-3 h-3 mr-2" /> Brief_Overview
              </Label>
              <Textarea 
                placeholder="Initial intelligence summary..."
                className="bg-black border-zinc-800 text-zinc-300 rounded-none min-h-[80px] font-mono text-xs placeholder:text-zinc-800 resize-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button 
               type="button" 
               variant="ghost" 
               onClick={onClose}
               className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400"
            >
              ABORT_INIT
            </Button>
            <Button 
               type="submit"
               className="bg-primary text-black text-[10px] font-black uppercase tracking-[0.2em] px-8 rounded-none h-11 shadow-[0_0_20px_rgba(229,255,0,0.1)]"
            >
              CONFIRM_WORKSPACE_GEN
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
