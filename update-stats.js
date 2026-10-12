const fs = require("fs");

const PUUID = "dE7x4ZwOPBa_45mRFJxlTCXuwOfkvMsh9my9E__CJdtgDtoVHacfr-JH3xG23LDbV9cy-0n08rnvOA"
const API_KEY = process.env.RIOT_API_KEY

async function generateSvg(rank, wins, losses) {
    const svgContent = `<svg width="400" height="120" viewBox="0 0 400 120" xmlns="http://www.w3.org/2000/svg">
    <style>
        .bg { fill: #021a3f; rx: 8px; }
        .title { fill: #58a6ff; font-family: sans-serif; font-size: 14px; font-weight: bold; }
        .text { fill: #c9d1d9; font-family: sans-serif; font-size: 12px; }
        .highlight { fill: #f0883e; font-weight: bold; }
    </style>
    
    <rect width="400" height="120" class="bg" />
    <text x="20" y="30" class="title">League Profile Stats</text>
    <text x="20" y="65" class="text">Rank:</text>
    <text x="100" y="65" class="text highlight">${rank}</text>
    
    <text x="20" y="90" class="text">Wins/Losses:</text>
    <text x="100" y="90" class="text highlight">${wins} / ${losses}</text>
    </svg>`;

    fs.writeFileSync('./assets/stats.svg    ', svgContent);
    console.log("SVG stats updated successfully!");
}

async function getApi() {
    const accountUrl = "https://tr1.api.riotgames.com/lol/league/v4/entries/by-puuid/dE7x4ZwOPBa_45mRFJxlTCXuwOfkvMsh9my9E__CJdtgDtoVHacfr-JH3xG23LDbV9cy-0n08rnvOA"
    const accountRes = await fetch(accountUrl, {
        headers: {"X-Riot-Token": API_KEY}
    })
    const accountData = await accountRes.json();

    // console.log(accountData)
    
    const rank1 = accountData[1].tier + " " + accountData[1].rank
    const wins1 = accountData[1].wins
    const losses1 = accountData[1].losses

    return {
        rank:rank1,
        wins:wins1,
        losses:losses1
    }
}

async function main() {
    const stats = await getApi();

    generateSvg(stats.rank, stats.wins, stats.losses);
}

main()
