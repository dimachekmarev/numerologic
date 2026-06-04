const meanings = {
  1: 'инициатива, личный выбор, смелый первый шаг',
  2: 'диалог, партнёрство, бережные договорённости',
  3: 'самовыражение, творчество, голос',
  4: 'структура, порядок, внутренняя опора',
  5: 'движение, изменения, гибкость',
  6: 'отношения, забота, эстетика',
  7: 'анализ, знания, тишина',
  8: 'ресурсы, деньги, управленческий фокус',
  9: 'завершение, масштаб, польза',
  11: 'усиленная интуиция и вдохновение',
  22: 'архитектура больших решений',
  33: 'поддержка и зрелая забота',
}

export function reduceNumber(value) {
  let n = Number(String(value).replace(/\D/g, '')) || 1
  while (n > 9 && ![11, 22, 33].includes(n)) {
    n = String(n)
      .split('')
      .reduce((sum, digit) => sum + Number(digit), 0)
  }
  return n || 1
}

export function calculateProfile(name = '', birthDate = '') {
  const lifePath = reduceNumber(birthDate)
  const nameTotal = Array.from(name.toLowerCase()).reduce((sum, char) => {
    const code = char.charCodeAt(0)
    return /[a-zа-яё]/i.test(char) ? sum + ((code % 9) + 1) : sum
  }, 0)
  const destiny = reduceNumber(nameTotal || 1)
  return {
    name,
    birth_date: birthDate,
    life_path: lifePath,
    destiny,
    soul: reduceNumber(destiny + lifePath),
    month: reduceNumber(lifePath + new Date().getMonth() + 1),
    meaning: meanings[lifePath],
  }
}

export { meanings }
