import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

export const InspectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [record, setRecord] = useState(null);
  const [capturedData, setCapturedData] = useState('{}');

  const fetchDetail = async () => {
    try {
      const res = await apiClient(`/api/v1/inspections/${id}`);
      setRecord(res.data);
      setCapturedData(JSON.stringify(res.data.captured_fields || res.data.capturedFields || {}, null, 2));
    } catch (err) {
      showToast(err.message);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpdate = async () => {
    try {
      let parsedFields = {};
      try { parsedFields = JSON.parse(capturedData); } catch (e) {
        showToast('Invalid JSON structure in captured fields');
        return;
      }

      const payload = {
        server_version: record.server_version,
        capturedFields: parsedFields
      };

      const res = await apiClient(`/api/v1/inspections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });

      showToast('Record updated successfully.');
      setRecord(res.data);
    } catch (err) {
      showToast(err.message);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        server_version: record.server_version
      };

      const res = await apiClient(`/api/v1/inspections/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      showToast('Record submitted for review.');
      setRecord(res.data);
    } catch (err) {
      showToast(err.message);
    }
  };

  if (!record) return <div className="container"><p>Loading details...</p></div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/')}>&larr; Back to List</button>
      <div className="card" style={{ marginTop: '16px' }}>
        <h2>Inspection ID: {record.id}</h2>
        <p>Status: <span className={`badge ${record.status}`}>{record.status}</span></p>
        <p>Server Version: <strong>{record.server_version}</strong></p>
        <p>Rule Config Stamp: <strong>{record.rule_config_version || record.ruleConfigVersion}</strong></p>

        <label><strong>Captured Fields (JSON):</strong></label>
        <textarea rows="8" value={capturedData} onChange={(e) => setCapturedData(e.target.value)} />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary" onClick={handleUpdate}>Update (PATCH)</button>
          <button style={{ background: '#28a745', color: '#fff', border: 'none' }} onClick={handleSubmit}>Submit for Review</button>
        </div>
      </div>
    </div>
  );
};