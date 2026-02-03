const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
    const msg = {
        to: options.email,

        // VERIFIED sender (keep this)
        from: {
            email: "prashantnigam094@gmail.com",
            name: "iNotebook Support Team"
        },

        replyTo: {
            email: "prashantnigam094@gmail.com",
            name: "iNotebook Support Team"
        },

        subject: options.subject,

        // Plain text fallback (important for spam filters)
        text: `Your iNotebook password reset code is ${options.otp}. This code is valid for 10 minutes. If you did not request this, please ignore this email.`,

        // HTML version
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6; color:#333;">
                <p>Hello,</p>

                <p>
                    We received a request to reset your 
                    <strong>iNotebook</strong> account password.
                </p>

                <p>Your one-time verification code is:</p>

                <h2 style="letter-spacing: 4px; margin: 16px 0;">
                    ${options.otp}
                </h2>

                <p>
                    This code is valid for <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not request a password reset, 
                    you can safely ignore this email.
                </p>

                <hr style="margin:20px 0;" />

                <p style="font-size: 12px; color: #777;">
                    This email was sent by iNotebook Support Team.<br/>
                    Contact: prashantnigam094@gmail.com
                </p>
            </div>
        `,

        // Extra headers to improve trust
        headers: {
            "X-Mailer": "iNotebook App",
            "X-Priority": "3",
            "List-Unsubscribe": "<mailto:prashantnigam094@gmail.com>"
        }
    };

    await sgMail.send(msg);
};

module.exports = sendEmail;