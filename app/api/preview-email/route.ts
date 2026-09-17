import { NextRequest, NextResponse } from "next/server";
import { marked } from "marked";

export async function POST(req: NextRequest) {
    try {
        const { markdownBody } = await req.json();
        
        if (!markdownBody) {
            return new NextResponse("Empty markdown preview", { status: 400 });
        }

        const substituted = markdownBody
            .replace(/\{\{name\}\}/g, "Alex Developer")
            .replace(/\{\{time\}\}/g, "Friday, October 24 at 4:30 PM")
            .replace(/\{\{link\}\}/g, "https://meet.google.com/abc-defg-hij");

        const rawHtml = marked.parse(substituted, { gfm: true, breaks: true }) as string;

        const previewHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #ffffff;
      margin: 0;
      padding: 20px;
      color: #202124;
      line-height: 1.6;
    }
    .header-bar {
      height: 4px;
      width: 100%;
      background: linear-gradient(90deg, #4285F4 25%, #EA4335 25% 50%, #FBBC04 50% 75%, #34A853 75%);
      margin-bottom: 24px;
      border-radius: 2px;
    }
    h1 { font-size: 22px; font-weight: 700; color: #202124; margin-top: 0; }
    h2 { font-size: 17px; font-weight: 600; color: #202124; }
    p { font-size: 14px; color: #3c4043; }
    blockquote {
      margin: 16px 0;
      padding: 10px 14px;
      border-left: 4px solid #4285F4;
      background: #f8f9fa;
      color: #5f6368;
      border-radius: 0 6px 6px 0;
    }
    ul, ol { font-size: 14px; color: #3c4043; padding-left: 20px; }
    li { margin-bottom: 6px; }
  </style>
</head>
<body>
  <div class="header-bar"></div>
  ${rawHtml}
</body>
</html>
`;

        return new NextResponse(previewHtml, {
            headers: { "Content-Type": "text/html" },
        });
    } catch (err: any) {
        return new NextResponse(err.message || "Preview render failed", { status: 500 });
    }
}
