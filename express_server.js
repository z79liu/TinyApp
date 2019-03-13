var express = require("express");
var cookieParser = require('cookie-parser')


var app = express();

var PORT = 8080; // default port 8080




app.set("view engine", "ejs")


var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};



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
  let templateVars = { urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_index", templateVars);
});

app.get("/about", (req, res) => {
  res.send("Welcome to Zeyu Liu's URL shortner");
});

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase,
    username: req.cookies.username
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies.username
  };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  var short = generateRandomString()
  urlDatabase[short] = req.body.longURL;  // Log the POST request body to the console
  res.redirect(`/urls/${short}`);         // Respond with 'Ok' (we will replace this)
});

//takes user to the actual long URL from the shortURl
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

//added delete button and redirect user back to the home page
app.post("/urls/:shortURL/delete",(req, res) =>{
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls")
})

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  urlDatabase[shortURL] = req.body.longURL
  res.redirect("/urls");
});

//for the login button
app.post("/login", (req, res) => {
  const user = req.body.username
  res.cookie("username",user);
  res.redirect("/urls")
});

app.post("/logout", (req, res) => {
  const user = req.body.username
  res.clearCookie("username",user);
  res.redirect("/urls")
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