import React, { useEffect, useState, useCallback } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { Header } from '../components/Header';
import { DataTable, Column } from '../components/DataTable';
import apiClient from '../api/client';
import { PaginatedResponse } from '../types';

interface WorkerActivityRow {
  id: string;
  name: string;
  avatar?: string;
  city?: string;
  fillup: { done: number; total: number };
  followup: { staleCount: number };
  compliance: { done: number; total: number };
}

function fractionColor(done: number, total: number): string {
  if (total === 0) return '#64748b';
  const ratio = done / total;
  if (ratio >= 1) return '#4ade80';
  if (ratio >= 0.6) return '#fbbf24';
  return '#f87171';
}

const WorkerActivity: React.FC = () => {
  const [data, setData] = useState<WorkerActivityRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<PaginatedResponse<WorkerActivityRow>>('/workers/activity', { params: { page, limit: 20 } });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  const columns: Column<WorkerActivityRow>[] = [
    {
      key: 'worker',
      header: 'Worker',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            {row.name?.[0]?.toUpperCase() || 'W'}
          </div>
          <div>
            <p className="text-sm font-medium text-white">{row.name}</p>
            {row.city && <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{row.city}</p>}
          </div>
        </div>
      ),
    },
    {
      key: 'fillup',
      header: 'Fillup',
      render: (row) => (
        <span className="font-semibold" style={{ color: fractionColor(row.fillup.done, row.fillup.total) }}>
          {row.fillup.done}/{row.fillup.total}
        </span>
      ),
    },
    {
      key: 'followup',
      header: 'Followup',
      render: (row) => (
        <span className="font-semibold" style={{ color: row.followup.staleCount > 0 ? '#f87171' : '#64748b' }}>
          {row.followup.staleCount > 0 ? `${row.followup.staleCount} pending` : '—'}
        </span>
      ),
    },
    {
      key: 'compliance',
      header: 'Compliance',
      render: (row) => (
        <span className="font-semibold" style={{ color: fractionColor(row.compliance.done, row.compliance.total) }}>
          {row.compliance.done}/{row.compliance.total}
        </span>
      ),
    },
  ];

  return (
    <div>
      <Header title="Worker Activity" subtitle="Fillup, followup & compliance tracking" />
      <div className="p-8">
        <div className="flex items-center gap-2 mb-6 text-sm" style={{ color: '#64748b' }}>
          <ClipboardCheck size={14} />
          {total.toLocaleString()} workers total
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
          emptyMessage="No workers found"
        />
      </div>
    </div>
  );
};

export default WorkerActivity;
