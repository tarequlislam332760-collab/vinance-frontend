import React, { useState, useEffect, useContext } from 'react';
import API from '../api';
import { UserContext } from '../context/UserContext';
import ManageUsers from './ManageUsers';
import PendingRequests from './PendingRequests';
import ManagePlans from './ManagePlans';
import InvestmentLogs from './InvestmentLogs';

const AdminPanel = () => {
  const { token } = useContext(UserContext);

  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newBalance, setNewBalance] = useState("");

  const fetchData = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const res = await API.get('/api/admin/all-data');

      setUsers(res.data.users || []);
      setRequests(res.data.requests || []);
      setInvestments(res.data.investments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleBalanceUpdate = async () => {
    if (!newBalance || newBalance < 0) {
      alert("Invalid balance");
      return;
    }

    try {
      await API.post('/api/admin/update-balance', {
        userId: selectedUser._id,
        balance: newBalance
      });

      setIsModalOpen(false);
      fetchData();
    } catch {
      alert("Error updating balance");
    }
  };

  if (loading) return <div className="text-center mt-20 text-yellow-500">Loading...</div>;

  return (
    <div className="p-8 bg-[#0b0e11] min-h-screen text-white">

      <div className="flex justify-between mb-10">
        <h2 className="text-3xl font-black text-yellow-500">Command Center</h2>

        <div className="flex gap-2">
          {['users', 'requests', 'plans', 'logs'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'users' && (
        <ManageUsers
          users={users}
          search={searchTerm}
          setSearch={setSearchTerm}
          onEdit={(user) => {
            setSelectedUser(user);
            setNewBalance(user.balance);
            setIsModalOpen(true);
          }}
        />
      )}

      {activeTab === 'requests' && (
        <PendingRequests requests={requests} fetchData={fetchData} />
      )}

      {activeTab === 'plans' && <ManagePlans />}

      {activeTab === 'logs' && <InvestmentLogs data={investments} />}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/80">
          <div className="bg-[#1e2329] p-6 rounded-xl">
            <h3>Update Balance</h3>

            <input
              type="number"
              value={newBalance}
              onChange={(e) => setNewBalance(e.target.value)}
            />

            <button onClick={handleBalanceUpdate}>Save</button>
            <button onClick={() => setIsModalOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;