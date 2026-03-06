import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { ClientController } from "../controllers/ClientController.js";
import { CatalogController } from "../controllers/CatalogController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();
router.get("/clients/total", ClientController.total);
// Catalog product follow-ups
router.get("/catalogs/:id/products/:prodId/followups", CatalogController.listProductFollowups);
router.post("/catalogs/:id/products/:prodId/followups", CatalogController.addProductFollowup);
router.delete("/catalogs/:id/products/:prodId/followups/:fuId", CatalogController.deleteProductFollowup);

// Garante que a pasta de uploads existe
const uploadDir = path.resolve(__dirname, "../../data/tmp");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.get("/health", ClientController.health);
router.get("/states", ClientController.states);
router.get("/clients", ClientController.list);
router.post("/clients", ClientController.create);
router.put("/clients/:id", ClientController.update);
router.delete("/clients/:id", ClientController.delete);
router.post("/import", upload.single("file"), ClientController.import);

// Client detail + observations
router.get("/clients/:id/detail", ClientController.getClient);
router.get("/clients/:id/observations", ClientController.listObservations);
router.post("/clients/:id/observations", ClientController.createObservation);
router.delete("/clients/:id/observations/:obsId", ClientController.deleteObservation);

// ─── Catalog (MVC) ───
router.get("/catalogs", CatalogController.listCatalogs);
router.post("/catalogs", CatalogController.createCatalog);
router.get("/catalogs/:id", CatalogController.getCatalog);
router.put("/catalogs/:id", CatalogController.updateCatalog);
router.post("/catalogs/:id/close", CatalogController.closeCatalog);
router.delete("/catalogs/:id", CatalogController.deleteCatalog);

// Catalog products
router.get("/catalogs/:id/products", CatalogController.listProducts);
router.post("/catalogs/:id/products", CatalogController.addProduct);
router.put("/catalogs/:id/products/:prodId", CatalogController.updateProduct);
router.delete("/catalogs/:id/products/:prodId", CatalogController.deleteProduct);
router.put("/catalogs/:id/products/:prodId/stock", CatalogController.updateStock);

// PDF import into catalog
router.post("/catalogs/:id/import-pdf", upload.single("file"), CatalogController.importPdf);

export default router;
