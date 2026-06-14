# Krok 1. Zdanie projektowe (decyzja operacyjna)

## Zdanie

> System ma pomóc **profesjonaliście podnoszącemu kwalifikacje obok pracy etatowej**
> w sytuacji **samodzielnej nauki w ograniczonych oknach czasowych (wieczory, weekendy)**
> podjąć decyzję **który kurs i którą lekcję realizować jako następną oraz czy tempo nauki
> pozwoli osiągnąć tygodniowy cel godzinowy**,
> na podstawie **katalogu kursów, struktury modułów i lekcji, własnego postępu
> oraz zagregowanych godzin nauki z ostatnich 7 dni**,
> w czasie **poniżej 5 sekund od wejścia na dashboard, bez przewijania ekranu**.

## Co wynika z poszczególnych slotów

Zdanie nie jest dekoracją — każdy slot warunkuje konkretne decyzje techniczne:

- **[komu] profesjonalista uczący się samodzielnie** — jeden główny aktor decyzyjny
  (student); nie budujemy uniwersalnego LMS z widokami dla wykładowców, dziekanatów
  i rodziców. Drugi aktor (administrator treści) istnieje tylko po to, żeby treść
  miała skąd się wziąć (patrz [02-aktorzy.md](./02-aktorzy.md)).
- **[w sytuacji] krótkie okna czasowe** — widok lekcji musi wznawiać naukę dokładnie
  tam, gdzie student skończył (stan ukończenia per lekcja, wyróżnienie „bieżącej"
  lekcji w sidebarze programu kursu). Lekcje mają jawny czas trwania (`durationMin`),
  żeby student mógł dobrać lekcję do dostępnego okna.
- **[decyzję] co realizować dalej i czy tempo jest wystarczające** — dashboard nie jest
  „ścianą statystyk", tylko odpowiedzią na dwa pytania: *co dalej* (lista moich kursów
  z następną lekcją) i *czy zdążę* (wykres godzin nauki z 7 dni vs cel tygodniowy).
- **[na podstawie] katalog + struktura kursu + postęp + agregaty** — to definiuje
  minimalny model danych: `Course → Module → Lesson` oraz
  `Enrollment → LessonProgress`. Agregaty godzin liczone są z ukończonych lekcji
  (`completedAt` × `durationMin`), więc nie potrzebujemy osobnego śledzenia czasu
  w tle ani zewnętrznej analityki.
- **[w czasie] < 5 s, bez scrolla** — dashboard musi być jednym zapytaniem
  zagregowanym po stronie serwera (`GET /api/me/dashboard`), a nie kaskadą
  zapytań klienckich; kluczowe liczby (suma godzin, % celu) nad wykresem,
  widoczne bez przewijania.

## Czego świadomie NIE robimy

Z negatywnej przestrzeni zdania wynika zakres:

- Brak komunikacji dwukierunkowej w czasie rzeczywistym (chat, kolaboracja) —
  decyzja studenta nie wymaga danych świeższych niż jego własne kliknięcia,
  więc **nie ma potrzeby WebSocket/SSE** (por. [05-mapa-stanu.md](./05-mapa-stanu.md)).
- Brak długotrwałych obliczeń po stronie serwera (model, render wideo) —
  wszystkie operacje API kończą się w pojedynczym request/response,
  więc **wzorzec Job API nie ma tu zastosowania** i jego dodanie byłoby
  sztucznym przeskalowaniem projektu.
- Płatności są **symulowane** — przedmiotem projektu jest architektura aplikacji,
  nie integracja z bramką płatności; checkout tworzy rekord `Order` i aktywuje
  `Subscription` bez zewnętrznego providera.
