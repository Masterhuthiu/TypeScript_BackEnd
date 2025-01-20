// src/index.ts
import {sum_to_n_a,sum_to_n_b,sum_to_n_c } from './sumWays';

const n = 5;

console.log(`a Ways to sum to ${n} (Recursive):`, sum_to_n_a(n));
console.log(`b Ways to sum to ${n} (DP):`, sum_to_n_b(n));
console.log(`c Ways to sum to ${n} (Iterative):`, sum_to_n_c(n));

