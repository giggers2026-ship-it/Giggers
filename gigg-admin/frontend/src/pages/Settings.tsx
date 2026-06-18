import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Globe, DollarSign, Bell, Shield } from 'lucide-react';
import { Header } from '../components/Header';

interface SettingSection {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const sections: SettingSection[] = [
  { id: 'general', label: 'General', icon: <Globe size={16} /> },
  { id: 'payments', label: 'Payments & Fees', icon: <DollarSign size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'security', label: 'Security', icon: <Shield size={16} /> },
];

const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState('general');
  const [saved, setSaved] = useState(false);

  // Simulated settings state
  const [settings, setSettings] = useState({
    platformName: 'Gigg',
    platformFeePercent: 10,
    minWithdrawal: 100,
    maxWithdrawal: 50000,
    autoApproveJobs: false,
    requireKYCForEmployer: true,
    requireKYCForWorker: true,
    enableSMSNotifications: true,
    enableEmailNotifications: true,
    maintenanceMode: false,
    maxJobsPerEmployer: 10,
    minPayPerWorker: 200,
  });

  const handleSave = () => {
    // In real app: POST /api/settings
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNum = (key: keyof typeof settings, val: number) => {
    setSettings((prev) => ({ ...prev, [key]: val }));
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="relative w-12 h-6 rounded-full transition-colors duration-200"
      style={{ background: enabled ? 'rgba(99,102,241,0.8)' : 'rgba(255,255,255,0.1)' }}
    >
      <span
        className="absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200"
        style={{ left: enabled ? '28px' : '4px', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
      />
    </button>
  );

  const NumberInput = ({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) => (
    <input
      type="number"
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(Number(e.target.value))}
      className="admin-input text-right"
      style={{ width: 120 }}
    />
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">General Platform Settings</h3>
            {[
              { label: 'Max Jobs Per Employer', desc: 'Maximum active jobs an employer can have simultaneously', key: 'maxJobsPerEmployer' as const, min: 1, max: 50 },
              { label: 'Min Pay Per Worker (₹)', desc: 'Minimum allowed pay per worker per job', key: 'minPayPerWorker' as const, min: 50, max: 2000 },
            ].map(({ label, desc, key, min, max }) => (
              <div
                key={key}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
                <NumberInput value={settings[key] as number} onChange={(v) => updateNum(key, v)} min={min} max={max} />
              </div>
            ))}

            {[
              { label: 'Maintenance Mode', desc: 'Put the app into maintenance mode (blocks all users)', key: 'maintenanceMode' as const },
              { label: 'Auto-Approve Jobs', desc: 'Automatically approve job listings without manual review', key: 'autoApproveJobs' as const },
            ].map(({ label, desc, key }) => (
              <div
                key={key}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
                <ToggleSwitch enabled={settings[key] as boolean} onToggle={() => toggle(key)} />
              </div>
            ))}
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">Payments & Fees</h3>
            {[
              { label: 'Platform Fee (%)', desc: 'Percentage fee taken on each job payment', key: 'platformFeePercent' as const, min: 0, max: 30 },
              { label: 'Min Withdrawal (₹)', desc: 'Minimum amount a worker can withdraw', key: 'minWithdrawal' as const, min: 50, max: 500 },
              { label: 'Max Withdrawal (₹)', desc: 'Maximum single withdrawal amount', key: 'maxWithdrawal' as const, min: 1000, max: 100000 },
            ].map(({ label, desc, key, min, max }) => (
              <div
                key={key}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
                <NumberInput value={settings[key] as number} onChange={(v) => updateNum(key, v)} min={min} max={max} />
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">Notification Settings</h3>
            {[
              { label: 'SMS Notifications', desc: 'Send SMS alerts to users for key events', key: 'enableSMSNotifications' as const },
              { label: 'Email Notifications', desc: 'Send email alerts to users for key events', key: 'enableEmailNotifications' as const },
            ].map(({ label, desc, key }) => (
              <div
                key={key}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
                <ToggleSwitch enabled={settings[key] as boolean} onToggle={() => toggle(key)} />
              </div>
            ))}
          </div>
        );

      case 'security':
        return (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">Security & KYC</h3>
            {[
              { label: 'Require KYC for Employers', desc: 'Employers must complete KYC before posting jobs', key: 'requireKYCForEmployer' as const },
              { label: 'Require KYC for Workers', desc: 'Workers must complete KYC before applying', key: 'requireKYCForWorker' as const },
            ].map(({ label, desc, key }) => (
              <div
                key={key}
                className="flex items-center justify-between p-5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{desc}</p>
                </div>
                <ToggleSwitch enabled={settings[key] as boolean} onToggle={() => toggle(key)} />
              </div>
            ))}

            <div
              className="p-5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
            >
              <p className="text-sm font-semibold text-red-400 mb-1">Danger Zone</p>
              <p className="text-xs mb-4" style={{ color: '#64748b' }}>
                These actions are irreversible. Proceed with extreme caution.
              </p>
              <button className="btn-danger">Clear All Cache</button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <Header title="Settings" subtitle="Platform configuration & controls" />
      <div className="p-8">
        <div className="flex gap-6">
          {/* Sidebar Nav */}
          <aside className="w-52 flex-shrink-0">
            <ul className="space-y-1">
              {sections.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setActiveSection(s.id)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                    style={{
                      background: activeSection === s.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: activeSection === s.id ? '#a5b4fc' : '#64748b',
                      border: `1px solid ${activeSection === s.id ? 'rgba(99,102,241,0.25)' : 'transparent'}`,
                    }}
                  >
                    {s.icon}
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Settings Content */}
          <div className="flex-1">
            <div className="animate-fade-in">
              {renderSection()}
            </div>

            {/* Save Button */}
            <div className="mt-8 flex items-center gap-3">
              <button onClick={handleSave} className="btn-primary py-3 px-6">
                <Save size={16} />
                Save Settings
              </button>
              {saved && (
                <span className="text-sm animate-fade-in" style={{ color: '#4ade80' }}>
                  ✓ Settings saved!
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
