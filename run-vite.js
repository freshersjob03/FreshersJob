import { createServer } from 'vite';

async function main() {
  try {
    console.log('creating server...');
    const server = await createServer({
      configFile: './vite.config.js',
      logLevel: 'info'
    });
    console.log('server created, listening...');
    await server.listen();
    console.log('listening on port', server.config.server.port);
  } catch (err) {
    console.error('caught error', err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

main();
