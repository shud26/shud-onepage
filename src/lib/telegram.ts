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

// 인라인 키보드 버튼 포함 메시지 전송
export async function sendTelegramWithButtons(
  text: string,
  buttons: { text: string; callback_data: string }[][]
): Promise<boolean> {
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
          reply_markup: {
            inline_keyboard: buttons,
          },
        }),
      }
    );

    if (!res.ok) {
      console.error('Telegram buttons API error:', await res.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Telegram buttons send error:', error);
    return false;
  }
}

// 콜백 쿼리 응답 (버튼 클릭 후 로딩 해제)
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string
): Promise<boolean> {
  const token = process.env.TELEGRAM_TOKEN;

  if (!token) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${token}/answerCallbackQuery`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || '처리 중...',
        }),
      }
    );

    return res.ok;
  } catch {
    return false;
  }
}
