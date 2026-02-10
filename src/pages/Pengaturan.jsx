import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, appId } from '../lib/firebase';

const Pengaturan = ({ isDemo, setIsDemo }) => {
    const [logoFile, setLogoFile] = useState(null);
    const [cctvLink, setCctvLink] = useState('');
    const [isLoading, setIsLoading] = useState({logo: false, cctv: false});
    const [message, setMessage] = useState({logo: '', cctv: ''});

    useEffect(() => {
        const cctvRef = doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink');
        const unsubscribe = onSnapshot(cctvRef, (docSnap) => {
            if (docSnap.exists()) {
                setCctvLink(docSnap.data().url);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 2 * 1024 * 1024) { // 2MB limit
            setMessage(prev => ({...prev, logo: 'Ukuran logo tidak boleh lebih dari 2MB.'}));
            setLogoFile(null);
        } else {
            setLogoFile(file);
            setMessage(prev => ({...prev, logo: ''}));
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) {
            setMessage(prev => ({...prev, logo: 'Pilih file logo terlebih dahulu.'}));
            return;
        }
        setIsLoading(prev => ({...prev, logo: true}));
        setMessage(prev => ({...prev, logo: 'Mengunggah logo...'}));

        try {
            const storageRef = ref(storage, `config/app_logo`);
            await uploadBytes(storageRef, logoFile);
            const downloadURL = await getDownloadURL(storageRef);

            const logoDocRef = doc(db, `artifacts/${appId}/public/data/config`, 'appLogo');
            await setDoc(logoDocRef, { url: downloadURL, updatedAt: new Date() });

            setMessage(prev => ({...prev, logo: 'Logo berhasil diperbarui!'}));
            setLogoFile(null);
        } catch (error) {
            console.error("Error uploading logo:", error);
            setMessage(prev => ({...prev, logo: 'Gagal mengunggah logo.'}));
        } finally {
            setIsLoading(prev => ({...prev, logo: false}));
        }
    };

    const handleCctvLinkUpdate = async () => {
        setIsLoading(prev => ({...prev, cctv: true}));
        setMessage(prev => ({...prev, cctv: 'Menyimpan tautan...'}));
        try {
            const cctvDocRef = doc(db, `artifacts/${appId}/public/data/config`, 'cctvLink');
            await setDoc(cctvDocRef, { url: cctvLink, updatedAt: new Date() });
            setMessage(prev => ({...prev, cctv: 'Tautan CCTV berhasil disimpan!'}));
        } catch (error) {
            console.error("Error updating CCTV link:", error);
            setMessage(prev => ({...prev, cctv: 'Gagal menyimpan tautan.'}));
        } finally {
            setIsLoading(prev => ({...prev, cctv: false}));
        }
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-md space-y-8">
            <h2 className="text-3xl font-bold text-gray-800">Pengaturan Aplikasi</h2>

            <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Ubah Logo Aplikasi</h3>
                <p className="text-gray-600 mb-4">Unggah logo baru untuk ditampilkan di seluruh aplikasi. Ukuran file maksimal 2MB (JPG, PNG).</p>
                <div className="flex items-center space-x-4">
                    <input type="file" onChange={handleFileChange} accept="image/png, image/jpeg" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>
                    <button onClick={handleLogoUpload} disabled={isLoading.logo || !logoFile} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-pink-300">
                        {isLoading.logo ? 'Mengunggah...' : 'Simpan Logo'}
                    </button>
                </div>
                {logoFile && <p className="mt-2 text-sm text-gray-600">File terpilih: {logoFile.name}</p>}
                {message.logo && <p className={`mt-4 text-sm ${message.logo.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>{message.logo}</p>}
            </div>

            <div className="p-6 border rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Ubah Tautan CCTV</h3>
                <p className="text-gray-600 mb-4">Masukkan tautan (link) ke sistem streaming CCTV lingkungan.</p>
                <div className="flex items-center space-x-4">
                    <input type="url" value={cctvLink} onChange={(e) => setCctvLink(e.target.value)} placeholder="https://..." className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />
                    <button onClick={handleCctvLinkUpdate} disabled={isLoading.cctv} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-pink-300">
                        {isLoading.cctv ? 'Menyimpan...' : 'Simpan Tautan'}
                    </button>
                </div>
                 {message.cctv && <p className={`mt-4 text-sm ${message.cctv.includes('Gagal') ? 'text-red-600' : 'text-green-600'}`}>{message.cctv}</p>}
            </div>

            <div className="p-6 border rounded-lg bg-yellow-50 border-yellow-200">
                <h3 className="text-xl font-semibold mb-2 text-yellow-800">Mode Demo</h3>
                <p className="text-yellow-700 mb-4">Aktifkan mode demo untuk melihat data dummy tanpa terhubung ke database langsung.</p>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsDemo(!isDemo)}
                        className={`px-6 py-2 font-semibold rounded-lg transition-colors ${isDemo ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                    >
                        {isDemo ? 'Nonaktifkan Mode Demo' : 'Aktifkan Mode Demo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pengaturan;
