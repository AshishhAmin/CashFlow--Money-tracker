import { X, Camera, User, Mail, Smartphone, AlignLeft, Check, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { storage } from '../firebase';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const [formData, setFormData] = useState({
        name: '', email: '', bio: '', phone: ''
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                phone: user.phone || ''
            });
            setPreviewUrl(user.photoURL || null);
        }
    }, [user, isOpen]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setUploadProgress(0);
        let photoURL = user?.photoURL;

        const performSave = () => {
            onSave({ ...formData, photoURL });
            onClose();
            setUploading(false);
        };

        try {
            if (imageFile) {
                if (!storage) throw new Error("Firebase Storage is not initialized.");
                const storageRef = ref(storage, `users/${user.email || 'unknown'}/profile_${Date.now()}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(Math.round(progress));
                    },
                    (error) => {
                        console.error("Upload failed:", error);
                        alert(`Upload failed: ${error.message}`);
                        setUploading(false);
                    },
                    async () => {
                        photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                        performSave();
                    }
                );
            } else {
                performSave();
            }
        } catch (error) {
            console.error("Error preparing upload: ", error);
            setUploading(false);
        }
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
                                        <User size={20} />
                                    </div>
                                    Edit Profile
                                </h2>
                                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-1">Update your personal details</p>
                            </div>
                            <button onClick={onClose} className="p-2 glass border-white/5 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Image Upload Area */}
                            <div className="flex flex-col items-center mb-8">
                                <div className="relative group cursor-pointer">
                                    <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-neon-green to-brand-blue p-1 shadow-2xl overflow-hidden">
                                        <div className="w-full h-full rounded-[2.2rem] bg-black flex items-center justify-center overflow-hidden border-4 border-black relative">
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                                            ) : (
                                                <div className="w-full h-full bg-surface-dark flex items-center justify-center text-gray-700">
                                                    <Camera size={40} />
                                                </div>
                                            )}

                                            {/* Progress Overlay */}
                                            {uploading && (
                                                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center">
                                                    <span className="text-neon-green font-black text-xs">{uploadProgress}%</span>
                                                    <div className="w-12 h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${uploadProgress}%` }}
                                                            className="h-full bg-neon-green"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 bg-white text-black p-2.5 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                                        <Camera size={16} />
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        disabled={uploading}
                                    />
                                </div>
                                <p className="text-gray-600 text-[8px] font-black uppercase tracking-[0.2em] mt-3">Change Profile Photo</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <User size={12} /> Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Mail size={12} /> Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all opacity-60 cursor-not-allowed"
                                        readOnly
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <Smartphone size={12} /> Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all"
                                        placeholder="+91 ...."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                        <AlignLeft size={12} /> Bio / About
                                    </label>
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        className="w-full glass bg-white/5 border-white/5 rounded-2xl px-5 py-4 text-white font-black tracking-tight focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all resize-none h-28 text-xs leading-relaxed"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={uploading}
                                className="w-full py-5 bg-white text-black rounded-[2rem] font-black uppercase tracking-[0.2em] text-[10px] mt-8 transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {uploading ? (
                                    <>
                                        <Zap size={14} className="animate-spin" />
                                        Saving: {uploadProgress}%
                                    </>
                                ) : (
                                    <>
                                        <Check size={14} />
                                        Save Changes
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
