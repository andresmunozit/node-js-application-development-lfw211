function outerFn() {
    var foo = true
}

outerFn()
console.log(foo) // Will trow a `ReferenceError: foo is not defined`
