const meanings = {
  1: 'лидерство, самостоятельность, инициатива',
  2: 'партнерство, дипломатия, чувствительность',
  3: 'творчество, речь, публичность',
  4: 'структура, дисциплина, система',
  5: 'свобода, движение, продажи, перемены',
  6: 'семья, красота, ответственность, сервис',
  7: 'анализ, знания, глубина, интуиция',
  8: 'деньги, управление, статус, результат',
  9: 'масштаб, завершение, наставничество, польза'
};

const focusAdvice = {
  'Деньги и карьера': 'В денежном запросе главный фокус — не распыляться: выберите один измеримый навык, одну аудиторию и один продукт на ближайшие 30 дней.',
  'Отношения': 'В отношениях сейчас важны честные договоренности, уважение границ и отказ от сценария «догадайся сам».',
  'Предназначение': 'Предназначение проявляется через повторяющиеся сильные стороны: посмотрите, за что вас чаще всего благодарят люди.',
  'Личный год': 'Личный год задает ритм: используйте его как подсказку для планирования, а не как жесткое ограничение.'
};

function reduceNumber(value) {
  let n = String(value).replace(/\D/g, '').split('').reduce((sum, x) => sum + Number(x), 0);
  while (n > 9 && ![11, 22, 33].includes(n)) {
    n = String(n).split('').reduce((sum, x) => sum + Number(x), 0);
  }
  return n;
}

function letterValue(char) {
  const map = 'абвгдежзийклмнопрстуфхцчшщъыьэюяabcdefghijklmnopqrstuvwxyz';
  const index = map.indexOf(char.toLowerCase());
  return index >= 0 ? (index % 9) + 1 : 0;
}

function nameNumber(name, mode = 'all') {
  const vowels = 'аеёиоуыэюяaeiouy';
  const letters = [...name.toLowerCase()].filter(ch => /[a-zа-яё]/i.test(ch));
  const selected = letters.filter(ch => {
    const isVowel = vowels.includes(ch);
    if (mode === 'vowels') return isVowel;
    if (mode === 'consonants') return !isVowel;
    return true;
  });
  const sum = selected.reduce((acc, ch) => acc + letterValue(ch), 0);
  return reduceNumber(sum || 1);
}

function personalYear(date) {
  const now = new Date();
  const [year, month, day] = date.split('-').map(Number);
  return reduceNumber(`${day}${month}${now.getFullYear()}`);
}

function describeNumber(n) {
  return meanings[n] || 'мастер-число: усиленный потенциал, высокая чувствительность и большая ответственность';
}

function renderNumbers(profile) {
  const el = document.getElementById('numbers');
  el.innerHTML = [
    ['Жизненный путь', profile.lifePath],
    ['Предназначение', profile.destiny],
    ['Душа', profile.soul],
    ['Личность', profile.personality],
    ['Личный год', profile.year]
  ].map(([label, value]) => `<div class="num-card"><div class="num">${value}</div><span>${label}</span></div>`).join('');
}

function buildInterpretation(profile) {
  const core = describeNumber(profile.lifePath);
  const destiny = describeNumber(profile.destiny);
  return `Краткий профиль для ${profile.name}\n\n` +
    `Жизненный путь ${profile.lifePath}: ${core}.\n` +
    `Предназначение ${profile.destiny}: ${destiny}.\n` +
    `Душа ${profile.soul}: внутренний мотив — ${describeNumber(profile.soul)}.\n` +
    `Личность ${profile.personality}: внешнее впечатление — ${describeNumber(profile.personality)}.\n` +
    `Личный год ${profile.year}: ${describeNumber(profile.year)}.\n\n` +
    `${focusAdvice[profile.focus] || ''}\n\n` +
    `Для точного разбора нужны контекст, текущая ситуация и цель — оставьте заявку ниже.`;
}

function saveLead(data) {
  const leads = JSON.parse(localStorage.getItem('numerologic_leads') || '[]');
  leads.unshift({ ...data, createdAt: new Date().toISOString() });
  localStorage.setItem('numerologic_leads', JSON.stringify(leads.slice(0, 25)));
}

window.addEventListener('DOMContentLoaded', () => {
  const calcForm = document.getElementById('calcForm');
  const leadForm = document.getElementById('leadForm');

  calcForm.addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(calcForm);
    const name = String(form.get('fullName')).trim();
    const birthDate = String(form.get('birthDate'));
    const focus = String(form.get('focus'));
    if (!name || !birthDate) return;
    const profile = {
      name,
      birthDate,
      focus,
      lifePath: reduceNumber(birthDate),
      destiny: nameNumber(name),
      soul: nameNumber(name, 'vowels'),
      personality: nameNumber(name, 'consonants'),
      year: personalYear(birthDate)
    };
    localStorage.setItem('numerologic_last_profile', JSON.stringify(profile));
    renderNumbers(profile);
    document.getElementById('interpretation').textContent = buildInterpretation(profile);
    document.getElementById('leadName').value = name.split(' ')[0] || name;
    document.getElementById('leadRequest').value = `Хочу персональный разбор NUMEROLOGIC. Запрос: ${focus}. Дата рождения: ${birthDate}. Число пути: ${profile.lifePath}.`;
  });

  leadForm.addEventListener('submit', event => {
    event.preventDefault();
    const data = {
      name: document.getElementById('leadName').value.trim(),
      contact: document.getElementById('leadContact').value.trim(),
      request: document.getElementById('leadRequest').value.trim()
    };
    if (!data.name || !data.contact) return;
    saveLead(data);
    const message = `Заявка NUMEROLOGIC\nИмя: ${data.name}\nКонтакт: ${data.contact}\nЗапрос: ${data.request || 'не указан'}`;
    document.getElementById('leadResult').textContent = message + '\n\nЗаявка сохранена локально. Скопируйте текст или отправьте в Telegram.';
    document.getElementById('telegramLink').href = `https://t.me/dimachekmarev?text=${encodeURIComponent(message)}`;
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});
