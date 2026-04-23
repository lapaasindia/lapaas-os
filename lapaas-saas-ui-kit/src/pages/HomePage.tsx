import React, { useState } from 'react';
import { ArrowRight, CheckCircle, BarChart3, Zap, Users, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setEmail('');
      setSubmitted(false);
    }, 3000);
  };

  const modules = [
    {
      id: 'collections',
      name: 'Collections Engine',
      description: 'Automate your collections process',
      icon: TrendingUp,
      features: [
        'Automated dunning ladder',
        'WhatsApp & Email templates',
        'Collections Agent (AI)',
        'Real-time aging reports',
        'Collections KPIs'
      ],
      outcome: 'Improve collection current% by 80% in 60 days',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'sales',
      name: 'Sales OS',
      description: 'Manage your entire sales pipeline',
      icon: BarChart3,
      features: [
        'Sales funnel management',
        'Deal tracking & SLA',
        'Activity scorecards',
        'Sales Copilot (AI)',
        'Sales automations'
      ],
      outcome: 'Increase close rate from 15% to 30%',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'finance',
      name: 'Finance OS',
      description: 'Control your cash flow & compliance',
      icon: BarChart3,
      features: [
        '13-week cashflow planner',
        'Scenario builder',
        'Variance analysis',
        'Finance Copilot (AI)',
        'Compliance calendar'
      ],
      outcome: 'Reduce DSO from 45 to 20 days',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'operations',
      name: 'Operations OS',
      description: 'Standardize & scale your operations',
      icon: Settings,
      features: [
        'SOP Wiki with versioning',
        'Quality checklists',
        'Vendor scorecards',
        'Inventory tracking',
        'Preventive maintenance'
      ],
      outcome: 'Improve on-time delivery from 70% to 92%',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'people',
      name: 'People OS',
      description: 'Build & manage your team',
      icon: Users,
      features: [
        'KRA/KPI tracking',
        'Performance reviews',
        'Hiring pipeline',
        'Onboarding workflows',
        'Culture & recognition'
      ],
      outcome: 'Reduce hiring time by 50%',
      color: 'from-pink-500 to-pink-600'
    },
    {
      id: 'customer',
      name: 'Customer OS',
      description: 'Delight your customers',
      icon: MessageSquare,
      features: [
        'Helpdesk & SLA tracking',
        'NPS surveys',
        'Health scores',
        'Churn prevention',
        'Expansion plays'
      ],
      outcome: 'Increase NPS by 20+ points',
      color: 'from-cyan-500 to-cyan-600'
    }
  ];

  const userRoles = [
    {
      role: 'Collections Manager',
      module: 'Collections Engine',
      tasks: [
        'View aging invoices',
        'Send collection reminders',
        'Track collections status',
        'View collections KPIs',
        'Generate collections report'
      ]
    },
    {
      role: 'Sales Manager',
      module: 'Sales OS',
      tasks: [
        'Manage sales pipeline',
        'Track deal progress',
        'Monitor sales activities',
        'Get AI sales coaching',
        'View sales forecast'
      ]
    },
    {
      role: 'Finance Manager',
      module: 'Finance OS',
      tasks: [
        'Plan 13-week cashflow',
        'Create scenarios',
        'Analyze variance',
        'Track compliance',
        'View financial KPIs'
      ]
    },
    {
      role: 'Operations Manager',
      module: 'Operations OS',
      tasks: [
        'Access SOP Wiki',
        'Complete quality checklists',
        'Track vendor performance',
        'Manage inventory',
        'Schedule maintenance'
      ]
    },
    {
      role: 'HR Manager',
      module: 'People OS',
      tasks: [
        'Set KRAs/KPIs',
        'Track performance',
        'Manage hiring',
        'Onboard new hires',
        'Recognize achievements'
      ]
    },
    {
      role: 'Customer Success Manager',
      module: 'Customer OS',
      tasks: [
        'Manage support tickets',
        'Track NPS scores',
        'Monitor health scores',
        'Prevent churn',
        'Plan expansion'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">Lapaas OS</div>
          <div className="hidden md:flex gap-8">
            <a href="#modules" className="hover:text-green-400 transition">Modules</a>
            <a href="#roles" className="hover:text-green-400 transition">User Roles</a>
            <a href="#pricing" className="hover:text-green-400 transition">Pricing</a>
          </div>
          <button 
            onClick={() => navigate('/login')}
            className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold transition"
          >
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div>
              <div className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                <span className="text-green-400 text-sm font-semibold">🚀 AI-Powered Business OS</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Run Your Business
                <span className="text-green-400"> With Modules</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8">
                Collections, Sales, Finance, Operations, HR, and Customer Success—each module is a complete workflow with AI copilots, automations, and scorecards.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={() => navigate('/register')}
                  className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105"
                >
                  Start Free Trial <ArrowRight size={20} />
                </button>
                <button className="border border-green-500 hover:bg-green-500/10 px-8 py-4 rounded-lg font-semibold transition">
                  Watch Demo
                </button>
              </div>

              <p className="text-gray-400 text-sm">14-day free trial. No credit card required. 3 seats included.</p>
            </div>

            {/* Right: Module Cards Preview */}
            <div className="grid grid-cols-2 gap-4">
              {modules.slice(0, 4).map((module) => {
                const Icon = module.icon;
                return (
                  <div key={module.id} className="bg-slate-800 border border-slate-700 rounded-lg p-4 hover:border-green-500/50 transition">
                    <Icon className="text-green-400 mb-2" size={24} />
                    <h3 className="font-semibold text-sm mb-1">{module.name}</h3>
                    <p className="text-xs text-gray-400">{module.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Modular Workflows for Every Function</h2>
            <p className="text-xl text-gray-300">Buy single modules or bundle them. Each module is a complete, guided workflow.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <div key={module.id} className="bg-slate-800 border border-slate-700 rounded-xl p-8 hover:border-green-500/50 transition group">
                  <div className={`bg-gradient-to-br ${module.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-2">{module.name}</h3>
                  <p className="text-gray-300 mb-6">{module.description}</p>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-400 mb-3">What you can do:</h4>
                    <ul className="space-y-2">
                      {module.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-300">
                          <CheckCircle size={16} className="text-green-400" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-green-400 font-semibold text-sm">{module.outcome}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Built for Your Team</h2>
            <p className="text-xl text-gray-300">Each role gets a tailored workflow with the tools they need.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRoles.map((item, idx) => (
              <div key={idx} className="bg-slate-800 border border-slate-700 rounded-xl p-6 hover:border-green-500/50 transition">
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-green-400">{item.role}</h3>
                  <p className="text-sm text-gray-400">{item.module}</p>
                </div>
                
                <div className="space-y-3">
                  {item.tasks.map((task, taskIdx) => (
                    <div key={taskIdx} className="flex items-start gap-3">
                      <CheckCircle size={16} className="text-green-400 mt-1 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{task}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Lapaas OS?</h2>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">AI-Powered Copilots</h3>
                  <p className="text-gray-300">Get AI assistance for policies, forecasts, coaching, and more. Save 10+ hours/week.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">Automations That Work</h3>
                  <p className="text-gray-300">Pre-built recipes for collections, sales, compliance, and more. No code needed.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">Real Business Outcomes</h3>
                  <p className="text-gray-300">Collections ↑80%, Close Rate ↑100%, DSO ↓55%, OTIF ↑31%. Proven results.</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">Buy What You Need</h3>
                  <p className="text-gray-300">Start with one module. Add more as you grow. No lock-in, seamless upgrades.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">Guided Setup</h3>
                  <p className="text-gray-300">Each module has a wizard. Industry templates. Pre-built dashboards. Go live in days.</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Zap className="text-green-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-bold text-lg mb-2">Everything Connected</h3>
                  <p className="text-gray-300">Collections ↔ Invoices ↔ Sales. Finance ↔ Payables ↔ Vendors. One source of truth.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { name: 'Free Trial', price: '₹0', period: '/mo', features: ['14 days', '3 seats', 'Limited automations', 'Basic support'] },
              { name: 'Starter', price: '₹499', period: '/seat/mo', features: ['Single module', 'Core features', 'Basic automations', 'Email support'] },
              { name: 'Pro', price: '₹1,499', period: '/seat/mo', features: ['3+ modules', 'All features', 'Unlimited automations', 'Priority support', 'AI copilots'], popular: true },
              { name: 'Scale', price: 'Custom', period: '', features: ['All modules', 'Unlimited seats', 'Advanced features', 'Dedicated support', 'SSO & white-label'] }
            ].map((plan, idx) => (
              <div key={idx} className={`rounded-xl p-8 transition ${plan.popular ? 'bg-green-500/10 border-2 border-green-500 ring-2 ring-green-500/20' : 'bg-slate-800 border border-slate-700 hover:border-green-500/50'}`}>
                {plan.popular && (
                  <div className="inline-block mb-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-6">{plan.price}<span className="text-lg text-gray-400">{plan.period}</span></div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle size={16} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-semibold transition ${plan.popular ? 'bg-green-500 hover:bg-green-600' : 'border border-green-500 hover:bg-green-500/10'}`}>
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/50">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-500/50 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Run Your Business Better?</h2>
          <p className="text-xl text-gray-300 mb-8">Start your 14-day free trial today. No credit card required. 3 seats included.</p>
          
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
              required
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 px-8 py-3 rounded-lg font-semibold transition flex items-center gap-2"
            >
              Start Trial <ArrowRight size={20} />
            </button>
          </form>

          {submitted && (
            <p className="text-green-400 text-sm">✓ Check your email for next steps!</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Lapaas OS</h4>
              <p className="text-gray-400 text-sm">AI-powered Business Operating System for Indian SMBs</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#modules" className="hover:text-green-400">Modules</a></li>
                <li><a href="#roles" className="hover:text-green-400">User Roles</a></li>
                <li><a href="#pricing" className="hover:text-green-400">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400">About</a></li>
                <li><a href="#" className="hover:text-green-400">Blog</a></li>
                <li><a href="#" className="hover:text-green-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400">Privacy</a></li>
                <li><a href="#" className="hover:text-green-400">Terms</a></li>
                <li><a href="#" className="hover:text-green-400">Security</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Lapaas OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
