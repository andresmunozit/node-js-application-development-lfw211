function f(n = 99) {
    // "==" and "===" are both equality operators
    // == performs type coercion if necessary, 1 == '1' is true because '1' is coerced to a number
    // === strict equality comparison, no type coercion will be done
    if (n === 0) throw Error()
    
    f(n - 1)
}

f()
