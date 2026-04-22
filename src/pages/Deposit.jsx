import React, { useState, useContext } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ArrowLeft, Loader2, Copy, Check, AlertTriangle, Info } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Deposit = () => {
  const navigate = useNavigate();
  const { token, API_URL } = useContext(UserContext);

  // ✅ FIX: wallet address এবং network আলাদা রাখা হয়েছে
  const WALLET_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';
  const NETWORK = 'TRC20'; // ⚠️ গুরুত্বপূর্ণ: TRC20 address 'T' দিয়ে শুরু হয়, EVM address '0x' দিয়ে — নিচে বিস্তারিত

  const [amount, setAmount] = useState('');
  const [txId, setTxId] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(WALLET_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    // ✅ FIX: সব validation একসাথে
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount)) return alert('❌ Please enter a valid amount');
    if (parsedAmount < 10) return alert('❌ Minimum deposit is $10 USDT');
    if (!txId.trim()) return alert('❌ Please enter your Transaction ID (TXID)');
    if (txId.trim().length < 10) return alert('❌ TXID seems too short, please check');

    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/deposit`,
        {
          amount: parsedAmount,
          // ✅ FIX: txId আলাদা field হিসেবে পাঠানো — backend এ আলাদা সেভ করতে পারবেন
          txId: txId.trim(),
          method: `USDT (${NETWORK})`,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('✅ ' + res.data.message);
      navigate('/dashboard');
    } catch (err) {
      alert(err.response?.data?.message || '❌ Failed to submit deposit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#03101a] text-white p-6 flex flex-col items-center">
      {/* Back Button */}
      <div className="w-full max-w-md mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-400 hover:text-[#1aa07b] transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>
      </div>

      <div className="w-full max-w-md bg-[#032a3b] rounded-[2.5rem] p-8 border border-[#143e52] text-center shadow-2xl">
        <h2 className="text-xl font-bold mb-2 text-[#1aa07b]">Deposit USDT</h2>
        <p className="text-gray-400 text-xs mb-6 uppercase tracking-widest font-bold">
          Network: <span className="text-white">{NETWORK}</span>
        </p>

        {/* ⚠️ Network Warning */}
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 mb-6 text-left">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-[10px] font-black uppercase tracking-wider mb-1">
                Important Warning
              </p>
              <p className="text-gray-300 text-[10px] leading-relaxed">
                Only send <span className="text-white font-bold">USDT via {NETWORK} network</span>.
                Sending via wrong network will result in <span className="text-red-400 font-bold">permanent loss of funds</span>.
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white p-4 rounded-3xl inline-block mb-6 shadow-lg">
          <QRCodeSVG value={WALLET_ADDRESS} size={150} />
        </div>

        {/* Wallet Address Copy */}
        <div className="bg-[#03101a] p-4 rounded-xl mb-2 flex items-center justify-between border border-[#143e52] text-left">
          <span className="text-[11px] text-gray-400 break-all mr-2 font-mono">
            {WALLET_ADDRESS}
          </span>
          <button
            onClick={handleCopy}
            className="text-[#1aa07b] hover:scale-110 transition-transform flex-shrink-0"
            title="Copy address"
          >
            {copied ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
          </button>
        </div>
        {copied && (
          <p className="text-emerald-400 text-[10px] font-bold mb-4">✅ Address Copied!</p>
        )}

        {/* Info Note */}
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-6 mt-4 text-left">
          <div className="flex items-center gap-2">
            <Info size={14} className="text-blue-400 flex-shrink-0" />
            <p className="text-blue-300 text-[10px] font-bold uppercase tracking-wider">
              After sending, enter the amount & TXID below. Your balance will be credited after admin verification (within 24hrs).
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleDeposit} className="space-y-4 text-left">
          <div>
            <label className="text-[10px] text-gray-400 uppercase font-black mb-2 block">
              Amount (USDT) — Min $10
            </label>
            <input
              type="number"
              required
              min="10"
              step="any"
              placeholder="e.g. 100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all text-white"
            />
            {amount && parseFloat(amount) < 10 && (
              <p className="text-red-400 text-[10px] mt-1 font-bold">❌ Minimum $10 required</p>
            )}
          </div>

          <div>
            <label className="text-[10px] text-gray-400 uppercase font-black mb-2 block">
              Transaction ID (TXID)
            </label>
            <input
              type="text"
              required
              placeholder="Paste your transaction hash here..."
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              className="w-full bg-[#03101a] p-4 rounded-xl border border-[#143e52] outline-none focus:border-[#1aa07b] transition-all text-white font-mono text-sm"
            />
            <p className="text-gray-600 text-[10px] mt-1">
              Find TXID in your wallet's transaction history
            </p>
          </div>

          {/* ✅ FIX: disabled state সঠিকভাবে কাজ করবে */}
          <button
            type="submit"
            disabled={loading || !amount || parseFloat(amount) < 10 || !txId.trim()}
            className="w-full bg-[#1aa07b] hover:bg-[#158566] text-white py-4 rounded-xl font-bold active:scale-95 transition-all shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} /> Submitting...
              </>
            ) : (
              'Submit Deposit Request'
            )}
          </button>
        </form>
      </div>

      {/* ⚠️ DEVELOPER NOTE — নিচের অংশ শুধু আপনার জন্য */}
      {/* 
        গুরুত্বপূর্ণ: আপনার wallet address '0x71C7...' এটা একটি EVM (Ethereum/BNB) address।
        TRC20 (TRON) address সবসময় 'T' দিয়ে শুরু হয়, যেমন: TXyz123...
        
        দুটো option আছে:
        1. Network TRC20 রাখতে চাইলে → Binance থেকে TRC20 USDT deposit address নিন (T দিয়ে শুরু)
        2. Address '0x' রাখতে চাইলে → Network BEP20 (BSC) বা ERC20 করুন
        
        ভুল network দিলে user এর fund চলে যাবে!
      */}
    </div>
  );
};

export default Deposit;