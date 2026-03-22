#!/bin/bash

echo "🚀 Запуск проекта КФХ Чуряева"
echo "----------------------------------"

# Проверка Node.js
if ! command -v node &> /dev/null
then
  echo "❌ Node.js не установлен"
  echo "👉 Установи Node.js: https://nodejs.org"
  exit 1
fi

# Проверка npm
if ! command -v npm &> /dev/null
then
  echo "❌ npm не установлен"
  exit 1
fi

# BACKEND
echo "🧠 Запуск backend..."

cd backend || exit

if [ ! -d "node_modules" ]; then
  echo "📦 Установка зависимостей backend..."
  npm install
fi

node server.js &
BACKEND_PID=$!

cd ..

# FRONTEND
echo "🌐 Запуск frontend..."

cd frontend || exit

if ! command -v serve &> /dev/null
then
  echo "📦 Установка serve..."
  npm install -g serve
fi

serve . &
FRONTEND_PID=$!

cd ..

echo "----------------------------------"
echo "✅ Backend:  http://localhost:3000"
echo "✅ Frontend: http://localhost:3000 или http://localhost:3001"
echo "⛔ Ctrl + C — остановить всё"
echo "----------------------------------"

# Корректное завершение
trap "echo '🛑 Остановка...'; kill $BACKEND_PID $FRONTEND_PID" SIGINT
wait
