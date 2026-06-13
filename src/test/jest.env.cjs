/**
 * Runs before any module is loaded (jest `setupFiles`).
 * Provides the env vars that src/config/env.ts validates at import time.
 * Mirrors the values previously defined in vitest.config.ts.
 */
// jsdom no implementa TextEncoder/TextDecoder y react-router 7 los requiere.
const { TextEncoder, TextDecoder } = require('node:util');
globalThis.TextEncoder ??= TextEncoder;
globalThis.TextDecoder ??= TextDecoder;

// jsdom tampoco implementa structuredClone (usado en tests de inmutabilidad).
const v8 = require('node:v8');
globalThis.structuredClone ??= (value) => v8.deserialize(v8.serialize(value));

// Web Streams y MessagePort (los necesita undici para cargar).
const streamWeb = require('node:stream/web');
globalThis.ReadableStream ??= streamWeb.ReadableStream;
globalThis.WritableStream ??= streamWeb.WritableStream;
globalThis.TransformStream ??= streamWeb.TransformStream;
globalThis.ByteLengthQueuingStrategy ??= streamWeb.ByteLengthQueuingStrategy;
globalThis.CountQueuingStrategy ??= streamWeb.CountQueuingStrategy;

const workerThreads = require('node:worker_threads');
globalThis.MessagePort ??= workerThreads.MessagePort;
globalThis.MessageChannel ??= workerThreads.MessageChannel;
globalThis.BroadcastChannel ??= workerThreads.BroadcastChannel;

// jsdom no implementa fetch/Request/Response/Headers; firebase/auth y
// react-router 7 los referencian al importarse. Nada hace red real en tests.
const undici = require('undici');
globalThis.fetch ??= undici.fetch;
globalThis.Request ??= undici.Request;
globalThis.Response ??= undici.Response;
globalThis.Headers ??= undici.Headers;

process.env.VITE_API_BASE_URL = 'http://localhost:8080';
process.env.VITE_FIREBASE_API_KEY = 'test-api-key';
process.env.VITE_FIREBASE_AUTH_DOMAIN = 'test.firebaseapp.com';
process.env.VITE_FIREBASE_PROJECT_ID = 'test-project';
process.env.VITE_FIREBASE_APP_ID = 'test-app-id';
