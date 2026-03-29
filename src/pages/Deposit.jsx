import React, { useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Loader2, Copy, Check } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useContext(UserContext);
  const [walletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F'); // আপনার বিন্যান্স এড্রেস
  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) < 10) return alert("❌ Minimum 10 USDT");

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/deposit`, 
        { 
          amount: parseFloat(amount), 
          method: `USDT(TRC20) - TXID: ${txId}` 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("✅ " + res.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || "❌ Failed to submit");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#03101a] text-white p-6 flex flex-col items-center">
      <div className="w-full max-w-md mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-[#1aa07b] transition-colors">
          <ArrowLeft size={20}/> Back
        </button>
      </div>
      <div className="w-full max-w-md bg-[#032a3b] rounded-[2.5rem] p-8 border border-[#143e52] text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-6 text-[#1aa07b]">Deposit USDT (TRC20)</h2>
        
        <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-lg">
          <QRCodeSVG value={walletAddress} size={150} />
        </div>

        <div className="bg-[#03101a] p-4 rounded-xl mb-6 flex items-center justify-between border border-[#143e52]">
          <span className="text-[10px] text-gray-400 truncate mr-2">{walletAddress}</span>
          <button onClick={handleCopy} className="text-[#1aa07b] hover:scale-110 transition-transform">
            {copied ? <Check size={18}/> : <Copy size={18}/>}
          </button>
        </div>

        <form onSubmit={handleDeposit} className="space-y-4">
          <input 
            type="number" required placeholder="Amount (Min $10)" 
            value={amount} onChange={(e) => setAmount(e.target.value)} 
            className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all" 
          />
          <input 
            type="text" required placeholder="Transaction ID (TXID)" 
            value={txId} onChange={(e) => setTxId(e.target.value)} 
            className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all" 
          />
          <button disabled={loading} className="w-full bg-[#1aa07b] hover:bg-[#158566] text-white py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg flex justify-center items-center">
            {loading ? <Loader2 className="animate-spin"/> : "Submit Deposit"}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Deposit;