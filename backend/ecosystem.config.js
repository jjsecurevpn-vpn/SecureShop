module.exports = {
  apps: [{
    name: 'secureshop-backend',
    script: './dist/index.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production'
    },
    env_file: '.env',
    error_file: '~/.pm2/logs/secureshop-backend-error.log',
    out_file: '~/.pm2/logs/secureshop-backend-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '500M',
    autorestart: true,
    watch: false
  }]
};
