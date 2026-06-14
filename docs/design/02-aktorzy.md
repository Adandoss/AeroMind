# Krok 2. Aktorzy i tryby pracy

Zasada z materiału dydaktycznego: *aktor podejmuje inną decyzję, więc widzi inny
widok*. Wspólny jest tylko shell aplikacji (TopBar, Footer), tożsamość użytkownika
i system designu.

## Tabela aktorów

| Rola | Typowa decyzja | Widok główny | Pytanie kontrolne UI |
|---|---|---|---|
| **Gość** (niezalogowany) | Czy ta platforma jest warta mojego czasu i pieniędzy; który plan wybrać | `/`, `/courses`, `/pricing` | Czy z katalogu i cennika da się podjąć decyzję o zakupie bez zakładania konta? |
| **Student** (zalogowany, aktywna subskrypcja) | Który kurs / którą lekcję realizować dalej; czy tempo nauki wystarcza do celu tygodniowego | `/dashboard`, `/learn/[slug]/[lessonId]` | Czy „co dalej" i „czy zdążę" widać w 5 sekund bez scrolla? |
| **Administrator treści** | Który kurs opublikować, którą lekcję poprawić lub przenieść | `/admin/courses` | Czy widać status publikacji i kompletność struktury (moduły bez lekcji) na liście, bez wchodzenia w każdy kurs? |

## Test czasownikowy (scalanie ról)

Każda rola jednym zdaniem zaczynającym się od czasownika decyzyjnego:

- **Gość decyduje**, czy kupić subskrypcję i w którym wariancie.
- **Student decyduje**, którą lekcję zrealizować w dostępnym oknie czasowym.
- **Administrator decyduje**, czy struktura kursu jest kompletna i gotowa do publikacji.

Trzy zdania, trzy różne decyzje — żadna para nie brzmi identycznie, więc role są
rozłączne i nie podlegają scaleniu.

## Role, których świadomie nie ma

- **Mentor / instruktor jako osobny aktor** — w zakresie projektu mentor jest
  *treścią* (pole `instructor` kursu w danych seed), a nie użytkownikiem
  podejmującym decyzje w systemie. Dodanie panelu autorskiego dla mentorów
  podwoiłoby zakres bez wpływu na decyzję głównego aktora.
- **Decydent biznesowy / analityk** — nie ma raportów organizacyjnych;
  platforma jest B2C dla pojedynczego uczącego się.

## Konsekwencje techniczne

- Dwie role w systemie uprawnień: `STUDENT` i `ADMIN`
  (enum `Role` w schemacie Prisma, rola w sesji Auth.js).
- Ochrona tras w dwóch warstwach: redirect w middleware dla `/dashboard`,
  `/learn/*`, `/admin/*` oraz autoryzacja w route handlerach
  (endpointy `/api/admin/*` wymagają `role === 'ADMIN'`).
- Gość ma pełny odczyt katalogu (`GET /api/courses` jest publiczny) —
  wynika to wprost z decyzji gościa: nie da się ocenić oferty bez jej obejrzenia.
  Treść lekcji jest chroniona, z wyjątkiem lekcji `isFreePreview`.
