"use strict";
/////////////////////////
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum_to_n_a = sum_to_n_a;
exports.sum_to_n_b = sum_to_n_b;
exports.sum_to_n_c = sum_to_n_c;
// Recursive Approach
function sum_to_n_a(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}
// Dynamic Programming Approach
function sum_to_n_b(n) {
    if (n <= 1)
        return n;
    return n + sum_to_n_b(n - 1);
}
// Iterative Approach
function sum_to_n_c(n) {
    return (n * (n + 1)) / 2;
}
