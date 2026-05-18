// 1. 브라우저 저장소(localStorage)에서 API 키 불러오기
let API_KEY = localStorage.getItem("gemini_api_key");

// 저장된 키가 없거나 이상한 값이면 초기화 후 다시 묻기
if (!API_KEY || API_KEY.trim() === "" || API_KEY === "null" || API_KEY === "undefined") {
    localStorage.removeItem("gemini_api_key");
    API_KEY = prompt("⚡ [최초 1회 설정] 구글 Gemini API Key를 입력해주세요.\n이 브라우저에만 안전하게 저장되며, 소스코드가 올라간 깃허브에는 절대 노출되지 않습니다:");
    if (API_KEY) {
        localStorage.setItem("gemini_api_key", API_KEY.trim());
    }
}

// 2. AI에게 보낼 명령(프롬프트) 정의 - 원하는 JSON 구조를 프롬프트에 직접 주입
const SYSTEM_PROMPT = `
너는 중학교 교실에서 수업 시작 전 학생들의 집중력을 높이는 웹 앱 '수업 시간 30초 스위치'의 전속 콘텐츠 생성기야. 
중학생(14~16세)의 눈높이에 맞는 '오늘의 질문' 1개와 '오늘의 퀴즈' 1개를 무작위로 생성해줘.

[콘텐츠 작성 가이드]
1. 오늘의 질문: 일상, 재미있는 상상, 가벼운 밸런스 게임 등 중학생이 흥미를 가질 주제 (예: 평생 스마트폰 없이 살기 vs 친구 없이 살기)
2. 오늘의 퀴즈: 중학교 수준의 과학(물리, 화학, 생물, 지구과학 전 단원 랜덤) 또는 국어, 역사, 일반 상식 등에서 무작위 선정. 객관식(4지선다) 또는 OX 퀴즈로 낼 것.

반드시 다른 부가 설명 없이 정확히 아래와 같은 JSON 구조로만 응답해줘:
{
  "todays_question": {
    "question": "질문 내용"
  },
  "todays_trivia": {
    "category": "과학(물리) 또는 일반상식 등",
    "question": "퀴즈 문제 내용",
    "options": ["보기1", "보기2", "보기3", "보기4"],
    "answer": "정답 보기와 완전히 일치하는 텍스트",
    "explanation": "정답에 대한 친절한 해설"
  }
}
`;

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
switchBtn.addEventListener('click', async () => {
    if (!API_KEY) {
        API_KEY = prompt("API Key가 필요합니다. 구글 Gemini API Key를 입력해주세요:");
        if (API_KEY) {
            localStorage.setItem("gemini_api_key", API_KEY.trim());
        } else {
            return;
        }
    }

    // 로딩 상태 표시
    switchBtn.disabled = true;
    switchBtn.innerText = "⏳ AI가 문제를 만드는 중...";
    contentArea.classList.add('hidden');
    quizExplanation.classList.add('hidden');

    try {
        // 가장 안정적인 정식 v1 주소와 gemini-1.5-flash 모델 조합 사용
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: SYSTEM_PROMPT }] }],
                generationConfig: {
                    responseMimeType: "application/json" // JSON 반환 강제
                }
            })
        });

        // 에러 발생 시 구글이 보낸 실제 원인 메시지 추출하기
        if (!response.ok) {
            let errorDetail = "구글 서버가 요청을 거절했습니다.";
            try {
                const errData = await response.json();
                if (errData.error && errData.error.message) {
                    errorDetail += `\n(상세 원인: ${errData.error.message})`;
                }
            } catch (e) {
                errorDetail += ` (에러 코드: ${response.status})`;
            }
            throw new Error(errorDetail);
        }

        const data = await response.json();
        const jsonText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(jsonText);

        // 화면에 반영하기
        displayContent(result);

    } catch (error) {
        console.error(error);
        
        // 에러가 나면 저장된 키를 지워 다음 새로고침 때 다시 입력창이 뜨도록 처리
        localStorage.removeItem("gemini_api_key");
        API_KEY = null;
        
        alert("❌ 오류가 발생하여 API 키를 초기화했습니다.\n\n" + error.message + "\n\n새로고침(F5) 후 올바른 키를 다시 입력해주세요.");
    } finally {
        switchBtn.disabled = false;
        switchBtn.innerText = "⚡ 다음 스위치 ON!";
    }
});

// 데이터를 받아와 화면에 그려주는 함수
function displayContent(data) {
    contentArea.classList.remove('hidden');

    todayQuestion.innerText = data.todays_question.question;

    const quiz = data.todays_trivia;
    quizCategory.innerText = quiz.category;
    todayQuiz.innerText = quiz.question;

    quizOptions.innerHTML = '';
    quiz.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.innerText = option;
        
        button.addEventListener('click', () => {
            quizExplanation.classList.remove('hidden');
            
            if (option.trim() === quiz.answer.trim()) {
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
        });
        quizOptions.appendChild(button);
    });
}
