// PM2-конфиг сервера Simba (Fastify).
// Запуск: pm2 start deploy/ecosystem.config.js
// Переменные окружения читаются из server/.env (dotenv в приложении).
module.exports = {
  apps: [
    {
      name: 'simba-server',
      cwd: './server',
      script: 'dist/index.js',
      // Node 20+ грузит server/.env сам (в приложении нет dotenv).
      node_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      max_memory_restart: '400M',
      autorestart: true,
    },
  ],
}
