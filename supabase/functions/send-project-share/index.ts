import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface ShareRequest {
  emails: string[];
  projectName: string;
  accessCode: string;
  customMessage?: string;
  projectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { emails, projectName, accessCode, customMessage, projectUrl }: ShareRequest = await req.json();

    if (!emails?.length || !projectName || !accessCode || !projectUrl) {
      throw new Error("Missing required fields");
    }

    const accessLink = `${projectUrl}?code=${encodeURIComponent(accessCode)}`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 0;">
        <h1 style="font-size: 20px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px;">
          ${projectName}
        </h1>
        <p style="font-size: 14px; color: #666; margin: 0 0 24px;">
          You've been invited to collaborate on a Governance Model Canvas.
        </p>

        ${customMessage ? `<p style="font-size: 14px; color: #333; background: #f5f5f5; padding: 12px 16px; border-radius: 8px; margin: 0 0 24px;">${customMessage}</p>` : ""}

        <div style="background: #fafafa; border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
          <p style="font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 6px;">Access Code</p>
          <p style="font-size: 22px; font-weight: 700; font-family: monospace; color: #1a1a1a; margin: 0; letter-spacing: 0.1em;">${accessCode}</p>
        </div>

        <a href="${accessLink}" style="display: inline-block; background: #1a1a1a; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 500;">
          Open Canvas
        </a>

        <p style="font-size: 12px; color: #999; margin: 24px 0 0;">
          If the button doesn't work, paste this link into your browser:<br/>
          <a href="${accessLink}" style="color: #666;">${accessLink}</a>
        </p>
      </div>
    `;

    const results = await Promise.all(
      emails.map((email) =>
        resend.emails.send({
          from: "Governance Canvas <noreply@apps.threeoclock.co>",
          to: [email],
          subject: `${projectName} — Governance Model Canvas`,
          html,
        }),
      ),
    );

    console.log("Emails sent:", results);

    return new Response(JSON.stringify({ success: true, count: results.length }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-project-share:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
