import React, { useState } from 'react';
import { ArrowRight, Brain, Zap as AutoIcon, Package, TrendingUp } from 'lucide-react';

export default function LandingPage() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-green-400">Lapaas OS</div>
          <div className="hidden md:flex gap-8">
            <a href="#features" className="hover:text-green-400 transition">Features</a>
            <a href="#pricing" className="hover:text-green-400 transition">Pricing</a>
            <a href="#testimonials" className="hover:text-green-400 transition">Testimonials</a>
          </div>
          <button className="bg-green-500 hover:bg-green-600 px-6 py-2 rounded-lg font-semibold transition">
            Sign In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
            <span className="text-green-400 text-sm font-semibold">🚀 AI-Powered Business OS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Turn Your Business Frameworks Into
            <span className="text-green-400"> Living Systems</span>
          </h1>
          
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Collections, Sales, Finance, Operations, HR, and Customer Success—all connected with AI copilots, automations, and scorecards that actually run your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button className="bg-green-500 hover:bg-green-600 px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition transform hover:scale-105">
              Start Free Trial <ArrowRight size={20} />
            </button>
            <button className="border border-green-500 hover:bg-green-500/10 px-8 py-4 rounded-lg font-semibold transition">
              Watch Demo
            </button>
          </div>

          <p className="text-gray-400 text-sm">14-day free trial. No credit card required. 3 seats included.</p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Modular Features Built for Growth</h2>
          
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Collections Engine */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition">
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="text-green-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Collections Engine</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✓ Automated dunning ladder (3/0/+7/+15 days)</li>
                <li>✓ WhatsApp & Email templates</li>
                <li>✓ Collections Agent (AI-powered)</li>
                <li>✓ Real-time aging reports</li>
                <li>✓ Collections KPIs & dashboards</li>
              </ul>
              <p className="text-green-400 font-semibold">Improve collection current% by 80% in 60 days</p>
            </div>

            {/* AI Copilots */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition">
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="text-green-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">AI Copilots</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✓ Policy & SOP drafter</li>
                <li>✓ Financial analyzer & forecaster</li>
                <li>✓ Sales coach & objection handler</li>
                <li>✓ HR advisor & KRA generator</li>
                <li>✓ Ops quality checker</li>
              </ul>
              <p className="text-green-400 font-semibold">Save 10+ hours/week with AI assistance</p>
            </div>

            {/* Automations */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition">
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <AutoIcon className="text-green-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Automations Engine</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✓ Trigger-based workflows</li>
                <li>✓ Pre-built recipe library</li>
                <li>✓ Custom actions & webhooks</li>
                <li>✓ Audit logging & monitoring</li>
                <li>✓ No-code automation builder</li>
              </ul>
              <p className="text-green-400 font-semibold">Automate 100+ business processes</p>
            </div>

            {/* Modular System */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 hover:border-green-500/50 transition">
              <div className="bg-green-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Package className="text-green-400" size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-4">Modular System</h3>
              <ul className="space-y-3 text-gray-300 mb-6">
                <li>✓ Buy single modules or bundles</li>
                <li>✓ Seamless upgrades</li>
                <li>✓ Industry-specific templates</li>
                <li>✓ Guided setup wizards</li>
                <li>✓ Template marketplace</li>
              </ul>
              <p className="text-green-400 font-semibold">Start small, scale as you grow</p>
            </div>
          </div>

          {/* Module Tracks */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-8">
            <h3 className="text-2xl font-bold mb-6">Available Tracks</h3>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Founder OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>BMS & Planning</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Finance OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Sales OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Marketing OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Operations OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Customer OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>People OS</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Automation OS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-4 gap-6">
            {/* Free Trial */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Free Trial</h3>
              <div className="text-3xl font-bold mb-6">₹0<span className="text-lg text-gray-400">/mo</span></div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li>✓ 14 days</li>
                <li>✓ 3 seats</li>
                <li>✓ Limited automations</li>
                <li>✓ Basic support</li>
              </ul>
              <button className="w-full border border-green-500 hover:bg-green-500/10 px-4 py-2 rounded-lg font-semibold transition">
                Start Free
              </button>
            </div>

            {/* Starter */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Starter</h3>
              <div className="text-3xl font-bold mb-6">₹499<span className="text-lg text-gray-400">/seat/mo</span></div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li>✓ Single module</li>
                <li>✓ Core features</li>
                <li>✓ Basic automations</li>
                <li>✓ Email support</li>
              </ul>
              <button className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition">
                Get Started
              </button>
            </div>

            {/* Pro */}
            <div className="bg-gray-800 border border-green-500 rounded-xl p-8 ring-2 ring-green-500/20">
              <div className="inline-block mb-4 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm font-semibold">
                Most Popular
              </div>
              <h3 className="text-xl font-bold mb-4">Pro</h3>
              <div className="text-3xl font-bold mb-6">₹1,499<span className="text-lg text-gray-400">/seat/mo</span></div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li>✓ 3+ modules</li>
                <li>✓ All features</li>
                <li>✓ Unlimited automations</li>
                <li>✓ Priority support</li>
                <li>✓ AI copilots</li>
              </ul>
              <button className="w-full bg-green-500 hover:bg-green-600 px-4 py-2 rounded-lg font-semibold transition">
                Start Pro Trial
              </button>
            </div>

            {/* Scale */}
            <div className="bg-gray-800 border border-gray-700 rounded-xl p-8">
              <h3 className="text-xl font-bold mb-4">Scale</h3>
              <div className="text-3xl font-bold mb-6">Custom</div>
              <ul className="space-y-3 text-gray-300 mb-8">
                <li>✓ All modules</li>
                <li>✓ Unlimited seats</li>
                <li>✓ Advanced features</li>
                <li>✓ Dedicated support</li>
                <li>✓ SSO & white-label</li>
              </ul>
              <button className="w-full border border-green-500 hover:bg-green-500/10 px-4 py-2 rounded-lg font-semibold transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Trusted by Indian Businesses</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Rajesh Kumar",
                role: "Founder, Tech Startup",
                quote: "Lapaas OS helped us reduce DSO from 45 to 20 days in just 60 days. The Collections Engine is a game-changer.",
                metric: "DSO: 45→20 days"
              },
              {
                name: "Priya Sharma",
                role: "Sales Director, Agency",
                quote: "Our sales close rate improved from 15% to 30% with the Sales OS and AI copilot. Incredible ROI.",
                metric: "Close Rate: 15%→30%"
              },
              {
                name: "Amit Patel",
                role: "Operations Head, Manufacturing",
                quote: "On-time delivery went from 70% to 92% using Vendor Scorecards and Quality OS. Highly recommended.",
                metric: "OTIF: 70%→92%"
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-green-400">★</span>
                  ))}
                </div>
                <p className="text-gray-300 mb-6 italic">"{testimonial.quote}"</p>
                <div className="border-t border-gray-700 pt-4">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-400">{testimonial.role}</p>
                  <p className="text-green-400 text-sm font-semibold mt-2">{testimonial.metric}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-green-500/20 to-green-400/20 border border-green-500/50 rounded-2xl p-12 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business?</h2>
          <p className="text-xl text-gray-300 mb-8">Start your 14-day free trial today. No credit card required.</p>
          
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-md mx-auto mb-6">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
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
      <footer className="border-t border-gray-700 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Lapaas OS</h4>
              <p className="text-gray-400 text-sm">AI-powered Business Operating System</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-green-400">Features</a></li>
                <li><a href="#" className="hover:text-green-400">Pricing</a></li>
                <li><a href="#" className="hover:text-green-400">Roadmap</a></li>
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
          
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 Lapaas OS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
