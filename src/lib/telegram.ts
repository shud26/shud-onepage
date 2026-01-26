export async function sendTelegramMessage(text: string): Promise<boolean> {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error('TELEGRAM_TOKEN or TELEGRAM_CHAT_ID not set');
    return false;
  }

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    );

    if (!res.ok) {
      console.error('Telegram API error:', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram send error:', error);
    return false;
  }
}
