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


// app.get('/reactQuiz', (req, res) => {
//
// });

app.post("/submitScore",function(req,res){
  res.redirect("/");
})


app.post("/learning",function(req,res){
  console.log(req.body.DayNo);
  req.flash('DayNo', req.body.DayNo);
  res.redirect("/quizLogin");
});


app.get("/", function(req, res) {
  console.log("yo");
  res.render("home2");
});

app.get("/react-quiz",(req,res)=>{
  res.sendFile(path.join(__dirname + '/client/build/index.html'));
});

app.post("/", function(req, res) {
  res.render("learnings");

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
            // res.render("quiz", {
            //   quiz: quiz,
            //   qcount: 0,
            //   userAnswers: JSON.stringify(userAnswers)
            // });
          }
        }

      );

    });

});

app.get("/quizDay",function(req,res){
  const day={dayNo:"day1"};
  req.flash('DayNo',day.dayNo);
  res.json(day);
});

app.post("/quiz", function(req, res) {
  var answers = [];
  var questionNo = req.body.questionNo;
  console.log(req.body.questionNo); //from hidden input

  var answers = JSON.parse(req.body.userAnsArray);

  var userAns = req.body.option;
  answers[questionNo] = userAns;
  console.log(answers);

  //console.log(answers);
  if (req.body.butt === "1") {
    //prev
    questionNo--;
    res.render("quiz", {
      quiz: quiz,
      qcount: questionNo,
      userAnswers: JSON.stringify(answers)
    });
  } else if (req.body.butt === "3") {
    //next
    questionNo++;
    res.render("quiz", {
      quiz: quiz,
      qcount: questionNo,
      userAnswers: JSON.stringify(answers)
    });
  } else {
    var score = 0;
    for (var i = 0; i < answers.length; i++) {
      if (answers[i] == quiz[i].answer) {
        score++;
      }
    }
    req.flash('score', score);


    res.redirect("/submit");
  } //submit}


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

let port=process.env.PORT;
let port="";
if(port== null ||port==""){
  port=5000;
}
app.listen(port, function() {
  console.log("Server started ");
});
