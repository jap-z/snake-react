module.exports = {
  apps: [
    {
      name: "snake-react",
      script: "npm",
      args: "start",
      cwd: "/home/ubuntu/.openclaw/workspace/projects/snake-react",
      watch: false,
      env: {
        NODE_ENV: "development",
        PORT: 3000,
        WDS_SOCKET_PATH: "/snake/ws",
        BROWSER: "none"
      }
    }
  ]
};
