function authorize(requiredLevel) {
  return function (req, res, next) {
    const user = req.body.user;
    const userLevel = 0;
    if (user) {
      userLevel = 1;
    }
    if (user && user.role === 'admin') {
      userLevel = 2;
    }

    if (userLevel >= requiredLevel) {
      next();
    } else {
      res.redirect('/auth');
    }
  };
}

module.exports = authorize;
