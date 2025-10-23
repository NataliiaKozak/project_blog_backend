import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import UserModel from '../models/User.js';

//REGISTER
export const register = async (req, res) => {
  try {
    const errors = validationResult(req); //все вытащить из запроса
    if (!errors.isEmpty()) {
      return res.status(400).json(errors.array());
    }

    //получаем пароль и хешируем
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    //чтобы создать пользователя, готовим док
    const doc = new UserModel({
      fullName: req.body.fullName,
      email: req.body.email,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    //создаем пользователя
    const user = await doc.save(); //документ сохранить в БД

    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc; //вытащим свойство хеш, но использовать его не будем

    res.json({
      ...userData,
      token,
    }); //вернуть информацию о пользователе и токин
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось зарегистрироваться',
    });
  }
};

//LOGIN
export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден', // лучше писать недетально: неверный логин или пароль
      });
    }

    const isValidPass = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    ); //сходятся ли

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль',
      });
    }

    //если пользователь нашелся, пароль корректный, то он смог авторизоваться. создаем новый токин
    const token = jwt.sign(
      {
        _id: user._id,
      },
      'secret123',
      {
        expiresIn: '30d',
      }
    );

    const { passwordHash, ...userData } = user._doc; //вытащим свойство хеш, но использовать его не будем

    res.json({
      ...userData,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось авторизоваться',
    });
  }
};

//ABOUT ME. получить инфо о пользователе: авторизован или нет
export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const { passwordHash, ...userData } = user._doc; //вытащим свойство хеш, но использовать его не будем

    res.json(userData);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Нет доступа',
    });
  }
};
