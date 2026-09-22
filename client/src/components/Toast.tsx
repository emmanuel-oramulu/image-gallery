"use client";

import { toast } from "@/components/ui/toast";

export type ToastType =
	| "default"
	| "success"
	| "info"
	| "warning"
	| "error";

interface ShowToastOptions {
	type?: ToastType;
	title?: string;
	description: string;
}

export function showToast({
	type = "default",
	title,
	description,
}: ShowToastOptions) {
	toast.add({
		type,
		title,
		description,
		priority: "high",
	});
}