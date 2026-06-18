import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Star, Briefcase, Wallet, UserX, UserCheck, Shield, CheckCircle, XCircle } from 'lucide-react';
import { Header } from '../components/Header';
import apiClient from '../api/client';
import { Profile, Job, Transaction } from '../types';

interface UserDetailData {
  profile: Profile;
  recentJobs: Job[];
  recentTransactions: Transaction[];
}

const UserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UserDetailData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get<UserDetailData>(`/users/${id}`).then((res) => {
      setData(res.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleBan = async () => {
    if (!data || !id) return;
    const isBanned = data.profile.is_banned;
    if (!confirm(`${isBanned ? 'Unban' : 'Ban'} this user?`)) return;
    await apiClient.patch(`/users/${id}/ban`, { banned: !isBanned });
    const res = await apiClient.get<UserDetailData>(`/users/${id}`);
    setData(res.data);
  };

  const handleVerify = async () => {
    if (!data || !id) return;
    await apiClient.patch(`/users/${id}`, { is_verified: !data.profile.is_verified });
    const res = await apiClient.get<UserDetailData>(`/users/${id}`);
    setData(res.data);
  };

  const handleApprove = async (approve: boolean) => {
    if (!data || !id) return;
    const label = approve ? 'Approve' : 'Reject';
    if (!confirm(`${label} account for ${data.profile.name}?`)) return;
    await apiClient.patch(`/users/${id}/approve`, { approved: approve });
    const res = await apiClient.get<UserDetailData>(`/users/${id}`);
    setData(res.data);
  };

  if (loading) {
    return (
      <div>
        <Header title="User Detail" />
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <Header title="User Not Found" />
        <div className="p-8 text-center" style={{ color: '#64748b' }}>
          User not found or you don't have permission.
        </div>
      </div>
    );
  }

  const { profile, recentJobs, recentTransactions } = data;

  return (
    <div>
      <Header title="User Detail" subtitle={profile.name} />
      <div className="p-8 max-w-5xl">
        {/* Back */}
        <button onClick={() => navigate('/users')} className="btn-secondary mb-6 py-2 px-4 text-sm">
          <ArrowLeft size={14} /> Back to Users
        </button>

        {/* Profile Card */}
        <div
          className="rounded-2xl p-6 mb-6 flex items-start gap-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {profile.name?.[0]?.toUpperCase()}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                <p className="text-sm mt-1" style={{ color: '#64748b' }}>{profile.email || profile.phone}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`badge ${profile.role === 'worker' ? 'badge-info' : 'badge-success'}`}>
                    {profile.role}
                  </span>
                  <span className={`badge ${profile.is_approved ? 'badge-success' : 'badge-warning'}`}>
                    {profile.is_approved ? '✓ Approved' : '⏳ Pending Approval'}
                  </span>
                  {profile.is_verified && <span className="badge badge-success">✓ KYC Verified</span>}
                  {profile.is_banned && <span className="badge badge-danger">Banned</span>}
                  {profile.aadhaar_verified && <span className="badge badge-info">Aadhaar ✓</span>}
                  {profile.selfie_verified && <span className="badge badge-info">Selfie ✓</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                {!profile.is_approved && (
                  <>
                    <button onClick={() => handleApprove(true)} className="btn-success py-2 px-4">
                      <CheckCircle size={14} /> Approve Account
                    </button>
                    <button onClick={() => handleApprove(false)} className="btn-danger py-2 px-4">
                      <XCircle size={14} /> Reject Account
                    </button>
                  </>
                )}
                {profile.is_approved && (
                  <button onClick={handleVerify} className={`btn-${profile.is_verified ? 'secondary' : 'success'} py-2 px-4`}>
                    <UserCheck size={14} />
                    {profile.is_verified ? 'Revoke KYC' : 'Verify KYC'}
                  </button>
                )}
                <button onClick={handleBan} className="btn-danger py-2 px-4">
                  <UserX size={14} />
                  {profile.is_banned ? 'Unban User' : 'Ban User'}
                </button>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              {[
                { icon: MapPin, label: 'Location', value: `${profile.city}, ${profile.area}` },
                { icon: Star, label: 'Rating', value: `${profile.rating || 0} ★ (${profile.review_count || 0})` },
                { icon: Briefcase, label: 'Jobs', value: profile.role === 'worker' ? profile.completed_jobs : profile.total_jobs_posted },
                { icon: Wallet, label: 'Earnings', value: `₹${(profile.total_earnings || 0).toLocaleString()}` },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)' }}
                  >
                    <Icon size={16} style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: '#64748b' }}>{label}</p>
                    <p className="text-sm font-semibold text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Two-column: Jobs + Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Jobs */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase size={15} style={{ color: '#818cf8' }} />
              Recent Jobs ({recentJobs.length})
            </h3>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#475569' }}>No jobs yet</p>
            ) : (
              <ul className="space-y-2">
                {recentJobs.map((job) => (
                  <li
                    key={job.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div>
                      <p className="text-sm font-medium text-white">{job.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        {new Date(job.created_at).toLocaleDateString()} · {job.category}
                      </p>
                    </div>
                    <span className={`badge badge-${
                      job.status === 'active' ? 'success' :
                      job.status === 'completed' ? 'info' :
                      job.status === 'cancelled' ? 'danger' : 'neutral'
                    }`}>
                      {job.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Transactions */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet size={15} style={{ color: '#34d399' }} />
              Recent Transactions ({recentTransactions.length})
            </h3>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#475569' }}>No transactions yet</p>
            ) : (
              <ul className="space-y-2">
                {recentTransactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: tx.type === 'credit' ? '#4ade80' : '#f87171' }}>
                        {tx.type === 'credit' ? '+' : '-'}₹{tx.amount}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                        {tx.description}
                      </p>
                    </div>
                    <span className={`badge badge-${
                      tx.status === 'success' ? 'success' :
                      tx.status === 'pending' ? 'warning' : 'danger'
                    }`}>
                      {tx.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* KYC Info */}
        <div
          className="mt-6 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Shield size={15} style={{ color: '#facc15' }} />
            KYC Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Aadhaar Verified', value: profile.aadhaar_verified },
              { label: 'Selfie Verified', value: profile.selfie_verified },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center justify-between p-4 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <span className="text-sm" style={{ color: '#94a3b8' }}>{label}</span>
                <span className={`badge ${value ? 'badge-success' : 'badge-neutral'}`}>
                  {value ? 'Verified' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
