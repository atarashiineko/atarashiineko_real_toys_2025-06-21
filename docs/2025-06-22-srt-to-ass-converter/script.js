const fileInput = document.getElementById('fileInput');
const filenameSpan = document.getElementById('filename');
const outputDiv = document.getElementById('output');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const logDiv = document.getElementById('log');

let captions = [];
let styles = [];
let reservoir = [];

function log(msg, isError) {
    const div = document.createElement('div');
    div.textContent = msg;
    if (isError) div.classList.add('error');
    logDiv.prepend(div);
}

function setupStyles() {
    styles = [];
    for (let i = 1; i <= 10; i++) {
        styles.push({
            name: `HighContrast${String(i).padStart(2, '0')}`,
            Fontname: i % 2 === 0 ? 'Verdana' : 'Arial',
            Fontsize: 72,
            PrimaryColour: '&H00FFFFFF&',
            SecondaryColour: '&H00000000&',
            Outline: 2,
            Shadow: 1,
            Bold: 1,
            Italic: 0,
            Underline: 0,
            Alignment: 2
        });
    }
    reservoir = styles.map((_, idx) => idx);
}

function selectRandomStyle() {
    if (reservoir.length === 0) reservoir = styles.map((_, idx) => idx);
    const index = Math.floor(Math.random() * reservoir.length);
    const [picked] = reservoir.splice(index, 1);
    return styles[picked];
}

function parseSrt(text) {
    const lines = text.split(/\r\n|\n|\r/);
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const indexLine = lines[i++].trim();
        if (!indexLine) { continue; }
        const idx = parseInt(indexLine, 10);
        const timeLine = lines[i++] || '';
        const textLines = [];
        while (i < lines.length && lines[i].trim() !== '') {
            textLines.push(lines[i++]);
        }
        while (i < lines.length && lines[i].trim() === '') i++; // skip blank lines
        if (Number.isNaN(idx)) {
            log(`Error parsing block at input-line ${i}: invalid index`, true);
            continue;
        }
        const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
        if (!timeMatch) {
            log(`Error parsing block at input-line ${i}: malformed timecode`, true);
            continue;
        }
        if (textLines.length === 0) {
            log(`Error parsing block at input-line ${i}: missing text`, true);
            continue;
        }
        blocks.push({ index: idx, start: timeMatch[1], end: timeMatch[2], text: textLines.join('\n') });
    }
    return blocks;
}

function timeToAss(t) {
    const [h, m, sMs] = t.split(':');
    const [s, ms] = sMs.split(',');
    const cs = String(Math.round(parseInt(ms, 10) / 10)).padStart(2, '0');
    return `${parseInt(h, 10)}:${m}:${s}.${cs}`;
}

function formatAssHeader() {
    return `[Script Info]\nTitle: Styled Subtitles\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080`;
}

function formatAssStyles(stylesArr) {
    let out = `\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, Outline, Shadow, Bold, Italic, Underline, Alignment`;
    for (const st of stylesArr) {
        out += `\nStyle: ${st.name},${st.Fontname},${st.Fontsize},${st.PrimaryColour},${st.SecondaryColour},${st.Outline},${st.Shadow},${st.Bold},${st.Italic},${st.Underline},${st.Alignment}`;
    }
    return out;
}

function formatAssEvents(caps, stylesArr) {
    let out = `\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;
    for (const cap of caps) {
        const style = selectRandomStyle();
        out += `\nDialogue: 0,${timeToAss(cap.start)},${timeToAss(cap.end)},${style.name},,0000,0000,0000,,${cap.text.replace(/\n/g, '\\N')}`;
    }
    return out;
}

fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    filenameSpan.textContent = file.name;
    downloadBtn.disabled = true;
    copyBtn.disabled = true;
    outputDiv.textContent = '';
    log('Parsing...', false);
    const reader = new FileReader();
    reader.onload = () => {
        setupStyles();
        captions = parseSrt(reader.result);
        const ass = formatAssHeader() + formatAssStyles(styles) + formatAssEvents(captions, styles);
        outputDiv.textContent = ass;
        downloadBtn.disabled = captions.length === 0;
        copyBtn.disabled = captions.length === 0;
        log('Parsing complete', false);
    };
    reader.readAsText(file);
});

downloadBtn.addEventListener('click', () => {
    const blob = new Blob([outputDiv.textContent], { type: 'text/plain' });
    const a = document.createElement('a');
    const base = (fileInput.files[0]?.name || 'output').replace(/\.srt$/i, '');
    a.href = URL.createObjectURL(blob);
    a.download = `${base}.ass`;
    a.click();
    URL.revokeObjectURL(a.href);
});

copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(outputDiv.textContent);
        log('Copied to clipboard', false);
    } catch (e) {
        log('Clipboard failed', true);
    }
});
