require("dotenv").config();
const mongoose = require("mongoose");
mongoose.set('strictQuery', true);
const uri = process.env.mongo_uri;

mongoose.connect(uri).then(()=>{
console.log(`connection successful`);
}).catch((error)=>{
console.log(error);
});