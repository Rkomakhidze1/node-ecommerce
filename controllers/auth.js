const bcrypt = require('bcryptjs');

const User = require('../models/user');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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',
    },
  })
);

exports.getLogin = async (req, res, next) => {
  try {
    res.render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
    });
  } catch (e) {
    console.log(e);
  }
};

exports.getSignup = (req, res, next) => {
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
  });
};

exports.postLogout = async (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};

exports.postSignup = async (req, res, next) => {
  try {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;
    const user = await User.findOne({ where: { email } });
    if (user) {
      return res.redirect('/signup');
    }
    await User.create({
      email,
      name,
      password: await bcrypt.hash(password, 12),
    });
    await transporter.sendMail({
      to: email,
      from: 'rezokomakhidze1@gmail.com',
      subject: 'Welcome',
      html: '<h1>you have signed up successfully</h1>',
    });
    res.redirect('/login');
  } catch (e) {
    console.log(e);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const password = req.body.password;
    const email = req.body.email;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.redirect('/login');
    }
    const doMatch = await bcrypt.compare(password, user.password);
    if (!doMatch) {
      return res.redirect('/login');
    }
    req.session.user = user;
    req.session.isLoggedIn = true;
    return req.session.save(() => {
      return res.redirect('/');
    });
  } catch (e) {
    console.log(e);
  }
};
