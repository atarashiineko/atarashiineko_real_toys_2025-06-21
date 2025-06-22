# 2025-06-22-srt-to-ass-converter
Date: 2025-06-22

Important Note: the examples below provided in TypeScript for clarity only. The project must be implemented in browser native Modern JavaScript with no external dependencies. 

The project should have descent and well designed layout and CSS Styles. No external dependencies. 



## 1. Project Overview

- Goal: Build a pure client-side HTML/CSS/JavaScript tool that converts a SubRip (.srt) file into a SubStation Alpha (.ass) file, preserving all original captions and timestamps but applying one of ten predefined high-contrast styles to each caption.

## 2. Technology Stack

- Languages: HTML5, CSS3, ES6+ JavaScript
- No server or build pipeline required; all code runs in browser.
- Supported browsers: latest Chrome, Edge, Firefox on Windows 10+ (must support contentEditable and File API).

## 3. User Interface

### 3.1 Layout

- Top toolbar containing:
  - “Choose File” input control (accept=".srt")
  - Filename display label
- Main area:
  - Large read-only contentEditable `<div id="output" contenteditable="false">` where generated .ass content appears.
- Bottom toolbar containing:
  - “Download .ass” button
  - “Copy to Clipboard” button
  - Error log panel `<div id="log">` (multi-line, scrollable)

### 3.2 Interaction

- On file selection:
  1. Read file via FileReader API.
  2. Immediately parse content.
  3. Populate `#output` with full .ass text.
  4. Report any parse errors in `#log` with line numbers.
- “Download .ass” triggers creation of Blob with MIME “text/plain” and downloads as original-basename.ass.
- “Copy to Clipboard” writes `#output.textContent` to clipboard and shows temporary confirmation (e.g. toast).

## 4. Data Formats

### 4.1 Input (.srt)

- Structure per caption block:
  1. Numeric index
  2. Timecode “HH:MM:SS,mmm --> HH:MM:SS,mmm”
  3. One or more lines of text
  4. Blank line delimiter

### 4.2 Output (.ass)

- Must include ASS header sections:

  ```
  [Script Info]
  Title: Styled Subtitles
  ScriptType: v4.00+
  PlayResX: 1920
  PlayResY: 1080
  
  [V4+ Styles]
  ; Style definitions (see Section 9)
  
  [Events]
  Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
  ```

- Each input caption produces one “Dialogue:” line under [Events], using corresponding start/end and a randomly selected Style name.

## 5. Parsing and Error Handling

- Implement robust SRT parser that:

  - Splits file by CRLF/CR or LF sequences.

  - Iterates blocks separated by blank lines.

  - Validates index (integer), timecode format, and presence of text.

  - On parse error (malformed timecode, missing fields), log an entry in `#log` with format:

    ```
    Error parsing block at input-line X: description
    ```

  - Continue parsing subsequent blocks despite errors.

## 6. Style Engine

- Predefine array `styles = [ { name, Fontname, Fontsize, PrimaryColour, SecondaryColour, Outline, Shadow, Bold, Italic, Underline, Alignment } , … ]` of length 10.

- Each style name must be unique (e.g. “HighContrast01” … “HighContrast10”).

- Colours use ASS hex format (&HBBGGRR&).

- Fontsize fixed at 72.

- Fonts must be common Windows fonts (e.g. Arial, Verdana, Tahoma).

- Example style object:

  ```
  {
    name: "HighContrast01",
    Fontname: "Arial",
    Fontsize: 72,
    PrimaryColour: "&H00FFFFFF&",
    SecondaryColour: "&H00000000&",
    Outline: 2,
    Shadow: 1,
    Bold: 1,
    Italic: 0,
    Underline: 0,
    Alignment: 2
  }
  ```

## 7. Random Style Selection Logic

- Use reservoir of available style indices `[0…9]`.
- For each caption block:
  1. If reservoir is empty, reset it to full `[0…9]`.
  2. Randomly pick one index from reservoir.
  3. Remove that index from reservoir.
  4. Assign `styles[pickedIndex]` to this caption.
- Ensures no style repeats until all ten have been used.

## 8. Output Generation Sequence

1. Build ASS header string.

2. Append Styles section by iterating `styles` array and formatting each into ASS style definition lines.

3. Append Events header.

4. For each parsed caption:

   - Format start/end times from “HH:MM:SS,mmm” to “H:MM:SS.mm” (ASS uses centiseconds).

   - Build “Dialogue:” line:

     ```
     Dialogue: 0,Start,End,StyleName,,0000,0000,0000,,CaptionText
     ```

   - Append to output buffer.

5. Set `#output.textContent` to full buffer.

## 9. Style Definitions Section

- Under `[V4+ Styles]`, include column header:

  ```
  Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, Outline, Shadow, Bold, Italic, Underline, Alignment
  ```

- Then ten lines, one per style object serialized in same order as `styles` array.

## 10. Logging Panel

- `#log` should display one `<div>` per message, newest at top.
- Errors styled in red text; informational messages in default color.

## 11. Function and Variable Structure

- Single global JavaScript module or IIFE.

- Key functions:

  - `parseSrt(text: string): CaptionBlock[]`
  - `formatAssHeader(): string`
  - `formatAssStyles(styles: Style[]): string`
  - `formatAssEvents(captions: CaptionBlock[], styles: Style[]): string`
  - `selectRandomStyle(): Style`

- Data types:

  ```
  interface CaptionBlock {
    index: number;
    start: string;  // "HH:MM:SS,mmm"
    end: string;    // "HH:MM:SS,mmm"
    text: string;   // may contain newlines
  }
  
  interface Style { … }  // as in Section 6
  ```

## 12. Performance and Edge Cases

- Support files up to 10 MB or ~100 000 caption blocks.
- Use streaming parse (split+loop) rather than regex-only.
- On extremely large files, show “Parsing…” indicator and disable controls until complete.
