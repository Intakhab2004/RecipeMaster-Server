// const nodemailer = require("nodemailer");
// const otpTemplate = require("../mailTemplate/otpVerification");


// exports.mailSender = async({email, username, otp}) => {
//     try{
//         const transporter = nodemailer.createTransport({
//             service: "gmail",
//             auth: {
//                 user: process.env.MAIL_USER,
//                 pass: process.env.MAIL_PASS
//             }
//         })

//         const mailOptions = {
//             from: `RecipeMaster ${process.env.MAIL_USER}`,
//             to: email,
//             subject: "RecipeMaster | Verification Code",
//             html: otpTemplate(otp, username)
//         }

//         const mailResponse = await transporter.sendMail(mailOptions);

//         if(mailResponse.accepted.length > 0){
//             return {
//                 success: true,
//                 status: 200,
//                 message: "Verification code sent successfully"
//             }
//         }

//         return {
//             success: false,
//             status: 402,
//             message: "Something went wrong while sending mail"
//         }
//     }
//     catch(error){
//         console.log("An error occured while sending mail: ", error.message);
//         return {
//             success: false,
//             status: 500,
//             message: "Internal server error"
//         }
//     }
// }


const sgMail = require("@sendgrid/mail");
const otpTemplate = require("../mailTemplate/otpVerification");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.mailSender = async({email, username, otp}) => {
    try{
        const msg = {
            to: email,
            from: {
                name: "RecipeMaster",
                email: process.env.SENDGRID_SENDER,
            },
            subject: "RecipeMaster | Verification Code",
            html: otpTemplate(otp, username),
        }

        const response = await sgMail.send(msg);

        if(response && response[0] && response[0].statusCode === 202){
            return {
                success: true,
                status: 200,
                message: "Verification code sent successfully",
            }
        }

        return {
            success: false,
            status: 402,
            message: "Something went wrong while sending mail",
        }
    }
    catch(error){
        console.log("An error occurred while sending mail: ", error.message);
        return {
            success: false,
            status: 500,
            message: "Internal server error",
        }
    }
}