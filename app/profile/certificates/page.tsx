"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { collectionGroup, collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
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
    templateName?: string;
    backgroundUrl?: string;
    issueDate?: string;
    issuedAt?: any;
    eventId?: string;
    templateId?: string;
}

export default function MyCertificatesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [fetching, setFetching] = useState(true);
    const [certificates, setCertificates] = useState<Certificate[]>([]);

    useEffect(() => {
        // Wait until Firebase Auth has initialized
        if (authLoading) return;

        // If auth resolved and there's no user, redirect to home
        if (!user) {
            router.push("/");
            return;
        }

        const fetchCertificates = async () => {
            try {
                setFetching(true);
                const certsMap = new Map<string, any>();
                const userEmail = user.email?.toLowerCase().trim();

                // 1. Fetch user's certificates from issuedCertificates collectionGroup by userId
                try {
                    const qUser = query(
                        collectionGroup(db, "issuedCertificates"),
                        where("userId", "==", user.uid)
                    );
                    const snapUser = await getDocs(qUser);
                    snapUser.docs.forEach((d) => {
                        const data = d.data();
                        certsMap.set(data.certificateId || d.id, { id: d.id, ...data });
                    });
                } catch (err) {
                    console.log("Query by userId:", err);
                }

                // 2. Also fetch by recipientEmail (handles case-insensitive match & unlinked UID)
                if (userEmail) {
                    // Try lowercase
                    try {
                        const qEmail = query(
                            collectionGroup(db, "issuedCertificates"),
                            where("recipientEmail", "==", userEmail)
                        );
                        const snapEmail = await getDocs(qEmail);
                        snapEmail.docs.forEach((d) => {
                            const data = d.data();
                            certsMap.set(data.certificateId || d.id, { id: d.id, ...data });
                        });
                    } catch (err) {
                        console.log("Query by lowercase email:", err);
                    }

                    // Also try exact user.email if casing was preserved
                    if (user.email && user.email !== userEmail) {
                        try {
                            const qExact = query(
                                collectionGroup(db, "issuedCertificates"),
                                where("recipientEmail", "==", user.email)
                            );
                            const snapExact = await getDocs(qExact);
                            snapExact.docs.forEach((d) => {
                                const data = d.data();
                                certsMap.set(data.certificateId || d.id, { id: d.id, ...data });
                            });
                        } catch (err) {
                            console.log("Query by exact email:", err);
                        }
                    }
                }

                // 3. Also fetch from root certificates collection by recipientEmail
                if (userEmail) {
                    try {
                        const qRoot = query(
                            collection(db, "certificates"),
                            where("recipientEmail", "==", userEmail)
                        );
                        const snapRoot = await getDocs(qRoot);
                        snapRoot.docs.forEach((d) => {
                            const data = d.data();
                            certsMap.set(data.certificateId || d.id, { id: d.id, ...data });
                        });
                    } catch (err) {
                        console.log("Query root certificates by email:", err);
                    }
                }

                // 4. Also fetch from user document's direct subcollection
                try {
                    const snapDirect = await getDocs(collection(db, "users", user.uid, "certificates"));
                    snapDirect.docs.forEach((d) => {
                        const data = d.data();
                        certsMap.set(data.certificateId || d.id, { id: d.id, ...data });
                    });
                } catch (err) {
                    console.log("Query direct user certs:", err);
                }

                const basicCerts = Array.from(certsMap.values()).sort((a, b) => {
                    const aTime = a.issuedAt?.seconds || (a.issuedAt?.toDate ? a.issuedAt.toDate().getTime() : 0);
                    const bTime = b.issuedAt?.seconds || (b.issuedAt?.toDate ? b.issuedAt.toDate().getTime() : 0);
                    return bTime - aTime;
                });

                // Fetch template background URL for each certificate if needed
                const fullCerts = await Promise.all(basicCerts.map(async (cert: any) => {
                    let formattedDate = cert.issueDate;
                    if (!formattedDate && cert.issuedAt) {
                        try {
                            formattedDate = cert.issuedAt.toDate
                                ? cert.issuedAt.toDate().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
                                : new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
                        } catch {
                            formattedDate = "Verified";
                        }
                    }

                    if (cert.backgroundUrl) {
                        return {
                            ...cert,
                            issueDate: formattedDate,
                            templateName: cert.templateName || "Official Participation Credential",
                        } as Certificate;
                    }

                    if (cert.eventId && cert.templateId) {
                        try {
                            const templateRef = doc(db, "events", cert.eventId, "certificates", cert.templateId);
                            const templateDoc = await getDoc(templateRef);

                            if (templateDoc.exists()) {
                                const templateData = templateDoc.data();
                                return {
                                    ...cert,
                                    issueDate: formattedDate,
                                    templateName: cert.templateName || "Official Participation Credential",
                                    backgroundUrl: templateData.backgroundUrl || ""
                                } as Certificate;
                            }
                        } catch (e) {
                            console.error("Error fetching template for cert", cert.id, e);
                        }
                    }

                    return {
                        ...cert,
                        issueDate: formattedDate,
                        templateName: cert.templateName || "Official Participation Credential",
                        backgroundUrl: ""
                    } as Certificate;
                }));

                setCertificates(fullCerts);
            } catch (error) {
                console.error("Error fetching certificates:", error);
            } finally {
                setFetching(false);
            }
        };

        fetchCertificates();
    }, [user, authLoading, router]);

    if (authLoading || fetching) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <LoadingSpinner text="Retrieving verified credentials..." />
            </main>
        );
    }

    return (
        <main className="min-h-screen text-[#0f172a] relative overflow-hidden pb-32 select-none">
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-20">
                {/* Header */}
                <div className="mb-10">
                    <Link
                        href="/profile"
                        className="inline-flex items-center text-xs font-mono text-slate-500 hover:text-slate-900 mb-6 transition-colors group"
                    >
                        <ArrowLeftIcon className="w-3.5 h-3.5 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Link>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-blue-50 border border-blue-200 text-[#2563EB]">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#0f172a]">
                            My Credentials & Certificates
                        </h1>
                    </div>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        Official, verifiable certifications and participation credentials awarded to you by Google Developer Groups.
                    </p>
                </div>

                {/* Certificates Grid */}
                {certificates.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm"
                    >
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-200">
                            <DocumentTextIcon className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-[#0f172a] mb-2">No Certificates Issued Yet</h3>
                        <p className="text-slate-500 max-w-md mx-auto text-sm mb-8">
                            You haven't been issued any certificates yet. Complete workshops, hackathons, and technical sessions to earn verifiable credentials!
                        </p>
                        <Link
                            href="/programs"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-medium text-sm rounded-full transition-all shadow-md cursor-pointer"
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
                                        className="group relative bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-[#2563EB]/50 transition-all duration-300 block p-6 h-full flex flex-col shadow-sm hover:shadow-md hover:-translate-y-1"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 rounded-2xl bg-blue-50 text-[#2563EB] border border-blue-200 group-hover:scale-105 transition-all">
                                                <DocumentTextIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-semibold">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                Verified
                                            </div>
                                        </div>

                                        <h4 className="font-bold text-[#0f172a] text-lg mb-1 line-clamp-2 group-hover:text-[#2563EB] transition-colors">
                                            {cert.eventTitle}
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-6 flex-1">
                                            {cert.templateName}
                                        </p>

                                        <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-4 mt-auto">
                                            <div className="flex items-center gap-1.5 font-mono text-[11px]">
                                                <CalendarDaysIcon className="w-3.5 h-3.5 text-slate-400" />
                                                {cert.issueDate || "Issued"}
                                            </div>
                                            <div className="flex items-center gap-1 font-mono text-[11px] text-[#2563EB] group-hover:translate-x-0.5 transition-transform font-bold">
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
