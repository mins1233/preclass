// 1. 브라우저 저장소(localStorage)에서 API 키 불러오기
let API_KEY = localStorage.getItem("gemini_api_key");

// 저장된 키가 없다면 선생님께 창을 띄워 입력받기
if (!API_KEY) {
    API_KEY = prompt("⚡ [최초 1회 설정] 구글 Gemini API Key를 입력해주세요.\n이 브라우저에만 안전하게 저장되며, 소스코드가 올라간 깃허브에는 절대 노출되지 않습니다:");
    if (API_KEY) {
        localStorage.setItem("gemini_api_key", API_KEY.trim());
    }
}

// 2. AI에게 보낼 명령(프롬프트) 정의 - 전 단원 과학 및 다양한 상식 유도
const SYSTEM_PROMPT = `
너는 중학교 교실에서 수업 시작 전 학생들의 집중력을 높이는 웹 앱 '수업 시간 30초 스위치'의 전속 콘텐츠 생성기야. 
중학생(14~16세)의 눈높이에 맞는 '오늘의 질문' 1개와 '오늘의 퀴즈' 1개를 무작위로 생성해줘.

[콘텐츠 작성 가이드]
1. 오늘의 질문: 일상, 재미있는 상상, 가벼운 밸런스 게임 등 중학생이 흥미를 가질 주제 (예: 평생 스마트폰 없이 살기 vs 친구 없이 살기)
2. 오늘의 퀴즈: 중학교 수준의 과학(물리, 화학, 생물, 지구과학 전 단원 랜덤) 또는 국어, 역사, 일반 상식 등에서 무작위 선정. 객관식(4지선다) 또는 OX 퀴즈로 낼 것.

반드시 다른 부가 설명 없이 지정된 JSON 형식으로만 응답해줘.
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
    // 혹시나 취소를 눌렀거나 키가 없을 경우 다시 묻기
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
        // 구글 Gemini API 호출 (최신 v1 주소와 gemini-2.5-flash 모델 적용)
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: SYSTEM_PROMPT }] }],
                generationConfig: {
                    // API 수준에서 JSON 출력을 강제하여 에러율을 줄입니다.
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: "OBJECT",
                        properties: {
                            todays_question: {
                                type: "OBJECT",
                                properties: {
                                    topic: { type: "STRING" },
                                    question: { type: "STRING" }
                                },
                                required: ["topic", "question"]
                            },
                            todays_trivia: {
                                type: "OBJECT",
                                properties: {
                                    category: { type: "STRING" },
                                    type: { type: "STRING" },
                                    question: { type: "STRING" },
                                    options: { type: "ARRAY", items: { type: "STRING" } },
                                    answer: { type: "STRING" },
                                    explanation: { type: "STRING" }
                                },
                                required: ["category", "type", "question", "options", "answer", "explanation"]
                            }
                        },
                        required: ["todays_question", "todays_trivia"]
                    }
                }
            })
        });

        if (!response.ok) {
            // API 키가 잘못되었거나 주소 오류일 가능성이 높으므로 저장된 키 삭제
            localStorage.removeItem("gemini_api_key");
            API_KEY = null;
            throw new Error("API 요청에 실패했습니다. API 키나 모델 설정을 다시 확인해주세요.");
        }

        const data = await response.json();
        // AI가 보낸 응답 텍스트를 JSON으로 파싱
        const jsonText = data.candidates[0].content.parts[0].text;
        const result = JSON.parse(jsonText);

        // 화면에 반영하기
        displayContent(result);

    } catch (error) {
        console.error(error);
        alert(error.message || "문제를 가져오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
        switchBtn.disabled = false;
        switchBtn.innerText = "⚡ 다음 스위치 ON!";
    }
});

// 데이터를 받아와 화면에 그려주는 함수
function displayContent(data) {
    contentArea.classList.remove('hidden');

    // 1. 오늘의 질문 배치
    todayQuestion.innerText = data.todays_question.question;

    // 2. 오늘의 퀴즈 배치
    const quiz = data.todays_trivia;
    quizCategory.innerText = quiz.category;
    todayQuiz.innerText = quiz.question;

    // 보기 버튼 동적 생성
    quizOptions.innerHTML = '';
    quiz.options.forEach(option => {
        const button = document.createElement('button');
        button.classList.add('option-btn');
        button.innerText = option;
        
        button.addEventListener('click', () => {
            quizExplanation.classList.remove('hidden');
            
            // 정답 확인 (공백 제거 후 비교)
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
