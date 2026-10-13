// Генератор HTML-макетов Meeting English (задача 2). Токены = Figma Variables.
import fs from 'node:fs';
import path from 'node:path';

const OUT = process.argv[2];
const ICONS = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
const inner = (n) => ICONS[n].replace(/^<svg[^>]*>\s*/, '').replace(/\s*<\/svg>$/, '');
const ic = (n, c = 'primary', s = 24, label) =>
  `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="var(--color-${c})" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" ${label ? `role="img" aria-label="${label}"` : 'aria-hidden="true"'}>${inner(n)}</svg>`;

const CSS = `
:root{--color-bg:#F6F7F8;--color-surface:#FFFFFF;--color-text:#20212B;--color-muted-text:#696C60;--color-muted-icon:#73766A;
--color-primary:#2D4354;--color-primary-hover:#233645;--color-on-primary:#FFFFFF;--color-primary-tint:#EAEEF1;--color-accent:#9E6752;--color-highlight:#FED7A5;
--color-dark:#534145;--color-success:#1F7A3A;--color-success-tint:#EAF4EC;--color-error:#B42318;--color-error-tint:#FBEDEB;
--color-border:#E3E5E8;--color-border-strong:#8C8F95}
*{box-sizing:border-box;margin:0}
body{font-family:Inter,system-ui,sans-serif;font-size:16px;line-height:24px;color:var(--color-text);background:var(--color-bg);-webkit-font-smoothing:antialiased}
.ic{flex:none;display:block}
h1{font-size:32px;line-height:40px;font-weight:600;letter-spacing:-.5px}
h2{font-size:24px;line-height:32px;font-weight:600;letter-spacing:-.3px}
h3{font-size:18px;line-height:26px;font-weight:600}
.cap{font-size:13px;line-height:18px;color:var(--color-muted-text)}
.lbl{font-size:14px;line-height:20px;font-weight:500}
.muted{color:var(--color-muted-text)}
.strong{font-weight:500}
.row{display:flex;align-items:center;gap:12px}.col{display:flex;flex-direction:column}
.between{justify-content:space-between}.grow{flex:1;min-width:0}
.topbar{height:64px;background:var(--color-primary);color:var(--color-on-primary);display:flex;align-items:center;justify-content:space-between;padding:0 32px}
.brand{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:600}
.shell{display:grid;grid-template-columns:264px 1fr;min-height:calc(100vh - 64px)}
.side{background:var(--color-surface);border-right:1px solid var(--color-border);padding:24px 16px;display:flex;flex-direction:column;gap:4px}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:6px;color:var(--color-text);white-space:nowrap}
.nav.on{background:var(--color-primary-tint);color:var(--color-primary);font-weight:500}
.side .sp{flex:1}
.main{padding:32px 40px;display:flex;flex-direction:column;gap:24px;min-width:0}
.card{background:var(--color-surface);border:1px solid var(--color-border);border-radius:8px;padding:24px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:40px;padding:0 16px;border-radius:6px;font-size:14px;line-height:20px;font-weight:500;border:1px solid transparent;white-space:nowrap;font-family:inherit}
.btn.p{background:var(--color-primary);color:var(--color-on-primary)}
.btn.s{background:var(--color-surface);color:var(--color-primary);border-color:var(--color-border-strong)}
.btn.g{background:transparent;color:var(--color-primary)}
.btn.sm{height:32px;padding:0 12px}
.btn{cursor:pointer;transition:background-color .15s,border-color .15s}
.btn.p:hover,.btn.p.is-hover{background:var(--color-primary-hover)}
.btn.s:hover,.btn.s.is-hover,.btn.g:hover,.btn.g.is-hover{background:var(--color-primary-tint)}
.btn:disabled,.btn.is-disabled{background:var(--color-bg);color:var(--color-muted-text);border-color:var(--color-border);cursor:not-allowed}
.btn.g:disabled,.btn.g.is-disabled{background:transparent;border-color:transparent}
:focus-visible,.is-focus{outline:2px solid var(--color-primary);outline-offset:2px}
.topbar :focus-visible,.topbar .is-focus{outline-color:var(--color-on-primary)}
.inp:hover,.inp.is-hover{border-color:var(--color-muted-text)}
.inp.is-disabled{background:var(--color-bg);border-color:var(--color-border);color:var(--color-muted-text)}
.inp.is-error{border-color:var(--color-error)}
.chip:hover,.chip.is-hover{background:var(--color-primary-tint)}
.chip.on{background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary)}
.ptrack{width:240px;height:6px;border-radius:3px;background:var(--color-border-strong);overflow:hidden}.ptrack .bar{background:var(--color-on-primary)}
.ibtn{width:40px;height:40px;display:inline-flex;align-items:center;justify-content:center;border-radius:6px}
.badge{display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:999px;font-size:13px;line-height:18px;white-space:nowrap}
.b-as{background:var(--color-primary-tint);color:var(--color-primary)}.b-sub{background:var(--color-highlight);color:var(--color-text)}
.b-ok{background:var(--color-success-tint);color:var(--color-success)}.b-late{background:var(--color-error-tint);color:var(--color-error)}
.av{width:32px;height:32px;border-radius:999px;background:var(--color-primary-tint);color:var(--color-primary);display:inline-flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;flex:none}
.av.m{width:40px;height:40px;font-size:14px}
.tabs{display:flex;border-bottom:1px solid var(--color-border);gap:4px}
.tab{padding:12px 16px;color:var(--color-muted-text);white-space:nowrap}.tab.on{color:var(--color-primary);font-weight:500;box-shadow:inset 0 -2px 0 var(--color-primary)}
.field{display:flex;flex-direction:column;gap:4px}
.inp{height:40px;border:1px solid var(--color-border-strong);border-radius:6px;background:var(--color-surface);padding:0 12px;display:flex;align-items:center;gap:8px;color:var(--color-text)}
.inp.ph{color:var(--color-muted-text)}.inp.focus{border:2px solid var(--color-primary);padding:0 11px}
textarea.inp{height:auto;padding:10px 12px;font:inherit;resize:none;width:100%}
.cell{display:inline-flex;align-items:center;gap:4px;height:32px;padding:0 10px;border-radius:4px;font-weight:500;vertical-align:middle;margin:0 2px;line-height:20px}
.c-empty,.c-sel.empty{min-width:96px}.c-empty{border:1px dashed var(--color-border-strong);background:var(--color-surface)}
.c-sel{border:2px solid var(--color-primary);background:var(--color-primary-tint);color:var(--color-primary)}
.c-ok{border:1px solid var(--color-success);background:var(--color-success-tint)}
.c-bad{border:1px solid var(--color-error);background:var(--color-error-tint)}
.chip{display:inline-flex;align-items:center;height:36px;padding:0 14px;border:1px solid var(--color-border-strong);border-radius:6px;background:var(--color-surface);font-weight:500}
.chip.used{color:var(--color-muted-text);border-style:dashed;background:var(--color-bg)}
.track{height:6px;background:var(--color-border);border-radius:3px;overflow:hidden}.bar{height:100%;background:var(--color-primary)}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:13px;line-height:18px;font-weight:500;color:var(--color-muted-text);padding:0 12px 12px}
td{padding:14px 12px;border-top:1px solid var(--color-border);vertical-align:middle}
.stat{display:flex;flex-direction:column;gap:4px}
.stat b{font-size:32px;line-height:40px;font-weight:600}
.grid3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.g2{display:grid;grid-template-columns:1.6fr 1fr;gap:24px;align-items:start}
.hl{background:var(--color-highlight);border-radius:6px;padding:12px 16px}
.dot{width:8px;height:8px;border-radius:999px;background:var(--color-success);flex:none}
.sec-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.divider{height:1px;background:var(--color-border)}
.switch{width:40px;height:24px;border-radius:999px;background:var(--color-primary);position:relative;flex:none}
.switch::after{content:'';position:absolute;right:3px;top:3px;width:18px;height:18px;border-radius:999px;background:var(--color-on-primary)}
.switch.off{background:var(--color-border-strong)}.switch.off::after{right:auto;left:3px}
.switch.inv{background:var(--color-on-primary)}.switch.inv::after{background:var(--color-primary)}
.block{border:1px solid var(--color-border);border-radius:8px;padding:20px;background:var(--color-surface)}
.block.sel{border:2px solid var(--color-primary);padding:19px}
.text-gaps{font-size:18px;line-height:44px}
@media (max-width:900px){
 .shell{grid-template-columns:72px 1fr}.side{padding:16px 12px;align-items:center}.nav{width:48px;justify-content:center;padding:0}.nav span{display:none}
 .main{padding:24px}.grid3{grid-template-columns:1fr 1fr}.g2{grid-template-columns:1fr}.topbar{padding:0 24px}.hide-t{display:none!important}.ptrack{width:120px}
}
@media (max-width:480px){
 .topbar{padding:0 12px}.player-main{padding:24px 16px!important;gap:16px!important}.player-main h1{font-size:24px;line-height:32px}
 .player-card{padding:20px!important}.text-gaps{font-size:17px;line-height:42px}.ptrack{width:72px}
 .player-actions{flex-direction:column-reverse;align-items:stretch!important;gap:8px}.player-actions .row{flex-direction:column-reverse;align-items:stretch;gap:8px}.player-actions .btn{width:100%}
}`;

const page = (
  title,
  body,
) => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Meeting English</title><link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet"><style>${CSS}</style></head><body>${body}</body></html>`;

const topbar = (
  name,
  ini,
  extra = '',
) => `<header class="topbar"><div class="brand">${ic('book-open', 'on-primary')}Meeting English</div>
<div class="row" style="gap:20px">${extra}<span class="ibtn">${ic('bell', 'on-primary', 24, 'Уведомления')}</span><span class="lbl hide-t">${name}</span><span class="av">${ini}</span></div></header>`;
const nav = (
  items,
  active,
) => `<nav class="side">${items.map(([i, t]) => `<a class="nav${t === active ? ' on' : ''}">${ic(i, t === active ? 'primary' : 'muted-icon')}<span>${t}</span></a>`).join('')}
<div class="sp"></div><a class="nav">${ic('settings', 'muted-icon')}<span>Настройки</span></a><a class="nav">${ic('log-out', 'muted-icon')}<span>Выход</span></a></nav>`;
const T_NAV = [
  ['layout-grid', 'Кабинет'],
  ['users', 'Ученики'],
  ['book-open', 'Уроки'],
  ['list-checks', 'Конструктор'],
  ['clipboard-check', 'Домашние задания'],
  ['calendar', 'Расписание'],
];
const S_NAV = [
  ['layout-grid', 'Кабинет'],
  ['book-open', 'Мои уроки'],
  ['clipboard-check', 'Домашние задания'],
  ['circle-check', 'Результаты'],
  ['calendar', 'Расписание'],
];
const prog = (p) =>
  `<div class="track" style="width:120px"><div class="bar" style="width:${p}%"></div></div>`;

const screens = {};

// 1. Вход / регистрация
screens['01-login'] = page(
  'Вход',
  `
<div style="min-height:100vh;display:flex;flex-direction:column">
<header class="row between" style="padding:24px 40px"><div class="brand" style="color:var(--color-primary)">${ic('book-open')}Meeting English</div><a class="lbl" style="color:var(--color-primary)">Помощь</a></header>
<main style="flex:1;display:flex;align-items:center;justify-content:center;padding:24px">
<div class="card" style="width:440px;padding:40px;display:flex;flex-direction:column;gap:24px">
 <div class="col" style="gap:8px"><h1>Вход</h1><p class="muted">Занятия английским один на один: уроки, домашние задания и виртуальный класс.</p></div>
 <div class="tabs"><div class="tab on">Вход</div><div class="tab">Регистрация</div></div>
 <div class="field"><span class="lbl">Электронная почта</span><div class="inp focus">anna.koroleva@mail.ru</div></div>
 <div class="field"><span class="lbl">Пароль</span><div class="inp">••••••••••<span class="grow"></span>${ic('eye', 'muted-icon', 20, 'Показать пароль')}</div>
  <div class="row between"><span class="cap">Не меньше 8 символов</span><a class="cap" style="color:var(--color-primary);font-weight:500">Забыли пароль?</a></div></div>
 <button class="btn p" style="width:100%">Войти</button>
 <div class="divider"></div>
 <div class="col" style="gap:8px"><span class="lbl">Нет аккаунта? Я регистрируюсь как</span>
  <div class="row"><div class="card row" style="padding:12px 16px;flex:1;border:2px solid var(--color-primary);background:var(--color-primary-tint)">${ic('graduation-cap')}<span class="strong" style="color:var(--color-primary)">Учитель</span></div>
  <div class="card row" style="padding:12px 16px;flex:1">${ic('user', 'muted-icon')}<span>Ученик</span></div></div></div>
</div></main>
<footer style="background:var(--color-dark);color:var(--color-on-primary);padding:20px 40px" class="row between"><span class="cap" style="color:var(--color-on-primary)">© 2026 Meeting English</span><span class="cap" style="color:var(--color-on-primary)">Политика конфиденциальности · Условия</span></footer>
</div>`,
);

// 2. Кабинет учителя
const students = [
  ['АК', 'Анна Королёва', 'B1', 72, ['b-sub', 'Сдано']],
  ['ДП', 'Дмитрий Петров', 'A2', 45, ['b-late', 'Просрочено']],
  ['ЕС', 'Елена Соколова', 'B2', 88, ['b-ok', 'Проверено']],
  ['МВ', 'Максим Волков', 'A2', 30, ['b-as', 'Назначено']],
  ['ОН', 'Ольга Новикова', 'B1', 64, ['b-ok', 'Проверено']],
];
screens['02-teacher'] = page(
  'Кабинет учителя',
  topbar('Ирина Смирнова', 'ИС') +
    `<div class="shell">${nav(T_NAV, 'Кабинет')}<main class="main">
<div class="row between"><div class="col"><h1>Добрый день, Ирина</h1><span class="muted">Понедельник, 12 октября · 3 урока сегодня</span></div>
<button class="btn p">${ic('play', 'on-primary', 20)}Запустить класс</button></div>
<div class="grid3">
<div class="card stat"><span class="row muted">${ic('users', 'muted-icon', 20)}Активные ученики</span><b>12</b><span class="cap">+2 за месяц</span></div>
<div class="card stat"><span class="row muted">${ic('calendar', 'muted-icon', 20)}Уроков на неделе</span><b>9</b><span class="cap">Ближайший в 16:00</span></div>
<div class="card stat hide-t"><span class="row muted">${ic('clipboard-check', 'muted-icon', 20)}ДЗ ждут проверки</span><b>5</b><span class="cap">2 просрочены</span></div></div>
<div class="g2">
<section class="card"><div class="sec-title"><h2>Ученики и прогресс</h2><a class="btn g sm">Все ученики${ic('chevron-right', 'primary', 20)}</a></div>
<table><thead><tr><th>Ученик</th><th>Уровень</th><th>Прогресс курса</th><th>Последнее ДЗ</th></tr></thead><tbody>
${students.map(([i, n, l, p, [b, bt]]) => `<tr><td><div class="row"><span class="av">${i}</span><span class="strong">${n}</span></div></td><td class="muted">${l}</td><td><div class="row">${prog(p)}<span class="lbl" style="font-variant-numeric:tabular-nums">${p}%</span></div></td><td><span class="badge ${b}">${bt}</span></td></tr>`).join('')}
</tbody></table></section>
<section class="card"><div class="sec-title"><h2>Ближайшие уроки</h2></div><div class="col" style="gap:0">
${[
  ['16:00', 'Анна Королёва', 'Present Perfect: опыт и результат', true],
  ['17:30', 'Максим Волков', 'Past Simple: неправильные глаголы'],
  ['19:00', 'Елена Соколова', 'Conditionals: second и third'],
]
  .map(
    ([t, n, l, now], k) => `
<div class="row" style="padding:16px 0;${k ? 'border-top:1px solid var(--color-border)' : ''};align-items:flex-start"><div class="col" style="width:56px"><span class="strong">${t}</span><span class="cap">сегодня</span></div>
<div class="col grow"><span class="strong">${l}</span><span class="cap">${n}</span></div>${now ? `<button class="btn p sm">Начать</button>` : `<button class="btn s sm">Открыть</button>`}</div>`,
  )
  .join('')}
</div><div class="hl row" style="margin-top:8px">${ic('clock', 'primary', 20)}<span class="cap" style="color:var(--color-text)">Через 25 минут — урок с Анной</span></div></section>
</div></main></div>`,
);

// 3. Кабинет ученика
const lessonCard = (
  n,
  lvl,
  title,
  desc,
  date,
  done,
  total,
  badge,
  cls = '',
) => `<div class="card col ${cls}" style="gap:12px">
<div class="row between"><span class="row" style="gap:8px">${ic('book-open')}<span class="cap">${n} · ${lvl}</span></span>${badge}</div>
<h3>${title}</h3><p class="muted">${desc}</p><span class="row cap" style="gap:8px">${ic('calendar', 'muted-icon', 20)}${date}</span>
<div class="col" style="gap:6px"><div class="row between"><span class="cap">Прогресс</span><span class="cap" style="color:var(--color-text)">${done} из ${total}</span></div><div class="track"><div class="bar" style="width:${(done / total) * 100}%"></div></div></div>
<button class="btn s" style="margin-top:auto">Открыть урок</button></div>`;
screens['03-student'] = page(
  'Кабинет ученика',
  topbar('Анна Королёва', 'АК') +
    `<div class="shell">${nav(S_NAV, 'Кабинет')}<main class="main">
<div class="col"><h1>Мои уроки</h1><span class="muted">Учитель: Ирина Смирнова · уровень B1</span></div>
<div class="card row between" style="background:var(--color-primary);border-color:var(--color-primary);color:var(--color-on-primary)">
<div class="row" style="gap:16px">${ic('calendar', 'on-primary')}<div class="col"><span class="strong">Следующий урок сегодня в 16:00</span><span class="cap" style="color:var(--color-on-primary)">Present Perfect: опыт и результат · Ирина Смирнова</span></div></div>
<button class="btn" style="background:var(--color-surface);color:var(--color-primary)">Войти в класс</button></div>
<div class="tabs"><div class="tab on">Уроки</div><div class="tab">Домашние задания · 2</div><div class="tab">Результаты</div></div>
<div class="grid3">
${lessonCard('Урок 5', 'B1', 'Present Perfect: опыт и результат', 'Текст с пропусками и выбор формы глагола.', '12 октября, 16:00', 7, 12, '<span class="badge b-as">Назначено</span>')}
${lessonCard('Урок 4', 'B1', 'Past Simple vs Present Perfect', 'Сравнение времён на примерах из путешествий.', '8 октября, 16:00', 12, 12, '<span class="badge b-ok">Проверено</span>')}
${lessonCard('Урок 3', 'B1', 'Лексика: работа и карьера', '20 слов, сопоставление и диалог.', '5 октября, 16:00', 10, 10, '<span class="badge b-sub">Сдано</span>', 'hide-t')}
</div>
<div class="g2"><section class="card"><div class="sec-title"><h2>Домашние задания</h2></div><table><tbody>
${[
  ['Present Perfect — упражнения 1–4', 'до 14 октября', 'b-as', 'Назначено'],
  ['Эссе: «Моя первая работа»', 'до 10 октября', 'b-late', 'Просрочено'],
  ['Лексика: работа и карьера', 'сдано 6 октября', 'b-ok', 'Проверено'],
]
  .map(
    ([t, d, b, bt], k) =>
      `<tr><td style="${k ? '' : 'border-top:0'}"><div class="row">${ic('clipboard-check', 'muted-icon')}<div class="col"><span class="strong">${t}</span><span class="cap">${d}</span></div></div></td><td style="text-align:right;${k ? '' : 'border-top:0'}"><span class="badge ${b}">${bt}</span></td></tr>`,
  )
  .join('')}
</tbody></table></section>
<section class="card col" style="gap:16px"><h2>Результаты</h2>
${[
  ['Урок 4 · Past Simple', 92],
  ['Урок 3 · Лексика', 85],
  ['Урок 2 · Артикли', 70],
]
  .map(
    ([t, s]) =>
      `<div class="col" style="gap:6px"><div class="row between"><span>${t}</span><span class="strong">${s}%</span></div><div class="track"><div class="bar" style="width:${s}%"></div></div></div>`,
  )
  .join('')}
</section></div></main></div>`,
);

// 4. Конструктор урока
screens['04-builder'] = page(
  'Конструктор урока',
  topbar('Ирина Смирнова', 'ИС') +
    `
<div style="display:grid;grid-template-columns:280px 1fr 320px;min-height:calc(100vh - 64px)">
<aside class="side" style="gap:8px"><div class="row between" style="padding:0 8px 8px"><h3>Блоки урока</h3><span class="cap">6</span></div>
${[
  ['type', 'Заголовок'],
  ['list-checks', 'Пропуски', 1],
  ['circle-check', 'Выбор слова'],
  ['layout-grid', 'Сопоставление'],
  ['book-open', 'Чтение'],
  ['clipboard-check', 'Домашнее задание'],
]
  .map(
    ([i, t, on], k) =>
      `<div class="nav${on ? ' on' : ''}" style="height:48px">${ic('grip-vertical', 'muted-icon', 20)}${ic(i, on ? 'primary' : 'muted-icon', 20)}<span class="grow">${k + 1}. ${t}</span></div>`,
  )
  .join('')}
<button class="btn s" style="margin-top:8px">${ic('plus', 'primary', 20)}Добавить блок</button></aside>
<main style="padding:24px 32px;display:flex;flex-direction:column;gap:20px;min-width:0">
<div class="row between"><div class="col"><span class="cap">Конструктор · черновик сохранён в 15:42</span><h2>Урок 5. Present Perfect</h2></div>
<div class="row"><button class="btn g">${ic('eye', 'primary', 20)}Предпросмотр</button><button class="btn s">Сохранить</button><button class="btn p">Опубликовать</button></div></div>
<div class="tabs"><div class="tab on">Редактор</div><div class="tab">Предпросмотр ученика</div></div>
<div class="block col" style="gap:8px"><span class="cap">Блок 1 · Заголовок и инструкция</span><h3>Have you ever…?</h3><p class="muted">Прочитайте текст и вставьте глагол в правильной форме.</p></div>
<div class="block sel col" style="gap:12px"><div class="row between"><span class="cap" style="color:var(--color-primary);font-weight:500">Блок 2 · Текст с пропусками — выбран</span><span class="ibtn">${ic('trash-2', 'muted-icon', 20, 'Удалить блок')}</span></div>
<p class="text-gaps">I <span class="cell c-sel">have been</span> to London twice. My sister <span class="cell c-empty"></span> never <span class="cell c-empty"></span> sushi. We <span class="cell c-empty"></span> in this flat since 2019.</p>
<div class="row" style="flex-wrap:wrap;gap:8px"><span class="cap">Варианты для ученика:</span><span class="chip">have been</span><span class="chip">has</span><span class="chip">tried</span><span class="chip">have lived</span><span class="chip">has gone</span></div></div>
<div class="block col" style="gap:8px"><span class="cap">Блок 3 · Выбор слова</span><p>She has lived here <span class="cell c-empty"></span> five years. <span class="muted">(for / since)</span></p></div>
</main>
<aside style="background:var(--color-surface);border-left:1px solid var(--color-border);padding:24px;display:flex;flex-direction:column;gap:20px">
<h3>Настройки блока</h3>
<div class="field"><span class="lbl">Тип блока</span><div class="inp">Текст с пропусками<span class="grow"></span>${ic('chevron-right', 'muted-icon', 20)}</div></div>
<div class="field"><span class="lbl">Пропуск 1 — правильный ответ</span><div class="inp focus">have been</div></div>
<div class="field"><span class="lbl">Допустимые варианты</span><div class="inp ph">Например: ’ve been</div><span class="cap">Через запятую</span></div>
<div class="divider"></div>
<div class="row between"><span>Показывать банк слов</span><span class="switch"></span></div>
<div class="row between"><span>Учитывать регистр</span><span class="switch off"></span></div>
<div class="row between"><span>Включить в ДЗ</span><span class="switch"></span></div>
<div class="divider"></div>
<div class="field"><span class="lbl">Подсказка для ученика</span><textarea class="inp" rows="3">Обратите внимание на слова never и since.</textarea></div>
</aside></div>`,
);

// 5. Плеер урока
screens['05-player'] = page(
  'Плеер урока',
  `
<header class="topbar"><div class="row" style="gap:16px"><span class="ibtn">${ic('x', 'on-primary', 24, 'Выйти из урока')}</span><div class="col"><span class="strong">Урок 5. Present Perfect</span><span class="cap" style="color:var(--color-on-primary)">Задание 2 из 12</span></div></div>
<div class="row" style="gap:12px"><div class="ptrack" role="progressbar" aria-valuenow="17" aria-valuemin="0" aria-valuemax="100" aria-label="Прогресс урока"><div class="bar" style="width:17%"></div></div><span class="lbl">17%</span></div></header>
<main class="player-main" style="max-width:800px;margin:0 auto;padding:40px 24px;display:flex;flex-direction:column;gap:24px">
<div class="col" style="gap:8px"><span class="cap">Текст с пропусками</span><h1>Have you ever…?</h1><p class="muted">Выберите пропуск, затем слово из банка слов. Когда заполните все пропуски, проверьте ответы.</p></div>
<div class="card col player-card" style="gap:20px;padding:32px">
<p class="text-gaps">I <span class="cell c-ok">${ic('check', 'success', 16)}have been</span> to London twice. My sister <span class="cell c-bad">${ic('x', 'error', 16)}<s>has gone</s></span> never <span class="cell c-ok">${ic('check', 'success', 16)}tried</span> sushi. We <span class="cell c-sel empty">&nbsp;</span> in this flat since 2019.</p>
<div class="divider"></div>
<div class="col" style="gap:12px"><span class="lbl">Банк слов</span><div class="row" style="flex-wrap:wrap;gap:8px"><span class="chip used">have been</span><span class="chip used">has gone</span><span class="chip">has</span><span class="chip used">tried</span><span class="chip">have lived</span><span class="chip">has lived</span></div></div></div>
<div class="row" style="gap:12px;padding:16px;border-radius:8px;border:1px solid var(--color-error);background:var(--color-error-tint);align-items:flex-start">${ic('circle-x', 'error')}<div class="col"><span class="strong" style="color:var(--color-error)">Пропуск 2: неверно</span><span>С never нужна форма has + V3: «My sister <b>has</b> never tried sushi».</span></div></div>
<div class="row" style="gap:12px;padding:16px;border-radius:8px;border:1px solid var(--color-success);background:var(--color-success-tint)">${ic('circle-check', 'success')}<span class="strong" style="color:var(--color-success)">Пропуски 1 и 3: верно</span></div>
<div class="row between player-actions"><button class="btn s">Назад</button><div class="row"><button class="btn g">Пропустить</button><button class="btn p">Проверить${ic('arrow-right', 'on-primary', 20)}</button></div></div>
</main>`,
);

// 6. Виртуальный класс (вид учителя)
const ctrl = `<div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn s sm">${ic('rotate-ccw', 'primary', 20)}Сбросить</button><button class="btn s sm">${ic('eye', 'primary', 20)}Показать ответ</button><button class="btn s sm">${ic('lock', 'primary', 20)}Заблокировать</button></div>`;
screens['06-classroom'] = page(
  'Виртуальный класс',
  `
<header class="topbar"><div class="row" style="gap:16px"><div class="brand">${ic('users', 'on-primary')}Виртуальный класс</div><span class="cap" style="color:var(--color-on-primary)">Урок 5. Present Perfect · идёт 18:42</span></div>
<div class="row" style="gap:16px"><div class="row" style="gap:10px">${ic('navigation', 'on-primary', 20)}<span class="lbl">Следуй за мной</span><span class="switch inv" role="switch" aria-checked="true"></span></div>
<button class="btn" style="background:var(--color-accent);color:var(--color-on-primary)">Завершить урок</button></div></header>
<div style="display:grid;grid-template-columns:1fr 340px;min-height:calc(100vh - 64px)">
<main style="padding:24px 32px;display:flex;flex-direction:column;gap:20px">
<div class="hl row">${ic('navigation', 'primary', 20)}<span>«Следуй за мной» включён: ученик видит тот же блок, что и вы — <b>блок 2 из 6</b></span></div>
<div class="block sel col" style="gap:16px"><div class="row between" style="align-items:flex-start"><div class="col"><span class="cap" style="color:var(--color-primary);font-weight:500">Блок 2 · Текст с пропусками · сейчас у ученика</span><h3>Have you ever…?</h3></div>${ctrl}</div>
<p class="text-gaps">I <span class="cell c-ok">${ic('check', 'success', 16)}have been</span> to London twice. My sister <span class="cell c-bad">${ic('x', 'error', 16)}<s>has gone</s></span> never <span class="cell c-ok">${ic('check', 'success', 16)}tried</span> sushi. We <span class="cell c-sel">have lived</span> in this flat since 2019.</p>
<div class="row" style="gap:20px"><span class="row cap" style="gap:6px">${ic('circle-check', 'success', 20)}2 верно</span><span class="row cap" style="gap:6px">${ic('circle-x', 'error', 20)}1 неверно</span><span class="row cap" style="gap:6px">${ic('clock', 'muted-icon', 20)}1 выбирается — Анна сейчас здесь</span></div></div>
<div class="block col" style="gap:12px"><div class="row between"><div class="col"><span class="cap">Блок 3 · Выбор слова</span><h3>For или since?</h3></div><span class="badge b-as" style="gap:6px">${ic('lock', 'primary', 16)}Заблокирован</span></div>
<p>She has lived here <span class="cell c-empty"></span> five years.</p></div>
</main>
<aside style="background:var(--color-surface);border-left:1px solid var(--color-border);padding:24px;display:flex;flex-direction:column;gap:20px">
<h3>Участники</h3>
<div class="row"><span class="av m">АК</span><div class="col grow"><span class="strong">Анна Королёва</span><span class="row cap" style="gap:6px"><span class="dot"></span>В сети · на блоке 2</span></div></div>
<div class="row"><span class="av m">ИС</span><div class="col grow"><span class="strong">Ирина Смирнова</span><span class="row cap" style="gap:6px"><span class="dot"></span>Вы · ведущий</span></div></div>
<div class="divider"></div><h3>Ход урока</h3>
<div class="col" style="gap:14px">
${[
  ['18:41', 'check', 'success', 'Анна вставила «tried» в пропуск 3 — верно'],
  ['18:40', 'x', 'error', 'Анна вставила «has gone» в пропуск 2 — неверно'],
  ['18:38', 'check', 'success', 'Анна вставила «have been» в пропуск 1 — верно'],
  ['18:36', 'lock', 'muted-icon', 'Вы заблокировали блок 3'],
]
  .map(
    ([t, i, c, s]) =>
      `<div class="row" style="align-items:flex-start;gap:10px"><span class="cap" style="width:40px;padding-top:3px;font-variant-numeric:tabular-nums">${t}</span>${ic(i, c, 20)}<span class="grow">${s}</span></div>`,
  )
  .join('')}
</div></aside></div>`,
);

// 7a. Список ДЗ
const hw = [
  ['АК', 'Анна Королёва', 'Present Perfect — упражнения 1–4', '14 окт', 'b-sub', 'Сдано', '—'],
  ['ДП', 'Дмитрий Петров', 'Эссе: «Моя первая работа»', '10 окт', 'b-late', 'Просрочено', '—'],
  ['ЕС', 'Елена Соколова', 'Conditionals — тест', '9 окт', 'b-ok', 'Проверено', '94%'],
  ['МВ', 'Максим Волков', 'Past Simple — неправильные глаголы', '16 окт', 'b-as', 'Назначено', '—'],
  ['ОН', 'Ольга Новикова', 'Лексика: путешествия', '8 окт', 'b-ok', 'Проверено', '81%'],
  ['АК', 'Анна Королёва', 'Лексика: работа и карьера', '6 окт', 'b-ok', 'Проверено', '85%'],
];
screens['07a-homework-list'] = page(
  'Домашние задания',
  topbar('Ирина Смирнова', 'ИС') +
    `<div class="shell">${nav(T_NAV, 'Домашние задания')}<main class="main">
<div class="row between"><div class="col"><h1>Домашние задания</h1><span class="muted">5 ждут проверки, 2 просрочены</span></div><button class="btn p">${ic('plus', 'on-primary', 20)}Назначить ДЗ</button></div>
<div class="row between"><div class="tabs grow"><div class="tab on">Все · 18</div><div class="tab">На проверке · 5</div><div class="tab">Проверено · 11</div><div class="tab hide-t">Просрочено · 2</div></div>
<div class="inp ph hide-t" style="width:280px;margin-left:24px">${ic('search', 'muted-icon', 20)}Поиск по ученику или теме</div></div>
<section class="card" style="padding:12px 12px 0"><table><thead><tr><th style="padding-top:12px">Ученик</th><th style="padding-top:12px">Задание</th><th style="padding-top:12px" class="hide-t">Срок</th><th style="padding-top:12px">Статус</th><th style="padding-top:12px" class="hide-t">Оценка</th><th></th></tr></thead><tbody>
${hw.map(([i, n, t, d, b, bt, s]) => `<tr><td><div class="row"><span class="av">${i}</span><span class="strong">${n}</span></div></td><td>${t}</td><td class="muted hide-t">${d}</td><td><span class="badge ${b}">${bt}</span></td><td class="hide-t">${s}</td><td style="text-align:right">${bt === 'Сдано' ? '<button class="btn p sm">Проверить</button>' : `<span class="ibtn">${ic('chevron-right', 'muted-icon', 24, 'Открыть')}</span>`}</td></tr>`).join('')}
</tbody></table></section></main></div>`,
);

// 7b. Проверка ДЗ
screens['07b-homework-review'] = page(
  'Проверка ДЗ',
  topbar('Ирина Смирнова', 'ИС') +
    `<div class="shell">${nav(T_NAV, 'Домашние задания')}<main class="main">
<div class="col" style="gap:4px"><span class="cap">Домашние задания / Анна Королёва</span><div class="row between"><h1>Present Perfect — упражнения 1–4</h1><span class="badge b-sub">Сдано 12 октября, 21:14</span></div></div>
<div class="g2">
<div class="col" style="gap:16px">
<div class="card col" style="gap:16px"><div class="row between"><h3>Упражнение 1. Текст с пропусками</h3><span class="lbl">3 из 4</span></div>
<p class="text-gaps">I <span class="cell c-ok">${ic('check', 'success', 16)}have been</span> to London twice. My sister <span class="cell c-bad">${ic('x', 'error', 16)}<s>has gone</s></span> never tried sushi. We <span class="cell c-ok">${ic('check', 'success', 16)}have lived</span> here since 2019. He <span class="cell c-ok">${ic('check', 'success', 16)}has just finished</span> work.</p>
<div class="row cap" style="gap:8px">${ic('circle-x', 'error', 20)}<span style="color:var(--color-text)">Пропуск 2 — правильный ответ: <b>has</b></span></div></div>
<div class="card col" style="gap:12px"><div class="row between"><h3>Упражнение 4. Короткий ответ</h3><span class="badge b-as">Нужна ручная проверка</span></div>
<p class="muted">Напишите 3 предложения о том, что вы уже сделали в этом году.</p>
<div style="padding:16px;border-radius:6px;background:var(--color-bg)">This year I have visited Kazan. I have started a new job. I have never been so busy!</div></div>
</div>
<aside class="card col" style="gap:20px"><h3>Итог проверки</h3>
<div class="row between"><span class="muted">Автопроверка</span><span class="strong">11 из 12 · 92%</span></div>
<div class="track"><div class="bar" style="width:92%"></div></div>
<div class="field"><span class="lbl">Оценка за ДЗ</span><div class="row" style="gap:8px">${[5, 4, 3, 2].map((n, k) => `<span class="chip${k === 0 ? ' on' : ''}" role="radio" aria-checked="${k === 0}" style="width:48px;justify-content:center">${n}</span>`).join('')}</div></div>
<div class="field"><span class="lbl">Комментарий ученику</span><textarea class="inp" rows="4">Отлично! Повтори has/have с he/she — разберём на уроке.</textarea></div>
<div class="col" style="gap:8px"><button class="btn p">${ic('circle-check', 'on-primary', 20)}Принять ДЗ</button><button class="btn s">${ic('rotate-ccw', 'primary', 20)}Вернуть на доработку</button></div>
</aside></div></main></div>`,
);

// 8. Состояния элементов (hover / focus-visible / disabled / error).
const stateRow = (title, items) =>
  `<div class="col" style="gap:12px"><span class="lbl">${title}</span><div class="row" style="gap:24px;align-items:flex-start;flex-wrap:wrap">${items.map(([cap, el]) => `<div class="col" style="gap:8px;min-width:140px"><span class="cap">${cap}</span>${el}</div>`).join('')}</div></div>`;
const ST = [
  ['Default', ''],
  ['Hover', ' is-hover'],
  ['Focus-visible', ' is-focus'],
  ['Disabled', ' is-disabled'],
];
const dis = (k) => k.includes('disabled');
screens['08-states'] = page(
  'Состояния',
  `<main style="max-width:1200px;margin:0 auto;padding:40px;display:flex;flex-direction:column;gap:24px">
<div class="col" style="gap:8px"><h1>Состояния элементов</h1><p class="muted">Hover — тинт primary-tint или primary-hover. Focus-visible — кольцо 2px primary с отступом 2px (на тёмной шапке — белое). Disabled — фон bg, граница border, текст muted-text (5.0:1), без прозрачности.</p></div>
<div class="card col" style="gap:32px">
${stateRow(
  'Button / Primary',
  ST.map(([c, k]) => [
    c,
    `<button class="btn p${k}">${ic('plus', dis(k) ? 'muted-icon' : 'on-primary', 20)}Добавить блок</button>`,
  ]),
)}
${stateRow(
  'Button / Secondary',
  ST.map(([c, k]) => [c, `<button class="btn s${k}">Открыть урок</button>`]),
)}
${stateRow(
  'Button / Ghost',
  ST.map(([c, k]) => [c, `<button class="btn g${k}">Пропустить</button>`]),
)}
${stateRow(
  'Кнопка-иконка (aria-label обязателен)',
  ST.map(([c, k]) => [
    c,
    `<span class="ibtn btn g${k}" style="padding:0">${ic('x', dis(k) ? 'muted-icon' : 'primary', 24, 'Закрыть')}</span>`,
  ]),
)}
<div class="divider"></div>
${stateRow(
  'Input',
  [...ST, ['Error', ' is-error']].map(([c, k]) => [
    c,
    `<div class="field" style="width:220px"><span class="lbl"${dis(k) ? ' style="color:var(--color-muted-text)"' : ''}>Электронная почта</span><div class="inp${k}">${k.includes('error') ? 'anna@school' : 'name@school.ru'}</div>${k.includes('error') ? `<span class="row cap" style="gap:4px;color:var(--color-error)">${ic('circle-x', 'error', 16)}Введите адрес полностью</span>` : '<span class="cap">Подсказка</span>'}</div>`,
  ]),
)}
<div class="divider"></div>
${stateRow('Вкладка', [
  ['Активная', '<div class="tabs"><div class="tab on">Уроки</div></div>'],
  ['Обычная', '<div class="tabs"><div class="tab">Уроки</div></div>'],
  ['Hover', '<div class="tabs"><div class="tab" style="color:var(--color-text)">Уроки</div></div>'],
  ['Focus-visible', '<div class="tabs"><div class="tab on is-focus">Уроки</div></div>'],
])}
${stateRow('Слово в банке / оценка', [
  ['Обычное', '<span class="chip">have been</span>'],
  ['Hover', '<span class="chip is-hover">have been</span>'],
  ['Focus-visible', '<span class="chip is-focus">have been</span>'],
  ['Использовано', '<span class="chip used">have been</span>'],
  ['Выбрано', '<span class="chip on" style="width:48px;justify-content:center">5</span>'],
])}
${stateRow('Ячейка ответа', [
  ['Пустая', '<span class="cell c-empty"></span>'],
  ['Выбрана', '<span class="cell c-sel">have been</span>'],
  ['Focus-visible', '<span class="cell c-empty is-focus"></span>'],
  ['Верно', `<span class="cell c-ok">${ic('check', 'success', 16)}have been</span>`],
  ['Неверно', `<span class="cell c-bad">${ic('x', 'error', 16)}<s>has gone</s></span>`],
])}
</div></main>`,
);

for (const [n, html] of Object.entries(screens))
  fs.writeFileSync(path.join(OUT, n + '.html'), html);
console.log(Object.keys(screens).join(' '));
