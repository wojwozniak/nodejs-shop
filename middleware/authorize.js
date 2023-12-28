function authorize(requiredLevel) {
  return function (req, res, next) {
    const user = req.session.user;
    let userLevel = 0;
    if (user) {
      userLevel = 1;
    }
    if (user && user.role === 'admin') {
      userLevel = 2;
    }

    if (userLevel >= requiredLevel) {
      console.log("User has level " + userLevel + " and is authorized.");
      next();
    } else {
      console.log("User has level " + userLevel + " and is not authorized. - redirecting to /auth");
      res.redirect('/auth');
    }
  };
}

module.exports = authorize;
