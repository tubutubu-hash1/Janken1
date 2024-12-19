<!-- index.html -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"></script>
// 勝敗記録の追記
let resultsForExcel = []; // Excel用の結果保存用配列

function playGame(playerMove) {
    const computerMove = decideComputerMove(moves);
    const result = judge(playerMove, computerMove);

    moves.push(playerMove);
    history.push(result);
    games++;

    if (result === "win") {
        win++;
    } else if (result === "lose") {
        lose++;
    } else {
        draw++;
    }

    // Excel用データに記録
    resultsForExcel.push({
        "試合回数": games,
        "プレイヤーの手": playerMove,
        "コンピュータの手": computerMove,
        "結果": result,
        "勝ち": win,
        "負け": lose,
        "引き分け": draw,
    });

    updateUI(playerMove, computerMove, result); // UI更新
    saveResultsToExcel(); // Excel保存
}

function updateUI(playerMove, computerMove, result) {
    document.getElementById("player-move").textContent = playerMove;
    document.getElementById("computer-move").textContent = computerMove;
    document.getElementById("result").textContent = result;
    document.getElementById("win-count").textContent = win;
    document.getElementById("lose-count").textContent = lose;
    document.getElementById("draw-count").textContent = draw;
    document.getElementById("games-count").textContent = games;
}

function saveResultsToExcel() {
    const worksheet = XLSX.utils.json_to_sheet(resultsForExcel); // JSONデータをワークシートに変換
    const workbook = XLSX.utils.book_new(); // 新しいExcelファイルを作成
    XLSX.utils.book_append_sheet(workbook, worksheet, "ジャンケン結果");

    // ブラウザでダウンロードさせる
    const excelData = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ジャンケン結果.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetGame() {
    moves = [];
    history = [];
    win = 0;
    lose = 0;
    draw = 0;
    games = 0;
    resultsForExcel = []; // Excelデータのリセット

    document.getElementById("player-move").textContent = "";
    document.getElementById("computer-move").textContent = "";
    document.getElementById("result").textContent = "";
    document.getElementById("win-count").textContent = win;
    document.getElementById("lose-count").textContent = lose;
    document.getElementById("draw-count").textContent = draw;
    document.getElementById("games-count").textContent = games;
}
// 勝敗の記録を保存する変数
let moves = [];
let history = [];
let win = 0;
let lose = 0;
let draw = 0;
let games = 0; // 試合回数

function randomMove() {
    const moves = ["グー", "チョキ", "パー"];
    return moves[Math.floor(Math.random() * moves.length)];
}

function buildTransitionMatrix(moves, order) {
    const transitionMatrix = {};
    for (let i = 0; i < moves.length - order; i++) {
        const state = moves.slice(i, i + order).join(",");
        const nextMove = moves[i + order];
        if (!transitionMatrix[state]) {
            transitionMatrix[state] = { "グー": 0, "チョキ": 0, "パー": 0 };
        }
        transitionMatrix[state][nextMove]++;
    }
    return transitionMatrix;
}

function predictNextMove(moves, order) {
    const state = moves.slice(-order).join(",");
    const transitionMatrix = buildTransitionMatrix(moves, order);

    if (transitionMatrix[state]) {
        const nextMoves = transitionMatrix[state];
        let maxMove = null;
        let maxCount = -1;
        for (const move in nextMoves) {
            if (nextMoves[move] > maxCount) {
                maxMove = move;
                maxCount = nextMoves[move];
            }
        }
        return maxMove;
    } else {
        return randomMove(); // データがない場合はランダムに手を選択
    }
}

function predictMoveByFrequency(moves) {
    const moveCounts = { "グー": 0, "チョキ": 0, "パー": 0 };
    for (const move of moves) {
        moveCounts[move]++;
    }
    let maxMove = null;
    let maxCount = -1;
    for (const move in moveCounts) {
        if (moveCounts[move] > maxCount) {
            maxMove = move;
            maxCount = moveCounts[move];
        }
    }
    return maxMove || randomMove();
}

function decideComputerMove(moves, order = 5) {
    console.log("プレイヤーの過去の手:", moves);
    
    if (moves.length < order) {
        console.log("履歴が短すぎます。ランダムな手を出します。");
        return randomMove();
    }
    
    const predictedMoveByMarkov = predictNextMove(moves, order);
    const predictedMoveByFrequency = predictMoveByFrequency(moves);

    // マルコフ連鎖と頻度ベースの予測を併用
    const predictedMove = predictedMoveByMarkov || predictedMoveByFrequency;
    const counterMoves = { "グー": "パー", "チョキ": "グー", "パー": "チョキ" };
    const computerMove = counterMoves[predictedMove];

    console.log("予測された次の手:", predictedMove);
    console.log("コンピュータの手:", computerMove);
    
    return computerMove || randomMove();  // エラー時にランダムな手を返す
}

function judge(player, computer) {
    if (player === computer) {
        return "draw";
    } else if (
        (player === "グー" && computer === "チョキ") ||
        (player === "チョキ" && computer === "パー") ||
        (player === "パー" && computer === "グー")
    ) {
        return "win";
    } else {
        return "lose";
    }
}

function playGame(playerMove) {
    const computerMove = decideComputerMove(moves);
    const result = judge(playerMove, computerMove);

    moves.push(playerMove);
    history.push(result);
    games++;

    if (result === "win") {
        win++;
    } else if (result === "lose") {
        lose++;
    } else {
        draw++;
    }

    document.getElementById("player-move").textContent = playerMove;
    document.getElementById("computer-move").textContent = computerMove;
    document.getElementById("result").textContent = result;
    document.getElementById("win-count").textContent = win;
    document.getElementById("lose-count").textContent = lose;
    document.getElementById("draw-count").textContent = draw;
    document.getElementById("games-count").textContent = games; // 試合回数を表示
}

function resetGame() {
    moves = [];
    history = [];
    win = 0;
    lose = 0;
    draw = 0;
    games = 0;

    document.getElementById("player-move").textContent = "";
    document.getElementById("computer-move").textContent = "";
    document.getElementById("result").textContent = "";
    document.getElementById("win-count").textContent = win;
    document.getElementById("lose-count").textContent = lose;
    document.getElementById("draw-count").textContent = draw;
    document.getElementById("games-count").textContent = games;
}

document.getElementById("rock").addEventListener("click", () => playGame("グー"));
document.getElementById("scissors").addEventListener("click", () => playGame("チョキ"));
document.getElementById("paper").addEventListener("click", () => playGame("パー"));
document.getElementById("reset").addEventListener("click", resetGame);
