export type PaginationResponse<T> = {
	data: T[];
	metadata: {
		totalPages: number;
		actualPage: number;
		lastPage: number;
	}
}