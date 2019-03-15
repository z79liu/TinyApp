//declaring and setting up the enviroment/ packages for the program

var express = require("express");
var cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');
var app = express();
app.use(cookieSession({
  name: 'session',
  keys: [''],
    // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

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


app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Test if the user cookie matches the current cookie, so that it
// only shows URLS that belong to that cookie. Passes the data to urls_index template
//

app.get("/urls", (req, res) => {
  var filtedList = {} ;
  for (shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl].userID == req.session.userId ){
      filtedList[shortUrl] = urlDatabase[shortUrl].longURL;
    }
  }
  let templateVars = { urls: filtedList,
    user: users[req.session.userId],
    error: "please login first"
  };
  res.render("urls_index", templateVars);
});

app.get("/about", (req, res) => {
  res.send("Welcome to Zeyu Liu's URL shortner");
});

//if user is not logged in / no cookie active it will be redirected
//to login

app.get("/urls/new", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect("/login") ;
  } else {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.userId]
  };
  res.render("urls_new", templateVars);
    }
});


app.get("/urls/:shortURL", (req, res) => {
  if (req.session.userId === undefined) {
    res.redirect("/login")
  } else {console.log('this is the Urldatabase after user adds', urlDatabase)
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId]
  };
  res.render("urls_show", templateVars);
}
});


//generate a random shortURL which will be stored in the Database

app.post("/urls", (req, res) => {
  var short = generateRandomString()
  urlDatabase[short] = {longURL: req.body.longURL, userID: req.session.userId};
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
  if (urlDatabase[shortURL].userID != req.session.userId) {
    res.status(403).send("This page does not belong to you")
    return
  }
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})


app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: req.session.userId}
  res.redirect("/urls");
});
app.get("/login", (req, res) => {
  let templateVars = { urls: urlDatabase,
    user: users[req.session.userId]
  };
  res.render("urls_login", templateVars);
});


//for the login button, if email does not exist, send erro 403 code
// if it does exist match the password/ email and then redirect to urls page
app.post("/login", (req, res) => {
  if (!dupEmail(req.body.email)) {
    res.status(403).send("This mail does not exist in the system");
  } else {
    for (userid in users){
      if (users[userid].email === req.body.email &&
        bcrypt.compareSync(req.body.password, users[userid].password)
        ){
          req.session.userId = userid
          console.log({userid})
          res.redirect("/urls")
      } else {
        res.status(403).send("This password does not match the email");
      }
    }
  }
});

//logout will clear the current active cookie
app.post("/logout", (req, res) => {
  req.session.userId = null;
  res.redirect("/urls")
});

//creates cookie when user first login and render the urls_register page
app.get("/register", (req, res) => {
  let templateVars = {user: users[req.session.userId],
                      error: undefined,
                     };
  res.render("urls_register", templateVars)
});

//helper function to check for dupliate emails
function dupEmail(emails){
  for (person in users){
    if (users[person].email === emails){
      return true
    }
  }
}

//post register request will check if email already exist and make sure the fields are inputed
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
    req.session.userId = userId;
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