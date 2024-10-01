import { Type } from "class-transformer";
import { IsOptional, IsPositive } from "class-validator";

export class PaginationDto {
	// Default value = 1
	@IsPositive()
	@IsOptional()
	@Type(() => Number)
	page?: number = 1;


	// Default value = 10
	@Type(() => Number)
	@IsPositive()
	@IsOptional()
	limit?: number = 10;
}