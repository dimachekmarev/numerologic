const meanings = {
  1: 'инициатива, лидерство, личный выбор', 2: 'партнерство, тонкие договоренности, эмпатия',
  3: 'общение, творчество, публичность', 4: 'структура, дисциплина, опора', 5: 'движение, продажи, перемены',
  6: 'отношения, забота, эстетика, ответственность', 7: 'анализ, знания, глубина, интуиция',
  8: 'деньги, управление, статус, результат', 9: 'завершение, масштаб, наставничество, польза'
};

const focusAdvice = {
  'Деньги и карьера': 'Денежный фокус месяца — выбрать один продукт, один канал продаж и один измеримый результат. Не распыляйтесь.',
  'Отношения': 'В отношениях главный риск — молчаливые ожидания. Сильный ход: проговорить потребности прямо и спокойно.',
  'Предназначение': 'Предназначение проявляется через повторяющуюся пользу: за что вас благодарят, что вы делаете легче других, где есть живой интерес.',
  'Личный месяц': 'Личный месяц лучше использовать как навигацию: что усилить, где не давить, какие решения отложить.',
  'Совместимость': 'Для совместимости важно сравнивать не “подходит/не подходит”, а стиль разговора, конфликтов и поддержки.'
};

function reduceNumber(value) {
  let n = String(value).replace(/\D/g, '').split('').reduce((sum, x) => sum + Number(x), 0);
  while (n > 9 && ![11, 22, 33].includes(n)) n = String(n).split('').reduce((sum, x) => sum + Number(x), 0);
  return n || 1;
}
function letterValue(char) { const map = 'абвгдежзийклмнопрстуфхцчшщъыьэюяabcdefghijklmnopqrstuvwxyz'; const i = map.indexOf(char.toLowerCase()); return i >= 0 ? (i % 9) + 1 : 0; }
function nameNumber(name, mode = 'all') { const vowels = 'аеёиоуыэюяaeiouy'; const letters = [...name.toLowerCase()].filter(ch => /[a-zа-яё]/i.test(ch)); const selected = letters.filter(ch => mode === 'vowels' ? vowels.includes(ch) : mode === 'consonants' ? !vowels.includes(ch) : true); return reduceNumber(selected.reduce((acc, ch) => acc + letterValue(ch), 0) || 1); }
function personalYear(date) { const now = new Date(); const [, month, day] = date.split('-').map(Number); return reduceNumber(`${day}${month}${now.getFullYear()}`); }
function personalMonth(date) { return reduceNumber(`${personalYear(date)}${new Date().getMonth() + 1}`); }
function describeNumber(n) { return meanings[n] || 'мастер-число: усиленный потенциал, высокая чувствительность и большая ответственность'; }
function nextDates(seed) { const today = new Date(); return [3, 9, 17].map((shift, idx) => { const d = new Date(today); d.setDate(today.getDate() + ((seed * (idx + 2) + shift) % 24 + 1)); return d; }); }
function fmtDate(d) { return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); }
function renderNumbers(profile) { document.getElementById('numbers').innerHTML = [['Путь', profile.lifePath], ['Предназн.', profile.destiny], ['Душа', profile.soul], ['Личность', profile.personality], ['Месяц', profile.month]].map(([label, value]) => `<div class="num-card"><div class="num">${value}</div><span>${label}</span></div>`).join(''); }
function renderDashboard(profile) {
  const energy = Math.min(92, 45 + profile.month * 6);
  document.getElementById('heroNumber').textContent = profile.month;
  document.getElementById('monthBar').style.width = `${energy}%`;
  document.getElementById('monthText').textContent = `Ваш месяц ${profile.month}: ${describeNumber(profile.month)}. Главная стратегия — ${profile.month % 2 ? 'действовать через личную инициативу и ясный выбор.' : 'сначала выстроить систему, потом ускоряться.'}`;
  const labels = ['переговоры и деньги', 'личный разговор', 'завершение хвоста'];
  document.getElementById('datesList').innerHTML = nextDates(profile.lifePath + profile.month).map((d, i) => `<div class="date-card"><span>${labels[i]}</span><b>${fmtDate(d)}</b></div>`).join('');
  document.getElementById('relationsText').textContent = profile.soul % 2 ? 'Ваш внутренний мотив сейчас требует честности: не соглашайтесь из вежливости.' : 'Сильная позиция месяца — спокойные правила и понятные договоренности.';
}
function buildInterpretation(profile) {
  return `Краткий профиль для ${profile.name}\n\n` +
    `Жизненный путь ${profile.lifePath}: ${describeNumber(profile.lifePath)}.\n` +
    `Предназначение ${profile.destiny}: ${describeNumber(profile.destiny)}.\n` +
    `Внутренний мотив ${profile.soul}: ${describeNumber(profile.soul)}.\n` +
    `Личный месяц ${profile.month}: ${describeNumber(profile.month)}.\n\n` +
    `${focusAdvice[profile.focus] || ''}\n\n` +
    `Что открыть в подписке: прогноз месяца, сильные даты, совместимость, PDF-разбор и еженедельные подсказки. Рекомендуемый старт — тариф «Личный».`;
}
function saveLead(data) { const leads = JSON.parse(localStorage.getItem('numerologic_leads') || '[]'); leads.unshift({ ...data, createdAt: new Date().toISOString() }); localStorage.setItem('numerologic_leads', JSON.stringify(leads.slice(0, 50))); }
function setPlan(plan) { const el = document.getElementById('leadPlan'); if (!el) return; [...el.options].forEach((o, i) => { if (o.textContent === plan) el.selectedIndex = i; }); document.getElementById('leadRequest').value = `Хочу оформить NUMEROLOGIC: ${plan}. Нужен персональный прогноз и доступ к подписке.`; }
window.addEventListener('DOMContentLoaded', () => {
  const calcForm = document.getElementById('calcForm'); const leadForm = document.getElementById('leadForm');
  document.querySelectorAll('[data-plan]').forEach(a => a.addEventListener('click', () => setPlan(a.dataset.plan)));
  const demo = { name: 'Анна', birthDate: '1991-06-24', focus: 'Деньги и карьера', lifePath: 5, destiny: 8, soul: 6, personality: 2, year: 4, month: 8 };
  renderDashboard(demo);
  calcForm.addEventListener('submit', event => {
    event.preventDefault(); const form = new FormData(calcForm); const name = String(form.get('fullName')).trim(); const birthDate = String(form.get('birthDate')); const focus = String(form.get('focus')); if (!name || !birthDate) return;
    const profile = { name, birthDate, focus, lifePath: reduceNumber(birthDate), destiny: nameNumber(name), soul: nameNumber(name, 'vowels'), personality: nameNumber(name, 'consonants'), year: personalYear(birthDate), month: personalMonth(birthDate) };
    localStorage.setItem('numerologic_last_profile', JSON.stringify(profile)); renderNumbers(profile); renderDashboard(profile); document.getElementById('interpretation').textContent = buildInterpretation(profile); document.getElementById('leadName').value = name.split(' ')[0] || name; document.getElementById('leadRequest').value = `Хочу персональный прогноз NUMEROLOGIC. Запрос: ${focus}. Дата рождения: ${birthDate}. Число пути: ${profile.lifePath}, личный месяц: ${profile.month}.`;
  });
  leadForm.addEventListener('submit', event => {
    event.preventDefault(); const data = { name: document.getElementById('leadName').value.trim(), contact: document.getElementById('leadContact').value.trim(), plan: document.getElementById('leadPlan').value, request: document.getElementById('leadRequest').value.trim() }; if (!data.name || !data.contact) return;
    saveLead(data); const message = `Заявка NUMEROLOGIC\nИмя: ${data.name}\nКонтакт: ${data.contact}\nТариф: ${data.plan}\nЗапрос: ${data.request || 'не указан'}`;
    document.getElementById('leadResult').textContent = `${message}\n\nЗаявка сохранена локально. Следующий этап — подключить оплату и закрытый Telegram-канал подписчиков.`;
    document.getElementById('telegramLink').href = `https://t.me/dimachekmarev?text=${encodeURIComponent(message)}`;
  });
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
});
