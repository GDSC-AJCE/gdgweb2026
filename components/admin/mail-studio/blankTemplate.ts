/** Seed content for "Start from scratch" — a minimal, editable Unlayer layout. */
export function buildBlankTemplate(title: string): { content: string; design: unknown } {
  const safeTitle = title.replace(/[<>&"]/g, "");
  const design = {
    counters: { u_row: 1, u_column: 1, u_content_heading: 1, u_content_text: 1, u_content_button: 1 },
    body: {
      rows: [
        {
          cells: [1],
          columns: [
            {
              contents: [
                {
                  type: "heading",
                  values: { text: safeTitle, headingType: "h1", textAlign: "center", color: "#1A73E8" },
                },
                {
                  type: "text",
                  values: {
                    text: "<p>Hi {{name}},</p><p>Write your message here.</p>",
                    lineHeight: "160%",
                    color: "#374151",
                  },
                },
                {
                  type: "button",
                  values: {
                    href: { name: "web", values: { href: "{{whatsapp_link}}", target: "_blank" } },
                    buttonColors: {
                      color: "#FFFFFF",
                      backgroundColor: "#25D366",
                      hoverColor: "#FFFFFF",
                      hoverBackgroundColor: "#1EBC5D",
                    },
                    fontSize: "14px",
                    textAlign: "center",
                    borderRadius: "24px",
                    lineHeight: "120%",
                    text: "<strong>Join WhatsApp group</strong>",
                  },
                },
              ],
            },
          ],
        },
      ],
      values: {
        backgroundColor: "#f8fafc",
        contentWidth: "600px",
        fontFamily: { label: "Google Sans", value: "'Google Sans', Roboto, sans-serif" },
      },
    },
  };

  const content = `<div style="font-family:'Google Sans',Roboto,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;padding:32px;border-radius:16px;border:1px solid #e2e8f0;"><h1 style="color:#1A73E8;text-align:center;">${safeTitle}</h1><p style="color:#374151;font-size:15px;line-height:1.6;">Hi {{name}},</p><p style="color:#374151;font-size:15px;line-height:1.6;">Write your message here.</p><div style="text-align:center;margin:24px 0;"><a href="{{whatsapp_link}}" target="_blank" style="display:inline-block;padding:12px 28px;background:#25D366;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;border-radius:28px;">Join WhatsApp group</a></div></div>`;

  return { content, design };
}
