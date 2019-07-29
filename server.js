const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt-nodejs");
const cors = require("cors");

const knex = require("knex");

const postgresDB = knex({
  client: "pg",
  connection: {
    host: "127.0.0.1",
    user: "postgres",
    password: "bling",
    database: "smartbrain"
  }
});

// postgresDB.select('*').from('users').then(data => {
//     console.log(data);
// });

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  postgresDB
    .select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then(data => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return postgresDB
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then(user => {
            console.log(user);
            res.json(user[0]);
          })
          .catch(err => res.status(400).json("unable to get user"));
      } else {
        res.status(400).json("wrong password");
      }
    })
    .catch(err => res.status(400).json("wrong credentials"));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  const hash = bcrypt.hashSync(password, null);

  postgresDB
    .transaction(trx => {
      trx
        .insert({
          hash: hash,
          email: email
        })
        .into("login")
        .returning("email")
        .then(loginEmail => {
          return trx("users")
            .returning("*")
            .insert({
              email: loginEmail[0],
              name: name,
              joined: new Date()
            })
            .then(user => {
              res.json(user);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
    .catch(err => res.status(400).json("unable to register"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;

  postgresDB
    .select("*")
    .from("users")
    .where({ id })
    .then(user => {
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(400).json("error getting user");
      }
    });
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  postgresDB("users")
    .where("id", "=", id)
    .increment("entries", 1)
    .returning("entries")
    .then(entries => {
      res.json(entries[0]);
    })
    .catch(err => res.status(400).json("unable to get entries"));
});

app.listen(3001, () => {
  console.log("App is running on Port 3001");
});
