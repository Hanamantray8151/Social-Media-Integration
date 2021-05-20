const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://admin-hanamantray:Test-123@cluster0.8ric1.mongodb.net/fbuserDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:true
});

var fbuserSchema = new mongoose.Schema({
    uid: String,
    email: String,
    name: String,
    fname: String,
    pic: String
});
var guserSchema = new mongoose.Schema({
    uid: String,
    email: String,
    name: String,
    fname: String,
    pic: String
});
module.exports = mongoose.model('FbUser', fbuserSchema);
module.exports = mongoose.model('GUser',guserSchema);