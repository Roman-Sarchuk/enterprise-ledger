const nodemailer = require('nodemailer');

async function sendViaResend(options) {
    if (!process.env.RESEND_API_KEY) return false;
    if (typeof fetch !== 'function') {
        throw new Error('Fetch is not available in this Node.js runtime');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
            from: process.env.RESEND_EMAIL_FROM,
            to: process.env.RESEND_EMAIL_TO,
            subject: options.subject,
            text: options.message,
            html: options.html,
        }),
    });

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`Resend API request failed: ${response.status} ${body}`);
    }

    return true;
}

const sendEmail = async (options) => {
    if (!options.to || options.to.trim() === "") {
        throw new Error("Email recipient (to) is required");
    }
    if (!options.subject || options.subject.trim() === "") {
        throw new Error("Email subject is required");
    }
    if (!options.message || options.message.trim() === "") {
        throw new Error("Email message is required");
    }

    // Prefer a provider API in production when configured because many hosts block SMTP ports.
    if (process.env.RESEND_API_KEY) {
        const sent = await sendViaResend(options);
        if (sent) return;
    }

    // 1. Створюємо транспортер (сервіс, через який буде йти відправка)
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        },
        family: 4,
        connectionTimeout: 10_000,
        greetingTimeout: 10_000,
        socketTimeout: 15_000,
    });

    // 2. Налаштовуємо параметри самого листа
    const mailOptions = {
        from: process.env.EMAIL_FROM ? `Home Ledger Admin <${process.env.EMAIL_FROM}>` : 'Home Ledger Admin <no-reply@example.com>',
        to: options.to,
        subject: options.subject,
        text: options.message,
        // html: options.html // Розкоментуй, якщо в майбутньому передаватимеш HTML-шаблони
    };

    // 3. Відправляємо лист
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;