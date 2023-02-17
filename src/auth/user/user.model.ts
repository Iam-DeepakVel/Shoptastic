import mongoose from "mongoose";
import { UserModel, UserDoc } from "@shoppingapp/common";
import bcrypt from "bcryptjs";
const schema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete doc._id;
        delete doc.password;
      },
    },
  }
);

schema.pre("save", async function (done) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  done();
});

export const User = mongoose.model<UserDoc, UserModel>("User", schema);
