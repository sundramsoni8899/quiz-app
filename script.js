 let questions = [];
fetch("question.json")
     .then((res) => res.json())
     .then((data) =>{
        questions = data;
        // startQuiz();
     })
     .catch((error) => console.error("Error loading questions:",error))
const questionElement = document.getElementById("question");
const answerButton = document.getElementById("answer-buttons")
const nextButton = document.getElementById("next-btn")
const correctSound = new Audio("sounds/correct.mp3")
const wrongSound = new Audio("sounds/wrong.mp3")

let currentQuestionIndex = 0;
let score = 0;
let questionToAsk = [];
let totalQuestions = 0;
let questionTimer;
let timePerQuestion = 30 ;
let timeLeft = timePerQuestion;
let quizEnded = false;
 
function startQuestionTimer(){
    clearInterval(questionTimer);
    timeLeft = timePerQuestion;
    updateQuestionTimerDisplay();
    questionTimer = setInterval(()=>{
        timeLeft--;
        updateQuestionTimerDisplay();
        if(timeLeft<=0){
            clearInterval(questionTimer);
            handleTimeOut();
        }
    },1000)
}
function updateQuestionTimerDisplay(){
    document.getElementById("timer").textContent = `⏱ Time left: ${timeLeft}s`
}
 function handleTimeOut(){
    if(quizEnded) return;
    const buttons = Array.from(answerButton.children);
    buttons.forEach(button=>{
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        else{
            button.classList.add("incorrect");
        }
        button.disabled = true;
    })
    wrongSound.play();
    nextButton.style.display ="block"
 }

function startQuiz(){
    quizEnded = false
    clearInterval(questionTimer);
    const count = document.getElementById("question-count").value;
    totalQuestions = parseInt(count);

    currentQuestionIndex = 0;
    score = 0;
    const shuffled = [...questions]
    shuffleQuestions(shuffled);
    questionToAsk = shuffled.slice(0, totalQuestions)
    nextButton.innerHTML = "Next";
    document.querySelector(".app").style.display = "block"
    document.getElementById("startScreen").style.display = "none"
    document.getElementById("quit-btn").style.display = "inline-block";
    showQuestion();
}
document.getElementById("quit-btn").addEventListener("click",()=>{
    const confirmQuit = confirm("Are you sure want to quit the quiz?");
    if(confirmQuit){
        clearInterval(questionTimer) ;
        timeLeft=timePerQuestion;
        document.getElementById("timer".textContent)
        document.querySelector(".app").style.display = "none";
        document.getElementById("startScreen").style.display = "block";
        document.getElementById("quit-btn").style.display = "none"
    }
})
function showQuestion(){
    resetState();
    let currentQuestion = questionToAsk[currentQuestionIndex]
    let questNo = currentQuestionIndex + 1;
    questionElement.innerHTML = questNo + ". " +currentQuestion.question;

    currentQuestion.answers.forEach(answer =>{
        const button = document.createElement("button");
        button.innerHTML = answer.text;
        button.classList.add("btn");
        answerButton.appendChild(button);
        if(answer.correct){
            button.dataset.correct = answer.correct;
        } 
        button.addEventListener("click", selectAnswer)
    });
    startQuestionTimer();
}

function resetState(){
    nextButton.style.display = "none"
    while(answerButton.firstChild){
        answerButton.removeChild(answerButton.firstChild)
    }
}

function selectAnswer(e){
    clearInterval(questionTimer);
    const selectBtn = e.target;
    const isCorrect = selectBtn.dataset.correct === "true";
    if(isCorrect){
        selectBtn.classList.add("correct");
        score++;
        correctSound.play();
    }
    else{
        selectBtn.classList.add("incorrect");
        wrongSound.play();
    }
    Array.from(answerButton.children).forEach(button =>{
        if(button.dataset.correct === "true"){
            button.classList.add("correct");
        }
        button.disabled = true
    })
    
    nextButton.style.display = "block"
}

function showScore(){
    resetState();
    quizEnded = true
    clearInterval(questionTimer)
    document.getElementById("timer").style.display = "none";
    confetti({
        particleCount:150,
        spread:70,
        origin:{y:0.6}
    })
    questionElement.innerHTML = `You scored ${score} out of ${questionToAsk.length}!`;
    nextButton.innerHTML = "Play again "
    nextButton.style.display = "block";

    document.getElementById("quit-btn").style.display ="none";

    const previousScores = JSON.parse(localStorage.getItem("quizScores")) || [];
    previousScores.push({
        score: score, 
        total: questionToAsk.length,
        date: new Date().toLocaleString()

    });
    localStorage.setItem("quizScores", JSON.stringify(previousScores))
}
function handleNextButton(){
    currentQuestionIndex++;
    if(currentQuestionIndex < questionToAsk.length){
        showQuestion();
    }
    else{
        showScore();
    }
}
nextButton.addEventListener("click",()=>{
    if(currentQuestionIndex < questionToAsk.length){
        handleNextButton();
    }
    else{
        
        
        document.querySelector(".app").style.display ="none";
        document.getElementById("startScreen").style.display = "block"
        showPreviousScores();
    }
})
function shuffleQuestions(array){
    for(let i = array.length - 1; i>0;i--){
        const j = Math.floor(Math.random()*(i+1));
        [array[i],array[j]] = [array[j],array[i]]
    }
}

function showPreviousScores(){
    const scoreBox = document.getElementById("previousScores");
    const savedScores = JSON.parse(localStorage.getItem("quizScores")) || [];
    if(savedScores.length === 0){
        scoreBox.innerHTML = "<p>No previous scores.</p>";
        return;
    }
    let html = "<h3>Previous Scores:</h3><ul>";
    savedScores.slice(-5).reverse().forEach(score => {
        html += <li>${score.date} - ${score.score}/${score.total}</li>;

    });
    html +="</ul>"
    scoreBox.innerHTML = html;
}
window.addEventListener("DOMContentLoaded",function(){
    showPreviousScores();
document.getElementById("clear-history").addEventListener("click", clearScores);
function clearScores(){
    localStorage.removeItem("quizScores")
    showPreviousScores();
}
});