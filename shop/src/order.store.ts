import { createStore } from "@sinuxjs/core";

import { products } from "./products";

export const ORDER_FIELDS = ["name", "phone", "product", "quantity", "address"] as const;
export type OrderField = (typeof ORDER_FIELDS)[number];

/** An order as the AI gives it: by the order form's tool, or read from a message. */
export type Order = { name?: string; phone?: string; address?: string; product?: string; quantity?: number };

export const orderSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		phone: { type: "string" },
		address: { type: "string" },
		product: { type: "string", enum: products.map((p) => p.id) },
		quantity: { type: "integer", minimum: 1 },
	},
};

export interface OrderState {
	message: string;
	fields: Record<OrderField, string>;
	/** The fields the AI filled in, highlighted until edited. */
	filled: OrderField[];
}

const empty: Record<OrderField, string> = { name: "", phone: "", product: "", quantity: "", address: "" };

export const orderStore = createStore(
	{
		message:
			"Hi, I'm Ana Lopez, please send two blue mugs to 12 rue des Lilas, Lyon. Call me on 06 12 34 56 78 if needed.",
		fields: empty,
		filled: [],
	} as OrderState,
	{
		editMessage: (_state, message: string) => ({ message }),
		edit: (state, field: OrderField, value: string) => ({
			fields: { ...state.fields, [field]: value },
			filled: state.filled.filter((f) => f !== field),
		}),
		fill: (_state: OrderState, order: Order) => {
			const fields = { ...empty };
			for (const key of ORDER_FIELDS) fields[key] = order[key] === undefined ? "" : String(order[key]);
			return { fields, filled: ORDER_FIELDS.filter((key) => fields[key] !== "") };
		},
		clear: () => ({ fields: empty, filled: [] }),
	},
);
