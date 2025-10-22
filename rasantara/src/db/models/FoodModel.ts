import { ObjectId } from "mongodb";
import { database } from "../config/mongodb";

class FoodModel {
  static collection() {
    return database.collection("foods");
  }

  static async insert(
    food: {
      name: string;
      description: string;
      photo: string; // base64 data URL or remote URL
      origin:
        | { province: string; island: string; city_or_region: string }
        | string[];
      category?: string;
      course?: string;
      alternate_names?: string[];
      main_ingredients?: string[];
      serving?: {
        temperature?: string;
        accompaniments?: string[];
        portion_size?: string;
      };
      taste_profile?: { spiciness?: string; flavor_notes?: string[] };
      model3D?: string;
    } & Record<string, unknown>
  ) {
    const result = await this.collection().insertOne(food);
    return { _id: result.insertedId, ...food };
  }

  static async getAll() {
    const foods = await this.collection().find({}).sort({ _id: -1 }).toArray();

    return foods;
  }

  static async getBySlug(slug: string) {
    const food = await this.collection().findOne({ slug: slug });
    return food;
  }

  static async deleteById(id: string) {
    const objectId = new ObjectId(id);
    const result = await this.collection().deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      throw new Error("Data tidak ditemukan atau gagal dihapus");
    }

    return { success: true, message: "Data berhasil dihapus" };
  }

  static async getById(id: string) {
    const objectId = new ObjectId(id);
    const food = await this.collection().findOne({ _id: objectId });
    return food;
  }

  static async updateById(
    id: string,
    food: {
      name?: string;
      description?: string;
      photo?: string;
      origin?:
        | { province: string; island: string; city_or_region: string }
        | string[];
      category?: string;
      course?: string;
      alternate_names?: string[];
      main_ingredients?: string[];
      serving?: {
        temperature?: string;
        accompaniments?: string[];
        portion_size?: string;
      };
      taste_profile?: { spiciness?: string; flavor_notes?: string[] };
      model3D?: string;
    } & Record<string, unknown>
  ) {
    const objectId = new ObjectId(id);
    const result = await this.collection().updateOne(
      { _id: objectId },
      { $set: food }
    );

    if (result.matchedCount === 0) {
      throw new Error("Data tidak ditemukan");
    }

    return { success: true, message: "Data berhasil diupdate" };
  }
}

export default FoodModel;
