# n8n + Supabase Docker Stack

Локальное развертывание стека автоматизации **n8n** с полнофункциональным **Supabase** через Docker Compose.

## 📋 Описание

Этот проект предоставляет готовую конфигурацию для запуска полного стека автоматизации с базой данных в локальной среде. Все сервисы упакованы в Docker-контейнеры и управляются через Docker Compose.

### Что включено:

- **n8n** — платформа автоматизации рабочих процессов с визуальным редактором
- **Supabase** — полноценная backend-инфраструктура:
  - PostgreSQL 15 — основная база данных
  - GoTrue — сервис аутентификации
  - PostgREST — REST API для PostgreSQL
  - Realtime — WebSocket-подписки в реальном времени
  - Storage — файловое хранилище
  - Kong — API-шлюз
  - Studio — веб-интерфейс администрирования

## 🏗️ Архитектура

```
┌───────────────────────────────────────────────────────────┐
│                      Docker Network                       │
│                                                           │
│  ┌──────────┐      ┌──────────────────────────────────┐   │
│  │          │      │         Supabase Stack           │   │
│  │   n8n    │      │                                  │   │
│  │   :5678  │      │  ┌─────────┐   ┌─────────────┐   │   │
│  │          ├──────┤  │  Kong   │   │   Studio    │   │   │
│  └──────────┘      │  │  :8000  │   │   :3000     │   │   │
│                    │  └────┬────┘   └─────────────┘   │   │
│                    │       │                          │   │
│                    │  ┌────┴─────────────────────┐    │   │
│                    │  │    PostgreSQL :5432      │    │   │
│                    │  └────┬─────────────────────┘    │   │
│                    │       │                          │   │
│                    │  ┌────┴────┐ ┌──────┐ ┌──────┐   │   │
│                    │  │PostgREST│ │Auth  │ │Meta  │   │   │
│                    │  │ :54322  │ │:54321│ │:54325│   │   │
│                    │  └─────────┘ └──────┘ └──────┘   │   │
│                    │                                  │   │
│                    │  ┌─────────┐ ┌────────────────┐  │   │
│                    │  │Realtime │ │    Storage     │  │   │
│                    │  │ :54323  │ │    :54324      │  │   │
│                    │  └─────────┘ └────────────────┘  │   │
│                    └──────────────────────────────────┘   │
└───────────────────────────────────────────────────────────┘
```

## 💻 Локальное развертывание веб-приложения

Этот проект включает веб-интерфейс для генерации и настройки конфигурационных файлов Docker. Ниже приведена инструкция по запуску приложения локально.

### Требования

- **Node.js** версии 18 или выше ([скачать](https://nodejs.org/))
- **npm** версии 9 или выше (устанавливается вместе с Node.js)

Проверьте установленные версии:

```bash
node --version   # v18.x.x или выше
npm --version    # 9.x.x или выше
```

### Установка и запуск

**Примечание:** Проект использует **Tailwind CSS v3** вместо v4 для избежания проблем с нативными зависимостями `@tailwindcss/oxide`, которые могут вызывать ошибки на некоторых системах.

#### 1. Клонируйте репозиторий

```bash
git clone https://github.com/your-username/n8n-supabase-docker.git
cd n8n-supabase-docker
```

#### 2. Установите зависимости

```bash
npm install
```

Эта команда установит все необходимые пакеты из `package.json`:
- **React** — UI-библиотека
- **Vite** — сборщик и dev-сервер
- **Tailwind CSS v3** — утилитарный CSS-фреймворк
- **PostCSS** — инструмент для обработки CSS
- **Autoprefixer** — автоматическое добавление вендорных префиксов
- **Prism.js** — подсветка синтаксиса кода

#### 3. Запустите dev-сервер

```bash
npm run dev
```

После запуска вы увидите в терминале:

```
  VITE v6.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

#### 4. Откройте в браузере

Перейдите по адресу [http://localhost:5173](http://localhost:5173)

Приложение откроется в браузере. Вы можете:
- Просматривать и настраивать конфигурационные файлы
- Изменять порты, пароли и другие параметры
- Скачивать готовые файлы для Docker Compose
- Следовать пошаговой инструкции по развертыванию

### Сборка для production

Для создания оптимизированной production-сборки:

```bash
npm run build
```

Собранные файлы будут находиться в директории `dist/`:

```
dist/
├── index.html
└── assets/
    ├── index-[hash].js
    └── index-[hash].css
```

### Предпросмотр production-сборки

Для локального тестирования production-сборки:

```bash
npm run preview
```

Это запустит локальный сервер, который обслуживает файлы из `dist/`.

### Структура проекта

```
n8n-supabase-docker/
├── public/              # Статические ресурсы
├── src/
│   ├── data/
│   │   └── configFiles.ts    # Генераторы конфигурационных файлов
│   ├── App.tsx               # Главный компонент приложения
│   ├── main.tsx              # Точка входа
│   └── index.css             # Глобальные стили
├── index.html                # HTML-шаблон
├── package.json              # Зависимости и скрипты
├── vite.config.js            # Конфигурация Vite
├── tailwind.config.js        # Конфигурация Tailwind CSS
├── postcss.config.js         # Конфигурация PostCSS
└── README.md                 # Документация
```

### Доступные npm-скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск dev-сервера с hot-reload |
| `npm run build` | Сборка production-версии |
| `npm run preview` | Предпросмотр production-сборки |
| `npm run lint` | Проверка кода линтером (если настроен) |

### Устранение проблем

#### Ошибка "Cannot find native binding" (Tailwind CSS)

Если при запуске `npm run dev` появляется ошибка:

```
Error: Cannot find native binding. npm has a bug related to optional dependencies
```

Это проблема с Tailwind CSS v4 и его нативной зависимостью `@tailwindcss/oxide`. **Решение: проект обновлён до Tailwind CSS v3**, которая не требует нативных биндингов.

Если вы клонировали старую версию, выполните:

```bash
# 1. Удалите старые зависимости
rm -rf node_modules package-lock.json

# 2. Установите заново (теперь с Tailwind v3)
npm install

# 3. Запустите dev-сервер
npm run dev
```

Если проблема сохраняется, попробуйте:

```bash
# Альтернативный способ — используйте npm ci вместо npm install
rm -rf node_modules package-lock.json
npm ci
```

#### Ошибка "EACCES: permission denied"

```bash
# Linux/macOS — исправьте права доступа
sudo chown -R $USER:$USER .
npm install
```

#### Ошибка "Cannot find module"

```bash
# Удалите node_modules и переустановите
rm -rf node_modules package-lock.json
npm install
```

#### Порт 5173 уже занят

```bash
# Запустите на другом порту
npm run dev -- --port 3000
```

#### Белый экран после сборки

```bash
# Проверьте base path в vite.config.ts
# Если приложение развернуто не в корне домена, укажите:
# export default defineConfig({
#   base: '/your-subfolder/',
# })
```

---

## 🌐 Деплой на GitHub Pages

Проект настроен для автоматического деплоя на GitHub Pages через GitHub Actions.

### Подготовка проекта

#### 1. Настройте base path в vite.config.js

Откройте `vite.config.js` и измените `base` на имя вашего репозитория:

```javascript
export default defineConfig({
  plugins: [react()],
  base: '/имя-вашего-репозитория/', // Например: '/n8n-supabase-docker/'
  // ... остальная конфигурация
});
```

**Важно:** Если вы деплоите на корневой домен (username.github.io), установите `base: '/'`.

#### 2. Создайте репозиторий на GitHub

```bash
# Инициализируйте Git (если ещё не сделано)
git init

# Добавьте файлы
git add .
git commit -m "Initial commit"

# Создайте репозиторий на GitHub и добавьте remote
git remote add origin https://github.com/ваш-username/имя-репозитория.git
git branch -M main
git push -u origin main
```

### Настройка GitHub Pages

#### 1. Включите GitHub Pages в настройках репозитория

1. Перейдите в ваш репозиторий на GitHub
2. Откройте **Settings** → **Pages**
3. В разделе **Source** выберите **GitHub Actions**

#### 2. Проверьте workflow файл

Файл `.github/workflows/deploy.yml` уже создан и содержит:
- Автоматическую сборку при пуше в ветку `main`
- Загрузку артефактов сборки
- Деплой на GitHub Pages

#### 3. Запустите деплой

Просто запушьте изменения в ветку `main`:

```bash
git push origin main
```

GitHub Actions автоматически:
1. Установит зависимости (`npm ci`)
2. Соберёт проект (`npm run build`)
3. Задеплоит на GitHub Pages

### Мониторинг деплоя

1. Перейдите в вкладку **Actions** в вашем репозитории
2. Найдите workflow **Deploy to GitHub Pages**
3. Проверьте статус выполнения

### URL вашего приложения

После успешного деплоя приложение будет доступно по адресу:

```
https://ваш-username.github.io/имя-репозитория/
```

Например: `https://ivanov.github.io/n8n-supabase-docker/`

### Ручной запуск деплоя

Вы можете запустить деплой вручную:

1. Перейдите в **Actions** → **Deploy to GitHub Pages**
2. Нажмите **Run workflow**
3. Выберите ветку и нажмите **Run workflow**

### Обновление приложения

Для обновления просто запушьте изменения:

```bash
# Внесите изменения
git add .
git commit -m "Update application"
git push origin main
```

GitHub Actions автоматически пересоберёт и задеплоит новую версию.

### Кастомный домен (опционально)

Если вы хотите использовать собственный домен:

1. В **Settings** → **Pages** укажите ваш домен
2. Создайте файл `CNAME` в корне репозитория с вашим доменом
3. Настройте DNS-записи у вашего регистратора

### Быстрый старт для GitHub Pages

```bash
# 1. Клонируйте репозиторий
git clone https://github.com/ваш-username/n8n-supabase-docker.git
cd n8n-supabase-docker

# 2. Установите зависимости
npm install

# 3. Настройте base path в vite.config.js
# Измените строку:
# const base = process.env.GITHUB_PAGES ? '/имя-репозитория/' : '/';
# на ваше имя репозитория

# 4. Создайте репозиторий на GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ваш-username/n8n-supabase-docker.git
git branch -M main
git push -u origin main

# 5. Включите GitHub Pages в Settings → Pages → Source: GitHub Actions

# 6. Готово! Приложение будет доступно по адресу:
# https://ваш-username.github.io/n8n-supabase-docker/
```

### Устранение проблем с деплоем

#### Страница не открывается (404)

- Проверьте, что `base` в `vite.config.js` совпадает с именем репозитория
- Убедитесь, что GitHub Pages включён и источник — **GitHub Actions**

#### Белый экран после деплоя

- Проверьте консоль браузера на ошибки
- Убедитесь, что пути к ассетам корректные (должны начинаться с `/имя-репозитория/`)

#### Workflow не запускается

- Проверьте, что файл `.github/workflows/deploy.yml` существует в ветке `main`
- Убедитесь, что у репозитория есть необходимые permissions

---

## 📦 Требования для Docker-стека

- **Docker Desktop** (macOS/Windows) или **Docker Engine** + **Docker Compose** (Linux)
- Минимум **4 GB RAM** (рекомендуется 8 GB)
- Минимум **10 GB** свободного места на диске

### Проверка установки

```bash
# Проверить версию Docker
docker --version
# Docker version 24.x.x или выше

# Проверить версию Docker Compose
docker compose version
# Docker Compose version v2.x.x или выше
```

Если Docker не установлен:
- **macOS/Windows**: [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- **Linux**: [Docker Engine Installation](https://docs.docker.com/engine/install/)

## 🚀 Быстрый старт

### 1. Клонируйте или создайте структуру проекта

```bash
mkdir n8n-supabase && cd n8n-supabase
mkdir -p volumes/db volumes/api
```

### 2. Скачайте конфигурационные файлы

Скачайте файлы из веб-интерфейса или создайте их вручную:

```
n8n-supabase/
├── docker-compose.yml
├── .env
└── volumes/
    ├── db/
    │   └── roles.sql
    └── api/
        └── kong.yml
```

### 3. Настройте переменные окружения

Отредактируйте файл `.env` и измените пароли:

```bash
# Обязательно измените пароли перед запуском!
DB_PASSWORD=your_secure_password_here
N8N_PASSWORD=your_n8n_password_here
JWT_SECRET=your_jwt_secret_at_least_32_chars_long
```

### 4. Запустите сервисы

```bash
# Запуск всех сервисов в фоне
docker compose up -d

# Проверить статус контейнеров
docker compose ps

# Просмотр логов
docker compose logs -f
```

### 5. Откройте сервисы

После запуска (обычно 1-2 минуты) сервисы доступны по адресам:

| Сервис | URL | Описание |
|--------|-----|----------|
| **n8n** | http://localhost:5678 | Платформа автоматизации |
| **Supabase Studio** | http://localhost:3000 | Админ-панель Supabase |
| **API Gateway** | http://localhost:8000 | REST API, Auth, Storage |
| **PostgreSQL** | localhost:5432 | Прямое подключение к БД |

## ⚙️ Конфигурация

### Переменные окружения (.env)

Основные параметры настраиваются в файле `.env`:

```bash
# n8n
N8N_PORT=5678              # Порт n8n
N8N_USER=admin             # Логин для входа
N8N_PASSWORD=your_password # Пароль для входа

# PostgreSQL
DB_PORT=5432               # Порт PostgreSQL
DB_PASSWORD=your_password  # Пароль суперпользователя

# Supabase порты
SUPABASE_STUDIO_PORT=3000  # Supabase Studio
SUPABASE_AUTH_PORT=54321   # GoTrue (Auth)
SUPABASE_REST_PORT=54322   # PostgREST (REST API)
SUPABASE_REALTIME_PORT=54323 # Realtime
SUPABASE_STORAGE_PORT=54324  # Storage
SUPABASE_META_PORT=54325   # PG Meta
SUPABASE_KONG_PORT=8000    # API Gateway

# Безопасность
JWT_SECRET=your_jwt_secret_at_least_32_chars_long
SECRET_KEY_BASE=your_secret_key_base

# Организация
ORGANIZATION_NAME=My Organization
PROJECT_NAME=n8n-supabase
TIMEZONE=Europe/Moscow
```

### Подключение n8n к Supabase

В n8n создайте новое подключение к PostgreSQL с параметрами:

```
Host: supabase-db
Port: 5432
Database: supabase
User: postgres
Password: <из .env DB_PASSWORD>
```

### Подключение к PostgreSQL извне

Для подключения из внешних приложений (например, pgAdmin, DBeaver):

```
Host: localhost
Port: 5432
Database: supabase
User: postgres
Password: <из .env DB_PASSWORD>
```

## 📖 Использование

### Работа с Supabase Studio

1. Откройте http://localhost:3000
2. Войдите с учетными данными по умолчанию:
   - Email: `admin@admin.com`
   - Password: `admin`
3. Создайте таблицы, настройте аутентификацию, управляйте хранилищем

### Работа с n8n

1. Откройте http://localhost:5678
2. Войдите с учетными данными из `.env`
3. Создайте рабочие процессы (workflows)
4. Используйте ноду "PostgreSQL" для работы с базой данных

### REST API через Kong

Примеры запросов к API:

```bash
# Получить все записи из таблицы
curl -X GET "http://localhost:8000/rest/v1/your_table" \
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Вставить запись
curl -X POST "http://localhost:8000/rest/v1/your_table" \
  -H "apikey: <your-anon-key>" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "test", "value": 123}'
```

## 🔧 Полезные команды

### Управление сервисами

```bash
# Запустить все сервисы
docker compose up -d

# Остановить все сервисы
docker compose down

# Перезапустить конкретный сервис
docker compose restart n8n
docker compose restart supabase-db

# Обновить образы и перезапустить
docker compose pull
docker compose up -d

# Просмотр логов конкретного сервиса
docker compose logs -f n8n
docker compose logs -f supabase-db
docker compose logs -f supabase-studio
```

### Работа с базой данных

```bash
# Подключиться к PostgreSQL через psql
docker exec -it supabase-db psql -U postgres -d supabase

# Создать резервную копию
docker exec supabase-db pg_dump -U postgres supabase > backup.sql

# Восстановить из резервной копии
docker exec -i supabase-db psql -U postgres -d supabase < backup.sql

# Очистить базу данных (осторожно!)
docker exec -it supabase-db psql -U postgres -d supabase -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

### Мониторинг

```bash
# Статус всех контейнеров
docker compose ps

# Использование ресурсов
docker stats

# Просмотр логов в реальном времени
docker compose logs -f

# Проверить здоровье контейнеров
docker inspect --format='{{.State.Health.Status}}' supabase-db
```

### Очистка данных

```bash
# Удалить все контейнеры и volumes (все данные будут потеряны!)
docker compose down -v

# Удалить только неиспользуемые volumes
docker volume prune

# Полная очистка Docker
docker system prune -a --volumes
```

## 🐛 Решение проблем

### Сервисы не запускаются

```bash
# Проверить логи для диагностики
docker compose logs

# Пересоздать контейнеры
docker compose down
docker compose up -d --force-recreate

# Проверить занятость портов
lsof -i :5678
lsof -i :5432
lsof -i :3000
```

### n8n не может подключиться к базе данных

1. Убедитесь, что PostgreSQL запущен:
   ```bash
   docker compose ps supabase-db
   ```

2. Проверьте здоровье контейнера:
   ```bash
   docker inspect supabase-db | grep -A 10 "Health"
   ```

3. Перезапустите n8n:
   ```bash
   docker compose restart n8n
   ```

### Supabase Studio не открывается

1. Проверьте, что все зависимости запущены:
   ```bash
   docker compose ps
   ```

2. Проверьте логи Studio:
   ```bash
   docker compose logs supabase-studio
   ```

3. Перезапустите сервисы:
   ```bash
   docker compose restart supabase-studio supabase-meta
   ```

### Проблемы с памятью

Если Docker использует слишком много памяти:

1. Увеличьте лимиты в Docker Desktop:
   - Settings → Resources → Memory: 8 GB+

2. Остановите неиспользуемые сервисы:
   ```bash
   docker compose stop supabase-realtime
   ```

### Ошибка "Port already in use"

Измените порты в файле `.env`:

```bash
N8N_PORT=5679        # вместо 5678
DB_PORT=5433         # вместо 5432
SUPABASE_STUDIO_PORT=3001  # вместо 3000
```

## 📊 Мониторинг и логирование

### Просмотр логов

```bash
# Все сервисы
docker compose logs -f

# Конкретный сервис
docker compose logs -f n8n
docker compose logs -f supabase-db

# Последние 100 строк
docker compose logs --tail=100 n8n
```

### Производительность

```bash
# Использование ресурсов контейнерами
docker stats

# Детальная информация о контейнере
docker inspect n8n
```

## 🔄 Обновление

### Обновление до новых версий

```bash
# Остановить сервисы
docker compose down

# Загрузить новые образы
docker compose pull

# Запустить с новыми образами
docker compose up -d

# Проверить версии
docker compose ps
```

### Резервное копирование перед обновлением

```bash
# Создать бэкап базы данных
docker exec supabase-db pg_dump -U postgres supabase > backup_$(date +%Y%m%d).sql

# Создать бэкап данных n8n
docker run --rm -v n8n_supabase_n8n_data:/data -v $(pwd):/backup alpine tar czf /backup/n8n_backup_$(date +%Y%m%d).tar.gz /data
```

## 🔒 Безопасность

### Важные рекомендации

1. **Измените все пароли по умолчанию** в файле `.env`
2. **Используйте сложные пароли** (минимум 16 символов)
3. **Не коммитьте `.env` файл** в Git
4. **Регулярно обновляйте образы** Docker
5. **Ограничьте доступ** к портам через firewall

### Добавление в .gitignore

```gitignore
.env
volumes/db/data/
*.log
```

## 📚 Дополнительные ресурсы

- [Документация n8n](https://docs.n8n.io)
- [Документация Supabase](https://supabase.com/docs)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## 🤝 Вклад

Если вы нашли ошибку или хотите предложить улучшения:

1. Создайте issue с описанием проблемы
2. Предложите pull request с исправлениями
3. Убедитесь, что все тесты проходят

## 📄 Лицензия

Этот проект предоставляется "как есть" для образовательных и коммерческих целей.

- **n8n** — [Sustainable Use License](https://docs.n8n.io/license/)
- **Supabase** — [Apache License 2.0](https://github.com/supabase/supabase/blob/master/LICENSE)

## ⭐ Благодарности

- Команда [n8n](https://n8n.io) за отличную платформу автоматизации
- Команда [Supabase](https://supabase.com) за open-source backend-инфраструктуру
- Сообществу Docker за инструменты контейнеризации

---

**Примечание**: Этот проект предназначен для локальной разработки и тестирования. Для production-окружения рекомендуется использовать managed-сервисы или настроить дополнительную безопасность, мониторинг и резервное копирование.
