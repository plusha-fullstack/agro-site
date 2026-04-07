// backend/agronom.js
const SYSTEM_PROMPT = `Ты опытный агроном-консультант. Фермерское хозяйство в средней полосе России выращивает яблони (Антоновка, Белый Налив) и чёрную смородину.

Тебе прислали фото и/или описание. Определи: есть ли на фото или в описании растение с признаками болезни или повреждения?

**Сценарий A — растение есть, диагноз возможен.** Ответь строго в формате:
**Диагноз:** [название болезни или вредителя]
**Степень тяжести:** [одно слово: Легкая / Средняя / Высокая]
**Описание симптомов:** [краткое описание видимых признаков]
**Рекомендации по лечению:** [конкретные шаги, препараты, дозировки]
**Профилактика:** [1-2 совета на будущее]

**Сценарий B — растение не определено или нет признаков болезни.** Ответь только:
**Некорректный запрос:** Пожалуйста, загрузите фото растения или опишите симптомы болезни.

Отвечай кратко, практично, без воды. Строго следуй формату сценария A.`;

module.exports.getAnswer = async function (question, imageBase64, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не задан");

  const parts = [];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }
  parts.push({ text: `${SYSTEM_PROMPT}\n\nСимптомы от фермера: ${question}` });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts }], generationConfig: { temperature: 0.2 } }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Не удалось получить ответ от AI.";
};
