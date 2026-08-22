// Общий сетевой слой для клиентов иконок: таймаут на каждый запрос и честная
// диагностика "сеть недоступна" vs "сервис ответил ошибкой" — без парсинга
// заголовков прокси (нестандартны, у каждого свои), но по факту исключения.
const TIMEOUT_MS = 10_000;

export async function fetchWithTimeout(url: string, init: RequestInit = {}): Promise<Response> {
  const host = new URL(url).host;
  try {
    return await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
  } catch (err) {
    if (err instanceof Error && err.name === "TimeoutError") {
      throw new Error(
        `${host} не ответил за ${TIMEOUT_MS / 1000}с — похоже на сетевую проблему, не на ответ сервиса.`,
      );
    }
    throw new Error(
      `Не удалось соединиться с ${host}: ${err instanceof Error ? err.message : String(err)}. ` +
        `Часто это блокировка исходящего трафика в текущей среде (корпоративный прокси/файрвол/песочница), ` +
        `а не проблема с кодом или лицензией — проверь через 'curl -v https://${host}/'.`,
    );
  }
}
