const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_PORT = Number(process.env.PORT) || 3000;
const ROOT_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);

  if (reqUrl.pathname === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }));
    return;
  }

  const relativePath = reqUrl.pathname === '/' ? 'index.html' : reqUrl.pathname.replace(/^\/+/, '');
  const safePath = path.normalize(path.join(ROOT_DIR, relativePath));

  // 상위 디렉터리 접근 차단
  if (!safePath.startsWith(ROOT_DIR)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('403 Forbidden');
    return;
  }

  fs.readFile(safePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
      return;
    }

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
    });
    res.end(content);
  });
});

function startListening(port) {
  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`포트 ${port}번이 사용 중이어서 ${port + 1}번 포트로 재시도합니다...`);
      startListening(port + 1);
    } else {
      console.error('서버 시작 오류:', err);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log('====================================================');
    console.log(' 수출입 관세 & FTA 실효세율 비교기 로컬 서버 구동 완료');
    console.log(` 접속 주소: http://localhost:${port}`);
    console.log(' 종료하려면 Ctrl + C 를 누르세요.');
    console.log('====================================================');
  });
}

startListening(DEFAULT_PORT);
