"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { XMarkIcon, ArrowDownTrayIcon, PhotoIcon } from "@heroicons/react/24/outline";

import { PREVIOUS_GDSC_GALLERY } from "@/lib/data/GalleryData";

const FALLBACK_MEMORIES = PREVIOUS_GDSC_GALLERY.map(item => ({
    src: item.src,
    caption: item.caption
}));

export default function GalleryPage() {
    const [galleryImages, setGalleryImages] = useState<{ src: string; caption: string }[]>(FALLBACK_MEMORIES);
    const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string } | null>(null);
    useBodyScrollLock(!!selectedImage);

    useEffect(() => {
        // Query Firestore gallery collection if populated in user's database
        import("@/lib/firebase").then(({ db }) => {
            import("firebase/firestore").then(({ collection, getDocs, query, orderBy }) => {
                getDocs(query(collection(db, "gallery"), orderBy("createdAt", "desc")))
                    .then((snap) => {
                        if (!snap.empty) {
                            const items = snap.docs.map((d) => ({
                                src: d.data().url || d.data().src,
                                caption: d.data().caption || "GDG AJCE Event Memory",
                            })).filter(item => Boolean(item.src));
                            if (items.length > 0) {
                                setGalleryImages(items);
                            }
                        }
                    })
                    .catch(() => {
                        // Keep default GDG-themed memories
                    });
            });
        });
    }, []);

    const handleDownload = (e: React.MouseEvent, src: string) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = src;
        link.download = 'gdg-ajce-memory.jpg';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <main className="min-h-screen text-[#2c2e2a] relative overflow-hidden pb-32 select-none">
            <div className="relative z-10 max-w-[1200px] mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
                {/* Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[50px] bg-[#ffffff] border border-[#d5d5d4] text-[13px] font-medium text-[#2c2e2a] shadow-xs">
                        <PhotoIcon className="w-3.5 h-3.5 text-[#2ba0ff]" />
                        <span>Visual Archive</span>
                    </div>
                    <h1 className="text-4xl sm:text-6xl font-medium text-[#2c2e2a] tracking-[-0.04em] leading-[1.05]">
                        Chapter Memories
                    </h1>
                    <p className="text-[16px] text-[#80827f] max-w-2xl mx-auto leading-relaxed">
                        Highlights from our developer conferences, late-night code sprints, hackathons, and Google ecosystem codelabs.
                    </p>
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
                    {galleryImages.map((image, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: i * 0.05 }}
                            onClick={() => setSelectedImage(image)}
                            className="break-inside-avoid relative group rounded-[32px] overflow-hidden cursor-pointer bg-[#ffffff] border border-[#d5d5d4] hover:border-[#2c2e2a]/40 transition-all shadow-xs hover:-translate-y-1"
                        >
                            <img
                                src={image.src}
                                alt={image.caption}
                                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                                <span className="text-xs font-semibold text-white tracking-wide">{image.caption}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Lightbox Modal */}
                {selectedImage && (
                    <div
                        onClick={() => setSelectedImage(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-50 cursor-pointer"
                        >
                            <XMarkIcon className="w-6 h-6" />
                        </button>

                        <div
                            className="relative max-w-5xl max-h-[85vh] w-full h-full flex items-center justify-center rounded-[32px] overflow-hidden bg-[#ffffff] border border-[#d5d5d4] shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.src}
                                alt={selectedImage.caption}
                                className="w-full h-full object-contain"
                            />

                            <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex justify-between items-center">
                                <div>
                                    <h3 className="text-sm sm:text-base font-medium text-white">{selectedImage.caption}</h3>
                                    <p className="text-xs text-white/70">Google Developer Groups on Campus</p>
                                </div>

                                <button
                                    onClick={(e) => handleDownload(e, selectedImage.src)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#2c2e2a] text-xs font-medium rounded-[50px] hover:bg-[#f5f1e4] transition-colors shadow-sm cursor-pointer"
                                >
                                    <ArrowDownTrayIcon className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
