# SMLT / ПИФ — исследовательский сайт

## English brief

A static presentation of an academic portfolio-risk prototype: point-in-time
inputs, feasible hedging, delayed execution and whole-book accounting.
Comparative economic effectiveness and live readiness are not established.

Start at [en.html](en.html) for the English project/contribution brief, or
[index.html](index.html) for the Russian presentation. The six-person team's
workstreams are attributed on [team.html](team.html). The separate
[source export](https://github.com/zabor-crypto/smlt-pif-research-code#english-brief)
includes a deliberately small synthetic test entry point; it excludes market
data, economic-run configurations and generated research results.

This repository is plain HTML/CSS/JavaScript, with no build or install step.
Check local assets, fragments, JSON and inline-script CSP hashes offline:

```sh
python3 scripts/check-site.py
node --check assets/navigation.js
node --check assets/episode.js
```

These structural checks do not establish browser rendering, economic validity
or the availability of external links. No reuse license is granted; rights
remain with the respective holders.

## Русская версия

Самостоятельная статическая веб-версия: 12 браузерных сцен / 600 секунд и подробная матрица качественных примеров. Академическая версия 1.0 фиксирует финансовую постановку, методологию и программный прототип. Сравнительная экономическая эффективность ещё не установлена.

## Локальное чтение
Откройте `index.html` либо запустите `python3 -m http.server 8000` и откройте `http://127.0.0.1:8000/`. Внешних библиотек, API и сетевых данных нет. Публичный сайт не включает портреты, исходные аналитические документы или академические PPTX/PDF/DOCX.

Имена и направления команды разрешены владельцем. Права на исходные тексты и код сохраняются за правообладателями. Лицензия на повторное использование не предоставлена этим выпуском; выбор открытой лицензии требует отдельного решения владельца. Зависимости браузера не распространяются. CSP ограничивает скрипты собственными файлами и хешами встроенных контроллеров; стили разрешены внутри документа. Политики HTTP-заголовков определяет хостинг.

Исходный код и синтетические примеры: [SMLT / ПИФ — исследовательский прототип](https://github.com/zabor-crypto/smlt-pif-research-code). Рыночные данные и конфигурации экономических запусков не включены; область проверок описана в README репозитория.
