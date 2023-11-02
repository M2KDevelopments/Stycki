import generatePassword from 'generate-password';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import { send } from '../helpers/email';
import { connectToDatabase } from '../helpers/mongo';
connectToDatabase();


export default async function signUp(req, res) {
    try {

        if (req.method.toUpperCase() !== 'POST') return res.status(404).json({ result: false, message: "Not Found" });

        const { name, email } = req.body;
        const { ref } = req.query;

        if (!name) {
            console.log(`Please enter name`);
            return res.status(400).json({ result: false, message: `Please enter name` });
        }

        if (typeof name !== 'string') {
            console.log(`Please enter a valid name`);
            return res.status(400).json({ result: false, message: `Please enter a valid name` });
        }

        if (name.length < 3) {
            console.log(`Please enter name with 3 or more characters`);
            return res.status(400).json({ result: false, message: `Please enter name with 3 or more characters` });
        }


        if (!email || !email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)) {
            console.log(`Please enter email`);
            return res.status(400).json({ result: false, message: `Please enter email` });
        }

        const exists = await User.findOne({ email: email }).select('name email verified verifiedDeadline').lean();

        // If user exists or resend verification email
        if (exists && exists.verified) {
            console.log(`User ${exists.name} (${exists.email}) already exists`);
            return res.status(400).json({ result: false, message: `User with this email (${exists.email}) already exists` });
        } else if (exists && !exists.verified) {
            // Re-send email
            if (exists.verifiedDeadline && exists.verifiedDeadline.getTime() < new Date().getTime()) {
                // email user account
                try {
                    console.log('Waiting for verification 1')
                    await send([exists.email], 'Verification Email', `Welcome back ${exists.name} (${exists.email}) to Sticky Notes Pro`);
                } catch (err) {
                    console.log(err.message);
                }
            } else if (!exists.verifiedDeadline) {
                // email user account
                try {
                    console.log('Waiting for verification 2')
                    await send([exists.email], 'Verification Email', `Welcome back ${exists.name} (${exists.email}) to Sticky Notes Pro`);
                } catch (err) {
                    console.log(err.message);
                }
            } else {
                console.log(`Email already sent to`, exists.email);
                return res.status(200).json({ result: true, message: "Please check your email for verification." });
            }
        }

        // Create new account
        const password = generatePassword.generate({
            length: 10,
            numbers: true,
            symbols: true,
            uppercase: true,
            excludeSimilarCharacters: true,
        });

        // Generate a salt
        const rounds = 10
        const salt = await bcrypt.genSalt(rounds);

        // Hash the password with the salt
        const hash = await bcrypt.hash(password, salt);

        // Referral System with cookies
        let referred = null;
        if (ref) {
            try {
                const referral = await User.findById(ref).select("name email");
                if (referral) {
                    console.log(`Refered by`, referral.name, referral.email);
                    referred = referral._id;
                }
            } catch (err) {
                console.log(err.message);
            }
        }

        let referralCode = name.replace(/\s/gmi, '-')
        const count = await User.count({ referralCode })
        if (count) referralCode += `${referralCode}`;

        //create user account
        const days = 3;
        const time = days * 24 * 60 * 60 * 1000
        const newuser = new User({
            name, email,
            password: hash,
            referredBy: referred,
            referralCode: referralCode,
            verifiedDeadline: new Date(Date.now() + time),
        })
        const user = await newuser.save();
        console.log(`Created an account form`, user.email, user._id);


        const html = `
        <div style="width:100vw;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
        
        <div style="font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;color:rgb(67, 96, 121);text-align:center;padding:20px;margin:auto 0;width:500px;height:700px;background:rgb(255, 255, 255);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
            <img src="https://stickynotespro.m2kdevelopments.com/logo.png" alt="Sticky Notes Pro" width="250px"/>
            <br/>
            <h2 style="color:#203444;">
                Welcome to <i>${user.name} (${user.email})</i> <b>Sticky Notes Pro</b>. You're Awesome for Registering with us.
            </h2>
            <br/><br/><br/>
            <h1>YOUR PASSWORD</h1>
            <div style="margin: auto 0; text-align:center;font-weight:900; font-size: 4rem;width:90%; padding:20px; background:rgb(237, 237, 237);border: 0px solid #959da533;border-radius:20px;box-shadow: #959da533 0px 8px 24px;">
                ${password}
            </div>
            <br/><br/>
            <h2>
                <a href="https://stickynotespro.m2kdevelopments.com">Go To <strong>Sticky Notes Pro</strong> Website</a>
            </h2>
        </div>

        </div>
        `
        // email user account
        try {
            await send([email], 'Verification Email', html);
        } catch (err) {
            console.log(err.message);
        }

        return res.status(201).json({ result: true, message: `Thank you for signing up to Sticky Notes Pro. Your Awesome! Check your email for the password.` })
    } catch (e) {
        console.log(e.message);
        return res.status(500).json({ result: false, message: e.message });
    }
}