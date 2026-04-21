/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Upload, 
  FileText, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Printer, 
  RefreshCw,
  HardHat,
  Building2,
  User,
  CreditCard,
  MapPin,
  Hammer
} from 'lucide-react';

// --- Types ---

type TradeType = 'General' | 'Electrical' | 'Plumbing' | 'Roofing' | 'HVAC' | 'Other';

interface ContractorDetails {
  companyName: string;
  primaryContact: string;
  licenseNumber: string;
  tradeType: TradeType;
  state: string;
}

interface ChecklistItem {
  id: string;
  label: string;
}

interface UploadedFiles {
  insurance: string | null;
  license: string | null;
  osha: string | null;
  additional: string | null;
}

// --- Mock Data ---

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland',
  'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey',
  'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina',
  'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const TRADE_TYPES: TradeType[] = ['General', 'Electrical', 'Plumbing', 'Roofing', 'HVAC', 'Other'];

const STATE_CHECKLISTS: Record<string, ChecklistItem[]> = {
  'California': [
    { id: 'ca1', label: "Valid Cal/OSHA 300A Summary on file" },
    { id: 'ca2', label: "Workers' Compensation Insurance (California compliant)" },
    { id: 'ca3', label: "CSLB License in good standing" },
    { id: 'ca4', label: "IIPP (Injury and Illness Prevention Program) documented" },
    { id: 'ca5', label: "Heat Illness Prevention Plan verified" },
    { id: 'ca6', label: "Lead/Asbestos certification (if applicable)" },
    { id: 'ca7', label: "Active DIR Public Works registration" },
    { id: 'ca8', label: "Subcontractor safety pre-qualification complete" },
  ],
  'Texas': [
    { id: 'tx1', label: "Texas DWC-005 (Employer Notice of No Coverage) verified" },
    { id: 'tx2', label: "General Liability Insurance with Texas waiver" },
    { id: 'tx3', label: "OSHA 10-hour Construction Safety current" },
    { id: 'tx4', label: "Drug-free workplace policy signed" },
    { id: 'tx5', label: "Equipment maintenance logs up to date" },
    { id: 'tx6', label: "Emergency Action Plan (EAP) submitted" },
    { id: 'tx7', label: "Texas Secretary of State status: Active" },
  ],
  'New York': [
    { id: 'ny1', label: "NY DOL License verification complete" },
    { id: 'ny2', label: "NYSIF Workers' Comp Certificate (Form C-105.2)" },
    { id: 'ny3', label: "Disability Benefits Insurance (Form DB-120.1)" },
    { id: 'ny4', label: "Site Safety Training (SST) cards for all personnel" },
    { id: 'ny5', label: "NY Labor Law 240/241 compliance verified" },
    { id: 'ny6', label: "Sexual Harassment Prevention training current" },
    { id: 'ny7', label: "NYC DOB Registration (if applicable)" },
    { id: 'ny8', label: "Hazard Communication Plan on site" },
  ]
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'gen1', label: "Valid workers' comp insurance on file" },
  { id: 'gen2', label: "OSHA 10/30 certification current" },
  { id: 'gen3', label: "License in good standing with state board" },
  { id: 'gen4', label: "General liability insurance verified" },
  { id: 'gen5', label: "Safety manual submitted and reviewed" },
  { id: 'gen6', label: "Toolbox talk logs for last 30 days" },
];

// --- Components ---

const BlueprintBackground = () => (
  <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a1628]">
    {/* Grid Texture */}
    <div 
      className="absolute inset-0 opacity-10" 
      style={{ 
        backgroundImage: `linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} 
    />
    <div 
      className="absolute inset-0 opacity-5" 
      style={{ 
        backgroundImage: `linear-gradient(to right, #00d4ff 1px, transparent 1px), linear-gradient(to bottom, #00d4ff 1px, transparent 1px)`,
        backgroundSize: '8px 8px'
      }} 
    />
    {/* Blueprint Accents */}
    <div className="absolute top-0 left-0 w-full h-1 bg-[#00d4ff] opacity-20" />
    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00d4ff] opacity-20" />
    <div className="absolute top-0 left-0 w-1 h-full bg-[#00d4ff] opacity-20" />
    <div className="absolute top-0 right-0 w-1 h-full bg-[#00d4ff] opacity-20" />
  </div>
);

const ProgressBar = ({ currentStep }: { currentStep: number }) => {
  const steps = ['DETAILS', 'CHECKLIST', 'DOCUMENTS', 'REPORT'];
  return (
    <div className="w-full max-w-4xl mx-auto mb-12 px-4">
      <div className="flex justify-between relative">
        {/* Connection Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#00d4ff]/20 -translate-y-1/2 z-0" />
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 bg-[#00d4ff] -translate-y-1/2 z-0"
          initial={{ width: '0%' }}
          animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
        
        {steps.map((step, idx) => (
          <div key={step} className="relative z-10 flex flex-col items-center">
            <motion.div 
              className={`w-10 h-10 rounded-none border-2 flex items-center justify-center bg-[#0a1628] transition-colors duration-300 ${
                idx <= currentStep ? 'border-[#00d4ff] text-[#00d4ff]' : 'border-[#00d4ff]/20 text-[#00d4ff]/20'
              }`}
              animate={{
                scale: idx === currentStep ? 1.1 : 1,
                boxShadow: idx === currentStep ? '0 0 25px rgba(0, 212, 255, 0.6)' : 'none'
              }}
            >
              {idx < currentStep ? <CheckCircle2 size={20} /> : <span className="font-mono text-sm">{idx + 1}</span>}
            </motion.div>
            <span className={`mt-2 font-mono text-[10px] uppercase tracking-widest ${
              idx <= currentStep ? 'text-[#00d4ff]' : 'text-[#00d4ff]/40'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState<ContractorDetails>({
    companyName: '',
    primaryContact: '',
    licenseNumber: '',
    tradeType: 'General',
    state: ''
  });
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [files, setFiles] = useState<UploadedFiles>({
    insurance: null,
    license: null,
    osha: null,
    additional: null
  });
  const [reportId] = useState(() => `CS-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [timestamp] = useState(() => new Date().toLocaleString());

  const currentChecklist = useMemo(() => {
    return STATE_CHECKLISTS[details.state] || DEFAULT_CHECKLIST;
  }, [details.state]);

  const isStep1Complete = details.companyName && details.primaryContact && details.licenseNumber && details.state;
  const isStep2Complete = checkedItems.size === currentChecklist.length;
  const isStep3Complete = files.insurance && files.license && files.osha;

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handleBack = () => setStep(s => Math.max(s - 1, 0));

  const toggleCheck = (id: string) => {
    const next = new Set(checkedItems);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setCheckedItems(next);
  };

  const handleFileUpload = (key: keyof UploadedFiles, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles(prev => ({ ...prev, [key]: file.name }));
    }
  };

  const resetFlow = () => {
    setStep(0);
    setDetails({
      companyName: '',
      primaryContact: '',
      licenseNumber: '',
      tradeType: 'General',
      state: ''
    });
    setCheckedItems(new Set());
    setFiles({
      insurance: null,
      license: null,
      osha: null,
      additional: null
    });
  };

  return (
    <div className="min-h-screen text-slate-200 font-sans selection:bg-[#00d4ff]/30 selection:text-[#00d4ff]">
      <BlueprintBackground />
      
      <div className="relative z-10 py-12 px-4">
        {/* Header */}
        <header className="max-w-4xl mx-auto mb-12 text-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 mb-4"
          >
            <div className="p-2 border-2 border-[#00d4ff] bg-[#00d4ff]/10">
              <ShieldCheck className="text-[#00d4ff]" size={32} />
            </div>
            <h1 className="text-4xl font-mono font-bold tracking-tighter text-[#00d4ff] uppercase">
              Contractor<span className="text-white">Safe</span>
            </h1>
          </motion.div>
          <p className="font-mono text-xs text-[#00d4ff]/60 tracking-widest uppercase">
            Safety Compliance Verification Protocol // v2.4.0
          </p>
        </header>

        <ProgressBar currentStep={step} />

        <main className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a1628]/80 border border-[#00d4ff]/20 p-8 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-8 border-b border-[#00d4ff]/20 pb-4">
                  <Building2 className="text-[#00d4ff]" size={20} />
                  <h2 className="font-mono text-xl uppercase tracking-tight text-[#00d4ff]">01 // Contractor Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#00d4ff]/60">Company Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/40" size={16} />
                      <input 
                        type="text"
                        value={details.companyName}
                        onChange={e => setDetails({...details, companyName: e.target.value})}
                        className="w-full bg-[#0a1628] border border-[#00d4ff]/20 py-3 pl-10 pr-4 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-mono text-sm"
                        placeholder="e.g. Skyline Construction LLC"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#00d4ff]/60">Primary Contact</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/40" size={16} />
                      <input 
                        type="text"
                        value={details.primaryContact}
                        onChange={e => setDetails({...details, primaryContact: e.target.value})}
                        className="w-full bg-[#0a1628] border border-[#00d4ff]/20 py-3 pl-10 pr-4 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-mono text-sm"
                        placeholder="Full Name"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#00d4ff]/60">License Number</label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/40" size={16} />
                      <input 
                        type="text"
                        value={details.licenseNumber}
                        onChange={e => setDetails({...details, licenseNumber: e.target.value})}
                        className="w-full bg-[#0a1628] border border-[#00d4ff]/20 py-3 pl-10 pr-4 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-mono text-sm"
                        placeholder="e.g. CA-982341"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#00d4ff]/60">Trade Type</label>
                    <div className="relative">
                      <Hammer className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/40" size={16} />
                      <select 
                        value={details.tradeType}
                        onChange={e => setDetails({...details, tradeType: e.target.value as TradeType})}
                        className="w-full bg-[#0a1628] border border-[#00d4ff]/20 py-3 pl-10 pr-4 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-mono text-sm appearance-none"
                      >
                        {TRADE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="font-mono text-[10px] uppercase tracking-widest text-[#00d4ff]/60">Operating State</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/40" size={16} />
                      <select 
                        value={details.state}
                        onChange={e => setDetails({...details, state: e.target.value})}
                        className="w-full bg-[#0a1628] border border-[#00d4ff]/20 py-3 pl-10 pr-4 focus:border-[#00d4ff] focus:outline-none focus:ring-1 focus:ring-[#00d4ff] focus:shadow-[0_0_15px_rgba(0,212,255,0.4)] transition-all font-mono text-sm appearance-none"
                      >
                        <option value="">Select a state...</option>
                        {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-10 flex justify-end">
                  <button 
                    onClick={handleNext}
                    disabled={!isStep1Complete}
                    className={`flex items-center gap-2 px-8 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                      isStep1Complete 
                      ? 'bg-[#00d4ff] text-[#0a1628] hover:bg-[#33e0ff] shadow-[0_0_30px_rgba(0,212,255,0.5)]' 
                      : 'bg-[#00d4ff]/10 text-[#00d4ff]/30 cursor-not-allowed border border-[#00d4ff]/20'
                    }`}
                  >
                    Proceed to Checklist <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a1628]/80 border border-[#00d4ff]/20 p-8 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8 border-b border-[#00d4ff]/20 pb-4">
                  <div className="flex items-center gap-3">
                    <HardHat className="text-[#00d4ff]" size={20} />
                    <h2 className="font-mono text-xl uppercase tracking-tight text-[#00d4ff]">02 // Regulatory Checklist</h2>
                  </div>
                  <div className="font-mono text-[10px] text-[#00d4ff]/60 uppercase tracking-widest bg-[#00d4ff]/10 px-2 py-1">
                    Jurisdiction: {details.state}
                  </div>
                </div>

                <div className="space-y-4">
                  {currentChecklist.map((item) => (
                    <div 
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      className={`group flex items-center gap-4 p-4 border transition-all cursor-pointer ${
                        checkedItems.has(item.id) 
                        ? 'border-[#00d4ff] bg-[#00d4ff]/5' 
                        : 'border-[#00d4ff]/10 hover:border-[#00d4ff]/40 bg-transparent'
                      }`}
                    >
                      <div className={`w-6 h-6 border-2 flex items-center justify-center transition-colors ${
                        checkedItems.has(item.id) ? 'border-[#00d4ff] bg-[#00d4ff]' : 'border-[#00d4ff]/30'
                      }`}>
                        {checkedItems.has(item.id) && <CheckCircle2 size={16} className="text-[#0a1628]" />}
                      </div>
                      <span className={`font-mono text-sm transition-colors ${
                        checkedItems.has(item.id) ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase tracking-widest text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/10 transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!isStep2Complete}
                    className={`flex items-center gap-2 px-8 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                      isStep2Complete 
                      ? 'bg-[#00d4ff] text-[#0a1628] hover:bg-[#33e0ff] shadow-[0_0_30px_rgba(0,212,255,0.5)]' 
                      : 'bg-[#00d4ff]/10 text-[#00d4ff]/30 cursor-not-allowed border border-[#00d4ff]/20'
                    }`}
                  >
                    Continue to Uploads <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#0a1628]/80 border border-[#00d4ff]/20 p-8 backdrop-blur-sm shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-8 border-b border-[#00d4ff]/20 pb-4">
                  <Upload className="text-[#00d4ff]" size={20} />
                  <h2 className="font-mono text-xl uppercase tracking-tight text-[#00d4ff]">03 // Document Repository</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {[
                    { key: 'insurance', label: 'Certificate of Insurance (COI)', required: true },
                    { key: 'license', label: 'State Contractor License', required: true },
                    { key: 'osha', label: 'OSHA Safety Certification', required: true },
                    { key: 'additional', label: 'Additional Supporting Docs', required: false },
                  ].map((doc) => (
                    <div key={doc.key} className="relative">
                      <input 
                        type="file" 
                        id={doc.key}
                        className="hidden" 
                        onChange={(e) => handleFileUpload(doc.key as keyof UploadedFiles, e)}
                      />
                      <label 
                        htmlFor={doc.key}
                        className={`flex flex-col md:flex-row md:items-center justify-between p-6 border-2 border-dashed transition-all cursor-pointer ${
                          files[doc.key as keyof UploadedFiles]
                          ? 'border-[#00d4ff] bg-[#00d4ff]/5'
                          : 'border-[#00d4ff]/20 hover:border-[#00d4ff]/50 bg-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4 md:mb-0">
                          <div className={`p-3 ${files[doc.key as keyof UploadedFiles] ? 'bg-[#00d4ff] text-[#0a1628]' : 'bg-[#00d4ff]/10 text-[#00d4ff]'}`}>
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="font-mono text-sm text-white uppercase tracking-tight">
                              {doc.label} {doc.required && <span className="text-red-400">*</span>}
                            </p>
                            <p className="text-[10px] font-mono text-[#00d4ff]/40 uppercase tracking-widest mt-1">
                              PDF, JPG, or PNG // Max 10MB
                            </p>
                          </div>
                        </div>
                        
                        {files[doc.key as keyof UploadedFiles] ? (
                          <div className="flex items-center gap-2 text-[#00d4ff] font-mono text-xs">
                            <CheckCircle2 size={14} />
                            <span className="truncate max-w-[150px]">{files[doc.key as keyof UploadedFiles]}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[#00d4ff]/60 font-mono text-xs uppercase tracking-widest">
                            <Upload size={14} /> Select File
                          </div>
                        )}
                      </label>
                    </div>
                  ))}
                </div>

                <div className="mt-10 flex justify-between">
                  <button 
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 font-mono text-sm uppercase tracking-widest text-[#00d4ff] border border-[#00d4ff]/30 hover:bg-[#00d4ff]/10 transition-all"
                  >
                    <ChevronLeft size={16} /> Back
                  </button>
                  <button 
                    onClick={handleNext}
                    disabled={!isStep3Complete}
                    className={`flex items-center gap-2 px-8 py-3 font-mono text-sm uppercase tracking-widest transition-all ${
                      isStep3Complete 
                      ? 'bg-[#00d4ff] text-[#0a1628] hover:bg-[#33e0ff] shadow-[0_0_30px_rgba(0,212,255,0.5)]' 
                      : 'bg-[#00d4ff]/10 text-[#00d4ff]/30 cursor-not-allowed border border-[#00d4ff]/20'
                    }`}
                  >
                    Generate Report <ChevronRight size={16} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white text-slate-900 p-12 shadow-2xl relative overflow-hidden print:p-0 print:shadow-none"
                id="verification-report"
              >
                {/* Report Background Texture */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                
                {/* Verified Stamp */}
                <motion.div 
                  initial={{ scale: 2, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 0.15, rotate: -20 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-8 border-green-600 text-green-600 font-mono text-8xl font-black px-12 py-4 pointer-events-none uppercase tracking-tighter"
                >
                  Verified
                </motion.div>

                {/* Report Header */}
                <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-10">
                  <div>
                    <h2 className="text-3xl font-mono font-bold uppercase tracking-tighter mb-1">Compliance Certificate</h2>
                    <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">ContractorSafe Verification Protocol // Official Record</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-mono uppercase text-slate-400">Report ID</p>
                    <p className="font-mono font-bold text-lg">{reportId}</p>
                  </div>
                </div>

                {/* Report Content */}
                <div className="grid grid-cols-2 gap-12 mb-12">
                  <section>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 mb-4 pb-1">Contractor Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400">Entity Name</p>
                        <p className="font-bold">{details.companyName}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400">Primary Contact</p>
                        <p className="font-medium">{details.primaryContact}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[10px] font-mono uppercase text-slate-400">License #</p>
                          <p className="font-mono text-sm">{details.licenseNumber}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-mono uppercase text-slate-400">Trade</p>
                          <p className="font-mono text-sm">{details.tradeType}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono uppercase text-slate-400">Jurisdiction</p>
                        <p className="font-medium">{details.state}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 mb-4 pb-1">Verification Status</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono uppercase text-xs">Regulatory Checklist</span>
                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> COMPLIANT</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono uppercase text-xs">Document Repository</span>
                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> VERIFIED</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono uppercase text-xs">Insurance Validity</span>
                        <span className="text-green-600 font-bold flex items-center gap-1"><CheckCircle2 size={14} /> ACTIVE</span>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100">
                      <p className="text-[10px] font-mono uppercase text-slate-400 mb-2">Uploaded Artifacts</p>
                      <ul className="space-y-1">
                        {Object.entries(files).map(([key, val]) => val && (
                          <li key={key} className="text-[10px] font-mono flex items-center gap-2">
                            <FileText size={10} className="text-slate-400" /> {val}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </section>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-end border-t-2 border-slate-900 pt-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase text-slate-400">Verification Timestamp</p>
                    <p className="font-mono text-xs">{timestamp}</p>
                  </div>
                  <div className="text-right">
                    <div className="w-32 h-12 border-b border-slate-900 mb-1" />
                    <p className="text-[10px] font-mono uppercase text-slate-400">Authorized Signature</p>
                  </div>
                </div>

                {/* Action Buttons (Hidden in Print) */}
                <div className="mt-12 flex justify-center gap-4 print:hidden">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-mono text-sm uppercase tracking-widest hover:bg-slate-800 transition-all"
                  >
                    <Printer size={16} /> Download Report
                  </button>
                  <button 
                    onClick={resetFlow}
                    className="flex items-center gap-2 px-6 py-3 border-2 border-slate-900 text-slate-900 font-mono text-sm uppercase tracking-widest hover:bg-slate-50 transition-all"
                  >
                    <RefreshCw size={16} /> New Verification
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="max-w-4xl mx-auto mt-20 text-center">
          <p className="font-mono text-[9px] text-[#00d4ff]/30 uppercase tracking-[0.3em]">
            Secure Infrastructure // End-to-End Encryption // Regulatory Compliance Engine
          </p>
        </footer>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .relative.z-10 { padding: 0 !important; }
          header, .ProgressBar, footer, .ProgressBar-container, button { display: none !important; }
          #verification-report { 
            box-shadow: none !important; 
            border: none !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
        }
        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300d4ff' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 1.2em;
        }
      `}} />
    </div>
  );
}
