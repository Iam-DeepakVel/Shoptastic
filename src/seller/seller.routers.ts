import { NextFunction, Request, Response, Router } from "express";
const router = Router();
import {
  BadRequestError,
  CustomError,
  requireAuth,
  uploadDir,
  Uploader,
  UploaderMiddlewareOptions,
} from "@shoppingapp/common";
import { sellerService } from "./seller.service";
const uploader = new Uploader(uploadDir);
const middlewareOptions: UploaderMiddlewareOptions = {
  types: ["image./png", "image/jpeg"],
  fieldName: "image",
};

const multipleFilesMiddleware = uploader.uploadMultipleFiles(middlewareOptions);

router.post(
  "/product/new",
  requireAuth,
  multipleFilesMiddleware,
  async (req: Request, res: Response, next: NextFunction) => {
    const { title, price } = req.body;
    if (!req.files) return next(new BadRequestError("Images are required"));
    if (req.uploaderError)
      return next(new BadRequestError(req.uploaderError.message));

    //   Create product
    const product = await sellerService.addProduct({
      title,
      price,
      userId: req.currentUser!.userId,
      files: req.files,
    });
    // send to user
    res.status(201).send(product);
  }
);

router.post(
  "/product/:id/update",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const result = await sellerService.updateProduct({
      title,
      price,
      userId: req.currentUser!.userId,
      productId: id,
    });
    if (result instanceof CustomError) {
      return next(result);
    }
    res.status(200).send(result);
  }
);

router.delete(
  "/product/:id/delete",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await sellerService.deleteProduct({
      productId: id,
      userId: req.currentUser!.userId,
    });
    if (result instanceof CustomError) {
      return next(result);
    }
    res.status(200).json({ message: "Product Deleted Successfully" });
  }
);

router.post(
  "/product/:id/add-images",
  multipleFilesMiddleware,
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const result = await sellerService.addProductImages({
      productId: id,
      userId: req.currentUser!.userId,
      files: req.files,
    });
    if (result instanceof CustomError) {
      return next(result);
    }
    res.status(200).send(result);
  }
);

router.post(
  "/product/:id/delete-images",
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { imagesIds } = req.body;
    const result = await sellerService.deleteProductImages({
      productId: id,
      userId: req.currentUser!.userId,
      imagesIds,
    });
    if (result instanceof CustomError) {
      return next(result);
    }
    res.status(200).send(result);
  }
);

export { router as sellerRouters };
