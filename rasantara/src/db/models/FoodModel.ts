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
      origin: { province: string; island: string; city_or_region: string } | string[];
      category?: string;
      course?: string;
      alternate_names?: string[];
      main_ingredients?: string[];
      serving?: { temperature?: string; accompaniments?: string[]; portion_size?: string };
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
}

export default FoodModel;
