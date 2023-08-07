function outerFn() {
    var foo = true
    function print() { console.log(foo) }
    print() // prints true
    foo = false
    print() // prints false
}

outerFn()
