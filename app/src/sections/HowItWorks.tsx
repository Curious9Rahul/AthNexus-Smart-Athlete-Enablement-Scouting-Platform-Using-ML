import { UserPlus, CalendarCheck, Brain, Users } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: UserPlus,
      step: '01',
      title: 'Create Profile',
      description: 'Students build profiles with achievements and stats.',
    },
    {
      icon: CalendarCheck,
      step: '02',
      title: 'Publish Events',
      description: 'Faculty creates events with requirements.',
    },
    {
      icon: Brain,
      step: '03',
      title: 'AI Recommends',
      description: 'ML analyzes and ranks best players.',
    },
    {
      icon: Users,
      step: '04',
      title: 'Guide Teams',
      description: 'Faculty leads with full transparency.',
    },
  ];

  return (
    <section id="how-it-works" className="relative py-32 bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-8">
            <span className="text-cyan-400 text-sm font-medium">How It Works</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Simple Process
          </h2>
        </div>

        {/* Steps - Horizontal on desktop */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-lime-400/10 flex items-center justify-center mb-6">
                <item.icon className="w-7 h-7 text-lime-400" />
              </div>
              <div className="text-5xl font-bold text-white/10 mb-4">{item.step}</div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
