import { X, Upload, Camera, Check, Loader2, ScanLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';

export default function ScanReceiptModal({ isOpen, onClose, onAdd, currency }) {
    const [step, setStep] = useState('upload'); // 'upload' | 'scanning' | 'review'
    const [scannedData, setScannedData] = useState({ title: '', amount: '', category: 'Food', date: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('Initializing...');

    useEffect(() => {
        if (isOpen) {
            setStep('upload');
            setSelectedFile(null);
            setScannedData({ title: '', amount: '', category: 'Food', date: '' });
            setScanProgress(0);
        }
    }, [isOpen]);

    const processReceiptText = (text) => {
        console.log("Scanned Text:", text);
        const lines = text.split('\n').filter(line => line.trim() !== '');
        const lowerText = text.toLowerCase();

        // 1. Merchant Name (Heuristic: First non-empty line that isn't a common noise word)
        // Skip lines that are just symbols or very short (likely artifacts)
        let merchant = lines.find(l => l.length > 3 && !l.match(/^[0-9\W]+$/)) || 'Unknown Merchant';
        merchant = merchant.replace(/^[^a-zA-Z0-9]+/, '').substring(0, 20);

        // 2. Total Amount - Enhanced Logic
        // Strategy A: Look for "Total", "Grand Total", "Payable", "Amount" lines
        let detectedAmount = 0;
        const totalKeywords = ['total', 'grand total', 'payable', 'amount', 'due', 'balance'];

        // Find line with keyword
        const totalLineIndex = lines.findIndex(line =>
            totalKeywords.some(keyword => line.toLowerCase().includes(keyword))
        );

        if (totalLineIndex !== -1) {
            // Check this line and the next line for numbers
            const candidateLines = [lines[totalLineIndex], lines[totalLineIndex + 1]].filter(Boolean);
            const amountRegex = /(\d{1,3}(,\d{3})*(\.\d{2}))/g; // Strict: must have decimal

            for (const line of candidateLines) {
                const matches = line.match(amountRegex);
                if (matches) {
                    // Parse matches, pick the last one usually (e.g. "Total ... 120.00")
                    const val = parseFloat(matches[matches.length - 1].replace(/,/g, ''));
                    if (!isNaN(val)) {
                        detectedAmount = val;
                        break;
                    }
                }
            }
        }

        // Strategy B: Fallback to largest number, but exclude likely years (2020-2030) and integers if possible
        if (detectedAmount === 0) {
            const amountRegexLoose = /(\d{1,3}(,\d{3})*(\.\d{2})?)/g;
            const numbers = text.match(amountRegexLoose);
            if (numbers) {
                let maxVal = 0;
                numbers.forEach(numStr => {
                    const val = parseFloat(numStr.replace(/,/g, ''));
                    // Exclude years: 2020-2030. Also exclude simple integers like "1", "2" unless they are the only thing.
                    // A year usually doesn't have a decimal.
                    const isYear = val >= 2020 && val <= 2030 && !numStr.includes('.');
                    if (!isNaN(val) && val > maxVal && val < 500000 && !isYear) {
                        maxVal = val;
                    }
                });
                detectedAmount = maxVal;
            }
        }

        // 3. Category Detection
        let category = 'Other';
        if (lowerText.includes('food') || lowerText.includes('restaurant') || lowerText.includes('coffee') || lowerText.includes('cafe') || lowerText.includes('bistro') || lowerText.includes('kitchen')) category = 'Food';
        else if (lowerText.includes('movie') || lowerText.includes('cinema') || lowerText.includes('theatre') || lowerText.includes('entertainment')) category = 'Entertainment';
        else if (lowerText.includes('fuel') || lowerText.includes('petrol') || lowerText.includes('diesel') || lowerText.includes('uber') || lowerText.includes('ola') || lowerText.includes('pump')) category = 'Transport';
        else if (lowerText.includes('mart') || lowerText.includes('store') || lowerText.includes('market') || lowerText.includes('retail') || lowerText.includes('grocery')) category = 'Shopping';
        else if (lowerText.includes('hospital') || lowerText.includes('pharmacy') || lowerText.includes('clinic') || lowerText.includes('med')) category = 'Health';
        else if (lowerText.includes('bill') || lowerText.includes('recharge') || lowerText.includes('electricity') || lowerText.includes('water') || lowerText.includes('wifi')) category = 'Bills';

        return {
            title: merchant,
            amount: detectedAmount > 0 ? detectedAmount.toFixed(2) : '', // Leave blank if 0 to avoid bad data
            category,
            date: new Date().toISOString() // Default to today
        };
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setStep('scanning');
            setScanProgress(0);
            setScanStatus('Initializing Engine...');

            Tesseract.recognize(
                file,
                'eng',
                {
                    logger: (m) => {
                        if (m.status === 'recognizing text') {
                            setScanProgress(Math.round(m.progress * 100));
                            setScanStatus(`Scanning... ${Math.round(m.progress * 100)}%`);
                        } else {
                            setScanStatus(m.status);
                        }
                    }
                }
            ).then(({ data: { text } }) => {
                const result = processReceiptText(text);
                setScannedData(result);
                setStep('review');
            }).catch(err => {
                console.error("OCR Error:", err);
                setScanStatus('Failed to scan. Please try again.');
                setTimeout(() => setStep('upload'), 2000);
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAdd({
            ...scannedData,
            amount: parseFloat(scannedData.amount),
            type: 'expense'
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className={`relative bg-card-dark w-full max-w-sm rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden`}>

                {/* Header */}
                <div className="flex justify-between items-center mb-6 z-10 relative">
                    <h2 className="text-xl font-bold text-white">Scan Receipt</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Step 1: Upload */}
                {step === 'upload' && (
                    <div className="flex flex-col items-center gap-6 py-8">
                        <div className="relative w-32 h-32 rounded-full bg-[#1a1a1a] flex items-center justify-center border-2 border-dashed border-gray-700 hover:border-neon-green transition-colors group cursor-pointer overflow-hidden">
                            <input
                                type="file"
                                accept="image/*"
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                                onChange={handleFileSelect}
                            />
                            <div className="absolute inset-0 bg-neon-green/5 group-hover:bg-neon-green/10 transition-colors z-0"></div>
                            <Camera size={40} className="text-gray-400 group-hover:text-neon-green transition-colors z-10" />
                        </div>
                        <p className="text-gray-400 text-center text-sm">
                            Tap to take a photo or <br /> upload an existing image
                        </p>
                    </div>
                )}

                {/* Step 2: Scanning */}
                {step === 'scanning' && (
                    <div className="flex flex-col items-center gap-6 py-8 relative">
                        {/* Scan Animation Line */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-neon-green shadow-[0_0_15px_rgba(46,204,113,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>

                        <div className="relative w-24 h-24 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-800"></div>
                            {/* Progress Ring */}
                            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle
                                    className="text-gray-800"
                                    strokeWidth="4"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="46"
                                    cx="50"
                                    cy="50"
                                />
                                <circle
                                    className="text-neon-green transition-all duration-300"
                                    strokeWidth="4"
                                    strokeDasharray={289}
                                    strokeDashoffset={289 - (289 * scanProgress) / 100}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="46"
                                    cx="50"
                                    cy="50"
                                />
                            </svg>
                            <span className="text-xs font-bold text-neon-green">{scanProgress}%</span>
                        </div>
                        <div className="text-center space-y-2">
                            <h3 className="text-white font-bold text-lg">AI Processing...</h3>
                            <p className="text-gray-500 text-xs capitalize">{scanStatus}</p>
                        </div>
                    </div>
                )}

                {/* Step 3: Review */}
                {step === 'review' && (
                    <form onSubmit={handleSubmit} className="space-y-4 animate-in slide-in-from-bottom-5 fade-in duration-300">
                        <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-4 flex items-center gap-3 mb-4">
                            <div className="bg-neon-green p-1.5 rounded-full text-black">
                                <Check size={14} strokeWidth={3} />
                            </div>
                            <p className="text-neon-green text-sm font-medium">Scan Complete!</p>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Merchant</label>
                            <input
                                type="text"
                                value={scannedData.title}
                                onChange={(e) => setScannedData({ ...scannedData, title: e.target.value })}
                                className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Total Amount</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{currency?.symbol || '₹'}</span>
                                <input
                                    type="number"
                                    value={scannedData.amount}
                                    onChange={(e) => setScannedData({ ...scannedData, amount: e.target.value })}
                                    className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl pl-8 pr-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Category</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Essentials', 'Health'].map((cat) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setScannedData({ ...scannedData, category: cat })}
                                        className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${scannedData.category === cat
                                            ? 'bg-neon-green text-black shadow-[0_0_10px_rgba(46,204,113,0.4)]'
                                            : 'bg-[#1a1a1a] text-gray-400 hover:bg-[#252525]'
                                            }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-white text-black font-bold py-4 rounded-xl mt-4 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
                        >
                            Confirm & Save
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}

// Add keyframes for scan animation if needed, but styling here for simplicity
// index.css should ideally have @keyframes scan { 0% { top: 0% } 50% { top: 100% } 100% { top: 0% } }
