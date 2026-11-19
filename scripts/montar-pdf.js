#!/usr/bin/env node
// Monta o PDF da porta a partir de um arquivo Markdown simples.
// Uso: node montar-pdf.js porta.md [--saida porta.pdf] [--cor "#1f6f5c"] [--autor "@seuperfil"]
// Gera sempre o .html ao lado. Se achar Chrome, Edge ou Chromium no computador, gera o .pdf também.
// Não usa internet e não precisa instalar nada além do Node.

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { pathToFileURL } = require('url');

function args() {
  const a = process.argv.slice(2);
  const o = { entrada: null, saida: null, cor: '#1f6f5c', autor: '' };
  for (let i = 0; i < a.length; i++) {
    if (a[i] === '--saida') o.saida = a[++i];
    else if (a[i] === '--cor') o.cor = a[++i];
    else if (a[i] === '--autor') o.autor = a[++i];
    else if (!o.entrada) o.entrada = a[i];
  }
  if (!o.entrada) {
    console.error('Uso: node montar-pdf.js porta.md [--saida porta.pdf] [--cor "#1f6f5c"] [--autor "@seuperfil"]');
    process.exit(1);
  }
  if (!/^#[0-9a-fA-F]{3,8}$/.test(o.cor)) o.cor = '#1f6f5c';
  o.entrada = path.resolve(o.entrada);
  o.saida = path.resolve(o.saida || o.entrada.replace(/\.md$/i, '') + '.pdf');
  return o;
}

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  s = esc(s);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/(^|[^*])\*(?!\s)(.+?)\*/g, '$1<em>$2</em>');
  s = s.replace(/`([^`]+)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]\n]{2,80})\](?!\()/g, '<mark>[$1]</mark>');
  return s;
}

// Markdown simples: #, ##, ###, parágrafo, listas (- e 1.), > citação, --- quebra de página, tabela simples.
function md(texto) {
  const linhas = texto.replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let i = 0;
  let titulo = '';
  while (i < linhas.length) {
    const l = linhas[i];
    if (/^\s*$/.test(l)) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{1,3})\s+(.*)$/))) {
      const n = m[1].length;
      if (n === 1 && !titulo) titulo = m[2].trim();
      out.push(`<h${n}>${inline(m[2].trim())}</h${n}>`);
      i++; continue;
    }
    if (/^\s*(---|\*\*\*)\s*$/.test(l)) { out.push('<div class="quebra"></div>'); i++; continue; }
    if (/^\s*>/.test(l)) {
      const bloco = [];
      while (i < linhas.length && /^\s*>/.test(linhas[i])) { bloco.push(linhas[i].replace(/^\s*>\s?/, '')); i++; }
      out.push(`<blockquote>${inline(bloco.join(' '))}</blockquote>`);
      continue;
    }
    if (/^\s*([-*]|\d+[.)])\s+/.test(l)) {
      const ordenada = /^\s*\d+[.)]/.test(l);
      const itens = [];
      while (i < linhas.length && /^\s*([-*]|\d+[.)])\s+/.test(linhas[i])) {
        let item = linhas[i].replace(/^\s*([-*]|\d+[.)])\s+/, '');
        i++;
        while (i < linhas.length && /^\s{2,}\S/.test(linhas[i]) && !/^\s*([-*]|\d+[.)])\s+/.test(linhas[i])) { item += ' ' + linhas[i].trim(); i++; }
        const caixa = item.match(/^\[( |x)\]\s+(.*)$/i);
        itens.push(caixa ? `<li class="caixa">${caixa[1].toLowerCase() === 'x' ? '☑' : '☐'} ${inline(caixa[2])}</li>` : `<li>${inline(item)}</li>`);
      }
      out.push(ordenada ? `<ol>${itens.join('')}</ol>` : `<ul>${itens.join('')}</ul>`);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l)) {
      const rows = [];
      while (i < linhas.length && /^\s*\|.*\|\s*$/.test(linhas[i])) { rows.push(linhas[i]); i++; }
      const cel = (r) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
      const corpo = rows.filter((r) => !/^\s*\|[\s:|-]+\|\s*$/.test(r));
      const [cab, ...resto] = corpo;
      out.push('<table><thead><tr>' + cel(cab).map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>' +
        resto.map((r) => '<tr>' + cel(r).map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      continue;
    }
    const par = [];
    while (i < linhas.length && !/^\s*$/.test(linhas[i]) && !/^(#{1,3})\s|^\s*>|^\s*([-*]|\d+[.)])\s+|^\s*(---|\*\*\*)\s*$|^\s*\|/.test(linhas[i])) { par.push(linhas[i].trim()); i++; }
    out.push(`<p>${inline(par.join(' '))}</p>`);
  }
  return { html: out.join('\n'), titulo };
}

function pagina(corpo, titulo, cor, autor, subtitulo) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><title>${esc(titulo || 'Guia')}</title>
<style>
@page { size: A4; margin: 22mm 20mm; }
* { box-sizing: border-box; }
body { font-family: Georgia, 'Times New Roman', serif; font-size: 12.5pt; line-height: 1.6; color: #1d1d1b; margin: 0; }
.capa { height: 250mm; display: flex; flex-direction: column; justify-content: center; border-left: 10mm solid ${cor}; padding-left: 14mm; page-break-after: always; }
.capa h1 { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 34pt; line-height: 1.12; margin: 0 0 8mm; color: #111; }
.capa .sub { font-size: 15pt; color: #444; max-width: 135mm; margin-bottom: 10mm; }
.capa .autor { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 12pt; color: ${cor}; letter-spacing: .04em; }
h1, h2, h3 { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; line-height: 1.2; color: #111; }
h1 { font-size: 24pt; margin: 0 0 6mm; }
h2 { font-size: 18pt; margin: 12mm 0 4mm; padding-top: 3mm; border-top: 2px solid ${cor}; page-break-after: avoid; }
h2:first-of-type { page-break-before: auto; }
h3 { font-size: 13.5pt; margin: 7mm 0 2mm; color: ${cor}; page-break-after: avoid; }
p { margin: 0 0 3.5mm; }
ul, ol { margin: 0 0 4mm; padding-left: 7mm; }
li { margin: 0 0 1.5mm; }
li.caixa { list-style: none; margin-left: -6mm; }
blockquote { margin: 5mm 0; padding: 4mm 6mm; background: #f4f6f5; border-left: 3px solid ${cor}; font-style: italic; }
table { border-collapse: collapse; width: 100%; margin: 4mm 0 6mm; font-size: 11pt; }
th, td { border: 1px solid #d6d6d2; padding: 2mm 3mm; text-align: left; vertical-align: top; }
th { background: #f4f6f5; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; }
code { font-family: Consolas, monospace; font-size: 10.5pt; background: #f4f6f5; padding: 0 1mm; }
mark { background: #fff1a8; }
.quebra { page-break-after: always; }
.rodape { margin-top: 12mm; font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 10pt; color: #777; }
</style></head><body>
<section class="capa"><h1>${esc(titulo || 'Guia')}</h1>${subtitulo ? `<div class="sub">${subtitulo}</div>` : ''}${autor ? `<div class="autor">${esc(autor)}</div>` : ''}</section>
${corpo}
${autor ? `<p class="rodape">${esc(autor)}</p>` : ''}
</body></html>`;
}

function acharNavegador() {
  const c = [];
  if (process.platform === 'win32') {
    const bases = [process.env['PROGRAMFILES'], process.env['PROGRAMFILES(X86)'], process.env['LOCALAPPDATA']].filter(Boolean);
    for (const b of bases) {
      c.push(path.join(b, 'Google', 'Chrome', 'Application', 'chrome.exe'));
      c.push(path.join(b, 'Microsoft', 'Edge', 'Application', 'msedge.exe'));
      c.push(path.join(b, 'Chromium', 'Application', 'chrome.exe'));
    }
  } else if (process.platform === 'darwin') {
    c.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
    c.push('/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge');
    c.push('/Applications/Chromium.app/Contents/MacOS/Chromium');
  } else {
    for (const n of ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge']) {
      for (const d of ['/usr/bin', '/usr/local/bin', '/snap/bin']) c.push(path.join(d, n));
    }
  }
  return c.find((p) => { try { return fs.statSync(p).isFile(); } catch { return false; } }) || null;
}

function main() {
  const o = args();
  const texto = fs.readFileSync(o.entrada, 'utf8');
  const { html, titulo } = md(texto);
  // O título do arquivo vai na capa; tira o primeiro h1 do corpo para não repetir.
  let corpo = titulo ? html.replace(/<h1>.*?<\/h1>/, '') : html;
  // Parágrafos antes do primeiro capítulo viram o subtítulo da capa.
  let subtitulo = '';
  const abertura = corpo.match(/^\s*((?:<p>[\s\S]*?<\/p>\s*)+)/);
  if (abertura) { subtitulo = abertura[1]; corpo = corpo.slice(abertura[0].length); }
  corpo = corpo.replace(/^\s*<div class="quebra"><\/div>/, '');
  const htmlPath = o.saida.replace(/\.pdf$/i, '') + '.html';
  fs.writeFileSync(htmlPath, pagina(corpo, titulo, o.cor, o.autor, subtitulo), 'utf8');
  console.log('HTML: ' + htmlPath);

  const nav = acharNavegador();
  if (!nav) {
    console.log('PDF: não achei Chrome, Edge ou Chromium. Abra o HTML no navegador e use Imprimir > Salvar como PDF.');
    return;
  }
  const perfil = fs.mkdtempSync(path.join(require('os').tmpdir(), 'porta-pdf-'));
  try {
    execFileSync(nav, [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
      '--user-data-dir=' + perfil, '--no-pdf-header-footer', '--print-to-pdf-no-header',
      '--print-to-pdf=' + o.saida, pathToFileURL(htmlPath).href,
    ], { stdio: 'ignore', timeout: 60000 });
  } catch (e) {
    // alguns navegadores devolvem erro mesmo gerando o arquivo; confere abaixo
  } finally {
    try { fs.rmSync(perfil, { recursive: true, force: true }); } catch {}
  }
  if (fs.existsSync(o.saida) && fs.statSync(o.saida).size > 0) console.log('PDF: ' + o.saida);
  else console.log('PDF: o navegador não gerou o arquivo. Abra o HTML e use Imprimir > Salvar como PDF.');
}

main();
