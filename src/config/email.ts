const nodemailer = require('nodemailer');
require("dotenv").config()
let pass = process.env.PASS
let smtpTransport = require("nodemailer-smtp-transport");

const SendEmailUtility = async (EmailTo:string, EmailText:string, EmailSubject:string) => {
    let transporter = nodemailer.createTransport(
        smtpTransport({
            service: "Gmail",
            auth: {
                user: "ishanrana094@gmail.com",
                pass: pass
            },
        })
    );

    // ✅ HTML Email Template
    let mailOptions = {
        from: '"My App" <ishanrana094@gmail.com>',
        to: EmailTo,
        subject: EmailSubject,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8" />
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f9f9f9;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    padding: 20px;
                    border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                }
                .header {
                    text-align: center;
                    padding-bottom: 20px;
                }
                .header h1 {
                    color: #4CAF50;
                }
                .content {
                    font-size: 16px;
                    line-height: 1.6;
                    color: #333333;
                }
                .otp-box {
                    background: #4CAF50;
                    color: #ffffff;
                    font-size: 22px;
                    font-weight: bold;
                    padding: 12px;
                    text-align: center;
                    margin: 20px 0;
                    border-radius: 8px;
                }
                .footer {
                    text-align: center;
                    font-size: 14px;
                    color: #777777;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to My App 🎉</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>${EmailText}</p>
                    <div class="otp-box">
                        ${Math.floor(100000 + Math.random() * 900000)} 
                    </div>
                    <p>If you didn’t request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    <p>© ${new Date().getFullYear()} My App. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        `
    };

    return await transporter.sendMail(mailOptions);
}

export default SendEmailUtility;