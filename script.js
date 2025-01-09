// プレイヤーの手を保存する配列
const results = [];
const playerMoves = [];
let aiSuccessCount = 0;
let aiFailureCount = 0;

// ランダムに手を選択
function randomMove() {
    const moves = ["グー", "チョキ", "パー"];
    return moves[Math.floor(Math.random() * moves.length)];
}

// ゲームのロジックはそのままにします
function decideComputerMove(moves, order = 3) {
    if (moves.length < order) {
        return randomMove();
    }
    const predictedMove = predictNextMove(moves, order) || predictMoveByFrequency(moves);
    const counterMoves = { "グー": "パー", "チョキ": "グー", "パー": "チョキ" };
    return counterMoves[predictedMove] || randomMove();
}

// ゲームを実行（ボタン連打をサポート）
function playGame(playerHand) {
    const computerHand = decideComputerMove(playerMoves, 3);
    const predictedMove = predictNextMove(playerMoves, 3); // AIの予測
    const result = judge(playerHand, computerHand);

    // AIの予測成功/失敗を記録
    if (predictedMove === playerHand) {
        aiSuccessCount++;
    } else {
        aiFailureCount++;
    }

    // 履歴と結果を保存
    playerMoves.push(playerHand);
    results.push({ playerHand, computerHand, result });

    // 統計の更新
    updateStatistics();

    // 結果を画面に表示
    document.getElementById('result').textContent = `あなた: ${playerHand}, AI: ${computerHand}, 結果: ${result}`;
}

// 統計を更新
function updateStatistics() {
    const totalGames = results.length;
    const wins = results.filter(result => result.result === '勝ち').length;
    const draws = results.filter(result => result.result === '引き分け').length;
    const losses = results.filter(result => result.result === '負け').length;
    const nonDrawGames = totalGames - draws;
    const winRate = nonDrawGames > 0 ? ((wins / nonDrawGames) * 100).toFixed(2) : 0;

    // 統計情報を更新
    document.getElementById('total-games').textContent = `総ゲーム数: ${totalGames}`;
    document.getElementById('win-count').textContent = `勝数: ${wins}`;
    document.getElementById('draw-count').textContent = `引き分け数: ${draws}`;
    document.getElementById('loss-count').textContent = `負け数: ${losses}`;
    document.getElementById('win-rate').textContent = `勝率（引き分け除外）: ${winRate}%`;
    document.getElementById('ai-success-count').textContent = `AI予測成功数: ${aiSuccessCount}`;
    document.getElementById('ai-failure-count').textContent = `AI予測失敗数: ${aiFailureCount}`;
}

// ダブルタップや連打を許可する
document.querySelectorAll(".choices button").forEach(button => {
    button.addEventListener("click", event => {
        event.preventDefault(); // デフォルトのクリック動作を防ぐ
        const playerHand = event.target.textContent;
        playGame(playerHand);
    });
});
