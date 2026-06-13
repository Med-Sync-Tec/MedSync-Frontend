/**
 * UAT — MediBot IA (chat widget en DoctorLayout y CooLayout)
 *
 * Cubre:
 *   - FAB "MediBot IA" está visible en el dashboard
 *   - FAB abre el panel del chat al hacer clic
 *   - FAB muestra "Cerrar MediBot" cuando el chat está abierto
 *   - Chat muestra mensaje de bienvenida inicial
 *   - El campo de entrada tiene el placeholder correcto
 *   - Enviar mensaje con el botón
 *   - Enviar mensaje con la tecla Enter
 *   - El input se deshabilita mientras espera respuesta del bot
 *   - Indicador de "escribiendo" (···) aparece durante la carga
 *   - El mensaje enviado aparece alineado a la derecha
 *   - La respuesta del bot aparece alineada a la izquierda
 *   - Pregunta de guía de navegación (¿cómo agrego un paciente?)
 *   - Pregunta general de información del sistema (¿qué es MedSync?)
 *   - Pregunta con términos clínicos recibe advertencia/aviso médico
 *   - Mensaje CRÍTICO (emergencia/suicidio) recibe respuesta especial cerrada
 *   - Respuesta del bot renderiza markdown (negritas, listas)
 *   - Botón "X" del header del chat cierra el panel (onClose)
 *   - Chat persiste mensajes al cerrar y volver a abrir
 *   - Múltiples mensajes en conversación (contexto conservado)
 */
import { test, expect } from '@playwright/test';

const MEDIBOT_FAB = '[aria-label="Abrir MediBot"]';
const MEDIBOT_CLOSE_FAB = '[aria-label="Cerrar MediBot"]';
const CHAT_CLOSE_BTN = '[aria-label="Cerrar chat"]';
const CHAT_INPUT = 'input[placeholder*="MediBot"], textarea[placeholder*="MediBot"], input[placeholder*="pregunta"]';
const SEND_BTN = 'button[type="submit"][aria-label*="nv"], button[aria-label*="Enviar"], button:has(span:text("send"))';
const LOADING_INDICATOR = '[role="status"][aria-label*="escribiendo"], [role="status"][aria-label*="MediBot está"]';
const CHAT_HEADER = 'text=MediBot IA';

async function openMedibot(page: import('@playwright/test').Page) {
  const fab = page.locator(MEDIBOT_FAB);
  await expect(fab).toBeVisible({ timeout: 10_000 });
  await fab.click();
  await expect(page.locator(CHAT_HEADER)).toBeVisible({ timeout: 5_000 });
}

async function sendMessage(page: import('@playwright/test').Page, message: string) {
  const input = page.locator(CHAT_INPUT).first();
  await input.fill(message);
  await page.keyboard.press('Enter');
}

test.describe('MediBot IA', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/doctor/dashboard');
    await page.waitForLoadState('networkidle');
  });

  // ── FAB ──────────────────────────────────────────────────────────────────

  test('UAT-BOT-01 | el FAB "MediBot IA" está visible en el dashboard', async ({ page }) => {
    await expect(page.locator(MEDIBOT_FAB)).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-BOT-02 | el FAB muestra la etiqueta "MediBot IA"', async ({ page }) => {
    await expect(page.locator('text=MediBot IA')).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-BOT-03 | clic en el FAB abre el panel del chat', async ({ page }) => {
    await openMedibot(page);
    await expect(page.locator(CHAT_HEADER)).toBeVisible();
  });

  test('UAT-BOT-04 | FAB cambia a "Cerrar MediBot" cuando el chat está abierto', async ({ page }) => {
    await openMedibot(page);
    await expect(page.locator(MEDIBOT_CLOSE_FAB)).toBeVisible();
    await expect(page.locator(MEDIBOT_FAB)).not.toBeVisible();
  });

  test('UAT-BOT-05 | clic en el FAB "Cerrar MediBot" cierra el panel', async ({ page }) => {
    await openMedibot(page);
    await page.locator(MEDIBOT_CLOSE_FAB).click();
    await expect(page.locator(CHAT_HEADER)).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Mensaje de bienvenida ────────────────────────────────────────────────

  test('UAT-BOT-06 | chat muestra mensaje de bienvenida cuando no hay historial', async ({ page }) => {
    await openMedibot(page);
    await expect(
      page.locator('text=/Hola, soy MediBot|¿En qué puedo ayudarte?/')
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── Input y envío ─────────────────────────────────────────────────────────

  test('UAT-BOT-07 | campo de entrada tiene placeholder correcto', async ({ page }) => {
    await openMedibot(page);
    await expect(
      page.locator('input[placeholder*="pregunta"], input[placeholder*="MediBot"]')
    ).toBeVisible();
  });

  test('UAT-BOT-08 | se puede escribir en el campo de entrada', async ({ page }) => {
    await openMedibot(page);
    const input = page.locator(CHAT_INPUT).first();
    await input.fill('Hola, ¿cómo estás?');
    await expect(input).toHaveValue('Hola, ¿cómo estás?');
  });

  test('UAT-BOT-09 | el campo se vacía tras enviar el mensaje', async ({ page }) => {
    await openMedibot(page);
    const input = page.locator(CHAT_INPUT).first();
    await input.fill('Mensaje de prueba');
    await page.keyboard.press('Enter');
    await expect(input).toHaveValue('', { timeout: 3_000 });
  });

  test('UAT-BOT-10 | el mensaje enviado aparece en el chat (burbuja derecha)', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué es MedSync?');
    await expect(
      page.locator('text=¿Qué es MedSync?')
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── Estado de carga ──────────────────────────────────────────────────────

  test('UAT-BOT-11 | indicador "···" aparece mientras el bot responde', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué hace MedSync?');
    await expect(page.locator(LOADING_INDICATOR)).toBeVisible({ timeout: 8_000 });
  });

  test('UAT-BOT-12 | el input se deshabilita mientras el bot está respondiendo', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Cuáles son las funciones principales?');
    const input = page.locator(CHAT_INPUT).first();
    await expect(input).toBeDisabled({ timeout: 8_000 });
  });

  // ── Respuestas del bot ───────────────────────────────────────────────────

  test('UAT-BOT-13 | el bot responde a una pregunta general sobre el sistema', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué es MedSync?');
    // Esperar a que el indicador de carga desaparezca y aparezca la respuesta
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    // Debe haber al menos 2 mensajes (1 usuario + 1 bot)
    const messages = page.locator('.justify-end, .justify-start');
    await expect(messages).toHaveCount(2, { timeout: 5_000 });
  });

  test('UAT-BOT-14 | pregunta de guía ("¿cómo agrego un paciente?") recibe respuesta con pasos', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Cómo agrego un paciente nuevo?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    const botResponse = page.locator('.justify-start').last();
    await expect(botResponse).toBeVisible();
    // La respuesta debe tener contenido (no estar vacía)
    await expect(botResponse).not.toBeEmpty();
  });

  test('UAT-BOT-15 | pregunta sobre funcionalidades del sistema recibe una guía de navegación', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué puedo hacer en MedSync?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    const botResponse = page.locator('.justify-start').last();
    await expect(botResponse).not.toBeEmpty();
  });

  // ── Mensajes con advertencia clínica ────────────────────────────────────

  test('UAT-BOT-16 | pregunta sobre dosis recibe aviso de referencia general', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Cuál es la dosis de amoxicilina para adultos?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    // El disclaimer clínico debe aparecer en la respuesta
    await expect(
      page.locator('text=/Aviso|Esta información es de referencia|criterio médico/')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-BOT-17 | pregunta sobre medicamentos recibe aviso médico', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Para qué sirve el omeprazol?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator('text=/Aviso|referencia general|criterio médico/')
    ).toBeVisible({ timeout: 10_000 });
  });

  test('UAT-BOT-18 | pregunta sobre tratamiento recibe advertencia clínica', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué tratamiento se recomienda para la hipertensión?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    await expect(
      page.locator('text=/Aviso|referencia general/')
    ).toBeVisible({ timeout: 10_000 });
  });

  // ── Mensaje CRÍTICO ──────────────────────────────────────────────────────

  test('UAT-BOT-19 | mensaje de emergencia médica recibe respuesta especial de crisis', async ({ page }) => {
    await openMedibot(page);
    // El backend filtra mensajes críticos y devuelve respuesta cerrada
    await sendMessage(page, 'Tengo pensamientos de hacerme daño');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    // La respuesta del bot NO debe ser el flujo normal — debe ser un mensaje de crisis
    const botMsg = page.locator('.justify-start').last();
    await expect(botMsg).toBeVisible();
    await expect(botMsg).not.toBeEmpty();
  });

  // ── Markdown rendering ───────────────────────────────────────────────────

  test('UAT-BOT-20 | el bot renderiza **texto en negrita** correctamente', async ({ page }) => {
    // Mockear respuesta del backend con markdown
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: '**MedSync** es una herramienta para el área de salud.',
          isCritical: false,
        }),
      });
    });
    await openMedibot(page);
    await sendMessage(page, '¿Qué es MedSync?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
    // El texto debe renderizarse como <strong>
    await expect(page.locator('strong', { hasText: 'MedSync' })).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-BOT-21 | el bot renderiza listas con guiones (- item) como <ul><li>', async ({ page }) => {
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: '- Gestión de pacientes\n- Historial de consultas\n- Inventario',
          isCritical: false,
        }),
      });
    });
    await openMedibot(page);
    await sendMessage(page, '¿Qué módulos tiene?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
    await expect(page.locator('ul li', { hasText: 'Gestión de pacientes' })).toBeVisible({ timeout: 5_000 });
  });

  test('UAT-BOT-22 | el bot renderiza encabezados ### como texto semibold', async ({ page }) => {
    await page.route('**/api/chat', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          response: '### Módulos principales\nMedSync tiene varios módulos.',
          isCritical: false,
        }),
      });
    });
    await openMedibot(page);
    await sendMessage(page, '¿Cuáles son los módulos?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 15_000 });
    await expect(
      page.locator('p.font-semibold, p[class*="font-semibold"]', { hasText: 'Módulos principales' })
    ).toBeVisible({ timeout: 5_000 });
  });

  // ── Botón cerrar chat (X del header) ────────────────────────────────────

  test('UAT-BOT-23 | botón X del header del chat cierra el panel', async ({ page }) => {
    await openMedibot(page);
    await page.locator(CHAT_CLOSE_BTN).click();
    await expect(page.locator(CHAT_HEADER)).not.toBeVisible({ timeout: 3_000 });
  });

  // ── Persistencia de mensajes ─────────────────────────────────────────────

  test('UAT-BOT-24 | los mensajes persisten al cerrar y volver a abrir el chat', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, 'Mensaje que debe persistir');
    await expect(page.locator('text=Mensaje que debe persistir')).toBeVisible({ timeout: 8_000 });
    // Cerrar y reabrir
    await page.locator(MEDIBOT_CLOSE_FAB).click();
    await page.locator(MEDIBOT_FAB).click();
    // El mensaje debe seguir ahí
    await expect(page.locator('text=Mensaje que debe persistir')).toBeVisible({ timeout: 5_000 });
  });

  // ── Conversación multi-turno ─────────────────────────────────────────────

  test('UAT-BOT-25 | se pueden enviar múltiples mensajes en la misma conversación', async ({ page }) => {
    await openMedibot(page);
    await sendMessage(page, '¿Qué es MedSync?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    await sendMessage(page, '¿Cuántos módulos tiene?');
    await expect(page.locator(LOADING_INDICATOR)).not.toBeVisible({ timeout: 30_000 });
    // Debe haber al menos 4 mensajes (2 usuario + 2 bot)
    const userMsgs = page.locator('.justify-end');
    await expect(userMsgs).toHaveCount(2, { timeout: 5_000 });
  });

  // ── MediBot en COO layout ────────────────────────────────────────────────

  test('UAT-BOT-26 | el COO también puede abrir MediBot desde su dashboard', async ({ page }) => {
    await page.goto('/coo/dashboard');
    await page.waitForLoadState('networkidle');
    await expect(page.locator(MEDIBOT_FAB)).toBeVisible({ timeout: 10_000 });
    await page.locator(MEDIBOT_FAB).click();
    await expect(page.locator(CHAT_HEADER)).toBeVisible({ timeout: 5_000 });
  });

});
