/**
 * Point d'entrée unique vers le backend Spring Boot — configuration de PRODUCTION.
 *
 * Ce fichier remplace `api.config.ts` lors d'un build `--configuration production`
 * (voir `fileReplacements` dans angular.json). En production, nginx expose le
 * backend et le frontend sur la même origine : les appels sont donc relatifs au
 * domaine servi, sans URL en dur.
 */

/**
 * Origine publique de l'application.
 * - Navigateur : l'origine de la page courante.
 * - SSR (Node) : la variable d'environnement `PUBLIC_ORIGIN`, car `window`
 *   n'existe pas et HttpClient exige une URL absolue côté serveur.
 */
function resolvePublicOrigin(): string {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }

  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
  return env?.['PUBLIC_ORIGIN'] ?? 'http://127.0.0.1';
}

const PUBLIC_ORIGIN = resolvePublicOrigin();

export const API_BASE_URL = `${PUBLIC_ORIGIN}/api/v1`;

/** Serveur temps réel Netty-SocketIO (messagerie instantanée), proxifié par nginx. */
export const SOCKET_URL = PUBLIC_ORIGIN;
