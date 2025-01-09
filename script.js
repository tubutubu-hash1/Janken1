// 結果を保存する配列
const results = [];

// AIの手をランダムに生成
function getAIHand() {
    const hands = ['グー', 'チョキ', 'パー'];
    return hands[Math.floor(Math.random() * hands.length)];
}

// 勝敗を判定
function determineWinner(playerHand, aiHand) {
    if (playerHand === aiHand) return '引き分け';
    if (
        (playerHand === 'グー' && aiHand === 'チョキ') ||
        (playerHand === 'チョキ' && aiHand === 'パー') ||
        (playerHand === 'パー' && aiHand === 'グー')
    ) {
        return '勝ち';
    }
    return '負け';
}

// ゲームを実行
function playGame(playerHand) {
    const aiHand = getAIHand();
    const result = determineWinner(playerHand, aiHand);

    // 結果を画面に表示
    document.getElementById('result').textContent = `あなた: ${playerHand}, AI: ${aiHand}, 結果: ${result}`;

    // 結果を配列に保存
    results.push({ playerHand, aiHand, result });
}

// 結果をExcelファイルで保存
function downloadResults() {
    if (results.length === 0) {
        alert('保存する結果がありません');
        return;
    }

    // 配列をワークシートに変換
    const worksheet = XLSX.utils.json_to_sheet(results);

    // ワークブックを作成
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'じゃんけん結果');

    // Excelファイルをダウンロード
    XLSX.writeFile(workbook, 'janken_results.xlsx');
}
