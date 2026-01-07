import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from "hono/logger";
import { secureHeaders } from 'hono/secure-headers';
import { prettyJSON } from 'hono/pretty-json';
import { connectDB } from './db/db';
// import authRouter from './routes/auth';
import ridesRouter from './routes/rides';
import uiRouter from './routes/embed_ui';

import { serveStatic } from 'hono/bun';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', prettyJSON());
app.use('/ui/*', serveStatic({ root: './src/view', rewriteRequestPath: (path) => path.replace(/^\/ui/, '') }));

// app.route('/auth', authRouter);
app.route('/rides', ridesRouter);
app.route('/ui2', uiRouter);

app.get('/', (c) => c.text('Taxi Booking API'));

connectDB().then(() => {
  const port = Number(process.env.PORT) || 8000;
  console.log(`Server running on http://localhost:${port}`);
});

export default app;