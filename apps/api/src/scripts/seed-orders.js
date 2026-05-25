import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDatabase } from "../config/db.js";
import { Customer } from "../modules/customers/customer.model.js";
import { Order } from "../modules/orders/order.model.js";
import { Product } from "../modules/products/product.model.js";

dotenv.config();

const productBaselines = {
  "IPH-17PM": 8,
  "MAC-MBA15": 10,
  "WAT-S11": 12,
  "AIRPODSMAX": 7,
  "AIRPODSPRO3": 10,
  "IPD-PRO13": 7,
  "AVP-BASE": 4,
  "MAC-MBP14": 8,
};

const orderDefinitions = [
  {
    orderCode: "ORD-DEMO-1001",
    customerPhone: "0901000001",
    paymentMethod: "vnpay",
    paymentStatus: "paid",
    orderStatus: "delivered",
    note: "Flagship bundle order",
    createdAt: new Date("2026-03-01T09:15:00.000Z"),
    items: [
      { sku: "IPH-17PM", quantity: 1 },
      { sku: "AIRPODSMAX", quantity: 1 },
    ],
  },
  {
    orderCode: "ORD-DEMO-1002",
    customerPhone: "0901000002",
    paymentMethod: "cod",
    paymentStatus: "pending",
    orderStatus: "confirmed",
    note: "Waiting for COD collection",
    createdAt: new Date("2026-03-03T11:40:00.000Z"),
    items: [{ sku: "WAT-S11", quantity: 1 }],
  },
  {
    orderCode: "ORD-DEMO-1003",
    customerPhone: "0901000003",
    paymentMethod: "vnpay",
    paymentStatus: "paid",
    orderStatus: "shipping",
    note: "Paid online and waiting for delivery dispatch",
    createdAt: new Date("2026-03-05T07:20:00.000Z"),
    items: [
      { sku: "AVP-BASE", quantity: 1 },
      { sku: "AIRPODSPRO3", quantity: 1 },
    ],
  },
  {
    orderCode: "ORD-DEMO-1004",
    customerPhone: "0901000001",
    paymentMethod: "vnpay",
    paymentStatus: "paid",
    orderStatus: "delivered",
    note: "",
    createdAt: new Date("2026-03-06T14:05:00.000Z"),
    items: [{ sku: "IPD-PRO13", quantity: 1 }],
  },
  {
    orderCode: "ORD-DEMO-1005",
    customerPhone: "0901000004",
    paymentMethod: "cod",
    paymentStatus: "failed",
    orderStatus: "cancelled",
    note: "Customer unreachable",
    createdAt: new Date("2026-03-07T10:30:00.000Z"),
    items: [{ sku: "MAC-MBA15", quantity: 1 }],
  },
  {
    orderCode: "ORD-DEMO-1006",
    customerPhone: "0901000002",
    paymentMethod: "vnpay",
    paymentStatus: "paid",
    orderStatus: "delivered",
    note: "MacBook Pro order completed",
    createdAt: new Date("2026-03-08T16:10:00.000Z"),
    items: [{ sku: "MAC-MBP14", quantity: 1 }],
  },
];

async function seedOrders() {
  await connectDatabase(process.env.MONGODB_URI);

  await Order.deleteMany({});

  const products = await Product.find({
    sku: { $in: Object.keys(productBaselines) },
  });
  const productBySku = new Map(products.map((item) => [item.sku, item]));

  for (const product of products) {
    const baseline = productBaselines[product.sku];
    product.stock = baseline;
    product.status = "active";
    await product.save();
  }

  await Customer.updateMany({}, { totalSpend: 0, orderCount: 0 });

  for (const definition of orderDefinitions) {
    const customer = await Customer.findOne({ phone: definition.customerPhone });

    if (!customer) {
      throw new Error(`Missing customer ${definition.customerPhone}. Run seed:customers first.`);
    }

    const items = definition.items.map((item) => {
      const product = productBySku.get(item.sku);

      if (!product) {
        throw new Error(`Missing product ${item.sku}. Run seed:products first.`);
      }

      return {
        product,
        quantity: item.quantity,
        lineTotal: product.price * item.quantity,
      };
    });

    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    const shippingFee = subtotal >= 1000000 ? 0 : 30000;
    const totalAmount = subtotal + shippingFee;

    const order = await Order.create({
      orderCode: definition.orderCode,
      customerId: customer._id,
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      items: items.map(({ product, quantity, lineTotal }) => ({
        productId: product._id,
        name: product.name,
        sku: product.sku,
        image: product.images[0]?.url || "",
        quantity,
        unitPrice: product.price,
        lineTotal,
      })),
      shippingAddress: customer.addresses[0],
      paymentMethod: definition.paymentMethod,
      paymentStatus: definition.paymentStatus,
      orderStatus: definition.orderStatus,
      subtotal,
      shippingFee,
      discountAmount: 0,
      totalAmount,
      note: definition.note,
      createdAt: definition.createdAt,
      updatedAt: definition.createdAt,
    });

    await Order.updateOne(
      { _id: order._id },
      { $set: { createdAt: definition.createdAt, updatedAt: definition.createdAt } }
    );

    for (const item of items) {
      item.product.stock -= item.quantity;
      if (item.product.stock <= 0) {
        item.product.stock = 0;
        item.product.status = "out_of_stock";
      }
      await item.product.save();
    }

    customer.orderCount += 1;
    customer.totalSpend += totalAmount;
    if (customer.totalSpend >= 20000000) {
      customer.status = "vip";
    } else if (customer.orderCount > 0 && customer.status === "inactive") {
      customer.status = "active";
    }
    await customer.save();
  }

  console.log(`Seeded ${orderDefinitions.length} orders`);
}

seedOrders()
  .catch((error) => {
    console.error("Order seed failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
