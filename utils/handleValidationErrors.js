import { validationResult } from 'express-validator';

export default (req, res, next) => {
  const errors = validationResult(req); //все вытащить из запроса
  //если валидация не прошла
  if (!errors.isEmpty()) {
    return res.status(400).json(errors.array());
  }

  next();
};
