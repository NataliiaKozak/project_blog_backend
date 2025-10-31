import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import {
  registerValidation,
  loginValidation,
  postCreateValidation,
} from './validations.js';
import {UserController, PostController}  from './controllers/index.js';
import {handleValidationErrors, checkAuth} from './utils/index.js';

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

//хранилище
const storage = multer.diskStorage({
  // destination: (_, _, cb) => {
  //   cb(null, 'uploads'); //функция обьясняет, какой использовать путь
  // },
  destination: (_req, _file, cb) => {
    cb(null, 'uploads');
  },

  filename: (_, file, cb) => {
    cb(null, file.originalname); //брать оригинальное название файла
  },
});

const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static('uploads')); //есть ли в этой папке то, что передается/ get-запрос на получение статичного файла

app.post(
  '/auth/login',
  loginValidation,
  handleValidationErrors,
  UserController.login
); //если есть валидационные ошибки, то парсим их
app.post(
  '/auth/register',
  registerValidation,
  handleValidationErrors,
  UserController.register
);
app.get('/auth/me', checkAuth, UserController.getMe);

app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`,
  });
});
//из комментариев
// app.post('/upload', checkAuth, upload.single('image'), (req, res) =>{
//     res.json({
//     url: ('/uploads/' + req.file.originalname),

//upload.single('image') - middleware
//проверка
// app.post('/upload', upload.single('image'), (req, res) => {
//   if (!req.file) return res.status(400).json({ message: 'Файл не загружен' });
//   res.json({ url: `/uploads/${req.file.originalname}` });
// });

app.get('/posts', PostController.getAll);
app.get('/posts/:id', PostController.getOne);
app.post(
  '/posts',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.create
);
app.delete('/posts/:id', checkAuth, PostController.remote);
app.patch(
  '/posts/:id',
  checkAuth,
  postCreateValidation,
  handleValidationErrors,
  PostController.update
);

app.listen(PORT, (err) => {
  if (err) {
    return console.log(err);
  }

  console.log('Server OK');
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
