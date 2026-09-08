module.exports = {
  apps: [
    {
      name: 'chatbotwpp-vm',
      script: 'src/index.js',
      cwd: __dirname,
      autorestart: true,
      watch: false,
      max_memory_restart: '600M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
