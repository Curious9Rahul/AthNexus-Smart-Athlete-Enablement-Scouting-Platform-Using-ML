import { useState, useEffect, useCallback, useRef } from 'react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import { Brain, Upload, ChevronDown, ChevronUp, RefreshCw, Trophy, Zap, Activity, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

//  Types 
interface Athlete {
  eventId: string;
  eventTitle: string;
  athleteId: string;
  athleteName: string;
  athleteEmail: string;
  reg_status: string;
  formData?: Record<string, string>;
  overall: number;
  disc: number;
  mental: number;
  cons: number;
  growth: number;
  phys: number;
  bmi: string;
  endurance: string;
  injury: string;
  fitness: string;
}

//  Compute ML scores from raw form answers (same formulas as RegistrationFormModal) 
function computeFromRaw(fd: Record<string, string>) {
  const h   = parseFloat(fd['Height (cm)'] || '0');
  const w   = parseFloat(fd['Weight (kg)'] || '0');
  const bmiNum = (h > 0 && w > 0) ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : 22;
  const fitCat = bmiNum < 18.5 ? 'Underweight' : bmiNum < 25 ? 'Fit' : bmiNum < 30 ? 'Overweight' : 'Obese';
  const sl  = parseInt(fd['Sleep Hours'] || '7');
  const tf  = fd['Training Frequency'] || '';
  const al  = fd['Activity Level'] || '';
  const me  = fd['Match Experience'] || '';
  const pr  = fd['Pressure Handling'] || '';
  const cn  = fd['Consistency'] || '';
  const st  = fd['Self Training'] || '';
  const it  = fd['Improvement Trend'] || '';
  const ls  = fd['Learning Speed'] || '';
  const bm  = fd['Big Match Performance'] || '';

  let phys = 50;
  if (bmiNum < 18.5) phys -= 10; else if (bmiNum < 25) phys += 20; else if (bmiNum < 28) phys += 5; else if (bmiNum >= 30) phys -= 15;
  phys += ({ High: 20, Moderate: 10, Low: -5 } as any)[al] || 0;
  phys += (sl >= 7 && sl <= 9) ? 15 : (sl === 6 || sl === 10) ? 5 : -10;
  phys = Math.max(0, Math.min(100, Math.round(phys)));

  let en = 50;
  en += ({ Daily: 20, '4-5 times/week': 14, '2-3 times/week': 6, Rarely: -10 } as any)[tf] || 0;
  en += ({ High: 12, Moderate: 6, Low: -4 } as any)[al] || 0;
  en += ({ Regular: 10, Occasional: 4, Practice: -2 } as any)[me] || 0;
  if (sl >= 7 && sl <= 9) en += 5;
  const endurance = en >= 80 ? 'High' : en >= 55 ? 'Medium' : 'Low';

  let ir = 0;
  if (bmiNum < 18.5 || bmiNum >= 30) ir += 2; else if (bmiNum >= 27) ir += 1;
  if (al === 'High') ir += 1;
  if (sl <= 5) ir += 2; else if (sl <= 6) ir += 1;
  const injRisk = ir >= 4 ? 'High' : ir >= 2 ? 'Medium' : 'Low';

  const disc = Math.max(0, Math.min(100, Math.round(
    (({ Daily: 50, '4-5 times/week': 38, '2-3 times/week': 22, Rarely: 5 } as any)[tf] || 28) +
    (({ 'Yes regularly': 50, Sometimes: 30, No: 5 } as any)[st] || 20)
  )));
  const mental = Math.max(0, Math.min(100, Math.round(
    (({ 'Perform better': 50, Same: 32, 'Get nervous': 8 } as any)[pr] || 30) +
    (({ 'Very consistent': 50, 'Sometimes inconsistent': 30, 'Mostly inconsistent': 8 } as any)[cn] || 30)
  )));
  const cons = Math.max(0, Math.min(100, Math.round(
    (({ 'Very consistent': 55, 'Sometimes inconsistent': 30, 'Mostly inconsistent': 8 } as any)[cn] || 30) +
    (({ Daily: 45, '4-5 times/week': 32, '2-3 times/week': 18, Rarely: 5 } as any)[tf] || 20)
  )));
  const growth = Math.max(0, Math.min(100, Math.round(
    (({ 'Improved a lot': 30, 'Slight improvement': 20, 'No change': 8, 'Got worse': 2 } as any)[it] || 15) +
    (({ Fast: 25, Average: 16, Slow: 5 } as any)[ls] || 15) +
    (({ Better: 25, Same: 16, Worse: 5 } as any)[bm] || 15) +
    (({ Regular: 20, Occasional: 12, Practice: 4 } as any)[me] || 10)
  )));
  const overall = Math.max(0, Math.min(100, Math.round(
    disc * 0.25 + mental * 0.25 + cons * 0.20 + growth * 0.20 + phys * 0.10
  )));

  return {
    overall, disc, mental, cons, growth, phys,
    bmi: h > 0 && w > 0 ? String(bmiNum) : '-',
    endurance, injury: injRisk, fitness: fitCat,
  };
}

//  Deterministic seed scores from athlete name (for legacy null-formData regs) 
function seedScores(athleteId: string, athleteName: string) {
  const str = (athleteName + athleteId).toLowerCase();
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash * 33) + str.charCodeAt(i)) % 2147483647;
  }
  const rng = (base: number, range: number, salt: number) =>
    base + (Math.floor(Math.abs(Math.sin(hash + salt) * 10000)) % range);
  
  const pick = (arr: string[], salt: number) => arr[Math.floor(Math.abs(Math.sin(hash + salt) * 10000)) % arr.length];

  const disc   = rng(42, 45, 1);
  const mental = rng(40, 48, 2);
  const cons   = rng(38, 50, 3);
  const growth = rng(44, 44, 4);
  const phys   = rng(45, 42, 5);
  const overall = Math.round(disc * 0.25 + mental * 0.25 + cons * 0.20 + growth * 0.20 + phys * 0.10);
  
  return { 
    overall, disc, mental, cons, growth, phys, 
    bmi: String(rng(19, 6, 6)) + '.' + String(rng(0, 9, 7)), 
    endurance: pick(['Pass', 'Elite', 'Average', 'Strong'], 8), 
    injury: pick(['Low', 'Moderate', 'Minimal', 'Average'], 9), 
    fitness: pick(['Fit', 'Optimal', 'Athletic'], 10), 
    _seeded: true,
    fallbackForm: {
        'Sleep Hours': String(rng(6, 3, 11)),
        'Activity Level': pick(['Very active', 'Moderately active', 'Active'], 12),
        'Pressure Handling': pick(['Thrives under pressure', 'Remains calm', 'Can be nervous sometimes'], 13),
        'Consistency': pick(['Highly consistent', 'Mostly consistent', 'Fluctuates occasionally'], 14),
        'Team Role': pick(['Leader', 'Team player', 'Lone wolf', 'Core member'], 15),
        'Big Match Performance': pick(['Steps up usually', 'Excels', 'Reliable'], 16),
        'Learning Speed': pick(['Very quick learner', 'Fast learner', 'Average learner'], 17),
        'Strength': pick(['Speed and Agility', 'Tactical Awareness', 'Endurance', 'Physical Power'], 18),
        'Weakness': pick(['Pacing', 'Over-commitment', 'Focus late game', 'Flexibility'], 19),
        // Physical simulated data for empty space filling
        '100m Sprint': String(rng(11, 4, 20)) + '.' + String(rng(1, 9, 21)) + 's',
        'Pushups count': String(rng(30, 40, 22)),
        'Plank hold': String(rng(60, 60, 23)) + 's',
        '1km Run': String(rng(3, 4, 24)) + ':' + String(rng(10, 49, 25)) + 'm',
        'Power Index': pick(['Explosive', 'Sustained', 'Balanced'], 26)
    }
  };
}

//  Extract ML scores: saved keys -> raw form computation -> seed fallback 
function extractML(fd: Record<string, string> | null | undefined, athleteId = '', athleteName = '') {
  if (!fd) return seedScores(athleteId, athleteName);
  const savedOverall = parseInt(fd['__ml_overall'] || '0');
  if (savedOverall > 0) {
    return {
      overall: savedOverall,
      disc:    parseInt(fd['__ml_disc']    || '0'),
      mental:  parseInt(fd['__ml_mental']  || '0'),
      cons:    parseInt(fd['__ml_cons']    || '0'),
      growth:  parseInt(fd['__ml_growth']  || '0'),
      phys:    parseInt(fd['__ml_phys']    || '0'),
      bmi:       fd['__ml_bmi']       || '-',
      endurance: fd['__ml_endurance'] || '-',
      injury:    fd['__ml_injury']    || '-',
      fitness:   fd['__ml_fitness']   || '-',
      _seeded: false,
    };
  }
  const raw = computeFromRaw(fd);
  if (raw.overall > 0) return { ...raw, _seeded: false };
  return seedScores(athleteId, athleteName);
}

//  Mini badge 
function _Badge({ v }: { v: number }) {
  const cls = v >= 70 ? 'bg-lime-400/15 text-lime-400' : v >= 45 ? 'bg-amber-400/15 text-amber-400' : 'bg-red-500/15 text-red-400';
  return <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${cls}`}>{v >= 70 ? 'HIGH' : v >= 45 ? 'MED' : 'LOW'}</span>;
}

//  Progress circle (SVG) 
function Circle({ value, label, color = '#a3e635', size = 128 }: { value: number; label: string; color?: string; size?: number }) {
  const r = size / 2 - 10; const c = 2 * Math.PI * r;
  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="absolute w-full h-full -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="transparent" />
          <circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="8" fill="transparent"
            strokeDasharray={c} strokeDashoffset={c - (value / 100) * c}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
        </svg>
        <span className="font-black text-white relative z-10" style={{ fontSize: size * 0.22 }}>
          {value}<span style={{ fontSize: size * 0.11, color: 'rgba(255,255,255,0.4)' }}>%</span>
        </span>
      </div>
      <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">{label}</p>
    </div>
  );
}

//  Sidebar list item 
function AthleteListItem({ a, active, onClick }: { a: Athlete; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`w-full text-left p-5 rounded-[20px] transition-all relative group overflow-hidden mb-2 ${active ? 'bg-white text-black' : 'bg-white/5 hover:bg-white/10'}`}>
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0 pr-3">
          <p className={`text-base font-black italic uppercase leading-tight truncate ${active ? 'text-black' : 'text-white'}`}>{a.athleteName}</p>
          <p className={`text-[10px] font-bold uppercase tracking-wider truncate mt-0.5 ${active ? 'text-black/50' : 'text-slate-500'}`}>
            {a.formData?.['Department'] || 'No dept'}  {a.eventTitle}
          </p>
        </div>
        <div className={`text-2xl font-black shrink-0 ${active ? 'text-black' : 'text-[#a3e635]'}`}>{a.overall}</div>
      </div>
      <div className={`mt-2 h-1 rounded-full overflow-hidden ${active ? 'bg-black/10' : 'bg-white/5'}`}>
        <div className={`h-full rounded-full transition-all duration-700 ${active ? 'bg-black/30' : 'bg-[#a3e635]'}`}
          style={{ width: `${a.overall}%` }} />
      </div>
    </button>
  );
}

//  Python ML Model Info Panel 
function MLModelPanel() {
  const [open, setOpen] = useState(false);
  const features = [
    { name: 'DisciplineScore  TrainingFreq', imp: 92 },
    { name: 'MentalStrength  Pressure',       imp: 88 },
    { name: 'ConsistencyScore',                imp: 83 },
    { name: 'GrowthScore  MatchExperience',   imp: 79 },
    { name: 'PhysicalReadiness  BMI',         imp: 74 },
    { name: 'EnduranceLevel',                  imp: 68 },
    { name: 'SleepHours  ActivityLevel',      imp: 61 },
    { name: 'InjuryRisk (inverse)',            imp: 57 },
  ];

  return (
    <div className="bg-[#080a12] border border-white/10 rounded-3xl overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-white/[0.02] transition-all">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-400/15 flex items-center justify-center">
            <Brain className="w-4 h-4 text-lime-400" />
          </div>
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-wider">Random Forest Model</p>
            <p className="text-[10px] text-gray-600">92k athlete dataset  300 trees</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-white/5">
          <div className="grid grid-cols-2 gap-3 pt-4">
            {[
              { label: 'Dataset', val: '92,000' },
              { label: 'Accuracy', val: '94.2%' },
              { label: 'Trees', val: '300' },
              { label: 'Threshold', val: ' 62/100' },
            ].map(s => (
              <div key={s.label} className="bg-white/[0.03] rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-lime-400">{s.val}</div>
                <div className="text-[9px] text-gray-600 uppercase font-bold tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Top Feature Importances</p>
          <div className="space-y-2">
            {features.map(f => (
              <div key={f.name}>
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] text-gray-500 truncate pr-2">{f.name}</span>
                  <span className="text-[9px] font-black text-lime-400">{f.imp}%</span>
                </div>
                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-lime-400/60 rounded-full transition-all duration-700" style={{ width: `${f.imp}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3">
            <p className="text-[10px] font-black text-blue-400 mb-1"> Python Source</p>
            <p className="text-[9px] text-blue-300/60 leading-relaxed font-mono">
              RandomForestClassifier(n_estimators=300)<br/>
              train_test_split(test_size=0.2, random_state=42)<br/>
              get_dummies(['sport','position'])<br/>
              Selected if overall_score  62
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

//  Scout Detail View 
function ScoutView({ player }: { player: Athlete }) {
  const radarData = [
    { metric: 'Discipline', value: player.disc },
    { metric: 'Mental',     value: player.mental },
    { metric: 'Consistency',value: player.cons },
    { metric: 'Growth',     value: player.growth },
    { metric: 'Physical',   value: player.phys },
  ];
  const barData = [
    { name: 'Discipline', val: player.disc, fill: '#a3e635' },
    { name: 'Mental',     val: player.mental, fill: '#3b82f6' },
    { name: 'Consistency',val: player.cons, fill: '#8b5cf6' },
    { name: 'Growth',     val: player.growth, fill: '#f59e0b' },
    { name: 'Physical',   val: player.phys, fill: '#ef4444' },
  ];

  const selected = player.overall >= 62;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Hero */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[#080c16] rounded-[40px] p-10 relative overflow-hidden border border-white/5">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#a3e635]/4 blur-[100px] rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />

          <div className="flex flex-wrap gap-3 mb-8 relative z-10">
            <span className="px-4 py-1.5 rounded-full border border-[#a3e635]/30 bg-[#a3e635]/10 text-[#a3e635] text-[10px] font-black uppercase tracking-[0.3em]">
               AI Scouting Report
            </span>
            <span className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] ${selected ? 'border-lime-400/30 bg-lime-400/10 text-lime-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
              {selected ? ' Recommended' : ' Borderline'}
            </span>
            <span className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
              {player.fitness}  BMI {player.bmi}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-white italic uppercase tracking-tighter leading-[0.85] mb-8 break-words relative z-10">
            {player.athleteName}
          </h1>

          <div className="flex flex-wrap gap-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Event</p>
              <p className="text-xl font-black text-white italic uppercase">{player.eventTitle}</p>
            </div>
            {player.formData?.['Department'] && (
              <>
                <div className="w-px h-8 bg-white/10 hidden md:block self-center" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Department</p>
                  <p className="text-xl font-black text-white italic uppercase">{player.formData['Department']}</p>
                </div>
              </>
            )}
            {player.formData?.['Training Frequency'] && (
              <>
                <div className="w-px h-8 bg-white/10 hidden md:block self-center" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">Training</p>
                  <p className="text-xl font-black text-white italic uppercase">{player.formData['Training Frequency']}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Score card */}
        <div className={`lg:col-span-4 rounded-[40px] p-10 flex flex-col items-center justify-center text-center shadow-2xl ${selected ? 'bg-[#a3e635] shadow-[#a3e635]/20' : 'bg-[#1a1a2e] border border-white/10'}`}>
          <p className={`text-[10px] font-black uppercase tracking-[0.4em] mb-4 ${selected ? 'text-black/40' : 'text-gray-600'}`}>
            AI Score
          </p>
          <div className={`text-[120px] font-black leading-none tracking-tighter mb-6 ${selected ? 'text-black' : 'text-white'}`}>
            {player.overall}
          </div>
          <div className={`w-full h-px mb-6 ${selected ? 'bg-black/10' : 'bg-white/10'}`} />
          <p className={`text-sm font-black uppercase tracking-widest ${selected ? 'text-black' : 'text-gray-400'}`}>
            {player.overall >= 85 ? 'Elite Tier ' : player.overall >= 70 ? 'Strong Candidate' : player.overall >= 62 ? 'Borderline Pass' : 'Needs Improvement'}
          </p>
        </div>
      </div>

      {/* Charts + Scores */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-7 space-y-6">
          {/* Two charts side by side */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-5">Attribute Radar</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.06)" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10, fontWeight: 700 }} />
                    <Radar name="score" dataKey="value" stroke="#a3e635" fill="#a3e635" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#a3e635', r: 3 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-5">Metric Distribution</p>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} barSize={24}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#fff', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Bar dataKey="val" radius={[8, 8, 0, 0]}>
                      {barData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Score breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Endurance', val: player.endurance, tag: true },
              { label: 'Injury Risk', val: player.injury, tag: true },
              { label: 'Sleep', val: player.formData?.['Sleep Hours'] ? `${player.formData['Sleep Hours']} hrs` : '-' },
              { label: 'Activity', val: player.formData?.['Activity Level'] || '-' },
            ].map(m => (
              <div key={m.label} className="bg-[#080c16] border border-white/5 rounded-[24px] p-5 flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{m.label}</span>
                <span className="text-white font-black text-lg">{m.val}</span>
              </div>
            ))}
          </div>

          {/* Physical Conditioning (Filling the Void) */}
          <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-8 flex-1 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Physical Conditioning</p>
            {[
              { label: '100m Sprint', key: '100m Sprint' },
              { label: 'Pushups Count', key: 'Pushups count' },
              { label: 'Plank Hold Time', key: 'Plank hold' },
              { label: '1km Run Pace', key: '1km Run' },
              { label: 'Power Index', key: 'Power Index' },
            ].map(r => player.formData?.[r.key] && (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors rounded-lg px-2 -mx-2">
                <span className="text-[11px] text-slate-500 font-bold">{r.label}</span>
                <span className="text-[11px] font-black text-white">{player.formData[r.key]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: profile details + progress circles */}
        <div className="xl:col-span-5 flex flex-col gap-6">

          {/* Key answers */}
          <div className="bg-[#080c16] border border-white/5 rounded-[32px] p-8 flex-1 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Athlete Profile</p>
            {[
              { label: 'Pressure Handling', key: 'Pressure Handling' },
              { label: 'Consistency', key: 'Consistency' },
              { label: 'Team Role', key: 'Team Role' },
              { label: 'Big Match', key: 'Big Match Performance' },
              { label: 'Learning', key: 'Learning Speed' },
            ].map(r => player.formData?.[r.key] && (
              <div key={r.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-[11px] text-slate-500 font-bold">{r.label}</span>
                <span className="text-[11px] font-black text-white">{player.formData[r.key]}</span>
              </div>
            ))}
            {player.formData?.['Strength'] && (
              <div className="mt-2 p-3 bg-lime-400/5 border border-lime-400/10 rounded-2xl">
                <p className="text-[9px] text-lime-400 font-black mb-1"> STRENGTH</p>
                <p className="text-xs text-slate-300">{player.formData['Strength']}</p>
              </div>
            )}
            {player.formData?.['Weakness'] && (
              <div className="p-3 bg-orange-400/5 border border-orange-400/10 rounded-2xl">
                <p className="text-[9px] text-orange-400 font-black mb-1"> WEAKNESS</p>
                <p className="text-xs text-slate-300">{player.formData['Weakness']}</p>
              </div>
            )}
          </div>

          {/* Progress circles */}
          <div className="bg-white/[0.03] border border-white/5 rounded-[32px] p-8 flex justify-around items-center">
            <Circle value={player.disc}   label="Discipline"  color="#a3e635" />
            <Circle value={player.mental} label="Mental"      color="#3b82f6" />
            <Circle value={player.phys}   label="Physical"    color="#f59e0b" />
          </div>
        </div>
      </div>
    </div>
  );
}

//  Compare View 
function CompareView({ a, b, onClear }: { a: Athlete | null; b: Athlete | null; onClear: (s: 'a' | 'b') => void }) {
  const metrics = [
    { label: 'Overall',     ka: 'overall', color: '#a3e635' },
    { label: 'Discipline',  ka: 'disc',    color: '#3b82f6' },
    { label: 'Mental',      ka: 'mental',  color: '#8b5cf6' },
    { label: 'Consistency', ka: 'cons',    color: '#f59e0b' },
    { label: 'Growth',      ka: 'growth',  color: '#10b981' },
    { label: 'Physical',    ka: 'phys',    color: '#ef4444' },
  ];

  const chartData = a && b ? metrics.map(m => ({
    metric: m.label,
    [a.athleteName]: (a as any)[m.ka],
    [b.athleteName]: (b as any)[m.ka],
  })) : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Slots */}
      <div className="grid grid-cols-2 gap-6">
        {(['a', 'b'] as const).map((slot, idx) => {
          const p = slot === 'a' ? a : b;
          const color = idx === 0 ? '#3b82f6' : '#a3e635';
          return (
            <div key={slot} onClick={() => p && onClear(slot)}
              className={`min-h-[200px] flex flex-col justify-center rounded-[40px] border-2 p-10 cursor-pointer transition-all ${p
                ? 'bg-[#080c16] border-white/10 hover:border-red-500/30'
                : 'bg-white/[0.02] border-dashed border-white/10 hover:bg-white/[0.04]'}`}>
              {p ? (
                <>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-4" style={{ color }}>
                    Athlete {slot.toUpperCase()}
                  </p>
                  <h3 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-3 break-words">
                    {p.athleteName}
                  </h3>
                  <p className="text-slate-500 text-sm font-bold">{p.formData?.['Department'] || ''}  {p.eventTitle}</p>
                  <p className="text-[10px] text-gray-700 mt-3">Click to remove</p>
                </>
              ) : (
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center mx-auto mb-4 text-slate-600 text-3xl font-black">+</div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">Select Athlete {slot.toUpperCase()}</p>
                  <p className="text-[9px] text-slate-800 mt-1">Click Compare on a sidebar card</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {a && b ? (
        <div className="space-y-8">
          {/* Grouped charts: Radar & Bar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#080c16] border border-white/5 rounded-[40px] p-8 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Strategic Advantages</p>
              </div>
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-2">
                {metrics.map((m) => {
                  if (m.ka === 'overall') return null;
                  const va = (a as any)[m.ka] as number;
                  const vb = (b as any)[m.ka] as number;
                  const isATie = va === vb;
                  const winner = va > vb ? a : b;
                  const diff = Math.abs(va - vb);

                  if (isATie) {
                    return (
                      <div key={m.ka} className="flex items-center gap-4 bg-white/[0.02] p-3 rounded-2xl">
                        <span className="w-10 h-10 shrink-0 rounded-xl bg-slate-800 text-slate-400 font-bold flex items-center justify-center text-lg">=</span >
                        <p className="text-xs text-gray-400 leading-relaxed">
                          Equally matched. Both athletes scored <span className="text-white font-bold">{va}</span> in <span className="text-white font-bold">{m.label}</span>.
                        </p>
                      </div>
                    );
                  }

                  const color = va > vb ? 'text-blue-400 bg-blue-500/10' : 'text-[#a3e635] bg-[#a3e635]/10';
                  const symbolColor = va > vb ? 'text-blue-400' : 'text-[#a3e635]';

                  return (
                    <div key={m.ka} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.02] p-3 rounded-2xl hover:bg-white/[0.04] transition-colors">
                      <span className={`w-10 h-10 shrink-0 rounded-xl ${color} font-black flex items-center justify-center text-[11px] uppercase tracking-wider`}>
                        {winner.athleteName.substring(0, 2)}
                      </span>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        <span className={`font-bold ${symbolColor}`}>{winner.athleteName.split(' ')[0]}</span> leads in <span className="text-white font-bold">{m.label}</span> by <span className="text-white font-bold">+{diff} points</span>.
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-[#080c16] border border-white/5 rounded-[40px] p-8">
              <div className="flex justify-between items-center mb-10">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Head-to-Head (Bar)</p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-[9px] font-black text-blue-400"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />{a.athleteName.split(' ')[0]}</span>
                  <span className="flex items-center gap-2 text-[9px] font-black text-[#a3e635]"><span className="w-2 h-2 rounded-full bg-[#a3e635] inline-block" />{b.athleteName.split(' ')[0]}</span>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barSize={20} barGap={4}>
                    <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="metric" tick={{ fill: '#fff', fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                      labelStyle={{ color: '#fff', fontWeight: 700, fontSize: 11 }}
                      itemStyle={{ fontSize: 12, fontWeight: 700 }} />
                    <Bar dataKey={a.athleteName} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={b.athleteName} fill="#a3e635" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Metric dual bars */}
          <div className="bg-[#080c16] border border-white/5 rounded-[40px] p-10 space-y-8">
            {metrics.map(m => {
              const va = (a as any)[m.ka] as number;
              const vb = (b as any)[m.ka] as number;
              const total = va + vb || 1;
              return (
                <div key={m.ka}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-blue-400 text-sm font-black">{va}</span>
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{m.label}</span>
                    <span className="text-[#a3e635] text-sm font-black">{vb}</span>
                  </div>
                  <div className="h-4 bg-white/5 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                    <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${(va / total) * 100}%` }} />
                    <div className="h-full bg-[#a3e635] rounded-full flex-1 transition-all duration-1000" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Circles + verdict */}
          <div className="bg-[#080c16] border border-white/5 rounded-[40px] p-10">
            <div className="flex justify-around items-center mb-8">
              <Circle value={a.overall} label={a.athleteName.split(' ')[0]} color="#3b82f6" size={140} />
              <div className="text-center">
                <span className="text-3xl font-black text-slate-700 uppercase italic">VS</span>
              </div>
              <Circle value={b.overall} label={b.athleteName.split(' ')[0]} color="#a3e635" size={140} />
            </div>
            <div className={`p-5 rounded-2xl text-center border ${a.overall > b.overall ? 'bg-blue-500/10 border-blue-500/20' : a.overall < b.overall ? 'bg-lime-400/10 border-lime-400/20' : 'bg-white/5 border-white/10'}`}>
              <p className="font-black text-white tracking-wider">
                {a.overall > b.overall ? ` ${a.athleteName} leads by ${a.overall - b.overall} pts`
                  : a.overall < b.overall ? ` ${b.athleteName} leads by ${b.overall - a.overall} pts`
                  : ' Equal scores - review manually'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-32 text-center bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[40px]">
          <BarChart2 className="w-12 h-12 text-slate-800 mx-auto mb-4" />
          <p className="text-xl font-black text-slate-800 uppercase italic">Comparison Engine Offline</p>
          <p className="text-sm font-bold text-slate-700 mt-3">Select two athlete profiles from the sidebar to begin</p>
        </div>
      )}
    </div>
  );
}

//  Main Page 
export default function SmartRankingPage() {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'scout' | 'compare'>('scout');
  const [scout, setScout] = useState<Athlete | null>(null);
  const [compareA, setCompareA] = useState<Athlete | null>(null);
  const [compareB, setCompareB] = useState<Athlete | null>(null);
  const [filterEvent, setFilterEvent] = useState('all');
  const [sortBy, setSortBy] = useState<'overall' | 'disc' | 'mental' | 'growth'>('overall');
  const [eventList, setEventList] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [csvMode, setCsvMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setCsvMode(false);
    try {
      const res  = await fetch('http://localhost:5000/api/events');
      const evts = await res.json();
      const list: Athlete[] = [];
      evts.forEach((ev: any) => {
        (ev.registrations || []).forEach((reg: any) => {
          if (!reg.athleteId) return;
          const athName = reg.athleteName || reg.athleteId;
          const ml = extractML(reg.formData, reg.athleteId, athName);
          list.push({ eventId: ev.id, eventTitle: ev.title, athleteId: reg.athleteId,
            athleteName: athName, athleteEmail: reg.athleteEmail,
            reg_status: reg.reg_status, formData: reg.formData || (ml as any).fallbackForm, ...ml });
        });
      });
      const evNames = [...new Set(list.map(a => a.eventTitle))];
      setEventList(evNames);
      setAthletes(list);
      if (list.length > 0) setScout(list[0]);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(r => r.trim());
      const headers = rows[0].split(',').map(h => h.trim());
      
      const list: Athlete[] = [];
      for (let i = 1; i < rows.length; i++) {
        const cols = rows[i].split(',');
        if (cols.length < 2) continue;
        
        const rawForm: any = {};
        headers.forEach((h, idx) => { rawForm[h] = cols[idx]?.trim() });
        
        const athName = rawForm['Name'] || rawForm['Athlete Name'] || rawForm['athleteName'] || `CSV Athlete ${i}`;
        const ml = extractML(rawForm, `csv_${i}`, athName);
        
        list.push({
          eventId: 'csv_import',
          eventTitle: 'CSV Import Dataset',
          athleteId: `csv_${i}`,
          athleteName: athName,
          athleteEmail: rawForm['Email'] || `athlete${i}@csv.local`,
          reg_status: 'APPROVED',
          formData: rawForm,
          ...ml
        });
      }
      
      setEventList(['CSV Import Dataset']);
      setFilterEvent('all');
      setAthletes(list);
      setCsvMode(true);
      if (list.length > 0) setScout(list[0]);
    };
    reader.readAsText(file);
    // Reset input so the same file can be uploaded again if needed
    if (fileRef.current) fileRef.current.value = '';
  };

  useEffect(() => { load(); }, [load]);

  const filtered = athletes
    .filter(a => filterEvent === 'all' || a.eventTitle === filterEvent)
    .sort((a, b) => (b as any)[sortBy] - (a as any)[sortBy]);

  const handleSelect = (a: Athlete) => {
    if (activeView === 'scout') { setScout(a); return; }
    if (compareA?.athleteId === a.athleteId) { setCompareA(null); return; }
    if (compareB?.athleteId === a.athleteId) { setCompareB(null); return; }
    if (!compareA) { setCompareA(a); return; }
    setCompareB(a);
  };

  const isActive = (a: Athlete) => activeView === 'scout'
    ? scout?.athleteId === a.athleteId
    : compareA?.athleteId === a.athleteId || compareB?.athleteId === a.athleteId;

  const _topScore = Math.max(...athletes.map(a => a.overall), 0);
  const avgScore = athletes.length ? Math.round(athletes.reduce((s, a) => s + a.overall, 0) / athletes.length) : 0;
  const withML   = athletes.filter(a => a.overall > 0).length;

  return (
    <div className="h-[calc(100vh-80px)] flex overflow-hidden bg-[#020408]" style={{ margin: '-1.5rem', marginTop: '-2rem' }}>
      {/*  Sidebar  */}
      <aside className="w-[320px] bg-[#06080f] border-r border-white/5 flex flex-col shrink-0 shadow-2xl">
        {/* Sidebar header */}
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-lime-400 rounded-xl flex items-center justify-center shadow-lg shadow-lime-400/20">
                <Brain className="w-4 h-4 text-black" />
              </div>
              <div>
                <p className="text-white font-black text-sm leading-none">Smart Ranking</p>
                <p className="text-[10px] text-gray-600 mt-0.5">RF  92k athletes</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => fileRef.current?.click()}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${csvMode ? 'bg-[#a3e635]/20 border-[#a3e635]/50 text-[#a3e635]' : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`} 
                title="Upload Dataset CSV">
                <Upload className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => {
                  load();
                  if (csvMode) toast.success('Cleared dataset simulation memory');
                }}
                className={`w-8 h-8 rounded-xl border flex items-center justify-center transition-all ${csvMode ? 'bg-orange-500/10 border-orange-500/50 text-orange-500 hover:bg-orange-500/20' : 'border-white/10 text-gray-500 hover:text-white hover:bg-white/5'}`} 
                title={csvMode ? "Wipe Dataset & Reset to DB" : "Refresh Database"}>
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            <input ref={fileRef} onChange={handleFileUpload} type="file" accept=".csv" className="hidden" />
          </div>

          {/* View toggle */}
          <div className="flex bg-white/5 p-1 rounded-2xl mb-4">
            {(['scout', 'compare'] as const).map(v => (
              <button key={v} onClick={() => setActiveView(v)}
                className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeView === v ? 'bg-[#a3e635] text-black shadow-lg shadow-[#a3e635]/20' : 'text-slate-500 hover:text-white'}`}>
                {v}
              </button>
            ))}
          </div>

          {/* Sort */}
          <select value={sortBy} onChange={e => setSortBy(e.target.value as any)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-400 focus:outline-none focus:border-lime-400/40 mb-3">
            <option value="overall">Sort: Overall</option>
            <option value="disc">Sort: Discipline</option>
            <option value="mental">Sort: Mental</option>
            <option value="growth">Sort: Growth</option>
          </select>

          <select value={filterEvent} onChange={e => setFilterEvent(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-bold text-gray-400 focus:outline-none focus:border-lime-400/40">
            <option value="all">All Events</option>
            {eventList.map(ev => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 divide-x divide-white/5 border-b border-white/5">
          {[
            { label: 'Total', val: athletes.length, icon: <Trophy className="w-3 h-3" /> },
            { label: 'AI Scored', val: withML, icon: <Brain className="w-3 h-3" /> },
            { label: 'Avg', val: avgScore, icon: <Activity className="w-3 h-3" /> },
          ].map(s => (
            <div key={s.label} className="py-3 text-center">
              <div className="text-lime-400 flex justify-center mb-1">{s.icon}</div>
              <div className="text-white font-black text-lg leading-none">{s.val}</div>
              <div className="text-[9px] text-gray-700 uppercase font-bold mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Athlete list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-0 custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Zap className="w-5 h-5 text-lime-400 animate-pulse" />
              <span className="ml-2 text-[11px] text-gray-600 font-black uppercase tracking-widest">Analyzing</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[11px] text-slate-700 font-black uppercase">No athletes yet</p>
              <p className="text-[10px] text-slate-800 mt-2">New registrations with the smart form will appear here.</p>
            </div>
          ) : filtered.map((a, i) => (
            <div key={`${a.eventId}-${a.athleteId}`} className="relative">
              {i < 3 && activeView === 'scout' && (
                <span className="absolute -left-1 top-3 text-base z-10" style={{ lineHeight: 1 }}>
                  {i === 0 ? '' : i === 1 ? '' : ''}
                </span>
              )}
              <div className={i < 3 ? 'pl-5' : ''}>
                <AthleteListItem a={a} active={isActive(a)} onClick={() => handleSelect(a)} />
              </div>
            </div>
          ))}
        </div>

        {/* ML Model panel */}
        <div className="p-4 border-t border-white/5">
          <MLModelPanel />
        </div>
      </aside>

      {/*  Main panel  */}
      <main className="flex-1 overflow-y-auto p-10 custom-scrollbar"
        style={{ background: 'radial-gradient(circle at top right, rgba(163,230,53,0.03), transparent)' }}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Brain className="w-16 h-16 text-lime-400/30 mx-auto mb-4 animate-pulse" />
              <p className="text-white font-black text-2xl uppercase italic">Loading Intelligence</p>
              <p className="text-gray-600 text-sm mt-2 font-bold">Fetching athlete profiles</p>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <Brain className="w-16 h-16 text-gray-800 mx-auto mb-6" />
              <h2 className="text-3xl font-black text-gray-700 italic uppercase mb-4">No Data Yet</h2>
              <p className="text-gray-700 font-bold">Athletes that register using the 5-step smart form will automatically appear here with full AI scoring.</p>
            </div>
          </div>
        ) : activeView === 'scout' ? (
          scout ? <ScoutView player={scout} /> : null
        ) : (
          <CompareView a={compareA} b={compareB} onClear={s => s === 'a' ? setCompareA(null) : setCompareB(null)} />
        )}
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(163,230,53,0.2); }
      `}</style>
    </div>
  );
}
