import React, { useState, useEffect, useRef } from 'react';
import { Siren } from 'lucide-react';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously, signInWithCustomToken } from 'firebase/auth';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { db, auth, appId, isConfigValid } from './lib/firebase';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import { AdminLoginModal, ConfirmationModal } from './components/Modals';
import FallingSakura from './components/FallingSakura';

import Dashboard from './pages/Dashboard';
import RegistrasiWarga from './pages/RegistrasiWarga';
import LayananSurat from './pages/LayananSurat';
import LaporanKeuangan from './pages/LaporanKeuangan';
import InformasiWarga from './pages/InformasiWarga';
import Marketplace from './pages/Marketplace';
import SaluranKomunitas from './pages/SaluranKomunitas';
import KeamananLingkungan from './pages/KeamananLingkungan';
import Fasum from './pages/Fasum';
import DKM from './pages/DKM';
import Rohani from './pages/Rohani';
import Pengaturan from './pages/Pengaturan';

const AppContent = () => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userSubRole, setUserSubRole] = useState(null);
    const [isDemo, setIsDemo] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [showAdminLogin, setShowAdminLogin] = useState(false);
    const [isPanicMode, setIsPanicMode] = useState(false);
    const [panicInfo, setPanicInfo] = useState(null);
    const [showPanicConfirm, setShowPanicConfirm] = useState(false);
    const [logoUrl, setLogoUrl] = useState("https://storage.googleapis.com/gemini-prod-us-west1-assets/e1889b153a79ec7ef10c79b5c3453a29");
    const audioRef = useRef(null);
    const location = useLocation();

    // Handling missing config gracefully
    if (!isConfigValid) {
        return (
            <div className="flex flex-col justify-center items-center h-screen p-8 text-center bg-gray-50">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Konfigurasi Sistem Belum Lengkap</h1>
                    <p className="text-gray-700 mb-6">
                        Aplikasi tidak dapat terhubung ke server database. Mohon hubungi administrator untuk memeriksa konfigurasi environment (.env).
                    </p>
                    <div className="text-sm text-gray-500 border-t pt-4">
                        Code: MISSING_FIREBASE_CONFIG
                    </div>
                </div>
            </div>
        );
    }

    useEffect(() => {
        if (!auth) return;

        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAnonymous = currentUser.isAnonymous;
                setIsAdmin(!isAnonymous);

                if (!isAnonymous) {
                     // Try to fetch specific role from Firestore if exists
                     try {
                         const userDoc = await getDoc(doc(db, `users`, currentUser.uid));
                         if (userDoc.exists()) {
                             const userData = userDoc.data();
                             setUserRole(userData.role);
                             setUserSubRole(userData.subRole);
                         } else {
                             setUserRole('Administrator');
                             setUserSubRole(null);
                         }
                     } catch (e) {
                         console.error("Error fetching user role:", e);
                         setUserRole('Administrator');
                         setUserSubRole(null);
                     }
                } else {
                    setUserRole('Warga');
                }
            } else {
                try {
                    // Check for custom token in global scope if injected, otherwise anonymous
                    if (typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
                        await signInWithCustomToken(auth, window.__initial_auth_token);
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
        if (!isAuthReady || !db) return;

        try {
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
        } catch (e) {
            console.error("Error setting up listeners:", e);
        }
    }, [isAuthReady]);


    const confirmAndTriggerPanic = async () => {
        setShowPanicConfirm(false);

        if (isDemo) {
            setPanicInfo({ active: true, triggeredBy: 'DemoUser', location: 'Lokasi Demo', timestamp: { toDate: () => new Date() } });
            setIsPanicMode(true);
            audioRef.current?.play().catch(e => console.error("Audio play failed:", e));
            return;
        }

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
        if (isDemo) {
            setIsPanicMode(false);
            setPanicInfo(null);
            audioRef.current?.pause();
            if(audioRef.current) audioRef.current.currentTime = 0;
            return;
        }
        await setDoc(doc(db, `artifacts/${appId}/public/data/panic`, 'status'), { active: false });
    };

    const handleAdminClick = async () => {
        if (isAdmin) {
            await auth.signOut();
            setIsAdmin(false);
            // Re-login anonymously handled by onAuthStateChanged
        } else {
            setShowAdminLogin(true);
        }
    };

    if (!isAuthReady) {
        return <div className="flex justify-center items-center h-screen"><div className="text-lg font-semibold">Memuat Aplikasi...</div></div>;
    }

    return (
        <div className="bg-gray-100 font-sans min-h-screen flex flex-col md:flex-row relative">
            <FallingSakura active={true} />
            <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg" loop />
            <AdminLoginModal show={showAdminLogin} onClose={() => setShowAdminLogin(false)} />
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
            <Sidebar
                isAdmin={isAdmin}
                logoUrl={logoUrl}
                user={user}
                role={userRole}
                subRole={userSubRole}
                onLogout={handleAdminClick}
            />
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <Header userId={user?.uid} onAdminClick={handleAdminClick} isAdmin={isAdmin} />
                <Routes>
                    <Route path="/" element={<Dashboard isDemo={isDemo} />} />
                    <Route path="/dashboard" element={<Dashboard isDemo={isDemo} />} />
                    <Route path="/registrasi" element={<RegistrasiWarga userId={user?.uid} isDemo={isDemo} />} />
                    <Route path="/surat" element={<LayananSurat userId={user?.uid} isDemo={isDemo} />} />
                    <Route path="/keuangan" element={<LaporanKeuangan isAdmin={isAdmin} isDemo={isDemo} />} />
                    <Route path="/informasi" element={<InformasiWarga userId={user?.uid} isAdmin={isAdmin} isDemo={isDemo} />} />
                    <Route path="/marketplace" element={<Marketplace userId={user?.uid} isDemo={isDemo} />} />
                    <Route path="/saluran" element={<SaluranKomunitas isDemo={isDemo} />} />
                    <Route path="/keamanan" element={<KeamananLingkungan onTriggerPanic={() => setShowPanicConfirm(true)} userId={user?.uid} isAdmin={isAdmin} subRole={userSubRole} isDemo={isDemo} />} />
                    <Route path="/aduan" element={<KeamananLingkungan onTriggerPanic={() => setShowPanicConfirm(true)} userId={user?.uid} isAdmin={isAdmin} subRole={userSubRole} isDemo={isDemo} />} />
                    <Route path="/fasum" element={<Fasum subRole={userSubRole} isAdmin={isAdmin} isDemo={isDemo} />} />
                    <Route path="/dkm" element={<DKM subRole={userSubRole} isAdmin={isAdmin} isDemo={isDemo} />} />
                    <Route path="/rohani" element={<Rohani subRole={userSubRole} isAdmin={isAdmin} isDemo={isDemo} />} />
                    <Route path="/pengaturan" element={isAdmin ? <Pengaturan isDemo={isDemo} setIsDemo={setIsDemo} /> : <div className="text-center p-8"><h2 className="text-2xl font-bold text-red-500">Akses Ditolak</h2><p className="text-gray-600 mt-2">Anda tidak memiliki izin untuk mengakses halaman ini.</p></div>} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>
        </div>
    );
};

const App = () => {
    return (
        <Router>
            <AppContent />
        </Router>
    );
};

export default App;
