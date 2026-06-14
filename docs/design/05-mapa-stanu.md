# Krok 5–7. Mapa stanu

Decyzja „co gdzie" wynika z dwóch pytań: *skąd pochodzi prawda?* oraz
*kto musi widzieć tę samą wartość?*

## Rodzaje stanu w AeroMind

| Rodzaj stanu | Co tam żyje | Gdzie trzymamy | Dlaczego |
|---|---|---|---|
| **URL-state** | filtry katalogu (`?category=&price=&rating=&q=&page=`), bieżąca lekcja (`/learn/[slug]/[lessonId]`) | routing Next.js (`useSearchParams`, segmenty dynamiczne) | filtr i lekcja mają być udostępnialne linkiem, działać z back/forward i przetrwać F5 |
| **Server-state** | katalog kursów, program kursu, postęp lekcji, dane dashboardu, profil i subskrypcja | TanStack Query (`lib/hooks/`) | prawda jest w bazie; potrzebujemy cache, retry, `isLoading`/`isError` i invalidacji po mutacjach |
| **Form-state** | pola logowania, rejestracji, checkoutu, formularzy admina; walidacja, dirty/touched | React Hook Form + resolver Zod | walidacja deklaratywna jednym schematem (`lib/schemas/`), rerender tylko zmienianych pól |
| **UI-state** | rozwinięcie modułu w sidebarze programu, otwarcie modala checkoutu, otwarcie menu mobilnego | `useState` w komponencie | stan jednego komponentu nie potrzebuje globalności |
| **Map-state** | — | — | brak mapy i brak stanu współdzielonego klientowo między odległymi komponentami |
| **Live-state** | — | — | patrz decyzja poniżej |

## Przykładowe decyzje

- **Filtr kategorii w katalogu → URL.** Użytkownik chce wysłać link
  „kursy z designu poniżej 100 $". Nie `useState`, nie store.
- **Postęp lekcji → TanStack Query.** Prawda jest na serwerze
  (`LessonProgress` w MariaDB). Mutacja „oznacz jako ukończoną" robi
  optymistyczny update i invaliduje `['curriculum', slug]` oraz `['dashboard']`.
  Nie trzymamy kopii postępu w żadnym stanie lokalnym.
- **Rozwinięcie modułu w `CurriculumSidebar` → `useState`.** Nikogo poza
  sidebarem to nie obchodzi; nie zaśmiecamy URL ani serwera.
- **Wybrany plan w checkout → props/`useState` modala.** Żyje krócej niż
  jedna interakcja; po zamknięciu modala nie ma powodu istnieć.
- **Sesja użytkownika → Auth.js** (cookie + `useSession`/`auth()`), nie ręczny
  store. Rola (`STUDENT`/`ADMIN`) jest w tokenie sesji.

## Decyzja: brak globalnego store'a (Zustand/Redux)

Po rozpisaniu wszystkich fragmentów stanu **żaden** nie spełnia kryterium
„współdzielony między wieloma komponentami, ale tylko po stronie klienta
i nie należy do URL ani do API". W RainTwin takim stanem był viewport mapy —
w AeroMind jego odpowiednik nie istnieje:

- to, co współdzielone między widokami, pochodzi z serwera → TanStack Query,
- to, co definiuje widok, jest w URL → routing,
- reszta jest lokalna → `useState`.

Dodanie Zustanda byłoby anty-wzorcem nr 4 z materiału dydaktycznego
(„globalny store dla wszystkiego"). Ta *nieobecność* jest świadomą decyzją
architektoniczną i ma własny wpis w ADR.

## Decyzja: brak live-state (SSE/WebSocket/polling)

Wszystkie zmiany danych w systemie są skutkiem akcji bieżącego użytkownika
(zapis na kurs, ukończenie lekcji, zakup planu). Nie ma zdarzeń, które serwer
musiałby wypychać do klienta (alerty, statusy długich zadań, dane innych
użytkowników). Mutacja + invalidacja query w pełni synchronizuje UI.

Zgodnie z tabelą decyzyjną *SSE vs WebSocket vs polling*: skoro nie ma
komunikacji serwer→klient inicjowanej przez serwer, każdy z tych mechanizmów
byłby kosztem bez problemu do rozwiązania. Analogicznie nie stosujemy wzorca
Job API — żadna operacja nie przekracza czasu pojedynczego request/response
(uzasadnienie w [01-zdanie-projektowe.md](./01-zdanie-projektowe.md)).
