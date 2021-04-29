//Global selection and variables 

const colorDivs = document.querySelectorAll('.color');
const fenerateBtn = document.querySelector('.generate');
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll('.color h2');
const popup = document.querySelector('.copy-container');
const adjustBtn = document.querySelectorAll('.adjust');
const lockBtn = document.querySelectorAll('.lock');
const closeAdjustments = document.querySelectorAll('.close-adjustment');
const sliderContainers = document.querySelectorAll('.sliders');
const generateBtn = document.querySelector('.generate')
const libraryContainer = document.querySelector('.library-container');
const libraryBtn = document.querySelector('.library');
const closeLibraryBtn = document.querySelector('.close-library');
let initialColors;


//variablesForLocalStorage 
let savedPalettes = [];

//Event Listeners 
generateBtn.addEventListener('click', randomColors)
sliders.forEach(slider => {
    slider.addEventListener('input', hslControls);
})

colorDivs.forEach((div, index) => {
    div.addEventListener('change', () => {
        updateTextUI(index);
    })
})

currentHexes.forEach(hex => {
    hex.addEventListener('click', () => {
        copyToClipboard(hex);
    })
})

popup.addEventListener('transitionend', () => {
    const popupBox = popup.children[0];
    popupBox.classList.remove('active');
    popup.classList.remove('active');
})
adjustBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        openAdjustmentPanel(index);
    })
})
closeAdjustments.forEach((button, index) => {
    button.addEventListener('click', () => {
        closeAdjustmentPanel(index);
    })
})

lockBtn.forEach((button, index) => {
    button.addEventListener('click', () => {
        button.children[0].classList.toggle(`fa-lock-open`);
        button.children[0].classList.toggle(`fa-lock`);
        colorDivs[index].classList.toggle('locked')
    })
})

libraryBtn.addEventListener('click', openLibrary);
closeLibraryBtn.addEventListener('click', closeLibrary)



//Functions


//Genrates color
function generateHex() {
    // VANILLA JS ALGORITHM
    // const letters = "0123456789ABCDEF"; 
    // let hash = "#"; 
    // for (i = 0; i < 6; i++) {
    //     hash += letters[Math.floor(Math.random() *16)]; 
    // }
    // return hash; 

    //CHROMA JS LIBRARY IMPLEMENTATON
    const hexColor = chroma.random();
    return hexColor;
}

//Random colors to div 

function randomColors() {
    initialColors = [];
    colorDivs.forEach((div, index) => {
        const hexText = div.children[0];
        const randomColor = generateHex();

        //Add it to Array 
        if (div.classList.contains('locked')) {
            initialColors.push(hexText.innerText)
            return;
        } else {
            initialColors.push(chroma(randomColor).hex());
        }


        //Change background
        div.style.backgroundColor = randomColor;
        hexText.innerText = randomColor;
        //Check for contrast 
        textContrast(randomColor, hexText);
        //Initaial Colorize Sliders 
        const color = chroma(randomColor);
        const sliders = div.querySelectorAll('.sliders input');
        const hue = sliders[0];
        const brightness = sliders[1];
        const saturation = sliders[2];

        colorizeSliders(color, hue, brightness, saturation);
    })
    resetInputs();
    //Check btns contrast 
    adjustBtn.forEach((button, index) => {
        textContrast(initialColors[index], button);
        textContrast(initialColors[index], lockBtn[index]);

    })
}


//text contrast depending on background

function textContrast(color, text) {
    const luminance = chroma(color).luminance(); //returns value 0 to 1
    if (luminance > 0.5) {
        text.style.color = "black";
    } else {
        text.style.color = "white";
    }
}


//colorizing Sliders 

function colorizeSliders(color, hue, brightness, saturation) {
    //Scale Saturation
    const noSat = color.set('hsl.s', 0);
    const fullSat = color.set('hsl.s', 1);
    console.log(noSat, fullSat);
    const scaleSat = chroma.scale([noSat, color, fullSat]);
    //Scale Brightness
    const midBright = color.set('hsl.l', 0.5);
    const scaleBrightness = chroma.scale(['black', midBright, 'white'])
    //Hue = all colors, so don't need any variables
    //Input update colors; 
    saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(0)}, ${scaleSat(1)})`;
    brightness.style.backgroundImage = `linear-gradient(to right,${scaleBrightness(0)}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;
    hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204),rgb(204,75,75))`
}

function hslControls(e) {
    const index = e.target.getAttribute('data-bright') || e.target.getAttribute('data-sat') || e.target.getAttribute('data-hue');
    let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
    console.log(sliders);
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    const bgColor = initialColors[index];

    let color = chroma(bgColor)
        .set('hsl.s', saturation.value)
        .set('hsl.l', brightness.value)
        .set('hsl.h', hue.value);

    colorDivs[index].style.backgroundColor = color;
    colorizeSliders(color, hue, brightness, saturation);
}

//UpdateText 
function updateTextUI(index) {
    const activeDiv = colorDivs[index];
    const color = chroma(activeDiv.style.backgroundColor)
    const textHex = activeDiv.querySelector('h2');
    const icons = activeDiv.querySelectorAll('.controls button');
    textHex.innerText = color.hex();
    //Check contrast 
    textContrast(color, textHex);
    for (icon of icons) {
        textContrast(color, icon)
    }
}

//Reset Input 
function resetInputs() {
    const sliders = document.querySelectorAll('.sliders input');
    sliders.forEach(slider => {
        if (slider.name === 'hue') {
            const hueColor = initialColors[slider.getAttribute('data-hue')];
            const hueValue = chroma(hueColor).hsl()[0]
            slider.value = Math.floor(hueValue)
        }
        if (slider.name === 'brightness') {
            const brightnessColor = initialColors[slider.getAttribute('data-bright')];
            const brightnessValue = chroma(brightnessColor).hsl()[2]
            slider.value = Math.floor(brightnessValue * 100) / 100;
        }
        if (slider.name === 'saturation') {
            const saturationColor = initialColors[slider.getAttribute('data-sat')];
            const saturationValue = chroma(saturationColor).hsl()[1]
            slider.value = Math.floor(saturationValue * 100) / 100
        }
    })
}
//copy
function copyToClipboard(hex) {
    const el = document.createElement('textArea');
    el.value = hex.innerText;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    //Pop up animation
    const popupBox = popup.children[0];
    popupBox.classList.add('active');
    popup.classList.add('active');
}

//openPanelwithAdj 
function openAdjustmentPanel(index) {
    sliderContainers[index].classList.toggle('active');
}
//closeIt
function closeAdjustmentPanel(index) {
    sliderContainers[index].classList.remove('active');
}


//save to palette and LOCAL STORAGE
const saveBtn = document.querySelector('.save');
const submitSave = document.querySelector('.submit-save');
const closeSave = document.querySelector('.close-save');
const saveContainer = document.querySelector('.save-container');
const saveInput = document.querySelector('.save-container input')

//
saveBtn.addEventListener('click', openPalette)
closeSave.addEventListener('click', closePalette)
submitSave.addEventListener('click', savePalette)

function openPalette(e) {
    const popup = saveContainer.children[0];
    saveContainer.classList.add('active');
    popup.classList.add('active');
}

function closePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
}

function savePalette(e) {
    saveContainer.classList.remove('active');
    popup.classList.remove('active');
    const name = saveInput.value;
    const colors = [];
    currentHexes.forEach(hex => {
        colors.push(hex.innerText)
    })
    //Create obj
    let paletteNr;
    const paletteObjects = JSON.parse(localStorage.getItem('palettes')); 
    if (paletteObjects) {
        paletteNr = paletteObjects.length
    } else {
        paletteNr = savedPalettes.length;
    }

    const palleteObj = {
        name: name,
        colors: colors,
        nr: paletteNr
    }
    savedPalettes.push(palleteObj);
    //Save to LOCAL STORAGE
    saveToLocal(palleteObj);
    saveInput.value = '';

    //Create library 
    const palette = document.createElement('div');
    palette.classList.add('custom-palette')
    const title = document.createElement('h4')
    title.innerText = palleteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    palleteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv)
    })
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(palleteObj.nr);
    paletteBtn.innerText = 'Select';

    //Attach event to btn 

    paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const palletteIndex = e.target.classList[1];
        initialColors = [];
        savedPalettes[palletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            text = colorDivs[index].children[0];
            text.innerText = color;
        })
        resetInputs();
    })

    //Append to Library

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);




}

function saveToLocal(palleteObj) {
    let localPalettes;
    if (localStorage.getItem('palettes') === null) {
        localPalettes = []
    } else {
        localPalettes = JSON.parse(localStorage.getItem('palettes'))
    }
    localPalettes.push(palleteObj);
    localStorage.setItem('palettes', JSON.stringify(localPalettes))
}

function openLibrary() {
    const popup = libraryContainer.children[0];
    libraryContainer.classList.add('active');
    popup.classList.add('active')
}

function closeLibrary() {
    libraryContainer.classList.remove('active');
    popup.classList.remove('active')
}


//get from localStorage 

function getLocal() {
   if(localStorage.getItem ('palettes') === null) {
        localPalettes = [];
   } else {
       const paletteObjects = JSON.parse(localStorage.getItem('palettes')); 
       savedPalettes = [...paletteObjects]
       paletteObjects.forEach(palleteObj => {
        const palette = document.createElement('div');
    palette.classList.add('custom-palette')
    const title = document.createElement('h4')
    title.innerText = palleteObj.name;
    const preview = document.createElement('div');
    preview.classList.add('small-preview');
    palleteObj.colors.forEach(smallColor => {
        const smallDiv = document.createElement('div');
        smallDiv.style.backgroundColor = smallColor;
        preview.appendChild(smallDiv)
    })
    const paletteBtn = document.createElement('button');
    paletteBtn.classList.add('pick-palette-btn');
    paletteBtn.classList.add(palleteObj.nr);
    paletteBtn.innerText = 'Select';

    //Attach event to btn 

    paletteBtn.addEventListener('click', e => {
        closeLibrary();
        const palletteIndex = e.target.classList[1];
        initialColors = [];
        paletteObjects[palletteIndex].colors.forEach((color, index) => {
            initialColors.push(color);
            colorDivs[index].style.backgroundColor = color;
            text = colorDivs[index].children[0];
            text.innerText = color;
        })
        resetInputs();
    })

    //Append to Library

    palette.appendChild(title);
    palette.appendChild(preview);
    palette.appendChild(paletteBtn);
    libraryContainer.children[0].appendChild(palette);
       })
   }
}


randomColors();
getLocal(); 
