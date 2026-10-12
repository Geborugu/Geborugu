const fs = require("fs");
const path = require("path");

const PUUID = "dE7x4ZwOPBa_45mRFJxlTCXuwOfkvMsh9my9E__CJdtgDtoVHacfr-JH3xG23LDbV9cy-0n08rnvOA";
const API_KEY = process.env.RIOT_API_KEY;

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

    const outDir = path.resolve(__dirname, "assets");
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    const outPath = path.join(outDir, "stats.svg"); // fixed path (no trailing spaces)

    fs.writeFileSync(outPath, svgContent, "utf8");
    console.log("SVG stats updated successfully at", outPath);
}

async function getApi() {
    if (!API_KEY) {
        throw new Error("RIOT_API_KEY is not set in the environment. Add it to repository secrets and the workflow.");
    }

    const accountUrl = `https://tr1.api.riotgames.com/lol/league/v4/entries/by-puuid/${PUUID}`;
    const accountRes = await fetch(accountUrl, {
        headers: { "X-Riot-Token": API_KEY }
    });

    const text = await accountRes.text();
    let accountData;
    try {
        accountData = JSON.parse(text);
    } catch (err) {
        throw new Error(`Failed to parse Riot response: ${err.message}. Raw response: ${text}`);
    }

    if (!accountRes.ok) {
        // riot returns a structured error; include it for debugging
        throw new Error(`Riot API returned ${accountRes.status}: ${JSON.stringify(accountData)}`);
    }

    if (!Array.isArray(accountData) || accountData.length === 0) {
        throw new Error(`Unexpected Riot API response shape: expected non-empty array, got ${JSON.stringify(accountData)}`);
    }

    // Prefer SOLO queue entry if present, otherwise use the first entry
    const soloEntry = accountData.find(e => e.queueType === "RANKED_SOLO_5x5");
    const entry = soloEntry || accountData[0];

    const rank = `${entry.tier} ${entry.rank}`; // e.g. "GOLD II"
    const wins = entry.wins ?? 0;
    const losses = entry.losses ?? 0;

    return { rank, wins, losses };
}

async function main() {
    try {
        const stats = await getApi();
        await generateSvg(stats.rank, stats.wins, stats.losses);
    } catch (err) {
        console.error("Failed to update stats:", err);
        process.exitCode = 1;
    }
}

main();
