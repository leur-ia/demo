import { NoProviderError } from "@leuria/client";
import { useChat } from "@leuria/react";
import { useStore } from "@sinuxjs/react";

import { ORDER_FIELDS, type OrderField, orderStore } from "./order.store";
import { products } from "./products";

const orderSchema = {
	type: "object",
	properties: {
		name: { type: "string" },
		phone: { type: "string" },
		address: { type: "string" },
		product: { type: "string", enum: products.map((p) => p.id) },
		quantity: { type: "integer", minimum: 1 },
	},
	required: ["name", "product", "quantity"],
};

type Order = Partial<Record<OrderField, string | number>>;

const LABELS: Record<OrderField, string> = { name: "Name", phone: "Phone", product: "Mug", quantity: "Quantity", address: "Address" };

/** Structured output: a free-text message becomes an order form. */
export function QuickOrder() {
	const { message, fields, filled } = useStore(orderStore);
	const { status, error, start } = useChat();
	const busy = status === "running";

	const fill = async () => {
		try {
			const order = await start<Order>({
				system: "Extract the order from the customer's message. Leave a field out when it is not given.",
				prompt: message,
				schema: orderSchema,
				validate: (value) => {
					const order = value as Order;
					if (!products.some((p) => p.id === order.product)) throw new Error(`product must be one of ${products.map((p) => p.id)}`);
					return order;
				},
			}).object();
			void orderStore.fill(order);
		} catch {
			// Shown from the hook's state.
		}
	};

	return (
		<section id="order" className="panel order">
			<div className="panel-head">
				<div>
					<h2>Quick order</h2>
					<p className="panel-sub">Paste your message, we fill in the order.</p>
				</div>
			</div>
			<label className="field field-wide">
				<span>Your message</span>
				<textarea value={message} onChange={(e) => void orderStore.editMessage(e.target.value)} rows={3} />
			</label>
			<div className="order-actions">
				<button type="button" className="btn" onClick={fill} disabled={busy || !message.trim()}>
					{busy ? "Reading your message…" : "Fill in the order"}
				</button>
				{filled.length > 0 && !busy && (
					<button type="button" className="btn btn-quiet" onClick={() => void orderStore.clear()}>
						Clear
					</button>
				)}
			</div>
			{status === "error" && error && (
				<p className="form-error" role="alert">
					{error instanceof NoProviderError
						? "Connect your AI at the top of the page, or fill in the order yourself."
						: "We couldn't read this order. Fill it in yourself, or try again."}
				</p>
			)}
			<div className="fields">
				{ORDER_FIELDS.map((key) => (
					<label key={key} className={`field${key === "address" ? " field-wide" : ""}${filled.includes(key) ? " field-filled" : ""}`}>
						<span>{LABELS[key]}</span>
						{key === "product" ? (
							<select value={fields.product} onChange={(e) => void orderStore.edit("product", e.target.value)}>
								<option value="">Choose a mug</option>
								{products.map((p) => (
									<option key={p.id} value={p.id}>
										{p.name}
									</option>
								))}
							</select>
						) : (
							<input
								value={fields[key]}
								inputMode={key === "quantity" ? "numeric" : key === "phone" ? "tel" : undefined}
								onChange={(e) => void orderStore.edit(key, e.target.value)}
							/>
						)}
					</label>
				))}
			</div>
		</section>
	);
}
