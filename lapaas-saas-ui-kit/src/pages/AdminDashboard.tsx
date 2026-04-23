import React, { useState } from 'react';
import { Users, Package, Zap, CreditCard, TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats] = useState({
    totalOrganizations: 24,
    totalUsers: 156,
    activeModules: 8,
    aiCreditsUsed: 35,
    monthlyRevenue: 125400,
    activeSubscriptions: 18
  });

  const [modules] = useState([
    { id: 'finance-os', name: 'Finance OS', adoptionRate: 85, activeOrgs: 15 },
    { id: 'sales-os', name: 'Sales OS', adoptionRate: 72, activeOrgs: 12 },
    { id: 'operations-os', name: 'Operations OS', adoptionRate: 68, activeOrgs: 10 },
    { id: 'people-os', name: 'People OS', adoptionRate: 65, activeOrgs: 9 },
    { id: 'customer-os', name: 'Customer OS', adoptionRate: 58, activeOrgs: 8 }
  ]);

  const [organizations] = useState([
    {
      id: 'org-001',
      name: 'TechStartup Inc',
      plan: 'pro',
      seats: 5,
      modules: 3,
      status: 'active',
      monthlySpend: 7495,
      aiCreditsUsed: 2500
    },
    {
      id: 'org-002',
      name: 'Manufacturing Co',
      plan: 'scale',
      seats: 25,
      modules: 8,
      status: 'active',
      monthlySpend: 45000,
      aiCreditsUsed: 8000
    },
    {
      id: 'org-003',
      name: 'Service Agency',
      plan: 'starter',
      seats: 3,
      modules: 1,
      status: 'active',
      monthlySpend: 1499,
      aiCreditsUsed: 500
    }
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage modules, organizations, and billing</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Organizations</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalOrganizations}</p>
              </div>
              <Users className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Modules</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeModules}</p>
              </div>
              <Package className="text-purple-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">AI Credits Used</p>
                <p className="text-3xl font-bold text-gray-900">{stats.aiCreditsUsed}%</p>
              </div>
              <Zap className="text-yellow-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Monthly Revenue</p>
                <p className="text-3xl font-bold text-gray-900">₹{(stats.monthlyRevenue / 1000).toFixed(0)}K</p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Subscriptions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="text-red-500" size={32} />
            </div>
          </div>
        </div>

        {/* Module Adoption */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Module Adoption</h2>
          <div className="space-y-4">
            {modules.map((module) => (
              <div key={module.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{module.name}</p>
                  <p className="text-sm text-gray-600">{module.activeOrgs} organizations</p>
                </div>
                <div className="w-48">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${module.adoptionRate}%` }}
                    />
                  </div>
                </div>
                <p className="text-right font-semibold text-gray-900 w-16">{module.adoptionRate}%</p>
              </div>
            ))}
          </div>
        </div>

        {/* Organizations Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Organizations</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Organization</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Seats</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Modules</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Monthly Spend</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">AI Credits</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <tr key={org.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 text-gray-900 font-semibold">{org.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {org.plan.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{org.seats}</td>
                    <td className="py-3 px-4 text-gray-900">{org.modules}</td>
                    <td className="py-3 px-4 text-gray-900 font-semibold">₹{org.monthlySpend.toLocaleString()}</td>
                    <td className="py-3 px-4 text-gray-900">{org.aiCreditsUsed.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={16} className="text-green-500" />
                        <span className="text-green-700 font-semibold">Active</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
