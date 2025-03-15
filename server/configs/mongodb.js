import mongoose from "mongoose";

const connectDB = async () => {
    mongoose.connection.on("conected", () => {
        console.log("Mongodb connected")
    })
    await mongoose.connect(`${process.env.MONGODB_URI}/lms`);

};

export default connectDB;
