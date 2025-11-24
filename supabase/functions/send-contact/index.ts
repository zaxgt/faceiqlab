import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, rating, frontImage } = await req.json();
    const DISCORD_WEBHOOK_URL = Deno.env.get("DISCORD_WEBHOOK_URL");

    if (!DISCORD_WEBHOOK_URL) {
      throw new Error("DISCORD_WEBHOOK_URL is not configured");
    }

    const fields = [
      {
        name: "User Rating",
        value: rating || "N/A",
        inline: true
      }
    ];

    // Add note if image was included (but don't send the large base64)
    if (frontImage) {
      fields.push({
        name: "Image",
        value: "✅ Front face image included",
        inline: true
      });
    }

    const embed: any = {
      title: "📬 New Contact Message",
      description: message,
      color: 0x00ffff,
      fields: fields,
      timestamp: new Date().toISOString()
    };

    const discordPayload = {
      embeds: [embed]
    };

    const response = await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    });

    if (!response.ok) {
      throw new Error(`Discord webhook error: ${response.status}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-contact function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
