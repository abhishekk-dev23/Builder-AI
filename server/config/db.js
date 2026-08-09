import mongoose from "mongoose";

export async function connectToDatabase() {
    mongoose.connection.on("connected", () => {
        console.log("DataBase is connected Successfully.");
    });

    await mongoose.connect(process.env.MONGODB_URI);
}
