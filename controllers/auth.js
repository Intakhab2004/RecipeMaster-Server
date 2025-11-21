const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const OTP = require("../models/OTP");
const PersonalDetails = require("../models/PersonalDetails");
const { mailSender } = require("../config/mailConfig");
const { signUpSchema, usernameSchema } = require("../schemas/signupSchema");
const { verifySchema } = require("../schemas/verifySchema");
const { siginSchema } = require("../schemas/signinSchema");



exports.sendOTP = async(req, res) => {
    try{
        const { username } = req.body;
        if(!username){
            console.log("Username is required for otp generation");
            return res.status(400).json({
                success: false,
                message: "Username not found"
            })
        }

        const user = await User.findOne({username});
        if(!user){
            console.log("User does not exists with the given username");
            return res.status(401).json({
                success: false,
                message: "User does not exists with the given username"
            })
        }

        if(user.isVerified){
            console.log("User is already verified");
            return res.status(401).json({
                success: false,
                message: "User is already verified"
            })
        }

        // Deleting all the previous OTP if exists
        await OTP.deleteMany({username});

        // Generating the otp
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();

        // creating entry in the database
        await OTP.create({username, otp})

        // Sending otp through mail
        const mailResponse = await mailSender({email: user.email, username: user.username, otp: otp});
        if(!mailResponse.success){
            console.log("Something went wrong while sending mail");
            return res.status(403).json({
                success: false,
                message: mailResponse.message
            })
        }

        return res.status(200).json({
            success: true,
            message: "Otp Resent Successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.uniqueUsername = async(req, res) => {
    try{
        const username = req.query.username.trim();
        
        // Zod validation
        const validationResult = usernameSchema.safeParse(username);
        if(!validationResult.success){
            return res.status(403).json({
                success: false
            })
        }

        const user = await User.findOne({username});
        if(user && user.isVerified){
            return res.status(409).json({
                success: false,
                message: "Username is already taken"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Username is available"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.signUp = async(req, res) => {
    try{
        const { username, email, password, confirmPassword } = req.body;

        // Zod schema validation
        const signupQuerySchema = {
            username,
            email,
            password,
            confirmPassword
        }

        const validationResult = signUpSchema.safeParse(signupQuerySchema);
        if(!validationResult.success){
            console.error("Validation failed: ", validationResult.error.issues);
            return res.status(400).json({
                success: false,
                message: "Please fill all the details correctly",
                errors: validationResult.error.issues
            })
        }
        const userData = validationResult.data;


        // Hasing password and generating otp
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        const otp = Math.floor(Math.random() * 900000 + 100000).toString();


        // Checking for the existing user
        const existingUser = await User.findOne({
            $or: [
                { username: userData.username },
                { email: userData.email }
            ]
        })

        if(existingUser){
            if(existingUser.isVerified){
                if(existingUser.email === userData.email){
                    console.log("User already exists with the given email");
                    return res.status(401).json({
                        success: false,
                        message: "User already exists with the provided email"
                    })
                }

                if(existingUser.username === userData.username){
                    console.log("User already exists with the given username");
                    return res.status(401).json({
                        success: false,
                        message: "User already exists with the provided username"
                    })
                }
            }

            existingUser.email = userData.email;
            existingUser.username = userData.username;
            existingUser.password = hashedPassword;
            existingUser.avatar.imageURL = "";
            existingUser.avatar.publicId = "";

            await existingUser.save();
        }

        else{
            const userDetails = new PersonalDetails({
                firstName: null,
                lastName: null,
                gender: null,
                DOB: null,
                contactNumber: null
            })

            await userDetails.save();

            const newUser = new User({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                avatar: {
                    imageURL: "",
                    publicId: ""
                },
                personalDetails: userDetails._id
            })
            await newUser.save();
        }

        // Creating entry in DB for otp
        await OTP.deleteMany({username});
        await OTP.create({username: userData.username, otp});

        // Sending otp to user
        const mailResponse = await mailSender({email: userData.email, username: userData.username, otp});
        if(!mailResponse.success){
            console.log("Something went wrong while sending the mail");
            return res.status(400).json({
                success: false,
                message: "Error while sending mail"
            })
        }

        return res.status(200).json({
            success: true,
            message: "Account created successfully, Please check your email for verification code"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.verifyOtp = async(req, res) => {
    try{
        const { username, otpCode } = req.body;

        // Zod validation
        const validationResult = verifySchema.safeParse({otpCode});
        if(!validationResult.success){
            console.log("Zod validation failed: ", validationResult.error.issues);
            return res.status(400).json({
                success: false,
                message: "Please fill all the details carefully",
                errors: validationResult.error.issues
            })
        }

        const user = await User.findOne({username});
        if(!user){
            console.log("User not found");
            return res.status(404).json({
                success: false,
                message: "User not found with the given username"
            })
        }

        // Extracting the otpCode from DB and verifying
        const currentOtp = await OTP.findOne({username});
        if(!currentOtp){
            console.log("OTP expired!");
            return res.status(402).json({
                success: false,
                message: "OTP expired!"
            })
        }

        const validOTP = (currentOtp.otp === validationResult.data.otpCode);
        if(!validOTP){
            console.log("OTP is incorrect");
            return res.status(401).json({
                success: false,
                message: "OTP is incoorect"
            })
        }

        user.isVerified = true;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "User verified successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.signIn = async(req, res) => {
    try{
        const { identifier, password } = req.body;

        // Zod validation
        const validationResult = siginSchema.safeParse({identifier, password});
        if(!validationResult.success){
            console.log("Zod validation failed: ", validationResult.error.issues);
            return res.status(400).json({
                success: false,
                message: "Please fill all the details carefully",
                errors: validationResult.error.issues
            })
        }

        // Checking for the existing user
        const user = await User.findOne({
            $or: [
                {email: identifier},
                {username: identifier}
            ]
        }).populate("favoriteRecipes").populate("nutritionLogs");
        

        if(!user){
            console.log("User not exists");
            return res.status(404).json({
                success: false,
                message: "User does not exists with the given credentials"
            })
        }

        if(!user.isVerified){
            console.log("User is not verified");
            return res.status(401).json({
                success: false,
                message: "User is not verified, Please verifiy the user before login"
            })
        }

        // Comparing the password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(!passwordMatch){
            console.log("Password is incorrect");
            return res.status(401).json({
                success: false,
                message: "Password is incorrect"
            })
        }

        const payload = {
            id: user._id,
            username: user.username,
            email: user.email,
            verifiedUser: user.isVerified
        }

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d"});
        user.password = undefined;

        const cookieOptions = {
            httpOnly: true,
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        }

        res.cookie("token", token, cookieOptions).status(200).json({
            success: true,
            user,
            message: "User logged in successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}


exports.logout = async(req, res) => {
    try{
        res.clearCookie("token", {
            httpOnly: true
        })

        return res.status(200).json({
            success: true,
            message: "Account Logged out Successfully"
        })
    }
    catch(error){
        console.log("Something went wrong: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}