const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt  = require("jsonwebtoken")
const UsersSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  conformPassword: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    required: true,
  },
  tokens:[{
    token:{type: String,
      required: true,}
  }]
});
//token generation

UsersSchema.methods.generateAuthToken = async function(){
try{
  const token = jwt.sign({_id:this._id.toString()},process.env.secret_key);
  this.tokens = this.tokens.concat({token:token})
  await this.save();
  return token;
}
catch(e){
console.log("token generation failed");
}}

//hashing  the password
UsersSchema.pre("save", async function(next){

if(this.isModified("password")){
this.password = await bcrypt.hash(this.password, 10);
this.conformPassword = await bcrypt.hash(this.conformPassword, 10);
}
next();
})

// now we are creating collection
const Register = new mongoose.model("Register", UsersSchema);

module.exports = Register;
