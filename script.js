// arrow dropdown functionality
const dropdowns = document.querySelectorAll('.dropdown');
const flexboxes = ['income-flexbox', 'expenses-flexbox', 'income-chart']

const debounce = {
    ['income-dropdown']: false,
    ['expenses-dropdown']: false,
    ['visualize-dropdown']: false,
}

for (const dropdown of dropdowns) {
    const flexboxVal = (dropdown.dataset.flexbox);
    const flexboxId = (flexboxes[parseInt(flexboxVal)]);
    const flexbox = document.getElementById(flexboxId);

    flexbox.style.transition = "opacity 250ms, max-height 450ms"

    dropdown.onclick = (e) => {
        const deb = debounce[flexbox.id];
        if (!deb) {
            flexbox.style.maxHeight = '0px';
            flexbox.style.opacity = '0';
            dropdown.style.transform = "rotate(180deg)"
        } else {
            flexbox.style.visibility = 'visible'

            flexbox.style.maxHeight = '1000px';
            flexbox.style.opacity = '1';
            dropdown.style.transform = "rotate(0)"
        }
        debounce[flexbox.id] = !deb
    }

    flexbox.addEventListener('transitionend', () => {
        if (debounce[flexbox.id]) flexbox.style.visibility = 'collapse';
    })
}

// search dropdown animations
const searchInput = document.querySelector('#search-dropdown > input');
const postrack = document.getElementById('button-location-tracker');
const container = document.getElementById('button-container')

let items = null;

searchInput.addEventListener('input', function () {
    if (searchInput.value === '') {
        for (let item of items) {
            item.style.display = 'block'
        }
    } else {
        if (container.style.display != 'flex') container.style.display = 'flex';

        const txt = searchInput.value;

        for (let i = 0; i <= items.length - 1; i++) {
            let itemTxt = items[i].innerHTML
            if (itemTxt.toLowerCase().search(txt.toLowerCase()) >= 0) {
                items[i].style.display = "block"
            } else {
                items[i].style.display = "none";
            }
        }

    };
})

searchInput.addEventListener('focus', function () { container.style.display = 'flex' })
searchInput.addEventListener('blur', function () {
    const isBusy = document.querySelectorAll('.search-item:hover').length == 1
    if (searchInput.value == '' && isBusy == false) container.style.display = 'none';
})

// make sure our search dropdown waits for all jobs to load first\
const inputs = document.querySelectorAll('.input input')

const editables = {
    agi: document.querySelector('#agi > input'),
    mgi: document.querySelector('#mgi > input'),
    mni: document.querySelector('#mni > input'),
}

const intId = setInterval(function () {
    if (container.dataset.loaded == 'true') {
        items = document.querySelectorAll('.search-item');
        for (let item of items) {
            item.onclick = function () {
                container.style.display = 'none'

                if (item.innerHTML === 'CLEAR') {
                    searchInput.placeholder = 'Search..';
                    resetInput(editables.agi)
                    resetInput(editables.mgi)
                    resetInput(editables.mni)
                    return
                };

                searchInput.value = ''
                searchInput.placeholder = item.innerHTML

                const base = item.dataset.salary;
                const monthly = Math.round(base / 12);
                const netmonthly = Math.round(monthly - (monthly * .3265) - 180)

                console.log(monthly * .3265)

                lockInput(editables.agi)
                setInput(editables.agi, base)

                lockInput(editables.mgi)
                setInput(editables.mgi, monthly)

                lockInput(editables.mni)
                setInput(editables.mni, netmonthly)
            }
        }
        clearInterval(intId)
    }
}, 500)

// button stuffz
function lockInput(input) {
    input.style.backgroundColor = '#D3D3D3'
    input.readOnly = true;
}

function setInput(input, val) {
    input.value = val;
}

function resetInput(input) {
    input.style.backgroundColor = 'white';
    input.value = '';
    input.readOnly = false;
}

const realtimeClass = document.querySelectorAll('.realtime > p');
const realtime = {
    ded: realtimeClass[1],
    net: realtimeClass[3],
    mis: document.querySelector('#mis > input')
}

let prevTxt = realtime.mis.value;

const expinputs = document.querySelectorAll('#expenses-flexbox > .input > input')
const mne = document.querySelector('#mne > p:nth-of-type(2)')

setInterval(function () {

    // total deductions
    if (editables.mgi.value != '' && editables.mni.value != '') {
        realtime.ded.innerHTML = parseInt(editables.mgi.value) - parseInt(editables.mni.value)
    } else {
        realtime.ded.innerHTML = '$N/A'
    }

    // misc. income sources
    let txt = realtime.mis.value;
    if (prevTxt != txt && txt != '') {
        setInput(editables.mgi, Math.round(parseInt(editables.agi.value) / 12) + parseInt(txt))
        prevTxt = txt
    } else if (txt == '' && editables.agi.value != '') {
        setInput(editables.mgi, Math.round(parseInt(editables.agi.value) / 12))
    }
}, 1000)

for (expinp of expinputs) {
    expinp.oninput = updateME
}

function updateME() { // me = monthly expenses
    let sum = 0;
    let updatedDataSet = [];
    let activeInputs = []

    for (expinp of expinputs) {
        const val = (expinp.value != '') ? parseInt(expinp.value) : 0
        const typeOfInp = expinp.previousElementSibling.innerHTML.slice(0, -1);
        updatedDataSet.push(val)
        if (val != 0) activeInputs.push(typeOfInp);
        sum += val;
    }



    mne.innerHTML = sum;

    updateChart(updatedDataSet, activeInputs)
}

// chart stuff
const ctx = document.getElementById('income-chart');

let chart = new Chart(ctx, {
    type: 'pie',
    data: {
        labels: [],
        datasets: [{
            label: ' (USD) In Dollars',
            data: [0, 0, 0, 0, 0, 0, 0, 0],
        }]
    },
    options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
});

function updateChart(dataset, labels) {
    chart.data.datasets = [{
        label: ' (USD) In Dollars',
        data: dataset,
    }]

    chart.data.labels = labels;

    chart.update()
}

// hows this calculated hoverable
const triggerButton = document.querySelector('#exception-flex > button');
const hoverDiv = document.getElementById('hoverable');
const hoverContain = document.getElementById('hoverable-container')
const calculables = document.querySelectorAll('#hoverable > ul > li')

var template = {
    0: "Federal Taxes - 12%",
    1: "State Taxes - 7%",
    2: "Social Security - 6.2%",
    3: "Medicare - 1.45%",
    4: "State Disability - 5%",
    5: "Retirement Investment - 5%",
    6: "Medical Insurance - $180",
}

function calcSpecific(index, value) {
    value = Math.round(value)
    for (let i = 0; i <= calculables.length-1; i++) {
        if (i == index) {
            const element = calculables[i];
            element.innerHTML = template[i] + ` (\$${value})`
        }
    }
}


function reCalc() {
    const MGI = parseInt(editables.mgi.value)
    if (MGI > 0) {
        calcSpecific(0, MGI*.12)
        calcSpecific(1, MGI*.07)
        calcSpecific(2, MGI*.062)
        calcSpecific(3, MGI*.0145)
        calcSpecific(4, MGI*.01)
        calcSpecific(5, MGI*.05)
        calcSpecific(6, 180)
    }
}

function onDiv() {
    hoverDiv.style.visibility = 'visible';
}

function offDiv() {
    hoverDiv.style.visibility = 'collapse'
}

offDiv()

function toggleDiv() {
    if (hoverDiv.style.visibility == 'collapse') {
        reCalc()
        onDiv()
    } else {
        offDiv()
    }
}

triggerButton.onclick = toggleDiv