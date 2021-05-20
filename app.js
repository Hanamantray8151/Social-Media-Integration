require('dotenv').config();
const express = require('express');
const app = express();

const passport = require('passport');
const cookieParser = require('cookie-parser');
const googleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const GUser = require('./models/FbUser');
const FbUser = require('./models/FbUser');
const facebookStrategy = require('passport-facebook').Strategy;

app.set("view engine", "ejs");
app.use(session({ secret: 'ilovescotchscotchyscotchscotch', resave: true, saveUninitialized: true }));
app.use(express.static("public"));
app.use(passport.initialize());
app.use(passport.session());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.render("index");
});
// Facebook Strategy
passport.use(new facebookStrategy({
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: process.env.FACEBOOK_CALLBACK_URL,
    profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)', 'email']
},
    function (token, refreshToken, profile, done) {
        console.log(profile);
        process.nextTick(function () {
            FbUser.findOne({ 'uid': profile.id }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    console.log("user found");
                    return done(null, user);
                } else {
                    var newUser = new FbUser();

                    newUser.uid = profile.id;
                    newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.email = profile.emails[0].value;
                    newUser.pic = profile.photos[0].value;
                    newUser.fname = profile._json.first_name;
                    newUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }

            });

        })

    }));

app.get('/fprofile', isLoggedIn, function (req, res) {
    console.log(req.user);
    res.render('fprofile', {
        user: req.user
    });
});

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    GUser.findById(id, function (err, user) {
        done(err, user);
    });
});


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/');
}

app.get('/facebook', passport.authenticate('facebook', { scope: 'email' }));

app.get('/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/fprofile',
        failureRedirect: '/'
    }));

//Google Strategy
passport.use(new googleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback:true
},
    function (request, accessToken, refreshToken, profile, done) {
        console.log(profile);
        process.nextTick(function () {
            GUser.findOne({ 'uid': profile.id }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    console.log("user found");
                    return done(null, user);
                } else {
                    var newGUser = new GUser();
                    newGUser.uid = profile.id;
                    newGUser.name = profile.displayName;
                    newGUser.email = profile.emails[0].value;
                    newGUser.pic = profile.picture;
                    newGUser.fname = profile.given_name;
                    newGUser.save(function (err) {
                        if (err)
                            throw err;
                        return done(null, newGUser);
                    });
                }

            });

        })
    }
));

app.get('/gprofile', isloggedIn, (req, res) => {
    console.log(req.user);
    res.render('gprofile', {
        user: req.user
    });
});

function isloggedIn(req, res, next) {
    if (req.isAuthenticated)
        return next();
    res.redirect("/");
}

app.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/google/callback',
    passport.authenticate('google', { failureRedirect: "/" }),
    function (req, res) {
        res.redirect("/gprofile");
    });


//Common Logout to both Facebook And Google
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, function () {
    console.log("App is listening on 3000");
});