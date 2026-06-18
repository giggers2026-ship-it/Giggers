import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, Eye, FileCheck, ChevronDown } from 'lucide-react';
import { Header } from '../components/Header';
import { DataTable, Column } from '../components/DataTable';
import apiClient from '../api/client';
import { KYCDocument, PaginatedResponse } from '../types';

const KYC: React.FC = () => {
  const [data, setData] = useState<KYCDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState<KYCDocument | null>(null);

  const fetchKYC = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<KYCDocument>>('/kyc', {
        params: { status: statusFilter, page, limit: 20 },
      });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { fetchKYC(); }, [fetchKYC]);

  const handleApprove = async (e: React.MouseEvent, doc: KYCDocument) => {
    e.stopPropagation();
    if (!confirm(`Approve KYC for ${doc.profiles?.name}?`)) return;
    await apiClient.patch(`/kyc/${doc.id}/approve`);
    fetchKYC();
  };

  const handleReject = async (e: React.MouseEvent, doc: KYCDocument) => {
    e.stopPropagation();
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    await apiClient.patch(`/kyc/${doc.id}/reject`, { reason });
    fetchKYC();
  };

  const columns: Column<KYCDocument>[] = [
    {
      key: 'user',
      header: 'Applicant',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {row.profiles?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{row.profiles?.name || 'Unknown'}</p>
            <p className="text-xs" style={{ color: '#64748b' }}>{row.profiles?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`badge ${row.type === 'aadhaar' ? 'badge-info' : 'badge-warning'}`}>
          {row.type === 'aadhaar' ? '🪪 Aadhaar' : '🤳 Selfie'}
        </span>
      ),
    },
    {
      key: 'aadhaar_number',
      header: 'Aadhaar No.',
      render: (row) => (
        <span style={{ color: '#94a3b8', fontSize: 13 }}>
          {row.aadhaar_number
            ? `XXXX XXXX ${row.aadhaar_number.slice(-4)}`
            : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`badge badge-${
          row.status === 'approved' ? 'success' :
          row.status === 'pending' ? 'warning' : 'danger'
        }`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'submitted_at',
      header: 'Submitted',
      render: (row) => (
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {new Date(row.submitted_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setSelectedDoc(row)}
            className="btn-secondary py-1.5 px-3 text-xs"
          >
            <Eye size={11} /> View
          </button>
          {row.status === 'pending' && (
            <>
              <button onClick={(e) => handleApprove(e, row)} className="btn-success py-1.5 px-3 text-xs">
                <CheckCircle size={11} /> Approve
              </button>
              <button onClick={(e) => handleReject(e, row)} className="btn-danger py-1.5 px-3 text-xs">
                <XCircle size={11} /> Reject
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="KYC Verification" subtitle="Review Aadhaar and selfie submissions" />
      <div className="p-8">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className="px-4 py-2 rounded-xl text-sm font-medium transition-all capitalize"
              style={{
                background: statusFilter === s ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.04)',
                color: statusFilter === s ? '#a5b4fc' : '#64748b',
                border: `1px solid ${statusFilter === s ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              {s === 'pending' ? '🟡' : s === 'approved' ? '🟢' : '🔴'} {s}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
            <FileCheck size={14} />
            {total} {statusFilter} submissions
          </div>
        </div>

        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          total={total}
          page={page}
          limit={20}
          onPageChange={setPage}
          rowKey={(row) => row.id}
          onRowClick={(row) => setSelectedDoc(row)}
          emptyMessage={`No ${statusFilter} KYC submissions`}
        />
      </div>

      {/* Detail Modal */}
      {selectedDoc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
          onClick={() => setSelectedDoc(null)}
        >
          <div
            className="rounded-2xl p-6 max-w-lg w-full animate-fade-in"
            style={{ background: '#0f1220', border: '1px solid rgba(99,102,241,0.3)', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">KYC Document</h3>
              <button
                onClick={() => setSelectedDoc(null)}
                className="p-2 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <XCircle size={16} style={{ color: '#94a3b8' }} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Name', value: selectedDoc.profiles?.name },
                  { label: 'Email', value: selectedDoc.profiles?.email },
                  { label: 'Type', value: selectedDoc.type },
                  { label: 'Status', value: selectedDoc.status },
                  { label: 'Aadhaar No.', value: selectedDoc.aadhaar_number || 'N/A' },
                  { label: 'Submitted', value: new Date(selectedDoc.submitted_at).toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs uppercase tracking-wider mb-1" style={{ color: '#64748b' }}>{label}</p>
                    <p className="font-medium text-white">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {selectedDoc.status === 'rejected' && selectedDoc.rejection_reason && (
                <div
                  className="p-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  <p className="text-xs text-red-400 font-semibold mb-1">Rejection Reason</p>
                  <p className="text-sm" style={{ color: '#fca5a5' }}>{selectedDoc.rejection_reason}</p>
                </div>
              )}

              {selectedDoc.status === 'pending' && (
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={(e) => { handleApprove(e, selectedDoc); setSelectedDoc(null); }}
                    className="btn-success flex-1 justify-center"
                  >
                    <CheckCircle size={15} /> Approve
                  </button>
                  <button
                    onClick={(e) => { handleReject(e, selectedDoc); setSelectedDoc(null); }}
                    className="btn-danger flex-1 justify-center"
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;
