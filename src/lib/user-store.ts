// Utility functions for accessing user and store data from localStorage

export interface UserStoreData {
	user_id: string;
	store_id: string;
	merchant_id: string;
	store_name: string;
	merchant_name: string;
}

export const getUserStoreData = (): UserStoreData | null => {
	if (typeof window === "undefined") return null;

	const user_id = localStorage.getItem("user_id");
	const store_id = localStorage.getItem("store_id");
	const merchant_id = localStorage.getItem("merchant_id");
	const store_name = localStorage.getItem("store_name");
	const merchant_name = localStorage.getItem("merchant_name");

	if (!user_id || !store_id || !merchant_id || !store_name || !merchant_name) {
		return null;
	}

	return {
		user_id,
		store_id,
		merchant_id,
		store_name,
		merchant_name,
	};
};

export const getStoreId = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("store_id");
};

export const getMerchantId = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("merchant_id");
};

export const getUserId = (): string | null => {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("user_id");
};

export const clearUserStoreData = (): void => {
	if (typeof window === "undefined") return;

	localStorage.removeItem("user_id");
	localStorage.removeItem("store_id");
	localStorage.removeItem("merchant_id");
	localStorage.removeItem("store_name");
	localStorage.removeItem("merchant_name");
};
