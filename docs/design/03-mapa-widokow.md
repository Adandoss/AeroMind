# Krok 3. Mapa widoków

Routing wynika z zadań aktorów ([02-aktorzy.md](./02-aktorzy.md)), nie z listy
komponentów. Każdy URL reprezentuje stan, który da się udostępnić linkiem,
otworzyć w nowej karcie i obsłużyć przyciskiem „wstecz".

## Tabela route'ów

| Route | Cel widoku | Aktor | Kluczowe komponenty |
|---|---|---|---|
| `/` | Przekonać do platformy: propozycja wartości, wyróżnione kursy, CTA | gość | `Hero`, `FeatureCards`, `CourseCard` (wariant featured), `TestimonialBlock`, `NewsletterCta` |
| `/courses` | Wybór kursu: filtrowanie po kategorii, cenie, ocenie; wyszukiwanie | gość + student | `CourseFilterSidebar`, `CourseSearchInput`, `CourseCard`, `Pagination` |
| `/courses/[slug]` | Decyzja o zapisie: opis, program, cena, przycisk zapisu | gość + student | `CourseHeader`, `CurriculumOutline`, `EnrollButton` |
| `/pricing` | Wybór planu i (symulowany) zakup | gość | `PricingCard` ×3, `CheckoutModal` (RHF + Zod) |
| `/login`, `/register` | Uwierzytelnienie | gość | `LoginForm`, `RegisterForm` (RHF + Zod) |
| `/dashboard` | Decyzja: co realizować dalej, czy tempo wystarcza | student | `GreetingHeader`, `WeeklyProgressChart`, `MyCourseList` (z linkiem „kontynuuj naukę") |
| `/learn/[slug]/[lessonId]` | Realizacja lekcji i nawigacja po programie kursu | student | `CurriculumSidebar`, `LessonContent`, `MarkCompleteButton`, `LessonPagination` (prev/next) |
| `/admin/courses` | Przegląd treści: status publikacji, kompletność | admin | `AdminCourseTable`, `PublishToggle` |
| `/admin/courses/[id]` | Edycja kursu, modułów i lekcji | admin | `CourseForm`, `ModuleList`, `LessonForm` |

## Ten sam komponent, inny kontrakt danych

Analogicznie do `CityMap` w studium RainTwin:

- **`CourseCard`** występuje na `/` (wariant *featured*: duża miniatura, kategoria,
  ocena) i na `/courses` (wariant *catalog*: dodatkowo czas trwania, liczba ocen,
  opis). Ten sam komponent — inne propsy. Dane w obu przypadkach pochodzą
  z warstwy `lib/api/courses.ts`, nie z fetcha w komponencie.
- **`CurriculumOutline`** (`/courses/[slug]`) i **`CurriculumSidebar`**
  (`/learn/...`) renderują tę samą strukturę modułów i lekcji, ale sidebar
  dodatkowo otrzymuje stan postępu użytkownika (ukończone / bieżąca / zablokowane).
  Endpoint `GET /api/courses/[slug]/curriculum` zwraca strukturę wzbogaconą
  o stan postępu, jeśli żądanie jest uwierzytelnione.

To uzasadnia istnienie warstwy `lib/api/` i dedykowanych hooków w `lib/hooks/` —
tłumaczenie i wzbogacanie danych żyje tam, nie w komponentach.

## Czego nie ma w URL-ach

- Brak `/checkout` jako osobnej strony — checkout jest modalem na `/pricing`,
  bo nie reprezentuje stanu wartego udostępnienia linkiem (koszyk jednoelementowy,
  symulowana płatność).
- Brak `/mentors` z mockupu w zakresie MVP — link w nawigacji prowadzi do sekcji
  statycznej; mentor nie jest aktorem (por. [02-aktorzy.md](./02-aktorzy.md)).
