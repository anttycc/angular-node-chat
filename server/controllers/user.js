const UserModel = require('../models/user');
const { validatePassword, generatePassword, getPasswordHash, titleCase } = require('../helper/password');

module.exports = {
  createUser: async (req, res, next) => {
    try {
      const body = req.body;
      let user = await UserModel.findOne({ email: body.email });
      if (!user) {
        body.password = getPasswordHash(body.password);
        body.firstname = titleCase(body.firstname);
        body.lastname = titleCase(body.lastname);
        user = await UserModel.create(body);
        res.status(200).json({ status: true });
      } else {
        throw { statusCode: 409, message: 'User already exist.' }
      }
    } catch (e) {
      next(e);
    }

  },
  login: async (req, res, next) => {
    try {
      const body = req.body;
      let user = await UserModel.findOne({ email: body.email });
      if (user && validatePassword(user.password.toString(), body.password)) {
        res.status(200).json(user);
      } else {
        throw { statusCode: 404, message: 'User not found.' }
      }
    } catch (e) {
      next(e);
    }
  }
}