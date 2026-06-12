// src/models/Barbershop.ts
import { Model } from "mongoloquent";

export class Barbershop extends Model {
    static collection = "barbershop";
    static timestamps = false;
}