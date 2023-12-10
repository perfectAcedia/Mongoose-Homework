import User from "../models/user.model.js";
import Article from "../models/article.model.js";

export const getUsers = async (req, res, next) => {
  try {
    const { sortBy = "age", sortOrder = 1 } = req.query;

    const query = await User.aggregate([
      { $sort: { [sortBy]: +sortOrder } },
      { $project: { _id: 1, fullName: 1, email: 1, age: 1 } },
    ]);

    console.log(query);

    res.json(query);
  } catch (err) {
    next(err);
  }
};

export const getUserByIdWithArticles = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const articles = await Article.find({ owner: userId });

    const simplifiedArticles = articles.map((article) => ({
      title: article.title,
      subtitle: article.subtitle,
      createdDate: article.createdAt,
    }));

    const userWithArticles = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      articles: simplifiedArticles,
    };

    res.json(userWithArticles);
  } catch (err) {
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, age } = req.body;

    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.age = req.body.age || user.age;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (err) {
    next(err);
  }
};

export const deleteUserById = async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Article.deleteMany({ owner: userId });

    await User.findByIdAndDelete(userId);

    res
      .status(200)
      .json({ message: "User and associated articles deleted successfully." });
  } catch (err) {
    next(err);
  }
};
