import mongoose from "mongoose";
const mongodbUrl = process.env.MONODB_URL

if(!mongodbUrl){
    throw new Error ("Db url not Found!")
}

let cached = global.mongooseConnection

if(!cached){
    cached = global.mongooseConnection={conn:null,promise:null}
}

const connectDb = async ()=>{
    if(cached.conn){
        return cached.conn
    }
    if(!cached.promise){
        cached.promise= mongoose.connect(mongodbUrl).then(c=>c.connection)
    }

    try{
        const conn = await cached.promise
        return conn;
    }
    catch (error){
        console.log("Error connecting to DB",error)

    }
}

export default connectDb
