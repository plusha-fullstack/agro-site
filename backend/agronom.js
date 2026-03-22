// backend/agronom.js
module.exports.getAnswer = function(question) {
  if (!question) return "Задайте вопрос агроному!";
  return "Ответ AI-Агронома: " + question;
};

