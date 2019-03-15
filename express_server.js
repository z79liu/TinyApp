var express = require("express");
var cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');

var app = express();
var PORT = 8080; // default port 8080
app.set("view engine", "ejs")
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/urls", (req, res) => {
  console.log('cuurent cookie is',req.cookies.userId )
  var filtedList = {}
  for (shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID == req.cookies.userId ){
      filtedList[shortUrl] = urlDatabase[shortUrl].longURL;
      }
    }
  console.log('this is the urldatabase:', urlDatabase)
  console.log('this is filtlist:', filtedList)
  let templateVars = { urls: filtedList,
    user: users[req.cookies.userId],
    error: "please login first"
  };
  res.render("urls_index", templateVars);
});

app.get("/about", (req, res) => {
  res.send("Welcome to Zeyu Liu's URL shortner");
});


app.get("/urls/new", (req, res) => {
  if (req.cookies.userId === undefined) {
    res.redirect("/login")
  } else {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies.userId]
  };
  res.render("urls_new", templateVars);
}
});
app.get("/urls/:shortURL", (req, res) => {
  if (req.cookies.userId === undefined) {
    res.redirect("/login")
  } else {console.log('this is the Urldatabase after user adds', urlDatabase)
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.cookies.userId]
  };
  res.render("urls_show", templateVars);
}
});
// const urlDatabase = {
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
// };
app.post("/urls", (req, res) => {
  var short = generateRandomString()
  urlDatabase[short] = {longURL: req.body.longURL, userID: req.cookies.userId};
   // Log the POST request body to the console
  res.redirect(`/urls/${short}`);         // Respond with 'Ok' (we will replace this)
});
//takes user to the actual long URL from the shortURl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});
//added delete button and redirect user back to the home page
app.post("/urls/:shortURL/delete",(req, res) =>{
  const shortURL = req.params.shortURL
  if (urlDatabase[shortURL].userID != req.cookies.userId) {
    res.status(403).send("This page does not belong to you")
    return
  }
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.cookies.userId}
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.cookies.userId]
  };
  res.render("urls_login", templateVars);
});
//for the login button
app.post("/login", (req, res) => {
  if (!dupEmail(req.body.email)) {
    res.status(403).send("This mail does not exist in the system");
  } else {
    for (userid in users){
      if (users[userid].email === req.body.email &&
        bcrypt.compareSync(req.body.password, users[userid].password)
        ){
          res.cookie("userId",userid)
          res.redirect("/urls")
      }
    }
    res.status(403).send("This password does not match the email");
  }
});
app.post("/logout", (req, res) => {
  res.clearCookie("userId",req.cookies.userId);
  res.redirect("/urls")
});
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.cookies.userId],
                      error: undefined,
                     };
  res.render("urls_register", templateVars)
});
function dupEmail(emails){
  for (person in users){
    if (users[person].email === emails){
      return true
    }
  }
}
app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password ) {
    res.render("urls_register",{ error: 'Please fill in all input fields'})
  } else if (dupEmail(req.body.email)){
    res.render("urls_register",{error: 'That email already exist'})
  } else {
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    var userId = generateRandomString()
    let templateVars = { id: userId,
      email: req.body.email,
      password: hashedPassword
    };
    users[userId] = templateVars
    res.cookie("userId",userId);
    res.redirect("/urls")
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}