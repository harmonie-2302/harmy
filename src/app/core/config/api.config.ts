/**
 * Point d'entrée unique vers le backend Spring Boot.
 * Toute requête HTTP de l'application doit passer par ces constantes :
 * aucune URL ne doit être écrite en dur dans un composant.
 */
export const API_BASE_URL = 'http://localhost:8080/api/v1';

/** Serveur temps réel Netty-SocketIO (messagerie instantanée). */
export const SOCKET_URL = 'http://localhost:9092';
