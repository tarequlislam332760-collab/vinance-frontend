import React, { useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, ChevronRight, Loader2 } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// আপনার ব্যাকএন্ড লিঙ্কটি এখানে দিন
const API_BASE_URL = "https://vinance-backend.vercel.app"; 

const Deposit = () => {
  const navigate = useNavigate();
  const { user, token, setUser } = useContext(UserContext);
  const [walletAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress);
    alert("Address copied!");
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) < 10) {
      alert("Minimum deposit is 10 USDT");
      return;
    }

    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        `${API_BASE_URL}/api/deposit`, // লোকালহোস্ট পরিবর্তন করা হয়েছে
        { amount: parseFloat(amount) }, 
        config
      );

      if (response.data) {
        setUser({ ...user, balance: response.data.newBalance });
        alert(`Success! $${amount} added to your account.`);
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || "Deposit failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-2 text-left w-full max-w-md">Deposit USDT</h1>
      <p className="text-gray-400 mb-8 text-sm text-left w-full max-w-md">Send only USDT to this address via TRC20 network.</p>

      <div className="w-full max-w-md bg-[#1e2329] rounded-3xl p-8 border border-gray-800 text-center shadow-2xl">
        <p className="text-gray-500 text-xs font-bold uppercase mb-4">Scan QR to Deposit</p>
        <div className="bg-white p-4 rounded-2xl inline-block mb-8">
          <QRCodeSVG value={walletAddress} size={180} />
        </div>

        <div className="text-left space-y-6">
          <div>
            <label className="text-xs text-gray-500 font-bold mb-2 block uppercase">Your Deposit Address</label>
            <div className="flex items-center gap-3 bg-[#0b0e11] p-4 rounded-xl border border-gray-800">
              <input readOnly value={walletAddress} className="bg-transparent border-none outline-none text-[10px] flex-1 text-gray-300 font-mono" />
              <button onClick={copyToClipboard} className="text-yellow-500 hover:text-yellow-400">
                <Copy size={18} />
              </button>
            </div>
          </div>

          <form onSubmit={handleDeposit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-500 font-bold mb-2 block uppercase">Amount Sent (USDT)</label>
              <input type="number" required placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-[#0b0e11] border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-yellow-500 font-mono" />
            </div>
            <button type="submit" disabled={loading} className={`w-full bg-yellow-500 text-black py-4 rounded-2xl font-bold hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 ${loading ? 'opacity-50' : ''}`}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : "I have sent the funds"}
              {!loading && <ChevronRight size={18} />}
            </button>
          </form>
        </div>
        <p className="mt-6 text-[10px] text-red-400 text-left">* Minimum deposit: 10 USDT</p>
      </div>
    </div>
  );
};

export default Deposit;