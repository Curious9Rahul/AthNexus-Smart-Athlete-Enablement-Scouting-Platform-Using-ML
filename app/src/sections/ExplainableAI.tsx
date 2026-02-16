import { Brain, TrendingUp, Award, Target, CheckCircle2 } from 'lucide-react';

const ExplainableAI = () => {
  const factors = [
    { label: 'Consistency', value: 32, icon: TrendingUp },
    { label: 'State Experience', value: 25, icon: Award },
    { label: 'Recent Form', value: 18, icon: Target },
    { label: 'Fitness Score', value: 12, icon: CheckCircle2 },
  ];

  return (
    <section id="ai" className="relative py-32 bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-400/10 border border-lime-400/20 mb-8">
            <Brain className="w-4 h-4 text-lime-400" />
            <span className="text-lime-400 text-sm font-medium">AI-Powered</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Explainable Selection
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Our AI doesn't just recommend—it explains why.
          </p>
        </div>

        {/* Score Card */}
        <div className="max-w-lg mx-auto">
          <div className="bg-[#1e293b] rounded-3xl border border-white/10 p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-lime-400 flex items-center justify-center text-xl font-bold text-[#0f172a]">
                  RS
                </div>
                <div>
                  <h3 className="text-white font-semibold">Rahul Sharma</h3>
                  <p className="text-gray-400 text-sm">Cricket</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-lime-400">92%</div>
                <div className="text-sm text-gray-400">Score</div>
              </div>
            </div>

            {/* Factors */}
            <div className="space-y-5">
              {factors.map((factor, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <factor.icon className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{factor.label}</span>
                    </div>
                    <span className="text-lime-400 text-sm font-medium">+{factor.value}%</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-lime-400 rounded-full"
                      style={{ width: `${factor.value * 2}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Badge */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-lime-400/10 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-lime-400" />
                <span className="text-lime-400 text-sm font-medium">
                  Recommended for State Level
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExplainableAI;
