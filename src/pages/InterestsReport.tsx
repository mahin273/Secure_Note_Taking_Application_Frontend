import React, { useState, useEffect } from 'react';
import { api } from '../api/client';

export interface InterestUser {
  _id: string;
  name?: string;
  email: string;
}

export interface InterestGroup {
  _id: string;
  count: number;
  users: InterestUser[];
}

interface ReportMeta {
  page: number;
  limit: number;
  totalGroups?: number;
  total?: number;
  totalPages?: number;
}

interface ReportPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ReportResponse {
  data: InterestGroup[];
  meta?: ReportMeta;
  pagination?: ReportMeta;
}

export const InterestsReport: React.FC = () => {
  const [reportData, setReportData] = useState<InterestGroup[]>([]);
  const [pagination, setPagination] = useState<ReportPagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search input and active filter
  const [searchInput, setSearchInput] = useState('');
  const [activeInterest, setActiveInterest] = useState('');

  const fetchReport = async (page: number, interest: string) => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '10');
      if (interest.trim()) {
        params.append('interest', interest.trim());
      }

      const res = await api.get<ReportResponse | InterestGroup[]>(
        `/reports/users-by-interests?${params.toString()}`
      );

      const groups: InterestGroup[] = Array.isArray(res)
        ? res
        : Array.isArray((res as any)?.data)
        ? (res as any).data
        : [];

      const meta: ReportMeta = (res as any)?.meta || (res as any)?.pagination || {
        page,
        limit: 10,
        totalGroups: groups.length,
      };

      const totalCount = meta.totalGroups ?? meta.total ?? groups.length;
      const totalPages =
        meta.totalPages ?? Math.max(1, Math.ceil(totalCount / (meta.limit || 10)));

      setReportData(groups);
      setPagination({
        page: meta.page || page,
        limit: meta.limit || 10,
        total: totalCount,
        totalPages,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate interests report');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(1, '');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveInterest(searchInput.trim());
    fetchReport(1, searchInput.trim());
  };

  const handleClear = () => {
    setSearchInput('');
    setActiveInterest('');
    fetchReport(1, '');
  };

  const handlePageChange = (newPage: number) => {
    fetchReport(newPage, activeInterest);
  };

  return (
    <div>
      <h3>Admin: Users by Interests Report</h3>
      <p style={{ color: '#555', fontSize: '0.9em' }}>
        Scenario 1 Aggregation: Aggregates user interest clusters via server-side pipeline.
      </p>

      <div className="card">
        <h4>Filter by Interest</h4>
        <form onSubmit={handleSearch} style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="e.g. Technology, Gaming, Music"
            style={{ flex: '1', minWidth: '220px' }}
          />
          <button type="submit">Search</button>
          {activeInterest && (
            <button type="button" onClick={handleClear}>
              Clear
            </button>
          )}
        </form>
        {activeInterest && (
          <p style={{ margin: '8px 0 0 0', fontSize: '0.9em' }}>
            Filtered by interest: <strong>{activeInterest}</strong>
          </p>
        )}
      </div>

      <hr />

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Generating report from database...</p>
      ) : !reportData || reportData.length === 0 ? (
        <p>No interest groups found matching criteria.</p>
      ) : (
        <div>
          {reportData.map((group) => (
            <div key={group._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>{group._id}</h4>
                <strong>
                  {group.count} {group.count === 1 ? 'user' : 'users'}
                </strong>
              </div>

              <div style={{ marginTop: '8px' }}>
                <p style={{ margin: '0 0 4px 0', fontSize: '0.85em', color: '#666' }}>
                  Associated Users ({group.users.length}):
                </p>
                <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '6px 8px', borderRadius: '4px' }}>
                  <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.9em' }}>
                    {group.users.map((u) => (
                      <li key={u._id}>
                        {u.email} <span style={{ color: '#888' }}>(ID: {u._id})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}

          {pagination.totalPages > 1 && (
            <div className="pagination" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                Previous
              </button>

              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} interests total)
              </span>

              <button
                type="button"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InterestsReport;
