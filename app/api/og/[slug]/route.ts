import { NextRequest, NextResponse } from 'next/server';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const eventsRef = collection(db, 'events');
        const q = query(eventsRef, where('slug', '==', slug));
        const querySnap = await getDocs(q);

        let posterUrl: string | null = null;

        if (!querySnap.empty) {
            const docSnap = querySnap.docs[0];
            posterUrl = docSnap.data().posterUrl || null;
        } else {
            const docRef = doc(db, 'events', slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                posterUrl = docSnap.data().posterUrl || null;
            }
        }

        if (!posterUrl) {
            return new NextResponse('Poster not found', { status: 404 });
        }

        if (posterUrl.startsWith('data:image/')) {
            const matches = posterUrl.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);

            if (!matches) {
                return new NextResponse('Invalid image format', { status: 400 });
            }

            const imageType = matches[1];
            const base64Data = matches[2];
            const binaryData = Buffer.from(base64Data, 'base64');

            return new NextResponse(binaryData, {
                status: 200,
                headers: {
                    'Content-Type': `image/${imageType}`,
                    'Cache-Control': 'public, max-age=86400, s-maxage=86400',
                    'Content-Length': binaryData.length.toString(),
                },
            });
        }

        return NextResponse.redirect(posterUrl);

    } catch (error) {
        console.error('Error serving poster:', error);
        return new NextResponse('Internal Server Error', { status: 500 });
    }
}
