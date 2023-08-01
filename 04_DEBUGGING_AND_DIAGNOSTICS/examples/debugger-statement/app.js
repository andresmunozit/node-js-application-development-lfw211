function f(n = 99) {
    if (n === 0) throw Error()

    // The debug process will be paused at the following line
    debugger
    f(n - 1)
}

f()
