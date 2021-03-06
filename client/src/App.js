import React from 'react';
import logo from './logo.svg';
import './App.css';
import axios from 'axios';
// import data from './data/data';
import data from './data/quiz1'

// import data from './data/quiz1';
import Answers from './components/Answers';
import Popup from './components/Popup';
//import Footer from 'Footer';


var quizNo=0;
class App extends React.Component {
    

    constructor(props) {

        super(props);

       

        this.state = {
            apiresp:false,
            nr: 0,
            total: 5,
            showButton: false,
            questionAnswered: false,
            score: 0,
            displayPopup: 'flex'
        }
        // const data=this.data;
        this.nextQuestion = this.nextQuestion.bind(this);
        this.handleShowButton = this.handleShowButton.bind(this);
        this.handleStartQuiz = this.handleStartQuiz.bind(this);
        this.handleIncreaseScore = this.handleIncreaseScore.bind(this);
    }

    // componentDidMount() {
    //
    // }
    //
    // async fetchQuiz(){
    //       this.data= await import  (`./data/quiz1`);
    //      console.log(data);
    // }

    pushData(nr) {
        // axios.get(`/quizDay`)
        // .then(async res => {
        //   const persons = res.data;
        //   if(persons.dayNo==="day1"){
        //     quizNo=1;
        //     console.log(quizNo);
        //   }
        // });
        this.setState({
            question: data[quizNo][nr].question,
            answers: [data[quizNo][nr].answers[0], data[quizNo][nr].answers[1], data[quizNo][nr].answers[2], data[quizNo][nr].answers[3] ],
            correct: data[quizNo][nr].correct,
            nr: this.state.nr + 1
        });
    
        
        
    }

    componentWillMount() {
        
        let { nr } = this.state;
        
        this.pushData(nr);
        
        
    }
    componentDidMount(){
        axios.get(`/quizDay`)
        .then(async res => {
          const persons = res.data;
          console.log(persons);
          quizNo=Number(persons.dayNo.charAt(3))-1;
        //   if(persons.dayNo==="day1"){
        //     quizNo=1;
        //     console.log(quizNo);
        //   }
        });
            
        
        
        
    }

    nextQuestion() {
        let { nr, total, score } = this.state;

        if(nr === total){
            this.setState({
                displayPopup: 'flex'
            });
        } else {
            this.pushData(nr);
            this.setState({
                showButton: false,
                questionAnswered: false
            });
        }

    }

    handleShowButton() {
        this.setState({
            showButton: true,
            questionAnswered: true
        })
    }

    handleStartQuiz() {
        this.setState({
            displayPopup: 'none',
            nr: 1
        });
    }

    handleIncreaseScore() {
        this.setState({
            score: this.state.score + 1
        });
    }

    render() {
        let { apiresp,nr, total, question, answers, correct, showButton, questionAnswered, displayPopup, score} = this.state;
       
        
            return (
                <div className="container">
    
                    <Popup style={{display: displayPopup}} score={score} total={total} startQuiz={this.handleStartQuiz}/>
    
                    <div className="row">
                        <div className="col-lg-10 col-lg-offset-1">
                            <div id="question">
                                <h4>Question {nr}/{total}</h4>
                                <p>{question}</p>
                            </div>
                            
                            <Answers answers={answers} correct={correct} showButton={this.handleShowButton} isAnswered={questionAnswered} increaseScore={this.handleIncreaseScore}/>
                            <div id="submit">
                                {showButton ? <button className="fancy-btn" onClick={this.nextQuestion} >{nr===total ? 'Finish quiz' : 'Next question'}</button> : null}
                            </div>
                        </div>
                    </div>
    
                </div>
            );

        
        
    }
};

export default App;

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;
