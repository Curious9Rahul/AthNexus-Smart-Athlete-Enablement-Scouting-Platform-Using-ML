import { AlertTriangle } from 'lucide-react';

const ProblemStatement = () => {
  const problems = [
    'Faculties don\'t know all athletes',
    'Achievements scattered in files/WhatsApp',
    'Event selection based on memory',
    'No transparency in selection',
  ];

  return (
    <section className="relative py-32 bg-[#0f172a]">
      <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
        {/* Section Header */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <span className="text-red-400 text-sm font-medium">The Challenge</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          The Gap in College Sports
        </h2>

        <p className="text-xl text-gray-400 mb-16 max-w-2xl mx-auto">
          Despite having talented athletes, colleges struggle with visibility and fair selection.
        </p>

        {/* Problems - Simple list */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className="px-6 py-3 bg-white/5 rounded-full border border-white/10 text-gray-300"
            >
              {problem}
            </div>
          ))}
        </div>

        {/* Punch Line */}
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-lime-400/20 rounded-2xl blur-xl" />
          <div className="relative bg-[#1e293b] rounded-2xl border border-lime-400/30 px-8 py-6">
            <p className="text-xl text-white">
              Great athletes remain <span className="text-red-400">unnoticed</span>.{' '}
              <span className="text-lime-400 font-semibold">SportSphere fixes this.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemStatement;
