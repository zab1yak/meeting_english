# HTML-макеты Meeting English

Источник истины для вёрстки (задача 2). Figma-файл содержит только Variables, стили текста,
иконки и часть компонентов: лимит Figma MCP на тарифе Starter исчерпан.

| Файл                  | Экран                                            | Ширины         |
| --------------------- | ------------------------------------------------ | -------------- |
| `01-login`            | Вход / регистрация                               | 1440, 768      |
| `02-teacher`          | Кабинет учителя                                  | 1440, 768      |
| `03-student`          | Кабинет ученика                                  | 1440, 768      |
| `04-builder`          | Конструктор урока                                | 1440           |
| `05-player`           | Плеер урока                                      | 1440, 768, 375 |
| `06-classroom`        | Виртуальный класс (вид учителя)                  | 1440           |
| `07a-homework-list`   | Список ДЗ                                        | 1440, 768      |
| `07b-homework-review` | Проверка ДЗ                                      | 1440           |
| `08-states`           | Состояния: hover, focus-visible, disabled, error | 1440           |

Скриншоты — в `png/`. Пересборка HTML:

```bash
node design/mockups/src/build.mjs design/mockups design/mockups/src/lucide-icons.json
```

Токены совпадают с `apps/web/app/globals.css` (`@theme`).
