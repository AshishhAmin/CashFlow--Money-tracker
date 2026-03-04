import { X, Upload, Camera, Check, Loader2, ScanLine, Zap, Image as ImageIcon, Search, Crosshair } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function ScanReceiptModal({ isOpen, onClose, onAdd, currency }) {
    const [step, setStep] = useState('upload'); // 'upload' | 'scanning' | 'review'
    const [scannedData, setScannedData] = useState({ title: '', amount: '', category: 'Food', date: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('Initializing Engine...');

    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setSelectedFile(null);
            setScannedData({ title: '', amount: '', category: 'Food', date: '' });
            setScanProgress(0);
        }
    }, [isOpen]);

    const processReceiptText = (text) => {
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const lowerText = text.toLowerCase();
        let merchant = lines.find(l => l.length > 3 && !l.match(/^[0-9\W]+$/)) || 'Unknown Entity';
        merchant = merchant.replace(/^[^a-zA-Z0-9]+/, '').substring(0, 25);

        let detectedAmount = 0;
        const totalKeywords = ['total', 'grand total', 'payable', 'amount', 'due', 'balance'];
        const totalLineIndex = lines.findIndex(line => totalKeywords.some(keyword => line.toLowerCase().includes(keyword)));

        if (totalLineIndex !== -1) {
            const candidateLines = [lines[totalLineIndex], lines[totalLineIndex + 1]].filter(Boolean);
            const amountRegex = /(\d{1,3}(,\d{3})*(\.\d{2}))/g;
            for (const line of candidateLines) {
                const matches = line.match(amountRegex);
                if (matches) {
                    const val = parseFloat(matches[matches.length - 1].replace(/,/g, ''));
                    if (!isNaN(val)) { detectedAmount = val; break; }
                }
            }
        }

        if (detectedAmount === 0) {
            const amountRegexLoose = /(\d{1,3}(,\d{3})*(\.\d{2})?)/g;
            const numbers = text.match(amountRegexLoose);
            if (numbers) {
                let maxVal = 0;
                numbers.forEach(numStr => {
                    const val = parseFloat(numStr.replace(/,/g, ''));
                    const isYear = val >= 2020 && val <= 2030 && !numStr.includes('.');
                    if (!isNaN(val) && val > maxVal && val < 500000 && !isYear) maxVal = val;
                });
                detectedAmount = maxVal;
            }
        }

        let category = 'Other';
        if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('coffee')) category = 'Food';
        else if (lowerText.includes('movie') || lowerText.includes('cinema')) category = 'Entertainment';
        else if (lowerText.includes('uber') || lowerText.includes('fuel')) category = 'Transport';
        else if (lowerText.includes('mart') || lowerText.includes('store')) category = 'Shopping';
        else if (lowerText.includes('hospital') || lowerText.includes('pharmacy')) category = 'Health';
        else if (lowerText.includes('bill') || lowerText.includes('recharge')) category = 'Bills';

        return { title: merchant, amount: detectedAmount > 0 ? detectedAmount.toFixed(2) : '', category, date: new Date().toISOString() };
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setStep('scanning');
            setScanProgress(0);
            setScanStatus('Starting scanner...');

            Tesseract.recognize(file, 'eng', {
                logger: (m) => {
                    if (m.status === 'recognizing text') {
                        setScanProgress(Math.round(m.progress * 100));
                        setScanStatus(`Reading receipt... ${Math.round(m.progress * 100)}%`);
                    } else { setScanStatus(m.status); }
                }
            }).then(({ data: { text } }) => {
                setScannedData(processReceiptText(text));
                setStep('review');
            }).catch(err => {
                setScanStatus('Logic Failure. Rebooting...');
                setTimeout(() => setStep('upload'), 2000);
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({ ...scannedData, amount: parseFloat(scannedData.amount), type: 'expense' });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative glass-card w-full max-w-md p-8 border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] z-20"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-neon-green/10 text-neon-green">
                                        <ScanLine size={20} />
                                    </div>
                                    Receipt Scanner
                                </h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Scan and extract details</p>
                            </div>
                            <button onClick={onClose} className="p-2 glass border-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {step === 'upload' && (
                            <div className="flex flex-col items-center gap-8 py-10">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    className="relative w-40 h-40 rounded-[3rem] glass bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center group cursor-pointer overflow-hidden transition-all hover:border-neon-green/50"
                                >
                                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer z-20" onChange={handleFileSelect} />
                                    <div className="absolute inset-0 bg-neon-green/5 opacity-0 group-hover:opacity-100 transition-opacity z-0" />
                                    <div className="flex flex-col items-center gap-3 z-10">
                                        <Camera size={48} className="text-gray-600 group-hover:text-neon-green transition-all" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-gray-700 group-hover:text-white transition-all">Take Photo</span>
                                    </div>
                                </motion.div>
                                <div className="text-center space-y-2">
                                    <p className="text-white text-xs font-black uppercase tracking-widest">Ready to scan</p>
                                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest leading-relaxed">System accepts JPEG or PNG images</p>
                                </div>
                            </div>
                        )}

                        {step === 'scanning' && (
                            <div className="flex flex-col items-center gap-10 py-12 relative">
                                <motion.div
                                    animate={{ y: [0, 160, 0] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute left-0 right-0 h-0.5 bg-neon-green/50 shadow-[0_0_20px_rgba(46,204,113,0.8)] z-10"
                                />
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-[2.5rem] border-4 border-white/5" />
                                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle className="text-neon-green/10" strokeWidth="6" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50" />
                                        <motion.circle
                                            initial={{ strokeDashoffset: 264 }}
                                            animate={{ strokeDashoffset: 264 - (264 * scanProgress) / 100 }}
                                            className="text-neon-green" strokeWidth="6" strokeDasharray={264} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="50" cy="50"
                                        />
                                    </svg>
                                    <div className="flex flex-col items-center">
                                        <span className="text-xl font-black text-white">{scanProgress}%</span>
                                        <Crosshair size={14} className="text-neon-green mt-1 animate-pulse" />
                                    </div>
                                </div>
                                <div className="text-center space-y-3">
                                    <h3 className="text-white font-black text-lg uppercase tracking-tight">Analyzing Receipt</h3>
                                    <div className="px-4 py-1.5 glass bg-white/5 border-white/5 rounded-lg">
                                        <p className="text-neon-green text-[10px] font-black uppercase tracking-[0.2em]">{scanStatus}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'review' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 bg-neon-green/5 border border-neon-green/10 p-4 rounded-2xl mb-6">
                                    <div className="bg-neon-green p-2 rounded-xl text-black">
                                        <Check size={16} strokeWidth={3} />
                                    </div>
                                    <div>
                                        <p className="text-neon-green text-[10px] font-black uppercase tracking-widest">Receipt Read</p>
                                        <p className="text-gray-400 text-[8px] font-black uppercase tracking-widest">Details extracted successfully</p>
                                    </div>
                                </motion.div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant / Shop</label>
                                        <input type="text" value={scannedData.title} onChange={(e) => setScannedData({ ...scannedData, title: e.target.value })} className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Total Amount</label>
                                        <div className="relative">
                                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 font-black">{currency?.symbol || '₹'}</span>
                                            <input type="number" value={scannedData.amount} onChange={(e) => setScannedData({ ...scannedData, amount: e.target.value })} className="w-full glass bg-white/5 border-white/5 rounded-2xl pl-10 pr-5 py-4 text-white font-black tracking-tight focus:outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {['Food', 'Shopping', 'Transport', 'Bills', 'Rent', 'Utilities', 'Subscriptions', 'Essentials', 'People', 'Transfers', 'Other'].map((cat) => (
                                                <button key={cat} type="button" onClick={() => setScannedData({ ...scannedData, category: cat })} className={`py-2.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${scannedData.category === cat ? 'bg-white text-black shadow-xl' : 'glass bg-white/5 text-gray-400'}`}>{cat}</button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] mt-8 shadow-2xl transition-all">
                                    Add to Expenses
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
