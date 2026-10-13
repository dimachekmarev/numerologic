"""Deterministic symbolic tools. No predictions, diagnoses or financial advice."""

import hashlib
import json
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo


def today_local():
    return datetime.now(ZoneInfo("Europe/Moscow")).date()


MEANINGS = {
    1: "инициатива",
    2: "диалог",
    3: "самовыражение",
    4: "порядок",
    5: "гибкость",
    6: "забота",
    7: "наблюдение",
    8: "ресурсы",
    9: "завершение",
    11: "вдохновение и чувствительность",
    22: "замысел и воплощение",
    33: "поддержка и зрелая забота",
}
PRACTICES = {
    1: "Выберите один небольшой шаг и сделайте его за 15 минут.",
    2: "Задайте близкому открытый вопрос и выслушайте ответ.",
    3: "Запишите идею, которую давно хотели выразить.",
    4: "Освободите одно место на столе или в расписании.",
    5: "Попробуйте привычное дело новым способом.",
    6: "Сделайте что-то заботливое для себя без чувства долга.",
    7: "Оставьте десять минут без телефона и запишите наблюдения.",
    8: "Перечислите доступные ресурсы: время, силы, помощь.",
    9: "Закончите небольшое дело, которое давно откладывали.",
}
TAROT = [
    ("Шут", "любопытство", "Что я могу попробовать без больших обязательств?"),
    ("Маг", "действие", "Какие инструменты уже есть у меня?"),
    ("Жрица", "наблюдение", "Что я чувствую и какие факты это подтверждают?"),
    ("Императрица", "забота", "Что сейчас нуждается в моём внимании?"),
    ("Император", "границы", "Где мне нужна ясная договорённость?"),
    ("Иерофант", "ценности", "Какое правило я выбираю для себя?"),
    ("Влюблённые", "выбор", "Что для меня действительно важно в этом выборе?"),
    ("Колесница", "направление", "Какой один шаг я могу контролировать?"),
    ("Сила", "бережность", "Как действовать без давления на себя?"),
    ("Отшельник", "пауза", "Что становится яснее в тишине?"),
    ("Колесо", "перемены", "К чему я могу адаптироваться?"),
    ("Справедливость", "равновесие", "Какие факты я ещё не учла или не учёл?"),
    ("Повешенный", "новый взгляд", "Как описал бы ситуацию другой человек?"),
    ("Смерть", "завершение", "Какую привычку пора оставить?"),
    ("Умеренность", "ритм", "Как снизить перегрузку сегодня?"),
    ("Дьявол", "привычки", "Что отвлекает меня от собственного выбора?"),
    ("Башня", "пересмотр", "Какую опору я могу восстановить?"),
    ("Звезда", "надежда", "Какой маленький прогресс я замечаю?"),
    ("Луна", "неопределённость", "Что я знаю, а что только предполагаю?"),
    ("Солнце", "радость", "Что доставило мне удовольствие сегодня?"),
    ("Суд", "переоценка", "Какой урок я хочу сохранить?"),
    ("Мир", "целостность", "За что я могу поблагодарить себя?"),
]


def reduce_number(value, preserve_masters=False):
    n = sum(int(c) for c in str(value) if c.isdigit())
    while n > 9 and not (preserve_masters and n in (11, 22, 33)):
        n = sum(int(c) for c in str(n))
    return n or 1


def validate_birth(value):
    try:
        born = date.fromisoformat(value)
    except (ValueError, TypeError):
        raise ValueError("Укажите существующую дату рождения в формате ГГГГ-ММ-ДД")
    if not date(1900, 1, 1) <= born <= today_local():
        raise ValueError("Дата рождения должна быть между 1900 годом и сегодняшним днём")
    return born


def name_number(name, mode="all"):
    vowels = set("аеёиоуыэюяaeiouy")
    alphabet_ru = "абвгдеёжзийклмнопрстуфхцчшщъыьэюя"
    alphabet_en = "abcdefghijklmnopqrstuvwxyz"
    mapping = {
        c: i % 9 + 1 for alphabet in (alphabet_ru, alphabet_en) for i, c in enumerate(alphabet)
    }
    chars = [
        c
        for c in name.lower()
        if c in mapping
        and (mode == "all" or (c in vowels if mode == "vowels" else c not in vowels))
    ]
    return reduce_number(sum(mapping[c] for c in chars), preserve_masters=True)


def calc_profile(name, birth_date, today=None):
    born = validate_birth(birth_date)
    today = today or today_local()
    year = reduce_number(born.day + born.month + today.year)
    digits = [int(c) for c in birth_date if c.isdigit()]
    return dict(
        name=name,
        birth_date=birth_date,
        life_path=reduce_number(birth_date, preserve_masters=True),
        base_path=reduce_number(birth_date),
        birthday=reduce_number(born.day, preserve_masters=True),
        destiny=name_number(name),
        soul=name_number(name, "vowels"),
        personality=name_number(name, "consonants"),
        year=year,
        month=reduce_number(year + today.month),
        meaning=MEANINGS[reduce_number(birth_date, preserve_masters=True)],
        arithmetic=" + ".join(map(str, digits)) + f" = {sum(digits)} → {reduce_number(birth_date, preserve_masters=True)}",
        system="Мастер-числа 11, 22 и 33 сохраняются в карте; периоды сводятся к 1–9. Буквы: отдельные русский и латинский алфавиты, цикл 1–9.",
    )


def zodiac(birth):
    d = validate_birth(birth)
    mmdd = d.month * 100 + d.day
    for boundary, name in [
        (120, "Козерог"),
        (219, "Водолей"),
        (321, "Рыбы"),
        (420, "Овен"),
        (521, "Телец"),
        (621, "Близнецы"),
        (723, "Рак"),
        (823, "Лев"),
        (923, "Дева"),
        (1023, "Весы"),
        (1122, "Скорпион"),
        (1222, "Стрелец"),
        (1232, "Козерог"),
    ]:
        if mmdd < boundary:
            return name


def daily(name, birth, user_id, today=None):
    today = today or today_local()
    p = calc_profile(name, birth, today)
    number = reduce_number(p["month"] + today.day)
    card = TAROT[int(hashlib.sha256(f"{user_id}:{today}".encode()).hexdigest(), 16) % len(TAROT)]
    return dict(
        date=today.isoformat(),
        number=number,
        theme=MEANINGS[number],
        practice=PRACTICES[number],
        tarot=dict(name=card[0], theme=card[1], question=card[2]),
        zodiac=zodiac(birth),
        astrology_note="Солнечный знак по календарным границам. Это символическая тема для размышления, не натальная карта и не прогноз.",
        profile=p,
    )


def report_content_for(name, birth, slug, focus="", partner=None, today=None):
    p = calc_profile(name, birth, today)
    today = today or today_local()
    library = json.loads((Path(__file__).parent / "library.json").read_text())
    if slug in library:
        return "\n\n".join(
            [
                f"NUMEROLOGIC · Практикум для {name}",
                "Самостоятельные упражнения для самонаблюдения. Это не психотерапия. Выбирайте безопасные ситуации и удобный темп.",
            ]
            + [
                f"День {i + 1}. {v[0]}\n{v[1]}\nВ дневник: {v[2]}"
                for i, v in enumerate(library[slug])
            ]
            + ["Отмечайте прогресс в разделе «Практики». Повторение и паузы допустимы."]
        )
    parts = [
        f"NUMEROLOGIC · {name}",
        f"Запрос: {focus or 'самонаблюдение'}",
        f"Метод\n{p['system']}\nДата: {p['arithmetic']}",
        f"Карта чисел\nПуть: {p['life_path']} — {MEANINGS[p['life_path']]}.\nИмя: {p['destiny']}. Гласные: {p['soul']}. Согласные: {p['personality']}.\nЭти темы — вопросы для размышления, а не утверждения о личности.",
    ]
    if slug in ("compatibility", "love-scenario", "deep-reading"):
        text = "Отношения\nНазовите по одной потребности каждого. Согласуйте время разговора без телефона. Запишите, какие границы помогают вам чувствовать себя спокойно.\nВопросы: чего я ожидаю молча? Что могу попросить прямо? Как мы поймём, что договорённость работает?"
        if partner:
            b = calc_profile(partner["name"], partner["birth_date"], today)
            text += f"\nКарта партнёра: {partner['name']}, путь {b['life_path']} ({MEANINGS[b['life_path']]}). Общая тема: {MEANINGS[reduce_number(p['life_path'] + b['life_path'])]}.\nРасчёт партнёра: {b['arithmetic']}. Числа не измеряют качество отношений."
        parts.append(text)
    if slug in ("money-realization", "deep-reading"):
        parts.append(
            "Работа и ресурсы\nОтделите задачи, которые вы контролируете, от внешних обстоятельств. Запишите три навыка и один конкретный пример их применения. Выберите проверяемый шаг: разговор, черновик, завершение задачи.\nВопросы: что забирает время? Какую помощь я могу попросить? Числа не используются для инвестиций, цен или прогноза дохода."
        )
    if slug in ("life-period", "year-forecast", "deep-reading", "club"):
        months = range(1, 13) if slug == "year-forecast" else [today.month]
        parts.append(
            "Календарь тем\nЛичный год: "
            + str(p["year"])
            + "\n"
            + "\n".join(
                f"Месяц {m}: {MEANINGS[reduce_number(p['year'] + m)]}. {PRACTICES[reduce_number(p['year'] + m)]}"
                for m in months
            )
            + "\nДаты не обозначают удачу или риск. Планируйте по реальным обстоятельствам."
        )
    parts.append(
        "План на семь дней\n"
        + "\n".join(f"{i + 1}. {PRACTICES[reduce_number(p['life_path'] + i)]}" for i in range(7))
    )
    parts.append(
        "Итог недели\nЧто получилось? Что я узнала или узнал? Какой шаг хочу повторить? Сохраните ответы в дневнике.\nСервис предназначен для развлечения и саморефлексии. Он не предсказывает события и не заменяет профессиональные консультации."
    )
    return "\n\n".join(parts)
