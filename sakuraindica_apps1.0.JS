import React, { useState, useEffect, useRef, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Home, FileText, Bell, Users, MessageSquare, Shield, LifeBuoy, HeartHandshake, Baby, Building2, Car, Siren, Phone, Video, Newspaper, UploadCloud, X, CheckCircle, UserPlus, PlusCircle, Trash2, FileImage, Landmark, Settings, Download, UserCog, Edit, Sparkles, BrainCircuit, Instagram, MessageCircle as WhatsappIcon } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Konfigurasi Firebase ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// --- Inisialisasi Firebase ---
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// --- ID Aplikasi Unik ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-rt-app';

// --- Komponen Modal ---
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="overflow-y-auto">{children}</div>
            </div>
        </div>
    );
};

const AdminLoginModal = ({ show, onClose, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = () => {
        if (username === 'Sakuraindica' && password === 'Adminsakura1') {
            onLogin(true);
            onClose();
            setUsername(''); setPassword(''); setError('');
        } else {
            setError('Username atau Password salah.');
        }
    };
    return (<Modal show={show} onClose={onClose} title="Login Administrator"><div className="p-4 space-y-4"><input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" />{error && <p className="text-red-500 text-sm text-center">{error}</p>}<button onClick={handleLogin} className="w-full px-6 py-3 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700">Login</button></div></Modal>);
};

const ConfirmationModal = ({ show, onClose, onConfirm, title, message }) => {
    if (!show) return null;
    return (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full"><h2 className="text-2xl font-bold text-red-600 mb-4">{title}</h2><p className="text-gray-700 mb-8">{message}</p><div className="flex justify-center space-x-4"><button onClick={onClose} className="px-8 py-3 font-semibold text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors">Batal</button><button onClick={onConfirm} className="px-8 py-3 font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors">Ya, Aktifkan!</button></div></div></div>);
};

const StatCard = ({ title, value, icon: Icon, color }) => (<div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-4"><div className={`flex-shrink-0 p-3 rounded-full ${color}`}><Icon size={24} className="text-white" /></div><div className="min-w-0 flex-1"><p className="text-sm text-gray-500">{title}</p><p className="text-xl lg:text-2xl font-bold text-gray-800 break-words">{value}</p></div></div>);

// --- Komponen Utama Aplikasi ---
const App = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isPanicMode, setIsPanicMode] = useState(false);
    const [panicInfo, setPanicInfo] = useState(null);
    const [showPanicConfirm, setShowPanicConfirm] = useState(false);
    const [logoUrl, setLogoUrl] = useState("https://storage.googleapis.com/gemini-prod-us-west1-assets/e1889b153a79ec7ef10c79b5c3453a29");
    const audioRef = useRef(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                try {
                    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                        await signInWithCustomToken(auth, __initial_auth_token);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) { console.error("Authentication error:", error); }
            }
            setIsAuthReady(true);
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!isAuthReady) return;

        const panicRef = doc(db, `artifacts/${appId}/public/data/panic`, 'status');
        const unsubscribePanic = onSnapshot(panicRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setIsPanicMode(data.active);
                setPanicInfo(data);
                if (data.active) {
                    audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
                } else {
                    audioRef.current?.pause();
                    if(audioRef.current) audioRef.current.currentTime = 0;
                }
            }
        }, (error) => console.error("Kesalahan listener panik:", error));

        const logoRef = doc(db, `artifacts/${appId}/public/data/config`, 'appLogo');
        const unsubscribeLogo = onSnapshot(logoRef, (docSnap) => {
            if (docSnap.exists()) {
                setLogoUrl(docSnap.data().url);
            }
        }, (error) => console.error("Kesalahan listener logo:", error));

        return () => { unsubscribePanic(); unsubscribeLogo(); };
    }, [isAuthReady]);

    const renderPage = () => {
        if (!isAuthReady) {
            return <div className="flex justify-center items-center h-full"><div className="text-lg font-semibold">Memuat Aplikasi...</div></div>;
        }
        switch (currentPage) {
            case 'dashboard': return <Dashboard />;
            case 'registrasi': return <RegistrasiWarga userId={user?.uid} />;
            case 'surat': return <LayananSurat userId={user?.uid} />;
            case 'keuangan': return <LaporanKeuangan isAdmin={isAdmin} />;
            case 'informasi': return <InformasiWarga userId={user?.uid} isAdmin={isAdmin} />;
            case 'pengaturan': return isAdmin ? <Pengaturan /> : <div className="text-center p-8"><h2 className="text-2xl font-bold text-red-500">Akses Ditolak</h2><p className="text-gray-600 mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div>;
            case 'forum': return <ForumKomunitas userId={user?.uid} />;
            case 'saluran': return <SaluranKomunitas />;
            case 'keamanan': return <KeamananLingkungan onTriggerPanic={() => setShowPanicConfirm(true)} />;
            default: return <Dashboard />;
        }
    };

    const confirmAndTriggerPanic = async () => {
        setShowPanicConfirm(false);
        if (!user) { console.error("Otentikasi gagal."); return; }
        const panicRef = doc(db, `artifacts/${appId}/public/data/panic`, 'status');
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                await setDoc(panicRef, { active: true, triggeredBy: user.uid, location: `https://www.google.com/maps?q=${latitude},${longitude}`, timestamp: new Date() });
            }, async () => {
                await setDoc(panicRef, { active: true, triggeredBy: user.uid, location: 'Lokasi tidak terdeteksi.', timestamp: new Date() });
            }, { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 });
        } else {
             await setDoc(panicRef, { active: true, triggeredBy: user.uid, location: 'Browser tidak mendukung geolokasi.', timestamp: new Date() });
        }
    };

    const stopPanic = async () => {
        await setDoc(doc(db, `artifacts/${appId}/public/data/panic`, 'status'), { active: false });
    };

    return (
        <div className="bg-gray-100 font-sans min-h-screen flex flex-col md:flex-row">
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop />
            <AdminLoginModal show={showAdminLogin} onClose={() => setShowAdminLogin(false)} onLogin={setIsAdmin} />
            <ConfirmationModal show={showPanicConfirm} onClose={() => setShowPanicConfirm(false)} onConfirm={confirmAndTriggerPanic} title="Konfirmasi Tindakan Darurat" message="Anda akan mengaktifkan sinyal S.O.S. Ini hanya untuk keadaan darurat nyata. Lanjutkan?" />
            {isPanicMode && (
                <div className="fixed inset-0 bg-red-600 bg-opacity-90 z-50 flex flex-col items-center justify-center text-white animate-pulse">
                    <Siren size={100} className="mb-4" />
                    <h1 className="text-5xl font-bold mb-2">!!! S.O.S !!!</h1>
                    <h2 className="text-2xl mb-4">SINYAL BAHAYA DIAKTIFKAN</h2>
                    <p className="mb-2">Info dari: {panicInfo?.triggeredBy.substring(0,8)}...</p>
                    <p className="mb-4">Waktu: {panicInfo?.timestamp?.toDate().toLocaleString('id-ID')}</p>
                    {panicInfo?.location && panicInfo.location.startsWith('http') && (
                        <a href={panicInfo.location} target="_blank" rel="noopener noreferrer" className="bg-white text-red-600 font-bold py-2 px-4 rounded-lg mb-6 hover:bg-gray-200">LIHAT LOKASI KEJADIAN</a>
                    )}
                    <button onClick={stopPanic} className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-600">Keadaan Aman (Nonaktifkan Sinyal)</button>
                </div>
            )}
            <Sidebar navigate={setCurrentPage} currentPage={currentPage} isAdmin={isAdmin} logoUrl={logoUrl} />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Header userId={user?.uid} onAdminClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)} isAdmin={isAdmin} />
                {renderPage()}
            </main>
        </div>
    );
};

// --- Komponen Header ---
const Header = ({ userId, onAdminClick, isAdmin }) => (
    <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Aplikasi Warga RT</h1>
        <div className="flex items-center space-x-4">
             <button onClick={onAdminClick} className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-lg ${isAdmin ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                <UserCog size={16} />
                <span>{isAdmin ? 'Keluar Mode Admin' : 'Mode Admin'}</span>
            </button>
            <div className="text-sm text-gray-500 hidden md:block">
                ID Pengguna: <span className="font-semibold text-gray-700">{userId ? userId.substring(0, 10) + '...' : 'Anonim'}</span>
            </div>
        </div>
    </div>
);

// --- Komponen Sidebar ---
const Sidebar = ({ navigate, currentPage, isAdmin, logoUrl }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, adminOnly: false },
        { id: 'registrasi', label: 'Registrasi Warga', icon: UserPlus, adminOnly: false },
        { id: 'surat', label: 'Layanan Surat', icon: FileText, adminOnly: false },
        { id: 'keuangan', label: 'Laporan Keuangan', icon: Landmark, adminOnly: false },
        { id: 'informasi', label: 'Informasi Warga', icon: Bell, adminOnly: false },
        { id: 'forum', label: 'Forum Komunitas', icon: MessageSquare, adminOnly: false },
        { id: 'saluran', label: 'Saluran Komunitas', icon: Users, adminOnly: false },
        { id: 'keamanan', label: 'Keamanan', icon: Shield, adminOnly: false },
        { id: 'pengaturan', label: 'Pengaturan', icon: Settings, adminOnly: true },
    ];

    const NavLink = ({ id, label, icon: Icon }) => (
        <button onClick={() => navigate(id)} className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 ${currentPage === id ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-600 hover:bg-pink-100 hover:text-pink-600'}`}>
            <Icon size={20} className="mr-4" />
            <span className="font-medium">{label}</span>
        </button>
    );

    return (
        <aside className="bg-white w-full md:w-64 p-6 shadow-xl md:min-h-screen flex-shrink-0">
            <div className="flex items-center mb-8">
                <img src={logoUrl} alt="Logo Aplikasi" className="w-12 h-12 mr-3 rounded-full object-cover"/>
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Sakura Indica</h2>
                    <p className="text-sm text-gray-500">Harvest City</p>
                </div>
            </div>
            <nav className="space-y-2">
                {menuItems.filter(item => !item.adminOnly || isAdmin).map(item => <NavLink key={item.id} {...item} />)}
            </nav>
        </aside>
    );
};

// --- Komponen Halaman: Pengaturan ---
const Pengaturan = () => {
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
        </div>
    );
};

// --- Komponen Halaman Lainnya (di-refactor) ---
const LaporanKeuangan = ({isAdmin}) => {
    // ... (kode LaporanKeuangan yang sudah ada)
    const [showFinanceModal, setShowFinanceModal] = useState(false);
    return (<div className="space-y-8">
        {isAdmin && <div className="flex justify-end">
            <button onClick={() => setShowFinanceModal(true)} className="flex items-center gap-2 px-4 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600"><Edit size={16}/> Kelola Keuangan</button>
        </div>}
        {/* ... sisa JSX LaporanKeuangan ... */}
    </div>);
};
const FileUpload = ({ label, onFileSelect, selectedFile, error }) => {
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) { onFileSelect(null, `${label}: Ukuran file tidak boleh lebih dari 5MB.`); } else { onFileSelect(file, ''); }
    };
    return (<div><label className="text-sm font-medium text-gray-600 block mb-1">{label}</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"><div className="space-y-1 text-center"><FileImage className="mx-auto h-12 w-12 text-gray-400" /><div className="flex text-sm text-gray-600"><label htmlFor={`file-upload-${label}`} className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none"><span>Pilih file gambar</span><input id={`file-upload-${label}`} name={`file-upload-${label}`} type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg" /></label></div><p className="text-xs text-gray-500">PNG, JPG hingga 5MB</p></div></div>{selectedFile && <p className="mt-2 text-sm text-green-600">File terpilih: {selectedFile.name}</p>}{error && <p className="mt-2 text-sm text-red-600">{error}</p>}</div>);
};
const RegistrasiWarga = ({ userId }) => {
    const [formData, setFormData] = useState({ namaLengkap: '', alamatKTP: '', alamatCluster: '', telepon: ['', '', ''], email: '', statusKawin: 'lajang', agama: '', pekerjaan: '', anggotaKeluarga: [], statusMenetap: 'menetap', statusRumah: 'pribadi', infoSewa: { durasi: '', namaPemilik: '', hpPemilik: '' }, kendaraan: [], hobi: '', kontakDarurat: { nama: '', hubungan: '', telepon: '' } });
    const [ktpFile, setKtpFile] = useState(null);
    const [kkFile, setKkFile] = useState(null);
    const [fileErrors, setFileErrors] = useState({ ktp: '', kk: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleNestedChange = (group, name, value) => { setFormData(prev => ({ ...prev, [group]: { ...prev[group], [name]: value } })); };
    const handleDynamicListChange = (listName, index, name, value) => { const list = [...formData[listName]]; if (name === null) { list[index] = value; } else { list[index][name] = value; } setFormData(prev => ({ ...prev, [listName]: list })); };
    const handleAddToList = (listName, newItem) => { setFormData(prev => ({ ...prev, [listName]: [...prev[listName], newItem] })); };
    const handleRemoveFromList = (listName, index) => { const list = [...formData[listName]]; list.splice(index, 1); setFormData(prev => ({ ...prev, [listName]: list })); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.namaLengkap || !formData.alamatCluster || !formData.email) { setError('Mohon isi kolom yang wajib diisi (Nama, Alamat Cluster, Email).'); return; }
        if (!ktpFile || !kkFile) { setError('Mohon lampirkan foto KTP dan Kartu Keluarga.'); return; }
        setIsLoading(true); setError('');
        try {
            const ktpStorageRef = ref(storage, `registrations/${userId}/ktp_${Date.now()}_${ktpFile.name}`);
            await uploadBytes(ktpStorageRef, ktpFile);
            const ktpUrl = await getDownloadURL(ktpStorageRef);
            const kkStorageRef = ref(storage, `registrations/${userId}/kk_${Date.now()}_${kkFile.name}`);
            await uploadBytes(kkStorageRef, kkFile);
            const kkUrl = await getDownloadURL(kkStorageRef);
            await addDoc(collection(db, `artifacts/${appId}/public/data/registrations`), { ...formData, ktpUrl, kkUrl, registeredBy: userId, createdAt: new Date() });
            setIsSuccess(true);
        } catch (err) { console.error("Error submitting registration:", err); setError('Gagal mengirim data registrasi. Silakan coba lagi.'); } finally { setIsLoading(false); }
    };
    if (isSuccess) { return (<div className="bg-white p-8 rounded-xl shadow-md text-center"><CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Registrasi Berhasil!</h2><p className="text-gray-600 mb-6">Data Anda telah diterima. Terima kasih telah melapor diri sebagai warga baru.</p><button onClick={() => window.location.reload()} className="px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600">Kembali ke Dashboard</button></div>); }
    const FormSection = ({ title, children }) => (<div className="bg-gray-50 p-6 rounded-lg border border-gray-200"><h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">{title}</h3><div className="space-y-4">{children}</div></div>);
    const InputField = ({ label, name, value, onChange, placeholder, type = 'text' }) => (<div><label className="text-sm font-medium text-gray-600 block mb-1">{label}</label><input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-400" /></div>);
    return (<div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-3xl font-bold text-gray-800 mb-6">Formulir Registrasi Warga Baru</h2><form onSubmit={handleSubmit} className="space-y-8"><FormSection title="Data Diri & Dokumen"><InputField label="Nama Lengkap (sesuai KTP)" name="namaLengkap" value={formData.namaLengkap} onChange={handleInputChange} placeholder="Nama Lengkap" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><FileUpload label="Foto KTP" onFileSelect={(file, err) => { setKtpFile(file); setFileErrors(p => ({...p, ktp: err})); }} selectedFile={ktpFile} error={fileErrors.ktp} /><FileUpload label="Foto Kartu Keluarga" onFileSelect={(file, err) => { setKkFile(file); setFileErrors(p => ({...p, kk: err})); }} selectedFile={kkFile} error={fileErrors.kk} /></div><InputField label="Alamat (sesuai KTP)" name="alamatKTP" value={formData.alamatKTP} onChange={handleInputChange} placeholder="Alamat KTP" /><InputField label="Alamat Cluster Sakura Indica" name="alamatCluster" value={formData.alamatCluster} onChange={handleInputChange} placeholder="Blok dan Nomor Rumah" /><div><label className="text-sm font-medium text-gray-600 block mb-1">Nomor Handphone</label><div className="grid grid-cols-1 md:grid-cols-3 gap-2">{formData.telepon.map((phone, index) => (<input key={index} type="tel" value={phone} onChange={(e) => handleDynamicListChange('telepon', index, null, e.target.value)} placeholder={`Nomor HP ${index + 1}${index > 0 ? ' (Opsional)' : ''}`} className="w-full p-2 border border-gray-300 rounded-md" />))}</div></div><InputField label="Alamat Email" name="email" value={formData.email} onChange={handleInputChange} placeholder="contoh@email.com" type="email" /><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-sm font-medium text-gray-600 block mb-1">Status Perkawinan</label><select name="statusKawin" value={formData.statusKawin} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"><option value="lajang">Lajang</option><option value="menikah">Menikah</option></select></div><InputField label="Agama" name="agama" value={formData.agama} onChange={handleInputChange} placeholder="Contoh: Islam" /></div><InputField label="Jenis Pekerjaan" name="pekerjaan" value={formData.pekerjaan} onChange={handleInputChange} placeholder="Contoh: Karyawan Swasta" /><InputField label="Hobi" name="hobi" value={formData.hobi} onChange={handleInputChange} placeholder="Contoh: Membaca, Olahraga" /></FormSection><FormSection title="Data Anggota Keluarga">{formData.anggotaKeluarga.map((member, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md items-center"><input value={member.nama} onChange={(e) => handleDynamicListChange('anggotaKeluarga', index, 'nama', e.target.value)} placeholder="Nama Anggota Keluarga" className="w-full p-2 border border-gray-200 rounded-md" /><div className="flex items-center gap-2"><input value={member.nik} onChange={(e) => handleDynamicListChange('anggotaKeluarga', index, 'nik', e.target.value)} placeholder="NIK" className="w-full p-2 border border-gray-200 rounded-md" /><button type="button" onClick={() => handleRemoveFromList('anggotaKeluarga', index)} className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"><Trash2 size={20} /></button></div></div>))}<button type="button" onClick={() => handleAddToList('anggotaKeluarga', { nama: '', nik: '' })} className="flex items-center gap-2 text-sm text-pink-600 font-semibold"><PlusCircle size={16} /> Tambah Anggota Keluarga</button></FormSection><FormSection title="Status Tinggal & Kendaraan"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label className="text-sm font-medium text-gray-600 block mb-1">Status Tinggal</label><select name="statusMenetap" value={formData.statusMenetap} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"><option value="menetap">Menetap</option><option value="sementara">Sementara/Kontrak</option></select></div><div><label className="text-sm font-medium text-gray-600 block mb-1">Status Rumah</label><select name="statusRumah" value={formData.statusRumah} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md"><option value="pribadi">Milik Pribadi</option><option value="sewa">Sewa</option></select></div></div>{formData.statusRumah === 'sewa' && (<div className="p-4 border-l-4 border-pink-400 bg-pink-50 rounded-r-lg space-y-2"><h4 className="font-semibold">Informasi Pemilik Sewa</h4><InputField label="Durasi Sewa" name="durasi" value={formData.infoSewa.durasi} onChange={(e) => handleNestedChange('infoSewa', 'durasi', e.target.value)} placeholder="Contoh: 1 Tahun" /><InputField label="Nama Pemilik Unit" name="namaPemilik" value={formData.infoSewa.namaPemilik} onChange={(e) => handleNestedChange('infoSewa', 'namaPemilik', e.target.value)} placeholder="Nama sesuai KTP" /><InputField label="Nomor HP Pemilik" name="hpPemilik" value={formData.infoSewa.hpPemilik} onChange={(e) => handleNestedChange('infoSewa', 'hpPemilik', e.target.value)} placeholder="0812..." /></div>)}</FormSection><FormSection title="Data Kendaraan">{formData.kendaraan.map((v, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2 border rounded-md items-center"><select value={v.jenis} onChange={(e) => handleDynamicListChange('kendaraan', index, 'jenis', e.target.value)} className="w-full p-2 border border-gray-200 rounded-md"><option value="">Pilih Jenis</option><option value="Mobil">Mobil</option><option value="Motor">Motor</option><option value="Sepeda">Sepeda</option></select><div className="flex items-center gap-2"><input value={v.plat} onChange={(e) => handleDynamicListChange('kendaraan', index, 'plat', e.target.value)} placeholder="No. Plat / Keterangan" className="w-full p-2 border border-gray-200 rounded-md" /><button type="button" onClick={() => handleRemoveFromList('kendaraan', index)} className="p-2 text-red-500 hover:text-red-700 flex-shrink-0"><Trash2 size={20} /></button></div></div>))}<button type="button" onClick={() => handleAddToList('kendaraan', { jenis: '', plat: '' })} className="flex items-center gap-2 text-sm text-pink-600 font-semibold"><PlusCircle size={16} /> Tambah Kendaraan</button></FormSection><FormSection title="Kontak Darurat"><InputField label="Nama Kontak Darurat" name="nama" value={formData.kontakDarurat.nama} onChange={(e) => handleNestedChange('kontakDarurat', 'nama', e.target.value)} placeholder="Nama" /><InputField label="Hubungan" name="hubungan" value={formData.kontakDarurat.hubungan} onChange={(e) => handleNestedChange('kontakDarurat', 'hubungan', e.target.value)} placeholder="Contoh: Orang Tua, Saudara" /><InputField label="Nomor Telepon Darurat" name="telepon" value={formData.kontakDarurat.telepon} onChange={(e) => handleNestedChange('kontakDarurat', 'telepon', e.target.value)} placeholder="0812..." /></FormSection>{error && <p className="text-red-500 text-sm text-center font-semibold">{error}</p>}<div className="pt-5"><button type="submit" disabled={isLoading} className="w-full px-6 py-4 font-semibold text-white bg-pink-600 rounded-lg hover:bg-pink-700 disabled:bg-pink-300 flex items-center justify-center text-lg">{isLoading ? 'Mengirim Data...' : 'Kirim Registrasi'}</button></div></form></div>);
};
const LayananModal = ({ service, onClose, userId }) => {
    if (!service) return null; // FIX: Add guard to prevent crash
    const [file, setFile] = useState(null); const [notes, setNotes] = useState(''); const [isLoading, setIsLoading] = useState(false); const [isSuccess, setIsSuccess] = useState(false); const [error, setError] = useState('');
    const handleFileChange = (e) => { const selectedFile = e.target.files[0]; if (selectedFile && selectedFile.size > 5 * 1024 * 1024) { setError('Ukuran file tidak boleh lebih dari 5MB.'); setFile(null); } else { setFile(selectedFile); setError(''); } };
    const handleSubmit = async (e) => {
        e.preventDefault(); if (!file) { setError('Mohon lampirkan dokumen pendukung.'); return; }
        setIsLoading(true); setError('');
        try {
            const storageRef = ref(storage, `attachments/${userId}/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            await addDoc(collection(db, `artifacts/${appId}/public/data/service_requests`), { userId: userId, serviceName: service.name, notes: notes, attachmentURL: downloadURL, fileName: file.name, status: 'pending', requestedAt: new Date() });
            setIsSuccess(true);
        } catch (err) { console.error("Error submitting request:", err); setError('Gagal mengirim permohonan. Silakan coba lagi.'); } finally { setIsLoading(false); }
    };
    if (isSuccess) { return (<div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"><div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-md w-full"><CheckCircle className="text-green-500 w-16 h-16 mx-auto mb-4" /><h2 className="text-2xl font-bold text-gray-800 mb-2">Permohonan Terkirim!</h2><p className="text-gray-600 mb-6">Pengurus RT akan segera memproses permohonan Anda. Terima kasih.</p><button onClick={onClose} className="w-full px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600">Tutup</button></div></div>); }
    return (<div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" onClick={onClose}><div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative" onClick={e => e.stopPropagation()}><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={24} /></button><div className="p-8"><h2 className="text-2xl font-bold text-gray-800 mb-2">{service.name}</h2><p className="text-gray-600 mb-6">Lengkapi data di bawah ini untuk mengajukan permohonan.</p><form onSubmit={handleSubmit} className="space-y-6"><div><label className="font-semibold text-gray-700 block mb-2">Dokumen Pendukung</label><div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800"><strong>Syarat:</strong> {service.docs}</div></div><div><label className="font-semibold text-gray-700 block mb-2">Lampirkan Dokumen</label><div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"><div className="space-y-1 text-center"><UploadCloud className="mx-auto h-12 w-12 text-gray-400" /><div className="flex text-sm text-gray-600"><label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none"><span>Pilih file untuk diunggah</span><input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/png, image/jpeg, application/pdf" /></label></div><p className="text-xs text-gray-500">PNG, JPG, PDF hingga 5MB</p></div></div>{file && <p className="mt-2 text-sm text-gray-600">File terpilih: {file.name}</p>}</div><div><label htmlFor="notes" className="font-semibold text-gray-700 block mb-2">Catatan (Opsional)</label><textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400" placeholder="Contoh: Mohon diproses secepatnya untuk keperluan..."></textarea></div>{error && <p className="text-red-500 text-sm text-center">{error}</p>}<div><button type="submit" disabled={isLoading} className="w-full px-6 py-3 font-semibold text-white bg-pink-500 rounded-lg hover:bg-pink-600 disabled:bg-pink-300 flex items-center justify-center">{isLoading ? 'Mengirim...' : 'Kirim Permohonan'}</button></div></form></div></div></div>);
};
const LayananSurat = ({ userId }) => {
    const [selectedService, setSelectedService] = useState(null);
    const suratList = [{ name: 'Surat Pengantar (Umum)', icon: FileText, docs: 'KTP, Kartu Keluarga, dan dokumen pendukung.' },{ name: 'Surat Keterangan Domisili', icon: Building2, docs: 'KTP, Kartu Keluarga, bukti kepemilikan/sewa rumah, SKP (Surat Keterangan Pindah) dari domisili sebelumnya, dan dokumen pendukung.' },{ name: 'Surat Izin Numpang Nikah', icon: HeartHandshake, docs: 'KTP & KK kedua calon, Surat Pengantar dari RT/RW asal, dokumen terkait lainnya dari KUA, dan dokumen pendukung.' },{ name: 'Lapor Keluhan/Pengaduan', icon: LifeBuoy, docs: 'Foto atau video bukti keluhan/pengaduan (jika ada) dan dokumen pendukung.' }];
    const handleServiceClick = (service) => { if (!userId) { alert("Gagal mendapatkan ID pengguna. Mohon muat ulang halaman."); return; } setSelectedService(service); };
    return (<>{selectedService && <LayananModal service={selectedService} onClose={() => setSelectedService(null)} userId={userId} />}<div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-gray-800 mb-2">Layanan Administrasi Warga</h2><p className="text-gray-600 mb-6">Pilih jenis layanan yang Anda butuhkan. Anda dapat langsung melampirkan dokumen pendukung melalui aplikasi.</p><div className="grid grid-cols-1 md:grid-cols-2 gap-6">{suratList.map((surat, index) => (<button key={index} onClick={() => handleServiceClick(surat)} className="bg-gray-50 p-6 rounded-lg flex items-center text-left hover:bg-pink-100 hover:shadow-lg transition-all duration-200"><surat.icon size={32} className="text-pink-500 mr-5 flex-shrink-0" /><div><h3 className="font-semibold text-lg text-gray-700">{surat.name}</h3><p className="text-sm text-pink-600">Klik untuk mengajukan permohonan</p></div></button>))}</div><div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg"><h4 className="font-bold">Alur Proses Baru:</h4><ol className="list-decimal list-inside mt-2 text-sm"><li>Pilih jenis layanan yang dibutuhkan.</li><li>Isi formulir dan lampirkan dokumen pendukung langsung di aplikasi.</li><li>Klik "Kirim Permohonan". Data Anda akan tercatat secara otomatis.</li><li>Pengurus RT akan menerima notifikasi dan memproses permohonan Anda.</li></ol></div></div></>);
};
const Dashboard = () => {
    const demografiData = [{ name: 'Balita (0-5)', value: 80, color: '#0088FE' },{ name: 'Muda (6-25)', value: 300, color: '#00C49F' },{ name: 'Produktif (26-55)', value: 500, color: '#FFBB28' },{ name: 'Manula (>55)', value: 150, color: '#FF8042' }];
    const statusData = [{ name: 'Menetap', value: 850 },{ name: 'Menyewa', value: 180 }];
    const kendaraanData = [{ name: 'Mobil', value: 450 },{ name: 'Motor', value: 700 }];
    const eventData = [{ name: 'Jan', kematian: 1, perkawinan: 3 },{ name: 'Feb', kematian: 0, perkawinan: 5 },{ name: 'Mar', kematian: 2, perkawinan: 2 },{ name: 'Apr', kematian: 1, perkawinan: 4 },{ name: 'Mei', kematian: 0, perkawinan: 6 },{ name: 'Jun', kematian: 1, perkawinan: 1 }];
    return (<div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"><StatCard title="Total Warga" value="1030" icon={Users} color="bg-blue-500" /><StatCard title="Jumlah Keluarga" value="350" icon={Home} color="bg-green-500" /><StatCard title="Total Kendaraan" value="1150" icon={Car} color="bg-yellow-500" /><StatCard title="Pengaduan Bulan Ini" value="12" icon={LifeBuoy} color="bg-red-500" /></div><div className="grid grid-cols-1 lg:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Demografi Usia Warga</h3><ResponsiveContainer width="100%" height={300}><PieChart><Pie data={demografiData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>{demografiData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer></div><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Peristiwa Bulanan</h3><ResponsiveContainer width="100%" height={300}><BarChart data={eventData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend /><Bar dataKey="perkawinan" fill="#8884d8" name="Perkawinan" /><Bar dataKey="kematian" fill="#82ca9d" name="Kematian" /></BarChart></ResponsiveContainer></div><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Status Tinggal</h3><ResponsiveContainer width="100%" height={300}><BarChart data={statusData} layout="vertical"><CartesianGrid strokeDasharray="3 3" /><XAxis type="number" /><YAxis type="category" dataKey="name" width={80}/><Tooltip /><Bar dataKey="value" fill="#ffc658" name="Jumlah" /></BarChart></ResponsiveContainer></div><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-lg font-semibold text-gray-700 mb-4">Jumlah Kendaraan</h3><ResponsiveContainer width="100%" height={300}><BarChart data={kendaraanData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="value" fill="#38bdf8" name="Jumlah" /></BarChart></ResponsiveContainer></div></div></div>);
};
const InformasiWarga = ({ userId, isAdmin }) => {
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [attachmentFile, setAttachmentFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!userId) return;
        const infoCollectionRef = collection(db, `artifacts/${appId}/public/data/informasi`);
        const q = query(infoCollectionRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const infoData = [];
            querySnapshot.forEach((doc) => { infoData.push({ id: doc.id, ...doc.data() }); });
            infoData.sort((a, b) => (b.timestamp?.toDate() || 0) - (a.timestamp?.toDate() || 0));
            setPosts(infoData);
        }, (error) => console.error("Kesalahan listener informasi:", error));
        return () => unsubscribe();
    }, [userId]);

    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (newPost.trim() === '' || !userId) return;
        setIsLoading(true);

        let attachmentURL = '';
        let attachmentType = '';

        if (attachmentFile) {
            const storageRef = ref(storage, `informasi/${Date.now()}_${attachmentFile.name}`);
            await uploadBytes(storageRef, attachmentFile);
            attachmentURL = await getDownloadURL(storageRef);
            attachmentType = attachmentFile.type;
        }

        await addDoc(collection(db, `artifacts/${appId}/public/data/informasi`), { 
            content: newPost, 
            author: `Pengurus RT`, 
            timestamp: new Date(),
            attachmentURL,
            attachmentType
        });
        
        setNewPost('');
        setAttachmentFile(null);
        setIsLoading(false);
    };
    return (<div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi & Himbauan Pengurus</h2>{isAdmin && (<form onSubmit={handlePostSubmit} className="mb-8 p-4 border rounded-lg bg-gray-50"><textarea value={newPost} onChange={(e) => setNewPost(e.target.value)} placeholder="Tulis pengumuman baru..." className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent" rows="3"></textarea><div className="mt-4"><label className="block text-sm font-medium text-gray-700 mb-2">Lampirkan File (Opsional)</label><input type="file" onChange={(e) => setAttachmentFile(e.target.files[0])} accept="image/png, image/jpeg, application/pdf" className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"/>{attachmentFile && <p className="text-xs text-gray-500 mt-1">File: {attachmentFile.name}</p>}</div><button type="submit" disabled={isLoading} className="mt-4 px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600 disabled:bg-pink-300">{isLoading ? "Mengirim..." : "Kirim Informasi"}</button></form>)}<div className="space-y-6">{posts.length > 0 ? posts.map(post => (<div key={post.id} className="p-5 border border-gray-200 rounded-lg bg-gray-50"><p className="text-gray-800 whitespace-pre-wrap">{post.content}</p>{post.attachmentURL && (<div className="mt-4">{post.attachmentType.startsWith('image/') ? (<img src={post.attachmentURL} alt="Lampiran" className="rounded-lg max-w-full h-auto md:max-w-md" />) : (<a href={post.attachmentURL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200"><Download size={16} /> Unduh Dokumen (PDF)</a>)}</div>)}<div className="text-right text-xs text-gray-500 mt-3"><span>{post.author}</span> - <span>{post.timestamp ? new Date(post.timestamp.toDate()).toLocaleString('id-ID') : 'Baru saja'}</span></div></div>)) : (<p className="text-center text-gray-500">Belum ada informasi terbaru.</p>)}</div></div>);
};
const ForumKomunitas = ({ userId }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    useEffect(() => {
        if (!userId) return;
        const forumCollectionRef = collection(db, `artifacts/${appId}/public/data/forum`);
        const q = query(forumCollectionRef);
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = [];
            querySnapshot.forEach((doc) => { msgs.push({ id: doc.id, ...doc.data() }); });
            msgs.sort((a, b) => (a.timestamp?.toDate() || 0) - (b.timestamp?.toDate() || 0));
            setMessages(msgs);
        }, (error) => console.error("Kesalahan listener forum:", error));
        return () => unsubscribe();
    }, [userId]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (newMessage.trim() === '' || !userId) return;
        await addDoc(collection(db, `artifacts/${appId}/public/data/forum`), { text: newMessage, authorId: userId, timestamp: new Date() });
        setNewMessage('');
    };
    return (<div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-md"><div className="p-4 border-b"><h2 className="text-xl font-bold text-gray-800">Forum Warga</h2></div><div className="flex-1 p-4 overflow-y-auto"><div className="space-y-4">{messages.map(msg => (<div key={msg.id} className={`flex ${msg.authorId === userId ? 'justify-end' : 'justify-start'}`}><div className={`max-w-xs lg:max-w-md p-3 rounded-lg ${msg.authorId === userId ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-800'}`}><p className="text-sm font-bold mb-1">{msg.authorId === userId ? 'Anda' : `Warga ${msg.authorId.substring(0, 6)}...`}</p><p className="whitespace-pre-wrap">{msg.text}</p><p className={`text-xs mt-1 ${msg.authorId === userId ? 'text-pink-100' : 'text-gray-500'} text-right`}>{msg.timestamp ? new Date(msg.timestamp.toDate()).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''}</p></div></div>))}<div ref={messagesEndRef} /></div></div><div className="p-4 border-t"><form onSubmit={handleSendMessage} className="flex space-x-2"><input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Ketik pesan Anda..." className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-transparent" /><button type="submit" className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg hover:bg-pink-600">Kirim</button></form></div></div>);
};
const SaluranKomunitas = () => {
    const channels = [{ name: 'Karang Taruna', icon: Users, description: 'Kegiatan dan informasi untuk pemuda-pemudi.', color: 'blue' },{ name: 'Dewan Kesejahteraan Masjid (DKM)', icon: Building2, description: 'Informasi seputar kegiatan keagamaan.', color: 'green' },{ name: 'Posyandu', icon: Baby, description: 'Jadwal dan layanan kesehatan ibu dan anak.', color: 'red' },{ name: 'PKK', icon: HeartHandshake, description: 'Program pemberdayaan dan kesejahteraan keluarga.', color: 'purple' }];
    const ChannelCard = ({ name, icon: Icon, description, color }) => (<div className={`p-6 rounded-xl shadow-md border-t-4 border-${color}-500 bg-white`}><div className="flex items-center mb-3"><Icon size={28} className={`text-${color}-500 mr-4`} /><h3 className="text-xl font-bold text-gray-800">{name}</h3></div><p className="text-gray-600 mb-4">{description}</p><button className={`w-full py-2 text-sm font-semibold text-white bg-${color}-500 rounded-lg hover:bg-${color}-600`}>Lihat Selengkapnya</button></div>);
    return (<div className="bg-white p-8 rounded-xl shadow-md"><h2 className="text-2xl font-bold text-gray-800 mb-6">Saluran Komunitas</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-8">{channels.map(channel => <ChannelCard key={channel.name} {...channel} />)}</div></div>);
};
const KeamananLingkungan = ({ onTriggerPanic }) => {
    return (<div className="space-y-8"><div className="bg-white p-8 rounded-xl shadow-md text-center"><h2 className="text-2xl font-bold text-gray-800 mb-4">Tombol Panik (S.O.S)</h2><p className="text-gray-600 mb-6 max-w-2xl mx-auto">Gunakan tombol ini HANYA dalam keadaan darurat (misal: perampokan, kebakaran, medis darurat). Menekan tombol akan mengaktifkan alarm dan mengirim notifikasi ke seluruh warga.</p><button onClick={onTriggerPanic} className="bg-red-600 text-white rounded-full w-48 h-48 flex flex-col items-center justify-center mx-auto shadow-2xl hover:bg-red-700 transition-transform transform hover:scale-105 active:scale-100 animate-pulse-slow"><Siren size={64} /><span className="text-2xl font-bold mt-2">TEKAN DI SINI</span></button></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Video className="mr-3 text-blue-500"/> Pantau CCTV</h3><p className="text-gray-600 mb-4">Akses siaran langsung dari CCTV yang terpasang di lingkungan kita.</p><a href="YOUR_CCTV_LINK" target="_blank" rel="noopener noreferrer" className="w-full block text-center py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600">Buka Tautan CCTV</a></div><div className="bg-white p-6 rounded-xl shadow-md"><h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center"><Phone className="mr-3 text-green-500"/> Kontak Darurat</h3><ul className="space-y-2 text-gray-700"><li><strong>Keamanan Cluster:</strong> 021-123-4567</li><li><strong>Polsek Setempat:</strong> 021-789-1011</li><li><strong>Ambulans:</strong> 118</li><li><strong>Pemadam Kebakaran:</strong> 113</li></ul></div></div></div>);
};

export default App;
