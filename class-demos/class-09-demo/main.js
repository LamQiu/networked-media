window.addEventListener('load', () => {
    // document.body is the selector to retrieve the body html element
    document.body.addEventListener("click", (e) => {
        console.log('document.body was clicked')
        console.log(`${e.clientX}`, `${e.clientY}`)
    })

    let textDiv = document.getElementById('text')
    document.addEventListener('keydown', (e) => {
        console.log('key pressed')
        console.log(e.key)

        textDiv.textContent += e.key

        if (e.key == ' ') {
            textDiv.style.backgroundColor = 'red';
        }
    })
})