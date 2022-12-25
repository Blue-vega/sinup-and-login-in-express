require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path")
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt  = require("jsonwebtoken")
const cookieParser = require("cookie-parser")
const auth = require("./middelware/auth");
require("./db/conn");
const Register = require("./models/register")
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;
// const static_path = path.join(__dirname, "../public")
const template_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

// for gating data from form
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

// app.use(express.static(static_path))
app.set("view engine", "hbs");
app.set("views",template_path);
hbs.registerPartials(partials_path);
app.get("/", (req, res)=> {  
 res.render("index")
})

 
 app.get("/login", (req, res)=>{
 res.render("login");
 });
 app.get("/secret", auth, (req, res)=>{
    res.render("secret");
 });
 app.get("/logout", auth, async(req, res)=>{
    try {
        // console.log(req.user.tokens);
        // req.user.tokens = req.user.tokens.filter((currElement)=>{
        //     return currElement.token !== req.token
        // })
        req.user.tokens= [];
        res.clearCookie("jwt");
        console.log("logout successful");
        await req.user.save();  
        res.render("login");
    } catch (error) {
        res.status(500).send(error);
    }
 });
 app.get("/register",(req, res)=>{
    res.render("register");
 });
//  creates a new user in database 
 app.post("/register", async(req, res)=>{
    try{
        const password = req.body.password;
        const cPassword = req.body.conformPassword;
        if(password === cPassword){
            const registerUser = new Register({
                firstname:req.body.firstName,
                lastname:req.body.lastName,
                age:req.body.age,
                email:req.body.Email,
                password:req.body.password,
                conformPassword:req.body.conformPassword,
                gender:req.body.gender,
                phone:req.body.mobile,
            })
            // password hashing
            // token generating
            const token = await registerUser.generateAuthToken();
            //cookie
            res.cookie('jwt',token,{
                expires:new Date(Date.now() + 30000000),
                httpOnly:true
            });




           const registered = await registerUser.save();
           res.status(201)
           .render("index");
        }

        else{
            res.send("Passwords are not Matching")
        }
        // console.log(req.body.firstName);
        // res.send(req.body.firstName);
    }
    catch(error){
        res.status(400).send(error)
    }
 });

//  login check
app.post("/login", async(req, res)=>{
    try{
        const email = req.body.email;
        const password = req.body.password;

    const useremail = await Register.findOne({email:email})

    const isMatch = await bcrypt.compare(password, useremail.password);
    const token = await useremail.generateAuthToken();
    // cookies storing
    res.cookie('jwt',token,{
        expires:new Date(Date.now() + 30000000),
        httpOnly:true,
        //secure:true,
    });
        // if(useremail.password === password){
         if(isMatch){
            res.status(201).render("index")
        }
        else{
            res.send("password is not matching")
        }
        
    }
    catch(error){
      res.status(400).send("invalid Email")
    }

 });

app.listen(port,()=>{
  console.log(`server is running @ port-${port} Enjoy...`);
});