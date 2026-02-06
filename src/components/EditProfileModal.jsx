import { X, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL, uploadBytesResumable } from 'firebase/storage';

export default function EditProfileModal({ isOpen, onClose, user, onSave }) {
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);

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

    // New state for progress
    const [uploadProgress, setUploadProgress] = useState(0);

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

                // File size check (e.g., max 5MB)
                if (imageFile.size > 5 * 1024 * 1024) {
                    throw new Error("File size exceeds 5MB limit.");
                }

                const storageRef = ref(storage, `users/${user.email || 'unknown'}/profile_${Date.now()}`);

                // Use resumable upload for progress
                const uploadTask = uploadBytesResumable(storageRef, imageFile);

                uploadTask.on('state_changed',
                    (snapshot) => {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        setUploadProgress(Math.round(progress));
                        console.log('Upload is ' + progress + '% done');
                    },
                    (error) => {
                        console.error("Upload failed:", error);
                        alert(`Upload failed: ${error.message} (Code: ${error.code})`);
                        setUploading(false);
                    },
                    async () => {
                        // Upload completed successfully
                        try {
                            photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                            performSave();
                        } catch (urlError) {
                            console.error("Error getting URL:", urlError);
                            alert("Upload finished but failed to get image URL.");
                            setUploading(false);
                        }
                    }
                );
            } else {
                performSave();
            }
        } catch (error) {
            console.error("Error preparing upload: ", error);
            alert(`Error: ${error.message}`);
            setUploading(false);
        }
    };

    if (!isOpen) return null;
    if (!user) return null; // Safety check

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-card-dark w-full max-w-md rounded-3xl p-6 border border-gray-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Image Upload */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer">
                            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-neon-green/30 group-hover:border-neon-green transition-colors">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-400">
                                        <Camera size={32} />
                                    </div>
                                )}
                                {/* Progress Overlay */}
                                {uploading && (
                                    <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                        <span className="text-neon-green font-bold text-sm">{uploadProgress}%</span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera size={24} className="text-white" />
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                        </div>
                        <p className="text-gray-500 text-xs mt-2">Tap to change photo</p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Full Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Email Address</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Phone Number</label>
                        <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all"
                            placeholder="+91 ..."
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Bio / Tagline</label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-[#0a0a0a] border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green focus:ring-1 focus:ring-neon-green transition-all resize-none h-24"
                            placeholder="Tell us a little about yourself..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={uploading}
                        className="w-full bg-neon-green text-black font-bold py-4 rounded-xl mt-4 hover:bg-neon-green/90 active:scale-[0.98] transition-all shadow-lg shadow-neon-green/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {uploading ? `Uploading... ${uploadProgress}%` : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}
