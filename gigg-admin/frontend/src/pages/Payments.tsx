import React, { useEffect, useState, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronDown, CreditCard } from 'lucide-react';
import { Header } from '../components/Header';
import { DataTable, Column } from '../components/DataTable';
import apiClient from '../api/client';
import { Transaction, PaginatedResponse } from '../types';

const Payments: React.FC = () => {
  const [data, setData] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [summary, setSummary] = useState({ totalEarnings: 0, totalWithdrawals: 0, pendingAmount: 0, netRevenue: 0 });

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;
      if (typeFilter) params.type = typeFilter;
      const [txRes, sumRes] = await Promise.all([
        apiClient.get<PaginatedResponse<Transaction>>('/payments', { params }),
        apiClient.get('/payments/summary'),
      ]);
      setData(txRes.data.data);
      setTotal(txRes.data.total);
      setSummary(sumRes.data);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, typeFilter]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const handleApprove = async (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    if (!confirm('Approve this withdrawal?')) return;
    await apiClient.patch(`/payments/${tx.id}/approve`);
    fetchPayments();
  };

  const handleReject = async (e: React.MouseEvent, tx: Transaction) => {
    e.stopPropagation();
    const reason = prompt('Rejection reason:');
    if (reason === null) return;
    await apiClient.patch(`/payments/${tx.id}/reject`, { reason });
    fetchPayments();
  };

  const columns: Column<Transaction>[] = [
    {
      key: 'user',
      header: 'User',
      render: (row) => (
        <div>
          <p className="text-sm font-medium text-white">{row.profiles?.name || '—'}</p>
          <p className="text-xs" style={{ color: '#64748b' }}>{row.profiles?.email}</p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`badge ${row.type === 'credit' ? 'badge-success' : 'badge-danger'}`}>
          {row.type === 'credit' ? '↑ Credit' : '↓ Debit'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className={`font-bold ${row.type === 'credit' ? 'text-green-400' : 'text-red-400'}`}>
          {row.type === 'credit' ? '+' : '-'}₹{row.amount?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <span className="badge badge-neutral capitalize">{row.category?.replace('_', ' ')}</span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (row) => (
        <span className="text-sm" style={{ color: '#94a3b8', maxWidth: 200, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {row.description}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`badge badge-${row.status === 'success' ? 'success' : row.status === 'pending' ? 'warning' : 'danger'}`}>
          {row.status}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (row) => (
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        row.status === 'pending' && row.category === 'withdrawal' ? (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <button onClick={(e) => handleApprove(e, row)} className="btn-success py-1.5 px-3 text-xs">
              <CheckCircle size={11} /> Approve
            </button>
            <button onClick={(e) => handleReject(e, row)} className="btn-danger py-1.5 px-3 text-xs">
              <XCircle size={11} /> Reject
            </button>
          </div>
        ) : <span style={{ color: '#334155' }}>—</span>
      ),
    },
  ];

  const summaryCards = [
    { label: 'Total Earnings', value: summary.totalEarnings, color: '#4ade80' },
    { label: 'Total Withdrawals', value: summary.totalWithdrawals, color: '#f87171' },
    { label: 'Pending Amount', value: summary.pendingAmount, color: '#facc15' },
    { label: 'Net Revenue', value: summary.netRevenue, color: '#818cf8' },
  ];

  return (
    <div>
      <Header title="Payments" subtitle="Transactions, withdrawals & earnings" />
      <div className="p-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl p-5"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>{card.label}</p>
              <p className="text-2xl font-bold" style={{ color: card.color }}>
                ₹{card.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-input appearance-none cursor-pointer"
              style={{ width: 'auto', paddingRight: '36px' }}
            >
              <option value="">All Status</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
          </div>
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="admin-input appearance-none cursor-pointer"
              style={{ width: 'auto', paddingRight: '36px' }}
            >
              <option value="">All Types</option>
              <option value="credit">Credit</option>
              <option value="debit">Debit</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
            <CreditCard size={14} />
            {total.toLocaleString()} transactions
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
          emptyMessage="No transactions found"
        />
      </div>
    </div>
  );
};

export default Payments;
