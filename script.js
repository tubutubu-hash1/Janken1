let stats = {
  wins: 0,
  losses: 0,
  draws: 0,
  totalGames: 0,
  history: [] // 履歴を保存
};
let workbook = null; // 読み込んだExcelファイルを保持

const hands = ["rock", "paper", "scissors"];

// 機械学習用変数
let model = null; // 学習モデル

// じゃんけんの処理
function play(playerHand) {
  const computerHand = getComputerHand(playerHand);
  const result = getResult(playerHand, computerHand);

  stats.totalGames++;
  if (result === "win") stats.wins++;
  if (result === "loss") stats.losses++;
  if (result === "draw") stats.draws++;

  stats.history.push({ playerHand, computerHand, result });
  updateStats();
  updateHistoryTable();

  // 学習データの更新
  updateModel(playerHand, computerHand, result);
}

// 勝敗判定
function getResult(player, computer) {
  if (player === computer) return "draw";
  if (
    (player === "rock" && computer === "scissors") ||
    (player === "scissors" && computer === "paper") ||
    (player === "paper" && computer === "rock")
  ) {
    return "win";
  }
  return "loss";
}

// AIの手を取得 (ランダムまたは学習結果)
function getComputerHand(playerHand) {
  if (model && stats.history.length > 5) {
    const lastPlayerHand = stats.history[stats.history.length - 1]?.playerHand || "rock";
    const lastComputerHand = stats.history[stats.history.length - 1]?.computerHand || "rock";

    // プレイヤーの手とコンピューターの手から次を予測
    const prediction = model.predict([[handToNumber(lastPlayerHand), handToNumber(lastComputerHand)]]);
    return numberToHand(prediction[0]);
  } else {
    return hands[Math.floor(Math.random() * hands.length)];
  }
}

// 学習データを更新し、モデルを再学習
function updateModel(playerHand, computerHand, result) {
  const tf = ml5.logisticRegression();

  // トレーニングデータを準備
  const data = stats.history.map((entry) => [
    handToNumber(entry.playerHand),
    handToNumber(entry.computerHand),
    resultToNumber(entry.result)
  ]);

  if (data.length > 5) {
    tf.addData(data, stats.history.map((entry) => handToNumber(entry.playerHand)));
    tf.train(() => {
      model = tf;
    });
  }
}

// 統計のUI更新
function updateStats() {
  document.getElementById("total-games").textContent = stats.totalGames;
  document.getElementById("wins").textContent = stats.wins;
  document.getElementById("losses").textContent = stats.losses;
  document.getElementById("draws").textContent = stats.draws;
}

// 履歴テーブルの更新
function updateHistoryTable() {
  const tableBody = document.getElementById("history-table").querySelector("tbody");
  tableBody.innerHTML = ""; // 既存の行をクリア
  stats.history.forEach((entry, index) => {
    const row = tableBody.insertRow();
    row.insertCell().textContent = index + 1;
    row.insertCell().textContent = entry.playerHand;
    row.insertCell().textContent = entry.computerHand;
    row.insertCell().textContent = entry.result;
  });
}

// Excelファイルを読み込む
function loadExcel(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    const data = new Uint8Array(e.target.result);
    workbook = XLSX.read(data, { type: "array" });

    // 既存の履歴をロード
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(worksheet);
    stats.history = json.map((row, index) => ({
      playerHand: row["プレイヤーの手"],
      computerHand: row["コンピューターの手"],
      result: row["結果"]
    }));
    stats.totalGames = stats.history.length;
    stats.wins = stats.history.filter(h => h.result === "win").length;
    stats.losses = stats.history.filter(h => h.result === "loss").length;
    stats.draws = stats.history.filter(h => h.result === "draw").length;

    updateStats();
    updateHistoryTable();
  };

  reader.readAsArrayBuffer(file);
}

// 履歴をExcelに保存
function saveToExcel() {
  const worksheetData = stats.history.map((entry, index) => ({
    試合番号: index + 1,
    プレイヤーの手: entry.playerHand,
    コンピューターの手: entry.computerHand,
    結果: entry.result
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  if (!workbook) {
    workbook = XLSX.utils.book_new();
  }
  XLSX.utils.book_append_sheet(workbook, worksheet, "じゃんけん履歴");
  XLSX.writeFile(workbook, "じゃんけん結果.xlsx");
}

// 手を数字に変換
function handToNumber(hand) {
  return hands.indexOf(hand);
}

// 数字を手に変換
function numberToHand(number) {
  return hands[number];
}

// 結果を数字に変換
function resultToNumber(result) {
  return result === "win" ? 1 : result === "loss" ? -1 : 0;
}

// リセット
function resetGame() {
  stats = { wins: 0, losses: 0, draws: 0, totalGames: 0, history: [] };
  updateStats();
  updateHistoryTable();
}

// ダブルタップでズーム防止
document.addEventListener("dblclick", (e) => e.preventDefault());
