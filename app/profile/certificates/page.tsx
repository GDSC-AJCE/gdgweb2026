"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collectionGroup, query, where, getDocs, orderBy, doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft as ArrowLeftIcon,
    Award as DocumentTextIcon,
    ExternalLink as ArrowTopRightOnSquareIcon,
    Calendar as CalendarDaysIcon,
    CheckCircle2,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import LoadingSpinner from "@/components/LoadingSpinner";

interface Certificate {
    id: string;
    certificateId: string;
    eventTitle: string;
    templateName: string;
    backgroundUrl: string;
    issueDate: string;
    issuedAt: any;
    eventId?: string;
    templateId?: string;
}

export default function MyCertificatesPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    useEffect(() => {
        if (!user) {
            router.push("/");
            return;
        }

        const fetchCertificates = async () => {
            try {
                // Fetch user's certificates from issuedCertificates collectionGroup
                const q = query(
                    collectionGroup(db, "issuedCertificates"),
                    where("userId", "==", user.uid),
                    orderBy("issuedAt", "desc")
                );
                const snap = await getDocs(q);

                const basicCerts = snap.docs.map((d) => ({
                    id: d.id,
                    ...d.data()
                } as any));

                // Fetch template background URL for each certificate if needed
                const fullCerts = await Promise.all(basicCerts.map(async (cert: any) => {
                    if (cert.backgroundUrl) return cert as Certificate;

                    if (cert.eventId && cert.templateId) {
                        try {
                            const templateRef = doc(db, "events", cert.eventId, "certificates", cert.templateId);
                            const templateDoc = await getDoc(templateRef);

                            if (templateDoc.exists()) {
                                const templateData = templateDoc.data();
                                return {
                                    ...cert,
                                    backgroundUrl: templateData.backgroundUrl
                                } as Certificate;
                            }
                        } catch (e) {
                            console.error("Error fetching template for cert", cert.id, e);
                        }
                    }

                    return {
                        ...cert,
                        backgroundUrl: ""
                    } as Certificate;
                }));

                setCertificates(fullCerts);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCertificates();
    }, [user, router]);

    if (loading) return <LoadingSpinner text="Retrieving verified credentials..." />;

    return (
        <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32 select-none">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href="/profile"
                        className="inline-flex items-center text-xs font-mono text-[#80827f] hover:text-[#2c2e2a] mb-6 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-[#2ba0ff]/10 border border-[#2ba0ff]/20 text-[#2ba0ff]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#2c2e2a]">
                            My Credentials & Certificates
                        </h1>
                    </div>
                    <p className="text-[#80827f] text-sm max-w-2xl">
                        Official, verifiable certifications and participation credentials awarded to you by Google Developer Groups.
                    </p>
                </div>

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-[#ffffff] rounded-3xl border border-[#d5d5d4] shadow-xs"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-[#f5f1e4] flex items-center justify-center mx-auto mb-4 border border-[#d5d5d4]">
                            <DocumentTextIcon className="w-8 h-8 text-[#80827f]" />
                        </div>
                        <h3 className="text-xl font-medium text-[#2c2e2a] mb-2">No Certificates Issued Yet</h3>
                        <p className="text-[#80827f] max-w-md mx-auto text-sm mb-8">
                            You haven't been issued any certificates yet. Complete workshops, hackathons, and technical sessions to earn verifiable credentials!
                        </p>
                        <Link
                            href="/programs"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ff705d] hover:bg-[#ee6350] text-white font-medium text-sm rounded-[50px] transition-all shadow-xs cursor-pointer"
                        >
                            Explore Upcoming Events
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {certificates.map((cert, index) => (
                                <motion.div
                                    key={cert.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.08 }}
                                >
                                    <Link
                                        href={`/verify/${cert.certificateId}`}
                                        target="_blank"
                                        className="group relative bg-[#ffffff] border border-[#d5d5d4] rounded-3xl overflow-hidden hover:border-[#2c2e2a]/40 transition-all duration-300 block p-6 h-full flex flex-col shadow-xs hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-2xl bg-[#2ba0ff]/10 text-[#2ba0ff] border border-[#2ba0ff]/20 group-hover:scale-105 transition-all">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#8ed462]/15 border border-[#8ed462]/30 text-[#2c2e2a] text-[10px] font-mono font-semibold">
                                                <CheckCircle2 className="w-3 h-3 text-[#34A853]" />
                                                Verified
                                            </div>
                                        </div>

                                        <h4 className="font-semibold text-[#2c2e2a] text-lg mb-1 line-clamp-2 group-hover:text-[#ff705d] transition-colors">
                                            {cert.eventTitle}
                                        </h4>
                                        <p className="text-xs text-[#80827f] mb-6 flex-1">
                                            {cert.templateName}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-[#80827f] border-t border-[#f5f1e4] pt-4 mt-auto">
                                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                <CalendarDaysIcon className="w-3.5 h-3.5 text-[#80827f]" />
                                                {cert.issueDate}
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[11px] text-[#2ba0ff] group-hover:translate-x-0.5 transition-transform">
                                                <span>#{cert.certificateId}</span>
                                                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </main>
    );
}
