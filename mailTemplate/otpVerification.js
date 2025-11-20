const otpTemplate = (otp, username) => {
    return (
        `
        <div style="font-family:Arial, sans-serif; background:#f4f4f4; padding:30px;">
            <div style="max-width:600px; margin:auto; background:#fff; border-radius:10px; padding:30px; box-shadow:0 4px 12px rgba(0,0,0,0.1); text-align:center;">
                <h1 style="color:#4A90E2; margin-bottom:10px;">
                    RecipeMaster
                </h1>
                <p style="color:#888; margin-top:0; margin-bottom:20px;">
                    Secure Login Verification
                </p>

                <p style="font-size:16px; color:#333;">
                    Hello <strong>${username}</strong>,
                </p>
                <p style="font-size:15px; color:#555; margin-top:0;">
                    Enter the OTP below to sign in. Valid for <strong>60 minutes</strong>.
                </p>

                <div style="margin:30px 0;">
                    <span style="display:inline-block; font-size:28px; letter-spacing:8px; font-weight:bold; color:#4A90E2; border:2px dashed #4A90E2; padding:12px 24px; border-radius:8px; background:#f9f9f9;">
                        ${otp}
                    </span>
                </div>

                <p style="font-size:14px; color:#888; margin-top:20px;">
                    If you didn’t request this, ignore this email.
                </p>
                <p style="font-size:12px; color:#aaa; margin-top:10px;">&copy; 2025 TaskHunter. All rights reserved.</p>
            </div>
        </div>

        `
    )
}

module.exports = otpTemplate;