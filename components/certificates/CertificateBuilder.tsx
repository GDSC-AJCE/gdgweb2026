"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
    X,
    Plus,
    Trash2,
    QrCode,
    Calendar,
    Award,
    User,
    Check,
    AlignLeft,
    AlignCenter,
    AlignRight
} from "lucide-react";
import GoogleBadge from "../GoogleBadge";

export interface CertificateElement {
    id: string;
    type: "name" | "date" | "certificateId" | "qrcode";
    x: number;
    y: number;
    fontSize: number;
    color: string;
    fontWeight: string;
    fontFamily: string;
    textAlign?: "left" | "center" | "right";
    label?: string;
}

interface CertificateBuilderProps {
    onClose: () => void;
    onSave: (data: {
        name: string;
        backgroundUrl: string;
        elements: CertificateElement[];
    }) => void;
    existingTemplate?: {
        id: string;
        name: string;
        backgroundUrl: string;
        elements: CertificateElement[];
    } | null;
}

const ELEMENT_TYPES = [
    { type: "name" as const, label: "Recipient Name", icon: User, placeholder: "{{NAME}}" },
    { type: "date" as const, label: "Issue Date", icon: Calendar, placeholder: "{{DATE}}" },
    { type: "certificateId" as const, label: "Certificate ID", icon: Award, placeholder: "{{ID}}" },
    { type: "qrcode" as const, label: "QR Code", icon: QrCode, placeholder: "[QR]" }
];

const FONT_OPTIONS = [
    { value: "Inter, sans-serif", label: "Inter (Sans)" },
    { value: "Arial, sans-serif", label: "Arial (Clean)" },
    { value: "Georgia, serif", label: "Georgia (Serif)" },
    { value: "Playfair Display, serif", label: "Playfair Display (Formal)" },
    { value: "Courier New, monospace", label: "Courier New (Mono)" },
    { value: "Great Vibes, cursive", label: "Great Vibes (Script)" },
];

export default function CertificateBuilder({
    onClose,
    onSave,
    existingTemplate
}: CertificateBuilderProps) {
    const [templateName, setTemplateName] = useState(existingTemplate?.name || "GDG Certificate Template");
    const [backgroundUrl, setBackgroundUrl] = useState(
        existingTemplate?.backgroundUrl || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1600&auto=format&fit=crop"
    );
    const [elements, setElements] = useState<CertificateElement[]>(
        existingTemplate?.elements || [
            {
                id: "elem_name",
                type: "name",
                x: 877,
                y: 620,
                fontSize: 48,
                color: "#FFFFFF",
                fontWeight: "bold",
                fontFamily: "Inter, sans-serif",
                textAlign: "center"
            },
            {
                id: "elem_date",
                type: "date",
                x: 877,
                y: 800,
                fontSize: 18,
                color: "#9CA3AF",
                fontWeight: "normal",
                fontFamily: "Inter, sans-serif",
                textAlign: "center"
            },
            {
                id: "elem_id",
                type: "certificateId",
                x: 877,
                y: 850,
                fontSize: 14,
                color: "#4285F4",
                fontWeight: "bold",
                fontFamily: "Courier New, monospace",
                textAlign: "center"
            },
            {
                id: "elem_qr",
                type: "qrcode",
                x: 1500,
                y: 1000,
                fontSize: 100,
                color: "#FFFFFF",
                fontWeight: "normal",
                fontFamily: "Inter, sans-serif"
            }
        ]
    );

    const [selectedElementId, setSelectedElementId] = useState<string | null>("elem_name");
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.45);

    // Certificate standard canvas coordinates: 1754 x 1240
    const CANVAS_WIDTH = 1754;
    const CANVAS_HEIGHT = 1240;

    useEffect(() => {
        const updateScale = () => {
            if (!canvasContainerRef.current) return;
            const containerWidth = canvasContainerRef.current.clientWidth - 48;
            const s = Math.min(containerWidth / CANVAS_WIDTH, 0.55);
            setScale(Math.max(s, 0.25));
        };
        updateScale();
        window.addEventListener("resize", updateScale);
        return () => window.removeEventListener("resize", updateScale);
    }, []);

    const selectedElement = elements.find(e => e.id === selectedElementId);

    const updateSelected = (updates: Partial<CertificateElement>) => {
        if (!selectedElementId) return;
        setElements(elements.map(e => e.id === selectedElementId ? { ...e, ...updates } : e));
    };

    const addElement = (type: CertificateElement["type"]) => {
        const newElem: CertificateElement = {
            id: `elem_${Date.now()}`,
            type,
            x: Math.round(CANVAS_WIDTH / 2),
            y: Math.round(CANVAS_HEIGHT / 2),
            fontSize: type === "qrcode" ? 120 : 28,
            color: type === "certificateId" ? "#4285F4" : "#FFFFFF",
            fontWeight: type === "name" ? "bold" : "normal",
            fontFamily: "Inter, sans-serif",
            textAlign: "center"
        };
        setElements([...elements, newElem]);
        setSelectedElementId(newElem.id);
    };

    const removeSelected = () => {
        if (!selectedElementId) return;
        setElements(elements.filter(e => e.id !== selectedElementId));
        setSelectedElementId(null);
    };

    const handleSave = () => {
        if (!templateName.trim()) return;
        onSave({
            name: templateName.trim(),
            backgroundUrl: backgroundUrl.trim(),
            elements
        });
    };

    return (
        <div className="fixed inset-0 z-[120] flex flex-col bg-[#131314] text-white">
            {/* Top Toolbar */}
            <header className="h-16 px-6 border-b border-white/10 flex items-center justify-between bg-[#18191b] shrink-0">
                <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#4285F4]" />
                    <input
                        type="text"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        placeholder="Template Name"
                        className="bg-transparent font-bold text-sm text-white focus:outline-none border-b border-transparent focus:border-[#4285F4] px-1 py-0.5"
                    />
                    <GoogleBadge label="VISUAL DESIGNER" variant="blue" size="sm" />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full border border-zinc-700 text-zinc-300 hover:text-white text-xs font-medium transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367D6] text-white font-semibold text-xs shadow-md transition flex items-center gap-1.5"
                    >
                        <Check className="w-4 h-4" />
                        Save Template
                    </button>
                </div>
            </header>

            {/* Main Studio Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Elements & Background Controls */}
                <div className="w-80 border-r border-white/10 bg-[#18191b] p-5 flex flex-col overflow-y-auto space-y-6 shrink-0">
                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">Background Image URL</label>
                        <input
                            type="text"
                            value={backgroundUrl}
                            onChange={(e) => setBackgroundUrl(e.target.value)}
                            placeholder="https://.../certificate-bg.png"
                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-[#4285F4]"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-mono uppercase text-zinc-400 block font-semibold">Add Layout Element</label>
                        <div className="grid grid-cols-2 gap-2">
                            {ELEMENT_TYPES.map((t) => (
                                <button
                                    key={t.type}
                                    onClick={() => addElement(t.type)}
                                    className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition flex flex-col gap-1 text-xs"
                                >
                                    <t.icon className="w-4 h-4 text-[#4285F4]" />
                                    <span className="font-semibold text-zinc-200">{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Selected Element Property Inspector */}
                    {selectedElement ? (
                        <div className="space-y-4 pt-4 border-t border-white/10">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-mono font-bold text-white uppercase">{selectedElement.type} Settings</span>
                                <button onClick={removeSelected} className="text-red-400 hover:text-red-300 p-1">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {selectedElement.type !== "qrcode" && (
                                <>
                                    <div>
                                        <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Font Family</label>
                                        <select
                                            value={selectedElement.fontFamily}
                                            onChange={(e) => updateSelected({ fontFamily: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                        >
                                            {FONT_OPTIONS.map(f => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Font Size</label>
                                            <input
                                                type="number"
                                                value={selectedElement.fontSize}
                                                onChange={(e) => updateSelected({ fontSize: parseInt(e.target.value) || 12 })}
                                                className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Color</label>
                                            <input
                                                type="color"
                                                value={selectedElement.color}
                                                onChange={(e) => updateSelected({ color: e.target.value })}
                                                className="w-full h-8 rounded-xl bg-zinc-900 border border-zinc-700 cursor-pointer"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Text Alignment</label>
                                        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-700">
                                            <button
                                                type="button"
                                                onClick={() => updateSelected({ textAlign: "left" })}
                                                className={`p-1.5 rounded-lg flex justify-center ${selectedElement.textAlign === "left" ? "bg-white/10 text-white" : "text-zinc-500"}`}
                                            >
                                                <AlignLeft className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateSelected({ textAlign: "center" })}
                                                className={`p-1.5 rounded-lg flex justify-center ${selectedElement.textAlign === "center" ? "bg-white/10 text-white" : "text-zinc-500"}`}
                                            >
                                                <AlignCenter className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateSelected({ textAlign: "right" })}
                                                className={`p-1.5 rounded-lg flex justify-center ${selectedElement.textAlign === "right" ? "bg-white/10 text-white" : "text-zinc-500"}`}
                                            >
                                                <AlignRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">X Coord</label>
                                    <input
                                        type="number"
                                        value={selectedElement.x}
                                        onChange={(e) => updateSelected({ x: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-zinc-400 uppercase block mb-1">Y Coord</label>
                                    <input
                                        type="number"
                                        value={selectedElement.y}
                                        onChange={(e) => updateSelected({ y: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs"
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-xs italic pt-4 border-t border-white/10">Click on an element on the canvas to configure its properties.</p>
                    )}
                </div>

                {/* Right: Interactive Canvas Workspace */}
                <div
                    ref={canvasContainerRef}
                    className="flex-1 overflow-auto bg-[#0e0e10] p-8 flex items-center justify-center relative"
                >
                    <div
                        style={{
                            width: `${CANVAS_WIDTH}px`,
                            height: `${CANVAS_HEIGHT}px`,
                            transform: `scale(${scale})`,
                            transformOrigin: "center center",
                        }}
                        className="relative shadow-2xl rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-white/20 select-none"
                    >
                        {/* Background Poster */}
                        {backgroundUrl && (
                            <img
                                src={backgroundUrl}
                                alt="Certificate Template"
                                className="w-full h-full object-cover pointer-events-none"
                            />
                        )}

                        {/* Interactive Elements on Canvas */}
                        {elements.map((elem) => {
                            const isSelected = elem.id === selectedElementId;
                            return (
                                <div
                                    key={elem.id}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedElementId(elem.id);
                                    }}
                                    style={{
                                        position: "absolute",
                                        left: `${elem.x}px`,
                                        top: `${elem.y}px`,
                                        transform: "translate(-50%, -50%)",
                                        fontSize: `${elem.fontSize}px`,
                                        color: elem.color,
                                        fontFamily: elem.fontFamily,
                                        fontWeight: elem.fontWeight,
                                        textAlign: elem.textAlign || "center",
                                        cursor: "pointer",
                                    }}
                                    className={`px-3 py-1.5 transition-all ${
                                        isSelected
                                            ? "ring-4 ring-[#4285F4] bg-[#4285F4]/20 rounded-xl"
                                            : "hover:ring-2 hover:ring-white/40 rounded"
                                    }`}
                                >
                                    {elem.type === "qrcode" ? (
                                        <div
                                            style={{ width: `${elem.fontSize}px`, height: `${elem.fontSize}px` }}
                                            className="bg-white rounded-xl flex items-center justify-center p-2 shadow-lg"
                                        >
                                            <QrCode className="w-full h-full text-black" />
                                        </div>
                                    ) : elem.type === "name" ? (
                                        "Alex Morgan"
                                    ) : elem.type === "date" ? (
                                        "October 24, 2025"
                                    ) : (
                                        "GDG-9842X1"
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
