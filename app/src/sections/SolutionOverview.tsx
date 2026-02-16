import { UserCircle, CalendarDays, Brain, Scale, BarChart3 } from 'lucide-react';

const SolutionOverview = () => {
  const solutions = [
    {
      icon: UserCircle,
      title: 'Athlete Showcase',
      description: 'Digital profiles with achievements and performance metrics.',
    },
    {
      icon: CalendarDays,
      title: 'Event Management',
      description: 'Organize events with faculty guides and clear accountability.',
    },
    {
      icon: Brain,
      title: 'AI Recommendations',
      description: 'Data-driven player selection with explainable scores.',
    },
    {
      icon: Scale,
      title: 'Fairness Detection',
      description: 'Automated bias monitoring for equal opportunities.',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Comprehensive dashboards with insights and reports.',
    },
  ];

  return (
    <section id="features" className="relative py-32 bg-[#0f172a]">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-8">
            <span className="text-lime-400 text-sm font-medium">The Solution</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            One Platform. Complete Ecosystem.
          </h2>
        </div>

        {/* Solutions Grid - Minimal cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className="group p-8 bg-white/[0.02] rounded-2xl border border-white/5 hover:border-lime-400/30 hover:bg-white/[0.04] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-lime-400/10 flex items-center justify-center mb-6 group-hover:bg-lime-400/20 transition-colors">
                <solution.icon className="w-6 h-6 text-lime-400" />
              </div>
              <h3 className="text-white font-semibold text-lg mb-3">{solution.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{solution.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionOverview;
