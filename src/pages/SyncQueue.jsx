import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../context/AuthContext';
import { generateUUID } from '../utils/uuid';

export const SyncQueue = () => {
  const [queue, setQueue] = useState([]);
  const { showToast } = useAuth();

  useEffect(() => {
    const items = JSON.parse(localStorage.getItem('offline_sync_queue') || '[]');
    setQueue(items);
  }, []);

  const handleSync = async () => {
    if (queue.length === 0) return;

    const idempotencyKey = generateUUID();
    const payload = {
      idempotencyKey,
      items: queue.map(item => ({
        clientInspectionId: item.clientInspectionId,
        baseServerVersion: item.baseServerVersion || null,
        ruleConfigVersion: item.ruleConfigVersion,
        capturedFields: item.capturedFields || {}
      }))
    };

    try {
      const res = await apiClient('/api/v1/sync/inspections', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      const results = res.data?.results || [];
      let conflictsFound = false;

      const remainingQueue = [];

      results.forEach((resItem) => {
        if (resItem.status === 'CONFLICT') {
          conflictsFound = true;
          showToast(`Conflict on record ${resItem.serverId || resItem.clientInspectionId}: Server version is higher.`);
          
          remainingQueue.push({
            ...queue.find(q => q.clientInspectionId === resItem.clientInspectionId),
            baseServerVersion: resItem.serverVersion
          });
        }
      });

      if (conflictsFound) {
        localStorage.setItem('offline_sync_queue', JSON.stringify(remainingQueue));
        setQueue(remainingQueue);
      } else {
        localStorage.setItem('offline_sync_queue', JSON.stringify([]));
        setQueue([]);
        showToast('All items synced successfully!');
      }

    } catch (err) {
      showToast(err.message || 'Sync failed.');
    }
  };

  const clearQueue = () => {
    localStorage.removeItem('offline_sync_queue');
    setQueue([]);
  };

  return (
    <div className="container">
      <h2>Offline Sync Queue</h2>
      <div className="card">
        <p>Items in pending local storage queue: <strong>{queue.length}</strong></p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="primary" disabled={queue.length === 0} onClick={handleSync}>Process Sync Batch</button>
          <button onClick={clearQueue}>Clear Queue</button>
        </div>
      </div>

      <div className="card">
        <pre>{JSON.stringify(queue, null, 2)}</pre>
      </div>
    </div>
  );
};