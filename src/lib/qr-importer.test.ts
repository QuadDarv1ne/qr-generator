import { describe, expect, test } from 'bun:test';
import { importQRContent } from './qr-importer';

describe('importQRContent', () => {
  test('URL', () => {
    const r = importQRContent('https://example.com/path');
    expect(r.dataType).toBe('url');
    expect(r.formData.url).toBe('https://example.com/path');
  });

  test('телефон', () => {
    const r = importQRContent('tel:+79991234567');
    expect(r.dataType).toBe('phone');
    expect(r.formData.phone).toBe('+79991234567');
  });

  test('email (mailto)', () => {
    const r = importQRContent('mailto:test@example.com?subject=Hi&body=Text');
    expect(r.dataType).toBe('email');
    expect(r.formData.email).toEqual({ to: 'test@example.com', subject: 'Hi', body: 'Text' });
  });

  test('SMS', () => {
    const r = importQRContent('sms:+79991234567?body=hello');
    expect(r.dataType).toBe('sms');
    expect(r.formData.sms).toEqual({ phone: '+79991234567', message: 'hello' });
  });

  test('Wi-Fi с паролем и скрытой сетью', () => {
    const r = importQRContent('WIFI:T:WPA;S:MyNet;P:secret;H:true;;;');
    expect(r.dataType).toBe('wifi');
    expect(r.formData.wifi).toEqual({
      ssid: 'MyNet',
      password: 'secret',
      encryption: 'WPA',
      hidden: true,
    });
  });

  test('Wi-Fi без пароля', () => {
    const r = importQRContent('WIFI:T:NOPASS;S:OpenNet;;;');
    expect(r.dataType).toBe('wifi');
    expect(r.formData.wifi.encryption).toBe('NOPASS');
    expect(r.formData.wifi.password).toBe('');
  });

  test('Wi-Fi снятие экранирования', () => {
    const r = importQRContent('WIFI:T:WPA;S:My\\;Net;P:pa\\:ss;;;');
    expect(r.formData.wifi.ssid).toBe('My;Net');
    expect(r.formData.wifi.password).toBe('pa:ss');
  });

  test('геолокация по координатам', () => {
    const r = importQRContent('geo:55.75,37.62');
    expect(r.dataType).toBe('location');
    expect(r.formData.location).toEqual({ latitude: '55.75', longitude: '37.62', query: '' });
  });

  test('геолокация по запросу', () => {
    const r = importQRContent('geo:0,0?q=%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0');
    expect(r.formData.location.query).toBe('Москва');
  });

  test('vCard', () => {
    const r = importQRContent(
      'BEGIN:VCARD\nVERSION:3.0\nFN:Иван Иванов\nTEL;TYPE=CELL:+79991234567\nEMAIL:ivan@example.com\nORG:Maestro7IT\nEND:VCARD'
    );
    expect(r.dataType).toBe('vcard');
    expect(r.formData.vcard.firstName).toBe('Иван');
    expect(r.formData.vcard.lastName).toBe('Иванов');
    expect(r.formData.vcard.phone).toBe('+79991234567');
    expect(r.formData.vcard.email).toBe('ivan@example.com');
    expect(r.formData.vcard.organization).toBe('Maestro7IT');
  });

  test('MECARD', () => {
    const r = importQRContent(
      'MECARD:N:Иван Иванов;ORG:Maestro7IT;TEL:+79991234567;EMAIL:ivan@example.com;URL:https://example.com;ADR:г. Москва;;'
    );
    expect(r.dataType).toBe('vcard');
    expect(r.formData.vcard.firstName).toBe('Иван');
    expect(r.formData.vcard.lastName).toBe('Иванов');
    expect(r.formData.vcard.phone).toBe('+79991234567');
    expect(r.formData.vcard.email).toBe('ivan@example.com');
    expect(r.formData.vcard.organization).toBe('Maestro7IT');
    expect(r.formData.vcard.url).toBe('https://example.com');
  });

  test('VEVENT', () => {
    const r = importQRContent(
      'BEGIN:VEVENT\nSUMMARY:Встреча\nLOCATION:Офис\nDTSTART:20260820T090000\nDTEND:20260820T100000\nDESCRIPTION:Планёрка\nEND:VEVENT'
    );
    expect(r.dataType).toBe('event');
    expect(r.formData.event.title).toBe('Встреча');
    expect(r.formData.event.location).toBe('Офис');
    expect(r.formData.event.startDate).toBe('2026-08-20');
    expect(r.formData.event.startTime).toBe('09:00');
    expect(r.formData.event.endDate).toBe('2026-08-20');
    expect(r.formData.event.endTime).toBe('10:00');
    expect(r.formData.event.description).toBe('Планёрка');
  });

  test('Telegram-ссылка', () => {
    const r = importQRContent('https://t.me/username?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82');
    expect(r.dataType).toBe('telegram');
    expect(r.formData.telegram.username).toBe('username');
    expect(r.formData.telegram.text).toBe('Привет');
  });

  test('WhatsApp-ссылка', () => {
    const r = importQRContent('https://wa.me/79991234567?text=Hello');
    expect(r.dataType).toBe('whatsapp');
    expect(r.formData.whatsapp.phone).toBe('79991234567');
    expect(r.formData.whatsapp.message).toBe('Hello');
  });

  test('криптовалюта (BIP-21)', () => {
    const r = importQRContent(
      'bitcoin:1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa?amount=0.001&label=Donate'
    );
    expect(r.dataType).toBe('crypto');
    expect(r.formData.crypto.currency).toBe('BTC');
    expect(r.formData.crypto.address).toBe('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
    expect(r.formData.crypto.amount).toBe('0.001');
    expect(r.formData.crypto.label).toBe('Donate');
  });

  test('USDT (tron)', () => {
    const r = importQRContent('tron:TXyz123456789');
    expect(r.dataType).toBe('crypto');
    expect(r.formData.crypto.currency).toBe('USDT');
  });

  test('обычный текст', () => {
    const r = importQRContent('Просто текст');
    expect(r.dataType).toBe('text');
    expect(r.formData.text).toBe('Просто текст');
  });

  test('пустая строка — текст', () => {
    const r = importQRContent('   ');
    expect(r.dataType).toBe('text');
  });
});