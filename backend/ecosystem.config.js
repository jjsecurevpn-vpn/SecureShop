module.exports = {
  apps: [
    {
      name: "secureshop-backend",
      script: "./dist/index.js",
      cwd: "/home/secureshop/secureshop-vpn/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        MP_ACCESS_TOKEN:
          "APP_USR-8757932973898001-081011-11b3d5038392a44bcbb684a733b5539d-222490274",
        MP_PUBLIC_KEY: "APP_USR-59bd1954-749b-43c7-9bfc-1c1a5e26a22d",
        MP_WEBHOOK_URL: "http://149.50.148.6/api/webhook",
        SERVEX_API_KEY:
          "sx_9c57423352279d267f4e93f3b14663c510c1c150fd788ceef393ece76a5f521c",
        SERVEX_BASE_URL: "https://servex.ws/api",
        DATABASE_PATH:
          "/home/secureshop/secureshop-vpn/backend/database/secureshop.db",
        CORS_ORIGIN: "https://shop.jhservices.com.ar",
        PORT: "4001",
        RATE_LIMIT_WINDOW_MS: "900000",
        RATE_LIMIT_MAX_REQUESTS: "100",
        SERVEX_TIMEOUT: "30000",
      },
      error_file: "~/.pm2/logs/secureshop-backend-error.log",
      out_file: "~/.pm2/logs/secureshop-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M",
      autorestart: true,
      watch: false,
    },
  ],
};
