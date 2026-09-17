import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export const createAuditLog = async (
    action: string,
    details: Record<string, any>,
    user?: any
) => {
    try {
        const currentUser = user || auth.currentUser;
        await addDoc(collection(db, "auditLogs"), {
            action,
            details,
            performedBy: currentUser?.email || "System",
            performedByName: currentUser?.displayName || "System",
            timestamp: Timestamp.now()
        });
    } catch (error) {
        console.error("Error creating audit log:", error);
    }
};
