"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const sumWays_1 = require("./sumWays");
const n = 5;
console.log(`a Ways to sum to ${n} (Recursive):`, (0, sumWays_1.sum_to_n_a)(n));
console.log(`b Ways to sum to ${n} (DP):`, (0, sumWays_1.sum_to_n_b)(n));
console.log(`c Ways to sum to ${n} (Iterative):`, (0, sumWays_1.sum_to_n_c)(n));
