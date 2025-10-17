// =========================================================
// ⚠️ 以下のURLを、あなたのGoogle Apps ScriptのURLに置き換えてください
// =========================================================
const GAS_API_URL = 'https://script.google.com/macros/s/AKfycbxYpCU6YhCzEnJWYNLfgKIUuUh0ZGo3y6RTdEA_kG-Q8rJQqosYK6rTZ1Jw_GUP6JGd/exec'; 
// 例: 'https://script.google.com/macros/s/XXXXXXXXXXXXXXXXXXXXXXXXXXXX/exec';
// =========================================================

let quizData = [];          // 全問題データを格納
let currentQuestionIndex = 0; // 現在の問題番号
let score = 0;              // 正答数

// DOM要素の取得
const questionNumberElement = document.getElementById('question-number');
const questionTextElement = document.getElementById('question-text');
const choicesArea = document.getElementById('choices-area');
const resultTextElement = document.getElementById('result-text');
const nextButton = document.getElementById('next-button');
const restartButton = document.getElementById('restart-button');
const explanationArea = document.getElementById('explanation-area');
const explanationTextElement = document.getElementById('explanation-text');

// データの読み込み
async function loadQuizData() {
    try {
        questionTextElement.textContent = "問題を読み込み中です...";
        
        // GAS APIからデータを取得 (シート名'基本機能・構成'を指定)
        // 別のシート名を使いたい場合は '?sheet=シート名' を変更
        const response = await fetch(GAS_API_URL + '?sheet=基本機能・構成');
        quizData = await response.json();
        
        // 読み込んだ問題をシャッフル (毎回ランダムな順番にするため)
        shuffleArray(quizData);
        
        if (quizData.length > 0) {
            displayQuestion();
        } else {
            questionTextElement.textContent = "問題データがありません。スプレッドシートを確認してください。";
        }

    } catch (error) {
        console.error("データ取得エラー:", error);
        questionTextElement.textContent = "問題の取得に失敗しました。GASのURLまたはデプロイ設定を確認してください。";
    }
}

// 配列をシャッフルする関数 (フィッシャー・イェーツ・シャッフル)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}


// 問題の表示
function displayQuestion() {
    // 画面をリセット
    resultTextElement.textContent = '';
    explanationArea.style.display = 'none';
    nextButton.style.display = 'none';
    restartButton.style.display = 'none';
    choicesArea.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = false;
        btn.classList.remove('correct', 'incorrect');
    });

    if (currentQuestionIndex < quizData.length) {
        const currentQuestion = quizData[currentQuestionIndex];
        
        // 問題文と番号の表示
        document.getElementById('category-info').textContent = `カテゴリ: ${currentQuestion.Category}`;
        questionNumberElement.textContent = `第 ${currentQuestionIndex + 1} 問 / 全 ${quizData.length} 問`;
        questionTextElement.textContent = currentQuestion.Question;
        
        // 選択肢の表示とイベントリスナーの設定
        document.getElementById('choice-A').textContent = `A. ${currentQuestion.Choice_A}`;
        document.getElementById('choice-B').textContent = `B. ${currentQuestion.Choice_B}`;
        document.getElementById('choice-C').textContent = `C. ${currentQuestion.Choice_C}`;
        document.getElementById('choice-D').textContent = `D. ${currentQuestion.Choice_D}`;

        choicesArea.querySelectorAll('.choice-btn').forEach(btn => {
            btn.onclick = () => checkAnswer(btn.dataset.choice, currentQuestion);
        });

    } else {
        // 全問終了
        showResults();
    }
}


// 解答の判定
function checkAnswer(selectedChoice, currentQuestion) {
    // 全てのボタンを無効化
    choicesArea.querySelectorAll('.choice-btn').forEach(btn => {
        btn.disabled = true;
    });

    const correctChoiceKey = currentQuestion.Correct_Choice; // 例: 'D'
    const selectedButton = document.getElementById(`choice-${selectedChoice}`);
    const correctButton = document.getElementById(`choice-${correctChoiceKey}`);

    // 正誤判定
    if (selectedChoice === correctChoiceKey) {
        score++;
        resultTextElement.textContent = '✅ 正解です！';
        selectedButton.classList.add('correct');
    } else {
        resultTextElement.textContent = '❌ 不正解です...';
        selectedButton.classList.add('incorrect');
    }
    
    // 正解をハイライト
    correctButton.classList.add('correct');

    // 解説の表示
    explanationTextElement.textContent = currentQuestion.Explanation;
    explanationArea.style.display = 'block';

    // 次へボタンの表示
    nextButton.style.display = 'block';
}

// 次の問題へ
nextButton.onclick = () => {
    currentQuestionIndex++;
    displayQuestion();
};

// 全問終了時の結果表示
function showResults() {
    questionNumberElement.textContent = '結果発表！';
    questionTextElement.textContent = `あなたは ${quizData.length} 問中、${score} 問正解しました！`;
    choicesArea.innerHTML = ''; // 選択肢をクリア
    resultTextElement.textContent = ''; // 結果テキストをクリア

    // やり直しボタンを表示
    restartButton.style.display = 'block';
}

// 最初からやり直す
restartButton.onclick = () => {
    currentQuestionIndex = 0;
    score = 0;
    // 選択肢エリアを元のHTMLに戻す（再構築）
    choicesArea.innerHTML = `
        <button class="choice-btn" id="choice-A" data-choice="A"></button>
        <button class="choice-btn" id="choice-B" data-choice="B"></button>
        <button class="choice-btn" id="choice-C" data-choice="C"></button>
        <button class="choice-btn" id="choice-D" data-choice="D"></button>`;
    loadQuizData(); // データ再読み込み（シャッフル）
};

// アプリの開始
loadQuizData();