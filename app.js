const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const fs = require('fs');
const flash = require('connect-flash');
const app = express();
const cors=require('cors');


// Serve static files from the React frontend app


app.use("/react-quiz",express.static(path.join(__dirname, 'client/build')));


app.use(cookieParser());

app.use(session({
  secret: 'nssvgec',
  saveUninitialized: true,
  resave: true
}));

app.use(flash());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.static("public"));

app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://Tanmay:Ultimate360@cluster0-ez8v9.mongodb.net/quizTakersDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = {
  name: String,
  email: String,
};

const quizStatsSchema = {
  userId: String,
  day1: Number,
  day2: Number,
  day3: Number,
  day4: Number,
  day5: Number,
  day6: Number,
  day7: Number,
};

const User = mongoose.model(
  "User", userSchema
);

const QuizStat = mongoose.model(
  "QuizStat", quizStatsSchema
);
var readQuiz = fs.readFileSync("public/quiz/quiz1.json", 'utf8');
var quiz = JSON.parse(readQuiz);


app.get("/", function(req, res) {
  console.log("Homepage");
  res.render("home2");
});

app.post("/", function(req, res) {
  res.redirect("/learning");

});
app.get("/learning",function(req,res){
  res.render("learnings");
})
app.post("/learning",function(req,res){
  console.log(req.body.DayNo);
  req.flash('DayNo', req.body.DayNo);
  res.redirect("/quizLogin");
});

app.get("/quizLogin", function(req, res) {
  res.render("quizLogin");
});

app.post("/quizLogin", async (req, res) => {
  var userName = req.body.studentName;
  var userEmail = req.body.studentEmail;
  var userId = "";
  var nameUser="";
  var flag = 0;
  User.findOne({
      name: userName,
      email: userEmail
    },
    async (err, result) => {
      if (!result) {
        console.log("no user");
        const newuser = new User({
          name: userName,
          email: userEmail
        });

        let saveUser = await newuser.save();
        userId = saveUser.id;
        nameUser=saveUser.name;
      } else {
        console.log("user found");
        userId = result.id;
        nameUser=result.name;
      }
      req.flash('userId', userId);
      req.flash('nameUser',nameUser);

      QuizStat.findOne({
          userId: userId

        },
        function(err, result) {
          if (!result) {

            const quizStat = new QuizStat({
              userId: userId,
              day1: 0,
              day2: 0,
              day3: 0,
              day4: 0,
              day5: 0,
              day6: 0,
              day7: 0,
            });
            quizStat.save();

          }

          if (!err) {
            var userAnswers = [0, 0, 0, 0, 0];
            res.redirect("/react-quiz");

          }
        }

      );

    });

});


app.get("/react-quiz",(req,res)=>{
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.get("/submitScore/:score",cors(), async (req,res,next)=>{
  try{var score=req.params.score;
  console.log(score);
  var dayNo = req.flash('DayNo');
  var userId = req.flash('userId');
  
  console.log(dayNo);


  var query = {};
  query[dayNo[0]] = score;

  QuizStat.updateOne({
    userId: userId[0]
  }, query, function(err, res) {
    if (err) {
      console.log(err);
    } else {

    }

  });
  res.json({recieved:true});
  }
  catch(err){
    console.log(err);
  }
});

app.get("/quizDay",cors(), async (req,res,next)=>{
  
  const day={dayNo:"day1"};
  const array=req.flash('DayNo');
  console.log(array);
  day.dayNo=array[0];
  req.flash('DayNo',day.dayNo);
  res.json(day);
});



app.get("/submit", function(req, res) {
  var dayNo = req.flash('DayNo');
  var userId = req.flash('userId');
  var score = req.flash('score');
  var nameUser=req.flash('nameUser');


  var query = {};
  query[dayNo[0]] = score[0];

  QuizStat.updateOne({
    userId: userId[0]
  }, query, function(err, res) {
    if (err) {
      console.log(err);
    } else {

    }

  });
  res.render("quizcomplete", {
    nameUser: nameUser[0],
    score: score[0]
  });
});

app.get("/aboutDev",function(req,res){

  res.render("about-dev");

});

let port=process.env.PORT;

if(port== null ||port==""){
  port=5000;
}
app.listen(port, function() {
  console.log("Server started ");
});
