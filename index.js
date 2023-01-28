const express = require("express");
require("dotenv").config();

const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const { connection } = require("./Config/db");
const { UserModel } = require("./Models/Users.model");
const { auth } = require("./Middleware/authentication");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.get("/", async (req, res) => {
  let userData = [];
  const data = await UserModel.find();
  userData.push({ data });
  res.send(userData);
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  const userAccount = await UserModel.findOne({ email });
  if (userAccount?.email) {
    res.send("Try Login, Account already exist");
  } else {
    try {
      bcrypt.hash(password, 8, async function (e, hash) {
        const userAccount = new UserModel({ email, password: hash });
        await userAccount.save();
        res.send("Signup Successfull");
      });
    } catch (error) {
      console.log(error);
      res.send("Something went wrong, please try again later");
    }
  }
});

app.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await UserModel.find({ email });

    if (users.length > 0) {
      const userPassword = users[0].password;
      bcrypt.compare(password, userPassword, function (error, login) {
        if (login) {
          const token = jwt.sign({ userID: userPassword[0]._id }, "shhhhh");
          res.send({ message: "Login Successfull", "token": token });
        } else {
          res.send("Login failed, please insert correct password");
        }
      });
    } else {
      res.send("Login failed, please insert correct password");
    }
  } catch (error) {
    console.log(error);
    res.send("Something went wrong, please try again later");
  }
});

app.get("/logout", (req, res) => {
  res.send("Logout successfully");
});

app.use(auth);

const userData = {
  name: "",
  age: "",
  height: "",
  weight: "",
};

app.get("/getProfile", async (req, res) => {
//   userData = req.body.userData;
  res.json(userData);
});

app.get("/user", async (req, res) => {
  try {
    const user = await UserModel.findById(req.user.userID);
    if (!user) throw new Error("user is not exists");
    user.password = undefined;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      success: false,
      message: err.message,
    });
  }
});

const bmiCalculator = {};

app.get("/bmiCalculator", (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.sign(token, "shhhhh");
  const bmidata = bmiCalculator[decoded.email] || [];
  res.send({ bmidata });
  res.sendFile(__dirname + "/index.html");
});

app.post("/bmiDetails", (req, res) => {
  const { height, weight } = req.body;
  const heightMtr = 0.3048 * height;
  const bmi = weight / (heightMtr * heightMtr);
  const token = req.headers.authorization.split(" ")[1];
  const decoded = jwt.sign(token, "shhhhh");
  if (!bmiCalculator[decoded.email]) {
    bmiCalculator[decoded.email] = [];
  }
  bmiCalculator[decoded.email].push(bmi);
  res.send({ bmi });
});

app.post("/bmiCalculator", (req, res) => {
  height = parseFloat(req.body.Height);
  weight = parseFloat(req.body.Weight);
  bmi = weight / (height * height);
  bmi = bmi.toFixed();
  req_name = req.body.Name;
  res.send(`${req_name} your BMI is ${bmi} `);
});

app.listen(process.env.PORT, async () => {
  try {
    await connection;
    console.log("Connected to DB Successfully");
  } catch (err) {
    console.log(err);
    console.log("Error connecting to DB");
  }
  console.log(`Listening on PORT http://localhost:${process.env.PORT}`);
});
