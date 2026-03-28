import React, { useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ChevronRight, Loader2, ArrowLeft } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
  const navigate = useNavigate();
  const { token } = useContext(UserContext);
  const [walletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) return alert("Min 10 USDT");
    if (!txId) return alert("Enter TXID");

    try {
      setLoading(true);
      const res = await axios.post('http://localhost:5000/api/deposit', 
        { amount: parseFloat(amount), method: 'USDT (TRC20)', transactionId: txId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ " + res.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6"><button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400"><ArrowLeft size={20}/> Back</button></div>
      <div className="w-full max-w-md bg-[#1e2329] rounded-[2.5rem] p-8 border border-gray-800">
        <div className="bg-white p-4 rounded-3xl inline-block mb-6"><QRCodeSVG value={walletAddress} size={150} /></div>
        <form onSubmit={handleDeposit} className="space-y-4">
          <input type="number" required placeholder="Amount USDT" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#0b0e11] p-4 rounded-xl outline-none border border-gray-800 focus:border-yellow-500" />
          <input type="text" required placeholder="Transaction ID (TXID)" value={txId} onChange={(e) => setTxId(e.target.value)} className="w-full bg-[#0b0e11] p-4 rounded-xl outline-none border border-gray-800 focus:border-yellow-500" />
          <button disabled={loading} className="w-full bg-yellow-500 text-black py-4 rounded-xl font-bold">
            {loading ? <Loader2 className="animate-spin mx-auto"/> : "Submit Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Deposit;