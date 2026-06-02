const mysql = require("mysql2");
const express = require("express");
const app = express();
const ejsMate = require("ejs-mate");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const PORT = 8080;


//midleware
app.set("View engine", "ejs");
app.set("views", path.join(__dirname, "Views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "/public")));
app.engine("ejs", ejsMate);
app.use(
  session({
    secret: "OnroadFuelSecretCode",
    resave: false,
    saveUninitialized: true,
  })
);
app.use(flash());

// Middleware to expose flash messages as res.locals
app.use((req, res, next) => {
  res.locals.success = req.flash("Success");
  res.locals.error = req.flash("Error");
  next();
});

require("dotenv").config();

//connection
const connection = mysql.createConnection({
  host    : env.DB_HOST,
  user    : env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
});
connection.connect((err) => {
  if (err) {
    console.error("Error connecting: " + err.message);
    return;
  }
  console.log("Connected to MySQL Database");
});

app.get("/login", (req, res) => {
  req.flash("Success", ["Welcome to Onroad Fuel"]);
  res.render("./userPage/login.ejs");
});

app.get("/signup", (req, res) => {
  res.render("./userPage/signup.ejs");
});

app.post("/signup", (req, res) => {
  const { name, username, email, mobno, password, cfpass } = req.body;
  let mysmt = "select * from fuelusers where email=?";
  connection.query(mysmt, [email], (err, result) => {
    if (result.length == 1) {
      req.flash("Error", "your already register please login..");
      res.redirect("/login");
    } else {
      let mysmt =
        "INSERT INTO FUELUSERS (name, username, email, mobno, password, cfpass) values( ?, ?, ?, ?, ?, ?)";
      connection.query(
        mysmt,
        [name, username, email, mobno, password, cfpass],
        (err, result) => {
          if (result.affectedRows == 1) {
            req.flash("Success", "user singup succesfully...");
            res.render("./userPage/login.ejs");
          } else {
            console.log("Data Insert ERROR :", err.message);
            res.send("signup fail");
          }
        }
      );
    }
  });
});

app.post("/login", (req, res) => {
  let { email, password } = req.body;
  let mysmt = " select * from FuelUsers where email=? and password=?";
  connection.query(mysmt, [email, password], (err, result) => {
    console.log("Login--Result==," ,result)
    if (result == 0) {
      req.flash("Error", " Invalid User ! Please SignUp....");
      res.redirect("/signup");
    } else {
      req.flash("Success", "Welcome ...!");
      res.render("./Userpage/profile.ejs", { result });
    }
  });
});

app.get("/GetFuel/:email", (req, res) => {
  // Extract email from URL parameters
  let { email } = req.params;
  let mysmt = "SELECT * FROM FuelUsers WHERE email = ?;";
  connection.query(mysmt, [email], (err, result) => {
    if (err) {
      console.log("ERROR Occurred...:", err.message);
      req.flash("error", "An error occurred while fetching data.");
      return res.redirect("/someErrorPage"); // Redirect to an error page or handle it accordingly
    } else {
      req.flash("Sucess ", "Order a Fuel..");
      res.render("./fuelDemand/GetFuel.ejs", { result });
    }
  });
});

app.post("/fuelorder/:email", (req, res) => {
  let { name, email, mobno, address, fuelType, num1, sum, OrderPlace } =
    req.body;
  console.log(req.body);

  let mysmt = "SELECT * FROM FuelUsers WHERE email = ?;";
  connection.query(mysmt, [email], (err, result) => {
    console.log("REsul to print the slect query", result);
  });
  mysmt =
    " INSERT INTO orderfuel(name, email, mobno, address, fuelType,num1, sum, OrderPlace) values  ( ?, ?, ?,?, ?, ?, ?, ?)";
  connection.query(
    mysmt,
    [name, email, mobno, address, fuelType, num1, sum, OrderPlace],
    (err, result) => {
      console.log("REsult to print insert query===>", result);
      if (result.affectedRows === 1) {
        console.log("order placed....");
        res.render("./fuelDemand/ThankYou.ejs", {
          name,
          email,
          mobno,
          address,
          fuelType,
          num1,
          sum,
          OrderPlace,
        });
      } else {
        res.send("order not be received..");
      }
    }
  );
});

app.get("/GetFuel/:email/edit", (req, res) => {
  let { email } = req.params;

  let mysmt = "SELECT * FROM FuelUsers WHERE email = ?;";
  connection.query(mysmt, [email], (err, result) => {
    if (err) {
      console.log("Error Occured...");
      res.send("Some error");
    } else {
      console.log("REsul to print the slect query", result);
      res.render("./layout/EditProfile.ejs", { result });
    }
  });
});
//work not done....! pleae completed..
app.post("/GetFuel/:email/edit", (req, res) => {
  let { email } = req.params;
console.log("mail==>", email);

  let mysmt ="update fuelusers set name=? , username=? , email=?, password=? , cfpass=? where email=?";
  connection.query(
    mysmt,
    [name, username, email, mobno, password, cfpass],
    (err, result) => {
      if (err) {
        console.log("Error Occured...");
        res.send("Some error");
      } else {
        console.log("Result to print the slect query for edit", result);
        res.send("updated......");
      }
    }
  );
});

app.all("*", async (err, req, res, next) => {
  console.log("eror: ", err);
  await next(new ExpressError(404, "page not found"));
});

app.listen(PORT, () => {
  console.log("App is listining on => " + PORT);
});

//  in that code not give incorrect password warning please give me code in right way
