import { Award, CheckCircle2 } from 'lucide-react';

const AthleteShowcase = () => {
  const athlete = {
    name: 'Rahul Sharma',
    department: 'Computer Science',
    sport: 'Cricket',
    achievements: ['State Level Gold', 'Inter-college MVP'],
    stats: { matches: 45, runs: 1280, wickets: 32 },
  };

  return (
    <section id="athletes" className="relative py-32 bg-[#0f172a]">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 mb-8">
            <Award className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Athlete Showcase</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Discover Talented Athletes
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Browse verified profiles with complete achievement timelines.
          </p>
        </div>

        {/* Single Profile Card - Clean */}
        <div className="max-w-md mx-auto">
          <div className="bg-[#1e293b] rounded-3xl border border-white/10 overflow-hidden">
            {/* Header */}
            <div className="h-24 bg-gradient-to-r from-blue-600 to-purple-600" />

            {/* Profile */}
            <div className="px-8 pb-8 -mt-12">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-2xl bg-lime-400 flex items-center justify-center text-2xl font-bold text-[#0f172a] border-4 border-[#1e293b] mb-4">
                RS
              </div>

              {/* Info */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">{athlete.name}</h3>
                  <CheckCircle2 className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-gray-400">{athlete.department}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-lime-400/20 rounded-full text-lime-400 text-sm">
                  {athlete.sport}
                </span>
              </div>

              {/* Achievements */}
              <div className="space-y-2 mb-6">
                {athlete.achievements.map((achievement, i) => (
                  <div key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                    <Award className="w-4 h-4 text-yellow-400" />
                    {achievement}
                  </div>
                ))}
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                {Object.entries(athlete.stats).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-xl font-bold text-lime-400">{value}</div>
                    <div className="text-xs text-gray-500 capitalize">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AthleteShowcase;
