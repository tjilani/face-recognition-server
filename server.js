const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");
const knex = require("knex");
const register = require('./controllers/register');
const signin = require('./controllers/signin');
const profile = require('./controllers/profile');
const image = require('./controllers/image');

const postgresDB = knex({
  client: "pg",
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: true,
  }
});

/*
  /                  --> res: this is working
  /signin            --> POST: sucess/fail
  /register          --> POST: user
  /profile:userId    --> GET: user
  /image             --> PUT: user

*/


// postgresDB.select('*').from('users').then(data => {
//   console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send('it is working!');
});

app.post("/signin", signin.handleSignin(postgresDB, bcrypt));

app.post("/register", register.handleRegister(postgresDB, bcrypt));

app.get("/profile/:id", profile.handleProfileGET(postgresDB));

app.put("/image", image.handleImage(postgresDB));

app.listen(process.env.PORT || 3001, () => {
  console.log("App is running on Port 3001");
})