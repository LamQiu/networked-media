alert('javescript!');
console.log("javascript log")

let colors = ['#360568', 'red', 'orange', 'blue', 'yellow']

window.onload = () => {
    console.log("page has loaded")

    // retrieves a SINGLE js element using an id
    let mainElement = document.getElementById('main');
    mainElement.style.color = 'white';
    console.log(mainElement);

    // querySelector only get the first element matches
    let firstParagraph = document.querySelector('p')
    let blueParagraph = document.querySelector('.blue')
    document.querySelector('#main')

    firstParagraph.textContent = 'i have updated the text with js'
    blueParagraph.style.backgroundColor = 'navy'
    console.log(firstParagraph)

    let containerDiv = document.querySelector("#blue-div")

    for (let i = 0; i < 60; i++) {
        // creating an element on a webpage:
        // 1. declare what type of element we are creating
        let newSpan = document.createElement('span')
        // 2. modify that element / content
        newSpan.textContent = 'new span'
        newSpan.classList.add('all-spans')
        let c = Math.floor(Math.random() * colors.length)
        newSpan.style.backgroundColor = colors[c]
        // 3. add the created element to the page
        containerDiv.appendChild(newSpan)
    }

    let rotation = 0
    setInterval(()=>{
        console.log("2 seconds have passsed")
        let allSpans = document.getElementsByClassName('.all-spans')
        //let allSpans = document.querySelectorAll('.all-spans')
        for(let s of allSpans){
            s.style.transform = `rotate(${rotation}deg)`
            rotation++
            console.log(s.style.transform)
        }
    }, 2000)
}

// helper functions go after window.onload {}
function intervalFunction(){

}