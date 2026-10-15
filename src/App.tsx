import { useState, useEffect, useRef } from 'react';
import {
  generateDockerCompose,
  generateEnvFile,
  generateRolesSql,
  generateKongYml,
  defaultConfig,
  ProjectConfig,
} from './data/configFiles';

// Code block component with syntax highlighting
function CodeBlock({ code, language, filename }: { code: string; language: string; filename: string }) {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      // @ts-ignore
      if (window.Prism) {
        // @ts-ignore
        window.Prism.highlightElement(codeRef.current);
      }
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-lg overflow-hidden border border-gray-700 bg-[#1e1e2e]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">{filename}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-gray-700 text-gray-300">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Скопировано
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Копировать
            </>
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed">
          <code ref={codeRef} className={`language-${language}`}>
            {code}
          </code>
        </pre>
      </div>
    </div>
  );
}

// Step component
function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 mb-6">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <div className="text-gray-300">{children}</div>
      </div>
    </div>
  );
}

// Config input component
function ConfigInput({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-[#1e1e2e] border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

function App() {
  const [config, setConfig] = useState<ProjectConfig>(defaultConfig);
  const [activeTab, setActiveTab] = useState<'files' | 'config' | 'guide'>('files');
  const [activeFile, setActiveFile] = useState<'docker-compose' | 'env' | 'roles' | 'kong'>('docker-compose');

  const updateConfig = (key: keyof ProjectConfig, value: string) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const files = {
    'docker-compose': {
      name: 'docker-compose.yml',
      language: 'yaml',
      description: 'Основной файл оркестрации Docker-контейнеров',
      content: generateDockerCompose(config),
    },
    env: {
      name: '.env',
      language: 'bash',
      description: 'Переменные окружения для всех сервисов',
      content: generateEnvFile(config),
    },
    roles: {
      name: 'volumes/db/roles.sql',
      language: 'sql',
      description: 'SQL-скрипт для создания ролей PostgreSQL',
      content: generateRolesSql(),
    },
    kong: {
      name: 'volumes/api/kong.yml',
      language: 'yaml',
      description: 'Конфигурация API-шлюза Kong',
      content: generateKongYml(config),
    },
  };

  const currentFile = files[activeFile];

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = () => {
    downloadFile('docker-compose.yml', files['docker-compose'].content);
    setTimeout(() => downloadFile('.env', files['env'].content), 200);
    setTimeout(() => downloadFile('roles.sql', files['roles'].content), 400);
    setTimeout(() => downloadFile('kong.yml', files['kong'].content), 600);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      {/* Header */}
      <header className="border-b border-gray-700/50 backdrop-blur-sm bg-black/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">n8n + Supabase</h1>
                <p className="text-xs text-gray-400">Docker Local Setup</p>
              </div>
            </div>
            <button
              onClick={downloadAll}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg text-sm font-medium hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Скачать все файлы
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Локальное развертывание{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              n8n + Supabase
            </span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Полный набор конфигурационных файлов для запуска стека автоматизации с базой данных через Docker Compose
          </p>
        </div>

        {/* Architecture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          <div className="p-5 rounded-xl bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                <span className="text-xl">⚡</span>
              </div>
              <h3 className="text-white font-semibold">n8n</h3>
            </div>
            <p className="text-sm text-gray-400">
              Платформа автоматизации рабочих процессов. Визуальный редактор, 350+ интеграций, webhook-и.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                <span className="text-xl">🗄️</span>
              </div>
              <h3 className="text-white font-semibold">Supabase</h3>
            </div>
            <p className="text-sm text-gray-400">
              PostgreSQL с REST API, аутентификацией, realtime-подписками и файловым хранилищем.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">🐳</span>
              </div>
              <h3 className="text-white font-semibold">Docker</h3>
            </div>
            <p className="text-sm text-gray-400">
              Все сервисы в контейнерах с оркестрацией через Docker Compose. Один запуск — всё работает.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#1e1e2e] rounded-xl p-1 border border-gray-700">
          <button
            onClick={() => setActiveTab('files')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'files'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📁 Файлы конфигурации
          </button>
          <button
            onClick={() => setActiveTab('config')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            ⚙️ Настройки
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            📖 Инструкция
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'files' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* File List */}
            <div className="lg:col-span-1">
              <div className="bg-[#1e1e2e] rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700 bg-[#181825]">
                  <h3 className="text-sm font-semibold text-gray-300">Файлы проекта</h3>
                </div>
                <div className="p-2">
                  {(Object.keys(files) as Array<keyof typeof files>).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveFile(key)}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all mb-1 ${
                        activeFile === key
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="font-mono text-xs">{files[key].name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{files[key].description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Ports */}
              <div className="mt-4 bg-[#1e1e2e] rounded-xl border border-gray-700 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-700 bg-[#181825]">
                  <h3 className="text-sm font-semibold text-gray-300">Порты сервисов</h3>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { name: 'n8n', port: config.n8nPort, color: 'bg-orange-400' },
                    { name: 'Supabase Studio', port: config.studioPort, color: 'bg-emerald-400' },
                    { name: 'API Gateway (Kong)', port: config.kongPort, color: 'bg-purple-400' },
                    { name: 'PostgreSQL', port: config.dbPort, color: 'bg-blue-400' },
                    { name: 'Auth (GoTrue)', port: config.authPort, color: 'bg-red-400' },
                    { name: 'REST API', port: config.restPort, color: 'bg-yellow-400' },
                    { name: 'Realtime', port: config.realtimePort, color: 'bg-pink-400' },
                    { name: 'Storage', port: config.storagePort, color: 'bg-cyan-400' },
                  ].map((service) => (
                    <div key={service.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${service.color}`}></div>
                        <span className="text-gray-400">{service.name}</span>
                      </div>
                      <span className="font-mono text-gray-300">:{service.port}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Code View */}
            <div className="lg:col-span-3">
              <CodeBlock
                code={currentFile.content}
                language={currentFile.language}
                filename={currentFile.name}
              />
              <div className="mt-3 flex justify-end">
                <button
                  onClick={() => downloadFile(currentFile.name, currentFile.content)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Скачать {currentFile.name}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1e1e2e] rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 bg-[#181825]">
                <h3 className="text-lg font-semibold text-white">Конфигурация проекта</h3>
                <p className="text-sm text-gray-400 mt-1">Настройте параметры перед генерацией файлов</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wide">n8n</h4>
                    <ConfigInput label="Порт n8n" value={config.n8nPort} onChange={(v) => updateConfig('n8nPort', v)} />
                    <ConfigInput label="Логин" value={config.n8nUser} onChange={(v) => updateConfig('n8nUser', v)} />
                    <ConfigInput label="Пароль" value={config.n8nPassword} onChange={(v) => updateConfig('n8nPassword', v)} type="password" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wide">База данных</h4>
                    <ConfigInput label="Порт PostgreSQL" value={config.dbPort} onChange={(v) => updateConfig('dbPort', v)} />
                    <ConfigInput label="Пароль БД" value={config.dbPassword} onChange={(v) => updateConfig('dbPassword', v)} type="password" />
                    <ConfigInput label="Часовой пояс" value={config.timezone} onChange={(v) => updateConfig('timezone', v)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wide">Supabase Порты</h4>
                    <ConfigInput label="Studio" value={config.studioPort} onChange={(v) => updateConfig('studioPort', v)} />
                    <ConfigInput label="Auth" value={config.authPort} onChange={(v) => updateConfig('authPort', v)} />
                    <ConfigInput label="REST API" value={config.restPort} onChange={(v) => updateConfig('restPort', v)} />
                    <ConfigInput label="Realtime" value={config.realtimePort} onChange={(v) => updateConfig('realtimePort', v)} />
                    <ConfigInput label="Storage" value={config.storagePort} onChange={(v) => updateConfig('storagePort', v)} />
                    <ConfigInput label="Kong (API Gateway)" value={config.kongPort} onChange={(v) => updateConfig('kongPort', v)} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-400 mb-3 uppercase tracking-wide">Организация</h4>
                    <ConfigInput label="Название организации" value={config.orgName} onChange={(v) => updateConfig('orgName', v)} />
                    <ConfigInput label="Название проекта" value={config.projectName} onChange={(v) => updateConfig('projectName', v)} />
                    <ConfigInput label="JWT Secret" value={config.jwtSecret} onChange={(v) => updateConfig('jwtSecret', v)} />
                    <ConfigInput label="Secret Key Base" value={config.secretKeyBase} onChange={(v) => updateConfig('secretKeyBase', v)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-[#1e1e2e] rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700 bg-[#181825]">
                <h3 className="text-lg font-semibold text-white">Пошаговая инструкция</h3>
                <p className="text-sm text-gray-400 mt-1">Как развернуть проект локально</p>
              </div>
              <div className="p-6">
                <Step number={1} title="Установите Docker и Docker Compose">
                  <p className="mb-3">Убедитесь, что Docker Desktop (или Docker Engine + Docker Compose) установлен:</p>
                  <CodeBlock
                    code={`# Проверить версию Docker
docker --version
docker compose version

# Если не установлен - скачать:
# macOS/Windows: https://www.docker.com/products/docker-desktop/
# Linux: https://docs.docker.com/engine/install/`}
                    language="bash"
                    filename="terminal"
                  />
                </Step>

                <Step number={2} title="Создайте структуру проекта">
                  <p className="mb-3">Создайте директорию и необходимые подпапки:</p>
                  <CodeBlock
                    code={`mkdir n8n-supabase && cd n8n-supabase
mkdir -p volumes/db volumes/api`}
                    language="bash"
                    filename="terminal"
                  />
                </Step>

                <Step number={3} title="Скопируйте файлы конфигурации">
                  <p className="mb-3">
                    Перейдите на вкладку <strong className="text-emerald-400">«Файлы конфигурации»</strong>, настройте параметры и скачайте все файлы.
                    Расположите их следующим образом:
                  </p>
                  <CodeBlock
                    code={`n8n-supabase/
├── docker-compose.yml
├── .env
└── volumes/
    ├── db/
    │   └── roles.sql
    └── api/
        └── kong.yml`}
                    language="text"
                    filename="structure"
                  />
                </Step>

                <Step number={4} title="Запустите сервисы">
                  <p className="mb-3">Из корневой директории проекта выполните:</p>
                  <CodeBlock
                    code={`# Запуск всех сервисов в фоне
docker compose up -d

# Проверить статус контейнеров
docker compose ps

# Просмотр логов (в реальном времени)
docker compose logs -f`}
                    language="bash"
                    filename="terminal"
                  />
                </Step>

                <Step number={5} title="Откройте сервисы">
                  <p className="mb-3">После запуска сервисы доступны по адресам:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { name: 'n8n', url: `http://localhost:${config.n8nPort}`, desc: 'Автоматизация' },
                      { name: 'Supabase Studio', url: `http://localhost:${config.studioPort}`, desc: 'Админ-панель БД' },
                      { name: 'API Gateway', url: `http://localhost:${config.kongPort}`, desc: 'REST/Realtime/Storage' },
                      { name: 'PostgreSQL', url: `localhost:${config.dbPort}`, desc: 'Прямое подключение' },
                    ].map((service) => (
                      <div key={service.name} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="font-semibold text-white text-sm">{service.name}</div>
                        <div className="text-xs text-emerald-400 font-mono mt-1">{service.url}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{service.desc}</div>
                      </div>
                    ))}
                  </div>
                </Step>

                <Step number={6} title="Подключите n8n к Supabase">
                  <p className="mb-3">В n8n настройте подключение к PostgreSQL:</p>
                  <div className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Host:</div>
                      <div className="text-white font-mono">supabase-db</div>
                      <div className="text-gray-400">Port:</div>
                      <div className="text-white font-mono">5432</div>
                      <div className="text-gray-400">Database:</div>
                      <div className="text-white font-mono">supabase</div>
                      <div className="text-gray-400">User:</div>
                      <div className="text-white font-mono">postgres</div>
                      <div className="text-gray-400">Password:</div>
                      <div className="text-white font-mono">{config.dbPassword}</div>
                    </div>
                  </div>
                </Step>

                <Step number={7} title="Полезные команды">
                  <CodeBlock
                    code={`# Остановить все сервисы
docker compose down

# Остановить и удалить данные (осторожно!)
docker compose down -v

# Перезапустить один сервис
docker compose restart n8n

# Обновить образы
docker compose pull
docker compose up -d

# Войти в контейнер
docker exec -it n8n sh
docker exec -it supabase-db psql -U postgres`}
                    language="bash"
                    filename="terminal"
                  />
                </Step>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-700/50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              n8n + Supabase Docker Setup Generator
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://docs.n8n.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                n8n Docs
              </a>
              <a
                href="https://supabase.com/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Supabase Docs
              </a>
              <a
                href="https://docs.docker.com/compose/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-emerald-400 transition-colors"
              >
                Docker Compose
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
