export function reportRuntimeError(error: unknown, context: Record<string, unknown> = {}) {
  // Error capture stays local to the app; it does not depend on an editor telemetry SDK.
  console.error('[ReciConti runtime]', error, context);
}
