import { createStore } from "@sinuxjs/core";

export const ORDER_FIELDS = ["name", "phone", "product", "quantity", "address"] as const;
export type OrderField = (typeof ORDER_FIELDS)[number];

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
		fill: (_state: OrderState, order: Partial<Record<OrderField, string | number>>) => {
			const fields = { ...empty };
			for (const key of ORDER_FIELDS) fields[key] = order[key] === undefined ? "" : String(order[key]);
			return { fields, filled: ORDER_FIELDS.filter((key) => fields[key] !== "") };
		},
		clear: () => ({ fields: empty, filled: [] }),
	},
);
