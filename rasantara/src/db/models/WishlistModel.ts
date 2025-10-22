import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

class WishlistModel {
  static collection() {
    return database.collection("wishlists");
  }

  static create(data: { userId: string; foodId: string | number }) {
    // Handle various foodId formats
    let foodObjectId: ObjectId;
    
    if (typeof data.foodId === 'string' && ObjectId.isValid(data.foodId)) {
      foodObjectId = new ObjectId(data.foodId);
    } else if (typeof data.foodId === 'number') {
      // If foodId is a number, convert to hex string first
      foodObjectId = new ObjectId(data.foodId.toString(16).padStart(24, '0'));
    } else {
      // If invalid, just try to use it as-is and let MongoDB throw error
      foodObjectId = new ObjectId(String(data.foodId));
    }
    
    return this.collection().insertOne({
      userId: new ObjectId(data.userId),
      foodId: foodObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  static async findByUserId(userId: string) {
    return this.collection()
      .find({ userId: new ObjectId(userId) })
      .toArray();
  }
  
  static async deleteById(wishlistId: string) {
    return this.collection().deleteOne({ _id: new ObjectId(wishlistId) });
  }
}

export default WishlistModel;
