const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

exports.checkSession = (req,res,next) => {
    if (req.session.email) {
        next();
    } else {
        req.session.url = req.url;
        console.error("session expired");
        res.redirect("/login");
    }
}