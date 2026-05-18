// 1. 오늘의 질문 풀 (중학생 맞춤형 선별)
const questions = [
    "만약 하루 동안 투명인간이 된다면 가장 먼저 하고 싶은 일은?",
    "평생 한 가지 음식만 먹어야 한다면? 치킨 VS 피자",
    "스마트폰 없이 일주일 살기 VS 친구 없이 일주일 살기, 당신의 선택은?",
    "내가 만약 하루 동안 우리 학교 교장 선생님이 된다면 바꾸고 싶은 규칙은?",
    "과거로 갈 수 있는 타임머신이 있다면, 몇 살 때로 돌아가고 싶나요?",
    "천재적인 두뇌 갖기 VS 절대 지치지 않는 무한 체력 갖기",
    "만약 동물과 대화할 수 있는 능력이 생긴다면, 가장 먼저 어떤 동물과 얘기하고 싶어?",
    "갑자기 10억 원이 생긴다면 가장 먼저 사고 싶은 물건은?",
    "내일 당장 학교가 하루 휴교한다면 무엇을 하며 시간을 보낼 건가요?"
];

// 2. 오늘의 퀴즈 풀 (과학: 생식과 발생 단원 및 상식 위주)
const quizzes = [
    {
        category: "과학 (세포 분열)",
        question: "체세포 분열 결과 생생된 딸세포의 염색체 수는 모세포와 비교했을 때 어떨까요?",
        options: ["반으로 줄어든다", "2배로 늘어난다", "동일하다", "염색체가 사라진다"],
        answer: "동일하다",
        explanation: "체세포 분열은 몸을 구성하는 세포가 늘어나는 과정으로, 분열 전후의 염색체 수와 유전 정보가 완전히 동일하게 유지됩니다."
    },
    {
        category: "과학 (생식)",
        question: "정자와 난자가 결합하여 하나의 세포(수정란)가 되는 과정을 무엇이라고 할까요?",
        options: ["발생", "분열", "배란", "수정"],
        answer: "수정",
        explanation: "암수 생식세포인 정자와 난자가 결합하는 현상을 '수정'이라고 하며, 이를 통해 만들어진 세포를 '수정란'이라고 합니다."
    },
    {
        category: "과학 (세포 분열)",
        question: "생식세포 분열(감수 분열) 결과 만들어진 딸세포의 염색체 수는 모세포의 몇 배가 될까요?",
        options: ["2배", "절반 (1/2배)", "4배", "동일하다"],
        answer: "절반 (1/2배)",
        explanation: "생식세포 분열은 세대를 거듭해도 자손의 염색체 수가 일정하게 유지되도록 염색체 수를 절반으로 줄이는 과정입니다."
    },
    {
        category: "국어 상식",
        question: "일이 뜻대로 되지 않아 황당할 때 쓰는 올바른 맞춤법은 무엇일까요?",
        options: ["어의없다", "어이업다", "어의업다", "어이없다"],
        answer: "어이없다",
        explanation: "'어처구니가 없다'와 같은 뜻으로, '어이없다'가 올바른 표준어 표기입니다."
    },
    {
        category: "과학 (발생)",
        question: "수정란이 세포 분열을 거쳐 개체가 되기까지의 복잡한 과정을 무엇이라고 할까요?",
        options: ["생식", "발생", "수정", "개화"],
        answer: "발생",
        explanation: "수정란이 난할을 거쳐 조직과 기관을 형성하고 하나의 완전한 개체로 자라나는 전 과정을 '발생'이라고 부릅니다."
    }
];

// DOM 요소 가져오기
const switchBtn = document.getElementById('switch-btn');
const contentArea = document.getElementById('content-area');
const todayQuestion = document.getElementById('today-question');
const quizCategory = document.getElementById('quiz-category');
const todayQuiz = document.getElementById('today-quiz');
const quizOptions = document.getElementById('quiz-options');
const quizExplanation = document.getElementById('quiz-explanation');
const quizResultText = document.getElementById('quiz-result-text');
const quizExpText = document.getElementById('quiz-exp-text');

// 스위치 버튼 클릭 이벤트
switchBtn.addEventListener('click', () => {
    // 1. 숨겨진 콘텐츠 영역 보여주기
    contentArea.classList.remove('hidden');
    quizExplanation.classList.add('hidden'); // 새 게임 시 해설 숨기기
    
    // 버튼 텍스트 변경 애니메이션 효과 느낌 주기
    switchBtn.innerText = "⚡ 다음 스위치 ON!";

    // 2. 랜덤 질문 선택 및 배치
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    todayQuestion.innerText = randomQuestion;

    // 3. 랜덤 퀴즈 선택 및 배치
    const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];
    quizCategory.innerText = randomQuiz.category;
    todayQuiz.innerText = randomQuiz.question;

    // 보기 버튼 동적 생성
    quizOptions.innerHTML = '';
    randomQuiz.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.innerText = option;
        
        // 보기 클릭 이벤트
        button.addEventListener('click', () => {
            checkAnswer(option, randomQuiz);
        });
        quizOptions.appendChild(button);
    });
});

// 정답 체크 함수
function checkAnswer(selectedOption, quiz) {
    quizExplanation.classList.remove('hidden');
    
    if (selectedOption === quiz.answer) {
        quizResultText.innerText = "⭕ 정답입니다! 멋져요!";
        quizResultText.style.color = "#2f855a";
        quizExplanation.style.backgroundColor = "#f0fff4";
        quizExplanation.style.borderColor = "#c6f6d5";
    } else {
        quizResultText.innerText = `❌ 아쉬워요! 정답은 [ ${quiz.answer} ] 입니다.`;
        quizResultText.style.color = "#c53030";
        quizExplanation.style.backgroundColor = "#fff5f5";
        quizExplanation.style.borderColor = "#fed7d7";
    }
    
    quizExpText.innerText = quiz.explanation;
}
