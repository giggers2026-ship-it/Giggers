import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronDown, Star, XCircle, Zap } from 'lucide-react';
import { Header } from '../components/Header';
import { DataTable, Column } from '../components/DataTable';
import apiClient from '../api/client';
import { Job, PaginatedResponse } from '../types';

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active: 'badge-success',
    completed: 'badge-info',
    cancelled: 'badge-danger',
    draft: 'badge-neutral',
  };
  return <span className={`badge ${map[status] || 'badge-neutral'}`}>{status}</span>;
};

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await apiClient.get<PaginatedResponse<Job>>('/jobs', { params });
      setData(res.data.data);
      setTotal(res.data.total);
    } catch {
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handleForceCancel = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    if (!confirm(`Force cancel "${job.title}"?`)) return;
    await apiClient.patch(`/jobs/${job.id}`, { status: 'cancelled' });
    fetchJobs();
  };

  const handleToggleFeatured = async (e: React.MouseEvent, job: Job) => {
    e.stopPropagation();
    await apiClient.patch(`/jobs/${job.id}`, { is_featured: !job.is_featured });
    fetchJobs();
  };

  const columns: Column<Job>[] = [
    {
      key: 'title',
      header: 'Job',
      render: (row) => (
        <div className="flex items-center gap-3">
          <span className="text-xl">{row.category_emoji || '💼'}</span>
          <div>
            <p className="text-sm font-medium text-white flex items-center gap-2">
              {row.title}
              {row.is_featured && <span className="badge badge-warning text-xs">⭐ Featured</span>}
              {row.is_urgent && <span className="badge badge-danger text-xs">🔥 Urgent</span>}
            </p>
            <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{row.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'employer',
      header: 'Posted By',
      render: (row) => (
        <span style={{ color: '#94a3b8' }}>
          {(row as Job & { profiles?: { name: string } }).profiles?.name || row.employer_id.slice(0, 8) + '...'}
        </span>
      ),
    },
    { key: 'status', header: 'Status', render: (row) => <StatusBadge status={row.status} /> },
    {
      key: 'pay',
      header: 'Pay / Worker',
      render: (row) => (
        <span className="font-semibold" style={{ color: '#4ade80' }}>
          ₹{row.pay_per_worker?.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'workers',
      header: 'Workers',
      render: (row) => (
        <span style={{ color: '#94a3b8' }}>
          {row.workers_hired}/{row.workers_needed}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Job Date',
      render: (row) => (
        <span style={{ color: '#64748b', fontSize: 12 }}>
          {row.date ? new Date(row.date).toLocaleDateString() : '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleToggleFeatured(e, row)}
            className="btn-secondary py-1.5 px-3 text-xs"
            title={row.is_featured ? 'Remove featured' : 'Feature this job'}
          >
            <Star size={11} />
            {row.is_featured ? 'Unfeature' : 'Feature'}
          </button>
          {row.status === 'active' && (
            <button
              onClick={(e) => handleForceCancel(e, row)}
              className="btn-danger py-1.5 px-3 text-xs"
            >
              <XCircle size={11} />
              Cancel
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <Header title="Jobs" subtitle="Manage all posted jobs" />
      <div className="p-8">
        {/* Toolbar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <form
            onSubmit={(e) => { e.preventDefault(); setSearch(searchInput); setPage(1); }}
            className="flex items-center gap-2 flex-1 max-w-md"
          >
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#475569' }} />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search job title..."
                className="admin-input pl-10"
              />
            </div>
            <button type="submit" className="btn-primary py-2.5 px-4">
              <Search size={14} /> Search
            </button>
          </form>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="admin-input appearance-none cursor-pointer"
              style={{ width: 'auto', paddingRight: '36px' }}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#475569' }} />
          </div>

          <div className="ml-auto flex items-center gap-2 text-sm" style={{ color: '#64748b' }}>
            <Zap size={14} />
            {total.toLocaleString()} jobs total
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
          emptyMessage="No jobs found"
          onRowClick={(row) => navigate(`/jobs/${row.id}`)}
        />
      </div>
    </div>
  );
};

export default Jobs;
