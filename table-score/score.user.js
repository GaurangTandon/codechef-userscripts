// ==UserScript==
// @name         CodeChef problem totals for tables
// @version      0.0.1
// @description  adds total problem solves to top of table
// @author       Gaurang Tandon
// @match        https://www.codechef.com/public/rankings/*
// @run-at       document-start
// ==/UserScript==

function getOneRowScore(tr) {
    let nodes = tr.children;
    let scores = [];
    for (let i = nodes.length - 1; i >= 0; i--) {
        let td = nodes[i];
        // the "score" node comes just before problem node
        // and it has a title set
        if (td.getAttribute("title")) break;
        let tdScore = td.innerText.match("^\\d+");
        tdScore = tdScore ? tdScore[0] : "0";
        scores.unshift(Number.parseInt(tdScore));
    }
    return scores;
}

function addVectors(veca, vecb) {
    return veca.map((val, idx) => val + vecb[idx]);
}

function scoreAllRows(rows) {
    // html collection does not allow map by default
    let scores = [...rows].map(row => getOneRowScore(row));
    // sanity check: all rows must have same number of columns
    if (!scores.every(v => v.length === scores[0].length))
        return null;

    return scores.reduce(addVectors);
}

function getTH() {
    return document.createElement("th");
}

function getTHWithText(text) {
    let th = getTH();
    th.innerText = text;
    return th;
}
function getMultipleTHs(texts) {
    return texts.map(txt => getTHWithText(txt));
}

function getStats(scores) {
    let container = document.createElement("details");
    container.style.float = "left";

    let result = scores
        .map((val, idx) => [val, idx])
        .sort(([a], [b]) => b - a)
        .map(([val, idx], sortedIdx) => `${sortedIdx + 1}. P${idx + 1} (${val})`)
        .join("<br>");
    container.innerHTML = `<summary>Problems sorted in ascending order of score</summary>${result}`;
    container.style.cursor = "pointer";
    return container;
}

function improveTable(table) {
    let thead = table.children[0];
    let tbody = table.children[1];

    let scores = scoreAllRows(tbody.children);
    if (!scores) return;

    // pasting into th so it's unaffected by sorting of the table

    let newRow = document.createElement("tr");
    newRow.setAttribute("role", "row");

    newRow.appendChild(getTH());
    newRow.appendChild(getTHWithText("Problem total score"));
    newRow.appendChild(getTH());

    for (let th of getMultipleTHs(scores))
        newRow.appendChild(th);

    thead.appendChild(newRow);

    let statsContainer = getStats(scores);
    let tableContainer = table.parentNode;
    tableContainer.insertBefore(statsContainer, table);
}

function onDocLoad() {
    if (document.readyState !== "complete") {
        setTimeout(onDocLoad, 100);
        return;
    }

    let tables = document.querySelectorAll(".dataTable");
    for (let table of tables) {
        improveTable(table);
    }
}

onDocLoad();

