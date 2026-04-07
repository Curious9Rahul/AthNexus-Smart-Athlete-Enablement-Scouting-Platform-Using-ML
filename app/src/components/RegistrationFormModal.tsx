import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import type { AppEvent } from '@/hooks/useEvents';

interface Props { event: AppEvent; onClose: () => void; onSuccess: () => void; }

/* ── Pill selector ── */
function Pills({ options, value, onChange }: { name?: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button key={o} type="button"
          onClick={() => onChange(o)}
          className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${value === o
            ? 'bg-lime-400/20 border-lime-400/60 text-lime-400'
            : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

/* ── ML scoring engine (mirrors the HTML form's calcAll exactly) ── */
function calcScores(S: Record<string, any>) {
  const h = parseInt(S.height) || 0;
  const w = parseInt(S.weight) || 0;
  const bmi = h > 0 && w > 0 ? parseFloat((w / ((h / 100) ** 2)).toFixed(1)) : 22;
  const fitCat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Fit' : bmi < 30 ? 'Overweight' : 'Obese';

  let pr = 50;
  if (bmi < 18.5) pr -= 10; else if (bmi < 25) pr += 20; else if (bmi < 28) pr += 5; else if (bmi >= 30) pr -= 15;
  pr += ({ High: 20, Moderate: 10, Low: -5 } as any)[S.activityLevel] || 0;
  const sl = S.sleepHours || 7;
  pr += (sl >= 7 && sl <= 9) ? 15 : (sl === 6 || sl === 10) ? 5 : -10;
  pr = Math.max(0, Math.min(100, Math.round(pr)));

  let en = 50;
  en += ({ Daily: 20, '4-5 times/week': 14, '2-3 times/week': 6, Rarely: -10 } as any)[S.trainingFreq] || 0;
  en += ({ High: 12, Moderate: 6, Low: -4 } as any)[S.activityLevel] || 0;
  en += ({ Regular: 10, Occasional: 4, Practice: -2 } as any)[S.matchExp] || 0;
  if (sl >= 7 && sl <= 9) en += 5;
  const endurance = en >= 80 ? 'High' : en >= 55 ? 'Medium' : 'Low';

  let ir = 0;
  if (bmi < 18.5 || bmi >= 30) ir += 2; else if (bmi >= 27) ir += 1;
  if (S.activityLevel === 'High') ir += 1;
  if (sl <= 5) ir += 2; else if (sl <= 6) ir += 1;
  const injRisk = ir >= 4 ? 'High' : ir >= 2 ? 'Medium' : 'Low';

  const disc = Math.max(0, Math.min(100, Math.round(
    ({ Daily: 50, '4-5 times/week': 38, '2-3 times/week': 22, Rarely: 5 } as any)[S.trainingFreq] +
    ({ 'Yes regularly': 50, Sometimes: 30, No: 5 } as any)[S.selfTraining]
  )));

  const mental = Math.max(0, Math.min(100, Math.round(
    ({ 'Perform better': 50, Same: 32, 'Get nervous': 8 } as any)[S.pressure] +
    ({ 'Very consistent': 50, 'Sometimes inconsistent': 30, 'Mostly inconsistent': 8 } as any)[S.consistency]
  )));

  const cons = Math.max(0, Math.min(100, Math.round(
    ({ 'Very consistent': 55, 'Sometimes inconsistent': 30, 'Mostly inconsistent': 8 } as any)[S.consistency] +
    ({ Daily: 45, '4-5 times/week': 32, '2-3 times/week': 18, Rarely: 5 } as any)[S.trainingFreq]
  )));

  const growth = Math.max(0, Math.min(100, Math.round(
    ({ 'Improved a lot': 30, 'Slight improvement': 20, 'No change': 8, 'Got worse': 2 } as any)[S.improvementTrend] +
    ({ Fast: 25, Average: 16, Slow: 5 } as any)[S.learningSpeed] +
    ({ Better: 25, Same: 16, Worse: 5 } as any)[S.bigMatch] +
    ({ Regular: 20, Occasional: 12, Practice: 4 } as any)[S.matchExp]
  )));

  const overall = Math.max(0, Math.min(100, Math.round(
    disc * 0.25 + mental * 0.25 + cons * 0.20 + growth * 0.20 + pr * 0.10
  )));

  return { bmi, fitCat, pr, endurance, injRisk, disc, mental, cons, growth, overall };
}

const DEPTS = ['Computer Science', 'IT', 'AIML', 'AIDS', 'CSDS', 'Mechanical', 'Civil', 'EXTC', 'Chemical', 'Electronics'];

const STEPS = [
  'Basic Info',
  'Training',
  'Mindset',
  'Team & Growth',
  'Physical Profile',
];

export default function RegistrationFormModal({ event, onClose, onSuccess }: Props) {
  const { user } = useAuth();
  const { registerForEvent } = useEvents();
  const backdropRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [S, setS] = useState<Record<string, any>>({
    name: user?.profile?.name || user?.email || '',
    age: '', dept: '', year: '', whyPlay: '',
    trainingFreq: '', selfTraining: '',
    pressure: '', consistency: '',
    teamRole: '', communication: '', improvementTrend: '',
    strengthText: '', weaknessText: '',
    matchExp: '', bigMatch: '', learningSpeed: '',
    height: '', weight: '', activityLevel: '', sleepHours: 7,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  const set = (key: string, val: any) => {
    setS(prev => ({ ...prev, [key]: val }));
    setValidationMsg('');
  };

  const validate = () => {
    if (step === 0) return S.age && S.dept && S.year && S.whyPlay?.trim().length > 3;
    if (step === 1) return S.trainingFreq && S.selfTraining;
    if (step === 2) return S.pressure && S.consistency;
    if (step === 3) return S.teamRole && S.communication && S.improvementTrend &&
      S.matchExp && S.bigMatch && S.learningSpeed &&
      S.strengthText?.trim().length > 3 && S.weaknessText?.trim().length > 3;
    if (step === 4) return S.height && S.weight && S.activityLevel;
    return true;
  };

  const next = () => {
    if (!validate()) { setValidationMsg('Please complete all fields before continuing.'); return; }
    setStep(s => Math.min(4, s + 1));
    setValidationMsg('');
  };
  const back = () => { setStep(s => Math.max(0, s - 1)); setValidationMsg(''); };

  const handleSubmit = async () => {
    if (!validate()) { setValidationMsg('Please complete all fields.'); return; }
    if (!user) return;
    setIsSubmitting(true);

    const scores = calcScores(S);
    const formPayload: Record<string, string> = {
      // Raw answers
      'Age': S.age, 'Department': S.dept, 'Year': S.year,
      'Why Play': S.whyPlay, 'Training Frequency': S.trainingFreq,
      'Self Training': S.selfTraining, 'Pressure Handling': S.pressure,
      'Consistency': S.consistency, 'Team Role': S.teamRole,
      'Communication': S.communication, 'Improvement Trend': S.improvementTrend,
      'Strength': S.strengthText, 'Weakness': S.weaknessText,
      'Match Experience': S.matchExp, 'Big Match Performance': S.bigMatch,
      'Learning Speed': S.learningSpeed, 'Height (cm)': S.height,
      'Weight (kg)': S.weight, 'Activity Level': S.activityLevel,
      'Sleep Hours': String(S.sleepHours),
      // ML computed scores (used by verifier ranking)
      '__ml_overall': String(scores.overall),
      '__ml_disc': String(scores.disc),
      '__ml_mental': String(scores.mental),
      '__ml_cons': String(scores.cons),
      '__ml_growth': String(scores.growth),
      '__ml_phys': String(scores.pr),
      '__ml_bmi': String(scores.bmi),
      '__ml_endurance': scores.endurance,
      '__ml_injury': scores.injRisk,
      '__ml_fitness': scores.fitCat,
    };

    const success = await registerForEvent(
      event.id,
      { athleteId: user.email, athleteName: user.profile?.name || user.email, athleteEmail: user.email },
      formPayload
    );
    setIsSubmitting(false);
    if (success) {
      toast.success('✅ Registration submitted! Await verifier approval.');
      onSuccess(); onClose();
    }
  };

  const bmi = (parseFloat(S.height) > 0 && parseFloat(S.weight) > 0)
    ? (parseFloat(S.weight) / ((parseFloat(S.height) / 100) ** 2)).toFixed(1) : null;

  return (
    <div ref={backdropRef} onClick={e => e.target === backdropRef.current && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d1520] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{event.image_emoji}</div>
              <div>
                <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest">Register for Event</p>
                <h2 className="text-base font-black text-white leading-tight">{event.title}</h2>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/10 transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>
          {/* Progress Bar */}
          <div className="flex items-center gap-3 mb-2">
            {STEPS.map((_s, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${i <= step ? 'bg-lime-400' : 'bg-white/10'}`} />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {step === 0 && <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
              <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 placeholder:text-gray-600"
                placeholder="e.g. Aryan Patil" value={S.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Age</label>
                <input type="number" min={15} max={35} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50"
                  placeholder="20" value={S.age} onChange={e => set('age', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Year</label>
                <select className="w-full bg-[#0d1520] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50"
                  value={S.year} onChange={e => set('year', e.target.value)}>
                  <option value="">Select</option>
                  {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Department</label>
              <select className="w-full bg-[#0d1520] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50"
                value={S.dept} onChange={e => set('dept', e.target.value)}>
                <option value="">Select department</option>
                {DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Why do you play sports? <span className="text-gray-600 normal-case font-normal">(max 80 chars)</span></label>
              <textarea maxLength={80} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 placeholder:text-gray-600 resize-none"
                placeholder="e.g. I love competing and want to represent my college"
                value={S.whyPlay} onChange={e => set('whyPlay', e.target.value)} />
            </div>
          </>}

          {step === 1 && <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">How often do you train?</label>
              <Pills name="tf" options={['Daily', '4-5 times/week', '2-3 times/week', 'Rarely']} value={S.trainingFreq} onChange={v => set('trainingFreq', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Self-training outside sessions?</label>
              <Pills name="st" options={['Yes regularly', 'Sometimes', 'No']} value={S.selfTraining} onChange={v => set('selfTraining', v)} />
            </div>
          </>}

          {step === 2 && <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Performance under pressure?</label>
              <Pills name="ph" options={['Perform better', 'Same', 'Get nervous']} value={S.pressure} onChange={v => set('pressure', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Training consistency?</label>
              <Pills name="cn" options={['Very consistent', 'Sometimes inconsistent', 'Mostly inconsistent']} value={S.consistency} onChange={v => set('consistency', v)} />
            </div>
          </>}

          {step === 3 && <>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Role in the team</label>
              <Pills name="tr" options={['Leader', 'Support', 'Flexible']} value={S.teamRole} onChange={v => set('teamRole', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Communication with teammates</label>
              <Pills name="cm" options={['Very good', 'Average', 'Poor']} value={S.communication} onChange={v => set('communication', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Improvement trend this season</label>
              <Pills name="it" options={['Improved a lot', 'Slight improvement', 'No change', 'Got worse']} value={S.improvementTrend} onChange={v => set('improvementTrend', v)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Match experience</label>
                <Pills name="me" options={['Regular', 'Occasional', 'Practice']} value={S.matchExp} onChange={v => set('matchExp', v)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Big match performance</label>
                <Pills name="bm" options={['Better', 'Same', 'Worse']} value={S.bigMatch} onChange={v => set('bigMatch', v)} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Learning speed for new skills</label>
              <Pills name="ls" options={['Fast', 'Average', 'Slow']} value={S.learningSpeed} onChange={v => set('learningSpeed', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your biggest strength <span className="text-gray-600 normal-case font-normal">(max 60 chars)</span></label>
              <textarea maxLength={60} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 placeholder:text-gray-600 resize-none"
                placeholder="e.g. I recover fast and stay calm under pressure"
                value={S.strengthText} onChange={e => set('strengthText', e.target.value)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Your main weakness <span className="text-gray-600 normal-case font-normal">(max 60 chars)</span></label>
              <textarea maxLength={60} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50 placeholder:text-gray-600 resize-none"
                placeholder="e.g. I get nervous before big matches"
                value={S.weaknessText} onChange={e => set('weaknessText', e.target.value)} />
            </div>
          </>}

          {step === 4 && <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Height (cm)</label>
                <input type="number" min={140} max={220} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50"
                  placeholder="175" value={S.height} onChange={e => set('height', e.target.value)} />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Weight (kg)</label>
                <input type="number" min={40} max={150} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-lime-400/50"
                  placeholder="68" value={S.weight} onChange={e => set('weight', e.target.value)} />
              </div>
            </div>
            {bmi && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                <span className="text-xs text-gray-400">BMI</span>
                <span className="text-white font-black">{bmi}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${parseFloat(bmi) < 18.5 ? 'bg-blue-500/20 text-blue-400' : parseFloat(bmi) < 25 ? 'bg-lime-400/20 text-lime-400' : parseFloat(bmi) < 30 ? 'bg-orange-400/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                  {parseFloat(bmi) < 18.5 ? 'Underweight' : parseFloat(bmi) < 25 ? 'Fit ✓' : parseFloat(bmi) < 30 ? 'Overweight' : 'Obese'}
                </span>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Activity level outside training</label>
              <Pills name="al" options={['High', 'Moderate', 'Low']} value={S.activityLevel} onChange={v => set('activityLevel', v)} />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Average sleep per night: <span className="text-lime-400 font-black">{S.sleepHours} hrs</span>
              </label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-600">4</span>
                <input type="range" min={4} max={10} step={1} value={S.sleepHours}
                  className="flex-1 accent-lime-400"
                  onChange={e => set('sleepHours', parseInt(e.target.value))} />
                <span className="text-xs text-gray-600">10</span>
              </div>
            </div>

            {/* Preview score */}
            {S.height && S.weight && S.activityLevel && S.trainingFreq && S.pressure && (
              <div className="p-4 bg-lime-400/5 border border-lime-400/20 rounded-2xl">
                <p className="text-[10px] font-black text-lime-400 uppercase tracking-widest mb-3">Your Profile Preview</p>
                <div className="grid grid-cols-3 gap-3">
                  {(() => {
                    const sc = calcScores(S);
                    return [
                      { label: 'Discipline', val: sc.disc },
                      { label: 'Mental', val: sc.mental },
                      { label: 'Growth', val: sc.growth },
                      { label: 'Physical', val: sc.pr },
                      { label: 'Consistency', val: sc.cons },
                      { label: 'Overall', val: sc.overall },
                    ].map(m => (
                      <div key={m.label} className="text-center">
                        <div className={`text-2xl font-black ${m.label === 'Overall' ? 'text-lime-400' : 'text-white'}`}>{m.val}</div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold">{m.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}
          </>}

          {validationMsg && (
            <div className="flex items-center gap-2 text-red-400 text-xs font-medium animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {validationMsg}
            </div>
          )}

          {/* Info strip */}
          <div className="flex items-start gap-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3">
            <span className="text-sm shrink-0">🤖</span>
            <p className="text-xs text-blue-300 font-medium leading-relaxed">
              Your profile is scored by our AI model. The verifier uses these scores to rank and select athletes.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0 border-t border-white/5 flex gap-3 shrink-0">
          {step > 0 ? (
            <button type="button" onClick={back}
              className="flex items-center gap-2 py-3 px-5 rounded-2xl border border-white/10 text-gray-400 hover:text-white font-black text-sm transition-all">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <button type="button" onClick={onClose}
              className="py-3 px-5 rounded-2xl border border-white/10 text-gray-400 hover:text-white font-black text-sm transition-all">
              Cancel
            </button>
          )}
          {step < 4 ? (
            <button type="button" onClick={next}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-lime-400 hover:bg-lime-500 text-[#0d1520] font-black text-sm transition-all active:scale-95">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-lime-400 hover:bg-lime-500 text-[#0d1520] font-black text-sm transition-all active:scale-95 disabled:opacity-60 shadow-lg shadow-lime-400/20">
              {isSubmitting ? 'Submitting…' : 'Submit Registration →'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
