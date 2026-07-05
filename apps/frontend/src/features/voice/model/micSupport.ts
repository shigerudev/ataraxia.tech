/** Valida que el entorno permita capturar audio; lanza con mensaje para el usuario. */
export function assertMicSupport(): void {
  if (!window.isSecureContext) {
    throw new Error('El modo de voz requiere una conexión segura (HTTPS).');
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('Tu navegador no permite el acceso al micrófono.');
  }
}

/** Traduce errores de getUserMedia (y afines) a mensajes para el usuario. */
export function micErrorMessage(err: unknown): string {
  if (err instanceof DOMException) {
    switch (err.name) {
      case 'NotAllowedError':
      case 'PermissionDeniedError':
        return 'No otorgaste permiso para usar el micrófono. Habilítalo en la configuración del navegador e intenta de nuevo.';
      case 'NotFoundError':
        return 'No detectamos un micrófono en tu dispositivo.';
      case 'NotReadableError':
        return 'El micrófono está en uso por otra aplicación.';
      default:
        break;
    }
  }
  return err instanceof Error && err.message
    ? err.message
    : 'No fue posible iniciar el modo de voz.';
}
