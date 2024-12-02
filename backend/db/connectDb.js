import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDb Connected Succesfully ${conn.connection.host}`)
    } catch (error) {
        console.log("Error in Mongo " ,error.message)
        process.exit(1);//1 for failue and 0 for success
    }
}