import { sendEmail, type EmailEnv } from '../_lib/email';
import { ensureMessagesSchema } from './_lib/messagesSchema';

type D1PreparedStatement = {
  run(): Promise<{ success: boolean; error?: string }>;
  bind(...values: unknown[]): D1PreparedStatement;
};

type D1Database = {
  prepare(query: string): D1PreparedStatement;
};

interface MessageInput {
  name?: string;
  email?: string;
  message?: string;
  imageUrl?: string | null;
  type?: 'message' | 'custom_order';
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIds?: string[] | null;
  categoryNames?: string[] | null;
  inspoExampleId?: string | null;
  inspoTitle?: string | null;
  inspoImageUrl?: string | null;
}

type MessageEnv = {
  DB: D1Database;
} & EmailEnv;

type ParsedAttachment = {
  filename: string;
  content: string;
  contentType?: string;
};

const SUBJECT = 'New Inquiry - Dover Designs';

export async function onRequestPost(context: { env: MessageEnv; request: Request }): Promise<Response> {
  try {
    const debugMessages = (context.env as any).DEBUG_MESSAGES === '1';
    await ensureMessagesSchema(context.env.DB);
    const body = (await context.request.json().catch(() => null)) as MessageInput | null;
    const name = body?.name?.trim() || '';
    const email = body?.email?.trim() || '';
    const message = body?.message?.trim() || '';
    const type = body?.type === 'custom_order' ? 'custom_order' : 'message';
    let categoryIds = Array.isArray(body?.categoryIds)
      ? body!.categoryIds!.map((value) => String(value).trim()).filter(Boolean)
      : [];
    let categoryNames = Array.isArray(body?.categoryNames)
      ? body!.categoryNames!.map((value) => String(value).trim()).filter(Boolean)
      : [];
    if (categoryIds.length === 0 && body?.categoryId?.trim()) {
      categoryIds = [body.categoryId.trim()];
    }
    if (categoryNames.length === 0 && body?.categoryName?.trim()) {
      categoryNames = [body.categoryName.trim()];
    }
    const categoryId = categoryIds[0] ?? null;
    const categoryName = categoryNames[0] ?? null;
    const inspoExampleId = body?.inspoExampleId?.trim() || null;
    const inspoTitle = body?.inspoTitle?.trim() || null;
    const inspoImageUrl = body?.inspoImageUrl?.trim() || null;
    if (debugMessages) {
      console.log('[messages] payload', {
        contentType: context.request.headers.get('content-type'),
        hasImageUrl: !!body?.imageUrl,
        imageUrlLength: body?.imageUrl?.length ?? 0,
        nameLen: name.length,
        emailLen: email.length,
        messageLen: message.length,
        categoryCount: categoryNames.length,
      });
    }

    if (!name || !email || !message) {
      return jsonResponse({ success: false, error: 'Name, email, and message are required.' }, 400);
    }

    if (name.length > 120) {
      return jsonResponse({ success: false, error: 'Name is too long (max 120 characters).' }, 400);
    }
    if (email.length > 254) {
      return jsonResponse({ success: false, error: 'Email is too long (max 254 characters).' }, 400);
    }
    if (message.length > 5000) {
      return jsonResponse({ success: false, error: 'Message is too long (max 5000 characters).' }, 400);
    }
    if (body?.imageUrl && body.imageUrl.length > 1800000) {
      return jsonResponse(
        {
          success: false,
          code: 'IMAGE_TOO_LARGE',
          error: 'Image is too large. Please upload a smaller file.',
          message: 'Image is too large. Please upload a smaller file.',
        },
        400
      );
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    const insert = context.env.DB.prepare(
      `INSERT INTO messages (
        id,
        name,
        email,
        message,
        image_url,
        type,
        category_id,
        category_name,
        category_ids_json,
        category_names_json,
        is_read,
        read_at,
        inspo_example_id,
        inspo_title,
        inspo_image_url,
        created_at
      )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      name,
      email,
      message,
      body?.imageUrl || null,
      type,
      categoryId,
      categoryName,
      JSON.stringify(categoryIds),
      JSON.stringify(categoryNames),
      0,
      null,
      inspoExampleId,
      inspoTitle,
      inspoImageUrl,
      createdAt
    );

    const result = await insert.run();
    if (!result.success) {
      console.error('[messages] Failed to insert message', result.error);
      return jsonResponse({ success: false, error: 'Failed to save message' }, 500);
    }

    const ownerTo = context.env.RESEND_OWNER_TO || context.env.EMAIL_OWNER_TO;
    if (!ownerTo) {
      console.error('[messages] Missing RESEND_OWNER_TO/EMAIL_OWNER_TO');
      return jsonResponse({ error: 'Failed to send email', detail: 'Missing owner email' }, 500);
    }

    const siteUrl = context.env.PUBLIC_SITE_URL || context.env.VITE_PUBLIC_SITE_URL || '';
    const attachment = parseDataUrl(body?.imageUrl);
    if (body?.imageUrl && !attachment) {
      console.warn('[messages] Invalid image data URL; sending without attachment');
    }

    const textLines = [
      `New inquiry from ${name}`,
      `Email: ${email}`,
      `Type: ${type === 'custom_order' ? 'Custom Order' : 'Message'}`,
      categoryNames.length ? `Category: ${categoryNames.join(', ')}` : '',
      inspoTitle ? `Inspired by: ${inspoTitle}` : '',
      '',
      message,
      '',
      attachment ? 'Image attached.' : 'No image attached.',
      siteUrl ? `Site: ${siteUrl}` : '',
    ].filter(Boolean);

    const html = `
      <div style="font-family: Arial, sans-serif; color: #0f172a; line-height: 1.5;">
        <p><strong>New inquiry from ${escapeHtml(name)}</strong></p>
        <p>Email: <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
        <p>Type: ${type === 'custom_order' ? 'Custom Order' : 'Message'}</p>
        ${categoryNames.length ? `<p>Category: ${escapeHtml(categoryNames.join(', '))}</p>` : ''}
        ${inspoTitle ? `<p>Inspired by: ${escapeHtml(inspoTitle)}</p>` : ''}
        <p style="white-space: pre-line;">${escapeHtml(message)}</p>
        <p>${attachment ? 'Image attached.' : 'No image attached.'}</p>
        ${siteUrl ? `<p>Site: <a href="${escapeHtml(siteUrl)}">${escapeHtml(siteUrl)}</a></p>` : ''}
      </div>
    `;

    const emailResult = await sendEmail(
      {
        to: ownerTo,
        subject: SUBJECT,
        text: textLines.join('\n'),
        html,
        replyTo: email,
        attachments: attachment ? [attachment] : undefined,
      },
      context.env
    );

    if (!emailResult.ok) {
      console.error('[messages] Failed to send email', emailResult.error);
      return jsonResponse({ error: 'Failed to send email', detail: emailResult.error }, 500);
    }

    return jsonResponse({ success: true, id, createdAt });
  } catch (err) {
    console.error('[messages] Error handling message submission', err);
    return jsonResponse({ success: false, error: 'Server error saving message' }, 500);
  }
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json',
    },
  });
}

function parseDataUrl(value?: string | null): ParsedAttachment | null {
  if (!value || !value.startsWith('data:')) return null;
  const [header, base64] = value.split(',', 2);
  if (!header || !base64) return null;
  const match = header.match(/^data:([^;]+);base64$/i);
  if (!match) return null;
  const contentType = match[1].toLowerCase();
  const extension = contentTypeToExtension(contentType);
  return {
    filename: `contact-upload.${extension}`,
    content: base64,
    contentType,
  };
}

function contentTypeToExtension(contentType: string) {
  switch (contentType) {
    case 'image/jpeg':
    case 'image/jpg':
      return 'jpg';
    case 'image/gif':
      return 'gif';
    case 'image/webp':
      return 'webp';
    case 'image/png':
    default:
      return 'png';
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
