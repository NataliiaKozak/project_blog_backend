import PostModel from '../models/Post.js';

//create post
export const create = async (req, res) => {
  try {
    const doc = new PostModel({
      title: req.body.title,
      text: req.body.text,
      tags: req.body.tags,
      imageUrl: req.body.imageUrl,
      user: req.userId,
    });

    const post = await doc.save();
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось создать статью',
    });
  }
};

//get all posts
export const getAll = async (req, res) => {
  try {
    // const post = await PostModel.find().populate('user').exec();
    const post = await PostModel.find().populate({
      path: 'user',
      select: ['fullName', 'avatarUrl'],
    }); //как передать туда только то что нужно, а не всю инфу из БД про всех авторов статей, включая email, хеши паролей, дату регистрации
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статьи',
    });
  }
};

//get one post
export const getOne = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findByIdAndUpdate(
      { _id: postId },
      { $inc: { viewsCount: 1 } },
      { returnDocument: 'after' }
      //   (err, doc) => {
      //     if (err) {
      //       console.log(err);
      //       return res.status(500).json({
      //         message: 'Не удалось вернуть статью',
      //       });
    ).populate('user');

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json(doc);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось получить статью',
    });
  }
};

//delete post
export const remote = async (req, res) => {
  try {
    const postId = req.params.id;

    const doc = await PostModel.findOneAndDelete({ _id: postId });
    // (err, doc) => {
    //   if (err) {
    //     console.log(err);
    //     return res.status(500).json({
    //       message: 'Не удалось удалить статью',
    //     });
    //   }Mongoose 8 больше не принимает колбэки у findOneAndDelete

    if (!doc) {
      return res.status(404).json({
        message: 'Статья не найдена',
      });
    }

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось удалить статью',
    });
  }
};

//update
export const update = async (req, res) => {
  try {
    const postId = req.params.id;
    const doc = await PostModel.updateOne(
      { _id: postId },
      {
        title: req.body.title,
        text: req.body.text,
        tags: req.body.tags,
        imageUrl: req.body.imageUrl,
        user: req.userId,
      }
    );

    res.json({
      success: true,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'Не удалось обновить статью',
    });
  }
};
