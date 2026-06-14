# Krok 4. Interakcje krytyczne

Format z materiału dydaktycznego: *„aktor robi X, system odpowiada Y w czasie Z,
stan kontekstu pozostaje W"*. Każdy punkt jest testem akceptacyjnym — musi dać się
zademonstrować w przeglądarce.

## Widok główny studenta: `/learn/[slug]/[lessonId]`

1. **Student wchodzi na URL lekcji** — aplikacja pobiera treść lekcji i program
   kursu ze stanem postępu; sidebar zaznacza bieżącą lekcję, ukończone mają
   checkmark, lekcje niedostępne (brak subskrypcji) — ikonę kłódki. Pierwszy
   render z treścią poniżej 1 s na danych seed.
2. **Student klika „Oznacz jako ukończoną"** — checkmark pojawia się
   natychmiast (optymistyczna aktualizacja mutacji TanStack Query), licznik
   postępu w sidebarze rośnie, przycisk zmienia się w stan „ukończona";
   pozycja przewinięcia treści lekcji nie zmienia się. W razie błędu API
   stan wraca do poprzedniego i pojawia się komunikat.
3. **Student klika inną lekcję w sidebarze** — nawigacja kliencka podmienia
   treść w czasie < 300 ms; sidebar nie traci pozycji przewinięcia ani stanu
   rozwinięcia modułów (analogia do „mapa nie traci zoomu" z RainTwin —
   program kursu jest tu kontekstem, którego nie wolno resetować).
4. **Student klika „Następna lekcja"** — przejście do kolejnej lekcji w porządku
   `Module.order`, `Lesson.order`, również przez granicę modułów; na ostatniej
   lekcji kursu przycisk prowadzi do podsumowania/dashboardu.
5. **Student klika lekcję z kłódką** — system nie nawiguję do treści, tylko
   pokazuje komunikat z linkiem do `/pricing`; URL nie zmienia się. Wejście
   na URL zablokowanej lekcji „z palca" zwraca ten sam komunikat (autoryzacja
   po stronie API, nie tylko ukrycie linku).
6. **Student odświeża stronę (F5)** — wraca dokładnie ten sam stan: ta sama
   lekcja (URL-state), ten sam postęp (server-state z bazy). Żaden postęp
   nie żyje wyłącznie w pamięci klienta.

## Interakcje uzupełniające: `/courses` (katalog)

1. **Gość zaznacza kategorię „Design"** — lista kursów filtruje się, URL zmienia
   się na `?category=design`; link wklejony w nowej karcie pokazuje ten sam
   przefiltrowany widok.
2. **Gość wpisuje frazę w wyszukiwarkę** — zapytanie jest debounce'owane
   (300 ms), wyniki podmieniają się bez przeładowania, fraza ląduje w `?q=`;
   przycisk „wstecz" przywraca poprzedni zestaw filtrów.
3. **Gość przechodzi na stronę 2 paginacji** — `?page=2` w URL; aktywne filtry
   pozostają nietknięte.

## Interakcje uzupełniające: `/pricing` (checkout symulowany)

1. **Gość klika „Get Started Now" przy planie Professional** — niezalogowany
   zostaje przekierowany do `/login?callbackUrl=/pricing`; po zalogowaniu wraca
   na cennik z otwartym modalem checkoutu dla wybranego planu.
2. **Student wypełnia formularz checkoutu błędnie** — walidacja Zod pokazuje
   komunikaty domenowe przy polach (bez wysyłki do API); ten sam schemat
   waliduje żądanie po stronie serwera.
3. **Student zatwierdza checkout** — API tworzy `Order` i aktywuje
   `Subscription` w jednej transakcji; modal pokazuje potwierdzenie,
   a przycisk „Enroll" przy kursach przestaje pokazywać kłódkę
   (invalidacja query `['me']`).
