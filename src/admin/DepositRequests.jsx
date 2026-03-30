import React, { useEffect, useState } from 'react';
import API from '../api';

const DepositRequests = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
    const res = await API.get('/api/admin/deposits');
    setRequests(res.data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id, status) => {
    await API.put(`/api/admin/deposit/${id}`, { status });
    fetchRequests();
  };

  return (
    <div>
      {requests.map(r => (
        <div key={r._id}>
          {r.user?.name} - {r.amount}

          <button onClick={() => handleAction(r._id, 'approved')}>Approve</button>
          <button onClick={() => handleAction(r._id, 'rejected')}>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default DepositRequests;