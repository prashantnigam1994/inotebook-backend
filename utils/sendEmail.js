const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.sendgrid.net",
        port: 2525,
        secure: false,
        auth: {
            user: "apikey",
            pass: process.env.SENDGRID_API_KEY,
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: `"iNotebook Support Team" <no-reply@yourdomain.com>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;