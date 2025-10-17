import { database } from "../config/mongodb";
import { ObjectId } from "mongodb";

class WishlistModel {
  static collection() {
    return database.collection("wishlists");
  }

  static create(data: { userId: string; foodId: string }) {
    return this.collection().insertOne({
      userId: new ObjectId(data.userId),
      foodId: new ObjectId(data.foodId),
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
