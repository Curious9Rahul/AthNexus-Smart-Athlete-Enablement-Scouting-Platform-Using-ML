import { Scale, Shield, AlertTriangle, CheckCircle2, Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const FairnessTransparency = () => {
  const metrics = [
    { label: 'Gender Parity', value: 98, status: 'good' },
    { label: 'Year Balance', value: 94, status: 'good' },
    { label: 'Dept Diversity', value: 87, status: 'good' },
    { label: 'Experience Equity', value: 91, status: 'good' },
  ];

  const alerts = [
    {
      type: 'warning',
      message: 'Low participation from 1st year students in Basketball',
      action: 'Recommended: Outreach program',
    },
    {
      type: 'success',
      message: 'Excellent gender balance maintained in Athletics',
      action: 'Continue current approach',
    },
  ];

  return (
    <section className="relative py-24 bg-[#0f172a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-500/20 mb-6">
            <Scale className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 text-sm font-medium">Fairness & Transparency</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            <span className="text-lime-400">Ethical AI</span> for Sports Selection
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Every selection is monitored for fairness. Our bias detection system 
            ensures equal opportunities for all athletes.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Fairness Score Card */}
          <div className="lg:col-span-2">
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-lime-400" />
                  Fairness Dashboard
                </h3>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  All Systems Good
                </Badge>
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-6 mb-8 p-4 bg-white/5 rounded-xl">
                <div className="relative w-24 h-24">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-white/10"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    />
                    <path
                      className="text-lime-400"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeDasharray="92, 100"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">92</span>
                  </div>
                </div>
                <div>
                  <div className="text-white font-semibold text-lg">Overall Fairness Score</div>
                  <div className="text-gray-400 text-sm">Based on last 30 events</div>
                  <div className="flex items-center gap-2 mt-2">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 text-sm">+3% from last month</span>
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                {metrics.map((metric, index) => (
                  <div key={index} className="p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300 text-sm">{metric.label}</span>
                      <span className="text-lime-400 font-semibold">{metric.value}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-lime-400 rounded-full"
                        style={{ width: `${metric.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts & Info */}
          <div className="space-y-6">
            {/* Bias Alerts */}
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 p-6">
              <h3 className="text-white font-semibold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-400" />
                Bias Detection Alerts
              </h3>
              <div className="space-y-4">
                {alerts.map((alert, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl ${
                      alert.type === 'warning'
                        ? 'bg-orange-500/10 border border-orange-500/20'
                        : 'bg-green-500/10 border border-green-500/20'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {alert.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-sm ${
                          alert.type === 'warning' ? 'text-orange-200' : 'text-green-200'
                        }`}>
                          {alert.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          alert.type === 'warning' ? 'text-orange-400' : 'text-green-400'
                        }`}>
                          {alert.action}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Equal Opportunity Stats */}
            <div className="bg-gradient-to-br from-lime-400/20 to-green-500/20 rounded-2xl border border-lime-400/30 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-lime-400" />
                Equal Opportunity Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Juniors Selected</span>
                  <span className="text-lime-400 font-semibold">42%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Seniors Selected</span>
                  <span className="text-lime-400 font-semibold">58%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-sm">Gender Ratio</span>
                  <span className="text-lime-400 font-semibold">52:48</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12 text-center">
          <blockquote className="text-xl text-gray-300 italic">
            "Fairness isn't just about equal treatment—it's about creating equal opportunities 
            for every athlete to showcase their potential."
          </blockquote>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="w-8 h-1 bg-lime-400 rounded-full" />
            <span className="text-gray-500 text-sm">SportSphere Ethics Committee</span>
            <div className="w-8 h-1 bg-lime-400 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default FairnessTransparency;
