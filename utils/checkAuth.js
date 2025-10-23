import jwt from 'jsonwebtoken';

export default (req, res, next) => {
  const token = (req.headers.authorization || '').replace(/Bearer\s?/, ''); //вернуть токин или пустую строку, и удалить слово, заменить на пустое

  if (token) {
    try {
      const decoded = jwt.verify(token, 'secret123'); //расшифровка токина

      req.userId = decoded._id;
      next(); //выполняй следующую функцию

    } catch (error) {
      return res.status(403).json({
        message: 'Нет доступа',
      });
    }
  } else {
    return res.status(403).json({
      message: 'Нет доступа',
    });
  }
};
