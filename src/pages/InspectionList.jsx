import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { generateUUID } from '../utils/uuid';

export const InspectionList = () => {
  const [inspections, setInspections] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({});
  const { showToast, activeRuleVersion } = useAuth();

  const fetchInspections = async () => {
    try {
      const query = new URLSearchParams({ page, limit: 10 });
      if (status) query.append('status', status);
      const res = await apiClient(`/api/v1/inspections?${query.toString()}`);
      setInspections(res.data || []);
      setMeta(res.meta || {});
    } catch (err) {
      showToast(err.message);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [page, status]);

  const handleCreateOfflineLocal = () => {
    const queue = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
    const newLocalItem = {
      clientInspectionId: generateUUID(),
      ruleConfigVersion: activeRuleVersion || 'v1.0.0',
      status: 'DRAFT',
      capturedFields: { item_name: 'New Package Inspection', mrp: 100 },
      createdAt: new Date().toISOString()
    };
    queue.push(newLocalItem);
    localStorage.setItem('offline_sync_queue', JSON.stringify(queue));
    showToast('Saved inspection to local offline queue.');
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0' }}>
        <h2>Inspections</h2>
        <button className="primary" onClick={handleCreateOfflineLocal}>+ Create Offline Record</button>
      </div>

      <div className="card" style={{ display: 'flex', gap: '10px' }}>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">All Statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="PENDING_REVIEW">PENDING_REVIEW</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: '8px' }}>ID</th>
              <th>Status</th>
              <th>Rule Version</th>
              <th>Server Ver</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {inspections.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '8px' }}>{item.id}</td>
                <td><span className={`badge ${item.status}`}>{item.status}</span></td>
                <td>{item.rule_config_version || item.ruleConfigVersion}</td>
                <td>{item.server_version}</td>
                <td>
                  <Link to={`/inspections/${item.id}`}><button>View / Edit</button></Link>
                </td>
              </tr>
            ))}
            {inspections.length === 0 && (
              <tr><td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>No records found.</td></tr>
            )}
          </tbody>
        </table>

        {meta.totalPages > 1 && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            <span>Page {meta.page} of {meta.totalPages}</span>
            <button disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </div>
  );
};