import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
    service: process.env.NODEMAILER_EMAIL_SERVICE,
    secure: true,
    host: process.env.NODEMAILER_HOST,
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_EMAIL_AUTH_PASSCODE,
    }
});

//node mailer send email function - return promise
export function send(emails, subject, html) {
    const mailOptions = {
        from: `${process.env.NODEMAILER_EMAIL_NAME} <${process.env.NODEMAILER_EMAIL}>`,
        to: emails,
        subject: subject,
        html: html,
    };

    // sending email promise
    return transporter.sendMail(mailOptions);
}
