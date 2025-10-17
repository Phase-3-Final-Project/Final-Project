import { database } from "../config/mongodb";

class FoodModel {
    static collection() {
        return database.collection("foods");
    }

    static async getAll() {
        const foods = await this.collection().find({}).toArray();
        return foods;
    }

    static async getBySlug(slug: string) {
        const food = await this.collection().findOne({ slug: slug });
        return food;
    }
}

export default FoodModel;