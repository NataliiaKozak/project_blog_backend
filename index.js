import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations.js';
import checkAuth from './utils/checkAuth.js';
import * as UserController from './controllers/UserController.js';
import * as PostController from './controllers/PostController.js';

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI не задан в .env');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('DB ok'))
  .catch((err) => console.log('DB error', err));

const app = express();

app.use(express.json());

app.post('/auth/login', loginValidation, UserController.login);
app.post('/auth/register', registerValidation, UserController.register);
app.get('/auth/me', checkAuth, UserController.getMe);

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post('/posts', checkAuth, postCreateValidation, PostController.create);
// app.delete('/posts', PostController.remote);
// app.patch('/posts', PostController.update);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK on port ${PORT}');
});

// Логирует метод/путь/Content-Type
// app.use((req, res, next) => {
//   console.log(`[REQ] ${req.method} ${req.url} ct=${req.headers['content-type'] || '-'}`);
//   next();
// });

// // Сохраняем «сырое» тело, чтобы увидеть, что именно пришло
// const saveRawBody = (req, res, buf, encoding) => {
//   if (buf && buf.length) {
//     req.rawBody = buf.toString(encoding || 'utf8');
//   }
// };

// // Парсер JSON с verify-хуком
// app.use(express.json({ verify: saveRawBody }));

// // Дружелюбный обработчик ошибок JSON-парсинга
// app.use((err, req, res, next) => {
//   if (err?.type === 'entity.parse.failed') {
//     console.error(
//       `[JSON ERROR] ${req.method} ${req.url}\n` +
//       `Raw body: ${req.rawBody ?? '<empty>'}`
//     );
//     return res.status(400).json({
//       message: 'Некорректный JSON в теле запроса. Проверь запятые/кавычки и Content-Type: application/json',
//     });
//   }
//   next(err);
// });
