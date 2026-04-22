import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
const { ReadableStream } = require('stream/web');

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.alert = jest.fn();
global.ReadableStream = ReadableStream;

window.HTMLElement.prototype.scrollIntoView = jest.fn();