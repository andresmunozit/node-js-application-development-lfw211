function outerFn () {
    var foo = true
    function print(foo) { console.log(foo) }

    // In this case the foo parameter of `print` overrides the foo variable in the `outerFn`
    // function.
    print(1) // prints 1
    foo = false
    print(2) // prints 2
}

outerFn()