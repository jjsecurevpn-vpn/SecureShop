module.exports = {
  apps: [
    {
      name: "secureshop-backend",
      script: "./dist/index.js",
      cwd: "/home/secureshop/secureshop-vpn/backend",
      instances: 1,
      exec_mode: "fork",
      listen_timeout: 10000,
      kill_timeout: 5000,
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
        // Email Configuration
        SMTP_HOST: "smtp.gmail.com",
        SMTP_PORT: "587",
        EMAIL_USER: "jjsecurevpn@gmail.com",
        EMAIL_PASS: "nnbupqttsrzators",
        // Supabase Configuration
        SUPABASE_URL: "https://yvxtlepjcpogiqgrzlpx.supabase.co",
        SUPABASE_SERVICE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl2eHRsZXBqY3BvZ2lxZ3J6bHB4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTc0ODk1MywiZXhwIjoyMDgxMzI0OTUzfQ.75iW23-u5jfDi4XtIjorzS6Kve7p2uhSySP81dmW7Y8",
      },
      error_file: "~/.pm2/logs/secureshop-backend-error.log",
      out_file: "~/.pm2/logs/secureshop-backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      max_memory_restart: "500M",
      max_size: "50M",
      max_restarts: 5,
      min_uptime: "30s",
      autorestart: true,
      watch: false,
      force_kill: true,
      shutdown_with_message: true,
    },
  ],
};
