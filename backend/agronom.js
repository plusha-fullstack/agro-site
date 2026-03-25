// backend/agronom.js
const SYSTEM_PROMPT = `Ты опытный агроном-консультант. Фермерское хозяйство в средней полосе России выращивает яблони (Антоновка, Белый Налив) и чёрную смородину.

Тебе прислали фото и/или описание. Сначала определи: это растение с признаками болезни или повреждения?

Выбери один из трёх сценариев:

**Сценарий A — растение есть, диагноз очевиден.** Ответь:
**Диагноз:** [название]
**Причина:** [объяснение]
**Что делать:** [конкретные шаги]
**Профилактика на будущее:** [1-2 совета]

**Сценарий B — растение есть, но симптомы неоднозначны.** Ответь:
**Вероятный диагноз:** [наиболее вероятное, с пометкой "предположительно"]
**Причина:** [объяснение]
**Что делать:** [шаги с учётом неопределённости]
**Профилактика на будущее:** [1-2 совета]

**Сценарий C — на фото/в описании нет растения или признаков болезни.** Ответь только:
**Некорректный запрос:** Пожалуйста, загрузите фото растения или опишите симптомы болезни.

Отвечай кратко, практично, без воды.`;

module.exports.getAnswer = async function(question, imageBase64, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY не задан");

  const parts = [];
  if (imageBase64 && mimeType) {
    parts.push({ inlineData: { mimeType, data: imageBase64 } });
  }
  parts.push({ text: `${SYSTEM_PROMPT}\n\nСимптомы от фермера: ${question}` });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`,
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
