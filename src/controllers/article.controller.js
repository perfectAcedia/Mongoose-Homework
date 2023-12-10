import Article from "../models/article.model.js";
import User from "../models/user.model.js";

export const getArticles = async (req, res, next) => {
  try {
    const { title, page = 1, limit = 10 } = req.query;

    const titleQuery = title ? { title: { $regex: title, $options: "i" } } : {};

    const articles = await Article.find(titleQuery)
      .populate({
        path: "owner",
        select: "fullName email age",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json(articles);
  } catch (err) {
    console.log(err);;
  }
};

export const getArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.status(200).json(article);
  } catch (err) {
    next(err);
  }
};

export const createArticle = async (req, res, next) => {
  try {
    const owner = await User.findById(req.body.owner);

    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const article = new Article({
      title: req.body.title,
      subtitle: req.body.subtitle,
      description: req.body.description,
      owner: req.body.owner,
      category: req.body.category,
    });

    const savedArticle = await article.save();

    owner.numberOfArticles += 1;
    await owner.save();

    res.status(201).json(savedArticle);
  } catch (err) {
    next(err);
  }
};

export const updateArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.id;
    const { title, subtitle, description, category } = req.body;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }

    const owner = await User.findById(article.owner);
    if (!owner) {
      return res.status(404).json({ error: "Owner not found" });
    }

    const loggedInUserId = req.headers.userid;

    if (owner._id.toString() !== loggedInUserId) {
      return res
        .status(403)
        .json({
          error: "Permission denied. Only the owner can update the article.",
        });
    }

    article.title = title || article.title;
    article.subtitle = subtitle || article.subtitle;
    article.description = description || article.description;
    article.category = category || article.category;
    article.updatedAt = Date.now();

    const updatedArticle = await article.save();

    res.status(200).json(updatedArticle);
  } catch (err) {
    next(err);
  }
};

export const deleteArticleById = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const owner = await User.findById(article.owner);
    if (!owner) {
      return res.status(404).json({ error: 'Owner not found' });
    }


    const loggedInUserId = req.headers.userid;

    if (owner._id.toString() !== loggedInUserId) {
      return res.status(403).json({ error: 'Permission denied. Only the owner can delete the article.' });
    }

    owner.numberOfArticles -= 1;
    await owner.save();

    await Article.findByIdAndDelete(articleId);

    res.status(200).json({ message: 'Article deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
